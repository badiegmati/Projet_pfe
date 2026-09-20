"""
supabase_sender.py — Envoi événements vers Supabase
Alpha Technology — PFE 2024-2025
Compatible supabase==1.2.1
FIX : stop_event coupe immédiatement les retries SSL
"""

import time
import threading
import hashlib
from datetime import datetime

from supabase import create_client, Client
from sqlite_manager import SQLiteManager
from gps_simulator  import GPSSimulator


class SupabaseSender:

    def __init__(self, config: dict,
                 sqlite_mgr: SQLiteManager,
                 gps_sim: GPSSimulator,
                 conducteur_id: str):

        supa             = config["supabase"]
        self._client: Client = create_client(supa["url"], supa["key"])
        self._table_evt  = supa["table_evenements"]
        self._table_gps  = supa["table_gps"]

        self._sqlite        = sqlite_mgr
        self._gps           = gps_sim
        self._conducteur_id = conducteur_id

        sender           = config.get("sender", {})
        self._intervalle = sender.get("intervalle_envoi_s", 5)
        self._batch_size = sender.get("batch_size", 20)
        self._retry_max  = sender.get("retry_max", 3)

        self._stop_event = threading.Event()
        self._running    = False

        self._nb_envoyes     = 0
        self._nb_erreurs     = 0
        self._nb_gps_ok      = 0
        self._nb_gps_timeout = 0

    def start(self):
        self._running = True
        self._stop_event.clear()
        threading.Thread(target=self._loop, daemon=True,
                         name="Supabase-Sender").start()
        print(f"[Supabase] Sender démarré — intervalle={self._intervalle}s")

    def stop_immediat(self):
        """Arrêt immédiat sans flush."""
        self._stop_event.set()
        self._running = False
        print(f"[Supabase] Sender arrêté — "
              f"événements={self._nb_envoyes} | "
              f"erreurs={self._nb_erreurs}")

    def stop(self):
        self.stop_immediat()

    def _loop(self):
        while self._running and not self._stop_event.is_set():
            try:
                self._send_batch()
            except Exception as e:
                print(f"[Supabase][ERROR] {e}")
            try:
                self._send_gps()
            except Exception:
                pass
            self._stop_event.wait(timeout=self._intervalle)

    def _send_batch(self):
        if self._stop_event.is_set():
            return
        events = self._sqlite.get_pending_events(self._batch_size)
        if not events:
            return

        lat, lon, vitesse, cap = self._gps.get_position()
        sent_ids = []

        for evt in events:
            if self._stop_event.is_set():
                break
            duree = float(evt.get("duree_secondes", 0))
            if duree < 2.0:
                sent_ids.append(evt["id"])
                continue

            payload = {
                "conducteur_id"  : self._conducteur_id,
                "type_evenement" : evt["type_evenement"],
                "categorie"      : evt["categorie"],
                "severite"       : evt["severite"],
                "timestamp_utc"  : evt["timestamp_utc"],
                "duree_secondes" : round(duree, 2),
                "latitude"       : evt.get("latitude")    or lat,
                "longitude"      : evt.get("longitude")   or lon,
                "vitesse_kmh"    : evt.get("vitesse_kmh") or vitesse,
                "cap_degres"     : evt.get("cap_degres")  or cap,
                "ear_ratio"      : evt.get("ear_ratio"),
                "mar_ratio"      : evt.get("mar_ratio"),
                "head_pose_angle": evt.get("head_pose"),
                "ttc_value"      : evt.get("ttc_value"),
                "deviation_voie" : evt.get("deviation_voie"),
                "distance_m"     : evt.get("distance_m"),
                "traite"         : False,
                "crc"            : self._crc(evt),
            }

            ok = self._insert_retry(payload)
            if ok:
                sent_ids.append(evt["id"])
                self._nb_envoyes += 1
                print(f"[Supabase] ✅ {evt['type_evenement']} "
                      f"({duree:.1f}s) → {self._conducteur_id}")
            else:
                self._nb_erreurs += 1

        if sent_ids:
            self._sqlite.mark_as_sent(sent_ids)

    def _send_gps(self):
        if self._stop_event.is_set():
            return
        lat, lon, vitesse, cap = self._gps.get_position()
        payload = {
            "conducteur_id": self._conducteur_id,
            "timestamp_utc": datetime.utcnow().isoformat() + "Z",
            "latitude"     : lat,
            "longitude"    : lon,
            "vitesse_kmh"  : vitesse,
            "cap_degres"   : cap,
        }
        try:
            self._client.table(self._table_gps).insert(payload).execute()
            self._nb_gps_ok += 1
        except Exception as e:
            self._nb_gps_timeout += 1
            err = str(e).lower()
            if self._nb_gps_timeout % 10 == 1:
                if any(k in err for k in ["timeout","ssl","handshake"]):
                    print(f"[GPS] ⚠️  SSL timeout "
                          f"({self._nb_gps_timeout}x) — non bloquant")
                else:
                    print(f"[GPS] ⚠️  Erreur ({self._nb_gps_timeout}x)")

    def _insert_retry(self, payload: dict) -> bool:
        for attempt in range(1, self._retry_max + 1):
            if self._stop_event.is_set():
                return False
            try:
                response = (self._client
                            .table(self._table_evt)
                            .insert(payload)
                            .execute())
                if hasattr(response, 'error') and response.error:
                    raise Exception(str(response.error))
                return True
            except Exception as e:
                if self._stop_event.is_set():
                    return False
                err  = str(e).lower()
                wait = min(2 ** attempt, 8)
                if any(k in err for k in ["timeout","ssl","handshake"]):
                    print(f"[Supabase] ⚠️  SSL timeout "
                          f"(tentative {attempt}/{self._retry_max})")
                else:
                    print(f"[Supabase] ⚠️  Tentative "
                          f"{attempt}/{self._retry_max}: {e}")
                if attempt < self._retry_max:
                    interrupted = self._stop_event.wait(timeout=wait)
                    if interrupted:
                        return False
        return False

    @staticmethod
    def _crc(evt: dict) -> str:
        data = f"{evt['type_evenement']}_{evt['timestamp_utc']}"
        return hashlib.md5(data.encode()).hexdigest()[:8].upper()

    def get_stats(self) -> dict:
        return {
            "envoyes"    : self._nb_envoyes,
            "erreurs"    : self._nb_erreurs,
            "gps_ok"     : self._nb_gps_ok,
            "gps_timeout": self._nb_gps_timeout,
        }