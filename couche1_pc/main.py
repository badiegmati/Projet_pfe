"""
main.py — Orchestrateur ADAS/DMS
Alpha Technology — PFE 2024-2025
LANCEMENT : python main.py
Ctrl+C    → arrêt immédiat < 0.5s
"""

import json, os, sys, time, threading, re, cv2, signal

ROOT_DIR    = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(ROOT_DIR, "config", "config.json")
sys.path.insert(0, ROOT_DIR)

import Shared
from sqlite_manager  import SQLiteManager
from gps_simulator   import GPSSimulator
from supabase_sender import SupabaseSender

try:
    from supabase import create_client
except ImportError:
    print("[ERREUR] pip install supabase==1.2.1")
    sys.exit(1)


def detecter_et_importer():
    if os.path.exists(os.path.join(ROOT_DIR, "DMS.py")):
        print("[Structure] Plate — DMS.py + ADAS.py dans couche1_pc/")
        from DMS import run_dms
        from ADAS import run_adas
        return run_dms, run_adas
    dms_path  = os.path.join(ROOT_DIR, "modules", "dms")
    adas_path = os.path.join(ROOT_DIR, "modules", "adas")
    if os.path.exists(os.path.join(dms_path, "DMS.py")):
        print("[Structure] Modules — modules/dms/DMS.py")
        sys.path.insert(0, dms_path)
        sys.path.insert(0, adas_path)
        from DMS import run_dms
        from ADAS import run_adas
        return run_dms, run_adas
    print("[ERREUR] DMS.py introuvable !")
    sys.exit(1)


def charger_config() -> dict:
    if not os.path.exists(CONFIG_PATH):
        print(f"[ERREUR] config.json introuvable")
        sys.exit(1)
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError as e:
            print(f"[ERREUR] config.json invalide : {e}")
            sys.exit(1)


def valider_format_id(cid: str) -> bool:
    return bool(re.match(r'^C[0-9]+$', cid))


def verifier_conducteur(client, conducteur_id: str) -> str:
    print(f"[Supabase] Vérification conducteur '{conducteur_id}'...")
    try:
        r1 = (client.table("evenements_bruts")
               .select("conducteur_id")
               .eq("conducteur_id", conducteur_id)
               .limit(1).execute())
        if r1.data:
            print(f"[Supabase] ✅ '{conducteur_id}' trouvé.")
            return conducteur_id
        r2 = (client.table("gps_logs_supabase")
               .select("conducteur_id")
               .eq("conducteur_id", conducteur_id)
               .limit(1).execute())
        if r2.data:
            print(f"[Supabase] ✅ '{conducteur_id}' trouvé.")
            return conducteur_id
        print(f"[Supabase] ℹ️  '{conducteur_id}' non trouvé — "
              f"démarrage automatique (données créées au 1er envoi).")
        return conducteur_id
    except Exception as e:
        print(f"[Supabase] ⚠️  Vérification impossible : {e}")
        print(f"[Supabase] → Démarrage quand même avec '{conducteur_id}'")
        return conducteur_id


def tester_camera(index: int) -> bool:
    cap = cv2.VideoCapture(index)
    ok  = cap.isOpened()
    cap.release()
    return ok


def detecter_cameras(dms_idx: int, adas_idx: int):
    print("\n[Caméras] Détection des caméras...")
    dms_ok  = tester_camera(dms_idx)
    adas_ok = tester_camera(adas_idx)
    print(f"  CAM DMS  (index={dms_idx})  : "
          f"{'✅ disponible' if dms_ok  else '❌ absente'}")
    print(f"  CAM ADAS (index={adas_idx}) : "
          f"{'✅ disponible' if adas_ok else '⚠️  absente'}")
    return dms_ok, adas_ok


def gps_context_updater(gps_sim, conducteur_id, stop_event):
    while not stop_event.is_set():
        lat, lon, vitesse, cap = gps_sim.get_position()
        Shared.set_context(conducteur_id, lat, lon, vitesse, cap)
        stop_event.wait(timeout=1.0)


def cleanup_thread(sqlite_mgr, intervalle_h, stop_event):
    print(f"[Cleanup] Thread démarré — purge toutes les {intervalle_h}h")
    while not stop_event.is_set():
        stop_event.wait(timeout=intervalle_h * 3600)
        if not stop_event.is_set():
            sqlite_mgr.purge_old_events()


def monitoring_thread(sqlite_mgr, sender, stop_event):
    while not stop_event.is_set():
        stop_event.wait(timeout=60)
        if stop_event.is_set():
            break
        s = sqlite_mgr.get_stats()
        e = sender.get_stats()
        print(f"\n[STATS] SQLite   : total={s['total']} | "
              f"en_attente={s['en_attente']} | envoyés={s['envoyes']}")
        print(f"[STATS] Supabase : envoyés={e['envoyes']} | "
              f"erreurs={e['erreurs']}\n")


def main():
    print("╔══════════════════════════════════════════════════════════╗")
    print("║   ADAS/DMS — Alpha Technology — PFE 2024-2025           ║")
    print("║   Lancement : python main.py                            ║")
    print("╚══════════════════════════════════════════════════════════╝\n")

    _refs = {"done": False}

    run_dms, run_adas = detecter_et_importer()

    config        = charger_config()
    conducteur_id = config["detection"].get("conducteur_id", "").strip()
    dms_idx       = config["detection"].get("dms_cam_index",  0)
    adas_idx      = config["detection"].get("adas_cam_index", 1)

    print(f"[Config] {CONFIG_PATH}")
    print(f"[Config] conducteur_id = '{conducteur_id}'")

    if not conducteur_id:
        print("[ERREUR] conducteur_id vide dans config.json")
        sys.exit(1)
    if not valider_format_id(conducteur_id):
        print(f"[ERREUR] Format invalide '{conducteur_id}' — ex: C10, C19")
        sys.exit(1)
    print(f"[Config] Format ID valide ✅")

    print(f"\n[Supabase] Connexion...")
    try:
        supa_client = create_client(
            config["supabase"]["url"],
            config["supabase"]["key"]
        )
        print(f"[Supabase] ✅ Connecté.")
    except Exception as e:
        print(f"[Supabase] ❌ Erreur : {e}")
        sys.exit(1)

    conducteur_id = verifier_conducteur(supa_client, conducteur_id)

    db_path = os.path.join(ROOT_DIR, config["sqlite"]["db_path"])
    Shared.set_db_path(db_path)
    Shared.init_db()
    sqlite_mgr = SQLiteManager(
        db_path         = db_path,
        retention_jours = config["sqlite"].get("retention_jours", 10)
    )
    print(f"\n[SQLite] Base initialisée : {db_path}")

    gps_sim = GPSSimulator(config)
    gps_sim.start()
    lat, lon, v, cap_deg = gps_sim.get_position()
    Shared.set_context(conducteur_id, lat, lon, v, cap_deg)
    print(f"[GPS] Position initiale : ({lat}, {lon}) | {v:.1f} km/h")

    sender = SupabaseSender(config, sqlite_mgr, gps_sim, conducteur_id)
    sender.start()

    dms_ok, adas_ok = detecter_cameras(dms_idx, adas_idx)
    if not dms_ok:
        print(f"\n[ERREUR] CAM DMS (index={dms_idx}) introuvable !")
        print("  Branchez la caméra PC et relancez.")
        os._exit(1)

    print()
    if adas_ok:
        print(f"[Mode] 🎥 DMS (CAM-{dms_idx}) + "
              f"🎥 ADAS (CAM-{adas_idx}) → Mode COMPLET")
    else:
        print(f"[Mode] 🎥 DMS (CAM-{dms_idx}) seulement "
              f"→ Branchez CAM USB pour activer ADAS")

    stop_event = threading.Event()

    threading.Thread(target=gps_context_updater,
                     args=(gps_sim, conducteur_id, stop_event),
                     daemon=True, name="GPS-Context").start()

    t_dms = threading.Thread(target=run_dms,
                              args=(stop_event, dms_idx),
                              daemon=True, name="DMS-Thread")
    t_dms.start()
    print(f"[DMS] Thread démarré — CAM-{dms_idx}")

    t_adas = None
    if adas_ok:
        t_adas = threading.Thread(target=run_adas,
                                   args=(stop_event, adas_idx),
                                   daemon=True, name="ADAS-Thread")
        t_adas.start()
        print(f"[ADAS] Thread démarré — CAM-{adas_idx}")

    threading.Thread(target=cleanup_thread,
                     args=(sqlite_mgr,
                           config["sqlite"].get("cleanup_interval_h", 24),
                           stop_event),
                     daemon=True, name="Cleanup").start()

    threading.Thread(target=monitoring_thread,
                     args=(sqlite_mgr, sender, stop_event),
                     daemon=True, name="Monitor").start()

    _refs.update({
        "stop_event"   : stop_event,
        "t_dms"        : t_dms,
        "t_adas"       : t_adas,
        "sender"       : sender,
        "gps_sim"      : gps_sim,
        "sqlite_mgr"   : sqlite_mgr,
        "conducteur_id": conducteur_id,
        "done"         : False,
    })

    def signal_handler(sig, frame):
        """Ctrl+C → os._exit(0) IMMÉDIAT < 0.5s."""
        if _refs.get("done"):
            return
        _refs["done"] = True
        print("\n[Main] Ctrl+C reçu — arrêt immédiat...")
        try:
            _refs["stop_event"].set()
        except Exception:
            pass
        try:
            _refs["sender"]._stop_event.set()
            _refs["sender"]._running = False
        except Exception:
            pass
        try:
            cv2.destroyAllWindows()
            cv2.waitKey(1)
        except Exception:
            pass
        try:
            stats = _refs["sender"].get_stats()
            cid   = _refs["conducteur_id"]
            print(f"\n{'='*55}")
            print(f"  ✅ Système arrêté.")
            print(f"  Conducteur             : {cid}")
            print(f"  Événements → Supabase : {stats['envoyes']}")
            print(f"  Erreurs d'envoi       : {stats['erreurs']}")
            print(f"  GPS envoyés           : {stats.get('gps_ok', 0)}")
            print(f"{'='*55}")
        except Exception:
            pass
        os._exit(0)

    signal.signal(signal.SIGINT, signal_handler)

    print(f"\n{'='*55}")
    print(f"  ✅ Système actif")
    print(f"  Conducteur  : {conducteur_id}")
    print(f"  Mode        : {'DMS + ADAS' if adas_ok else 'DMS seulement'}")
    print(f"  Ctrl+C pour arrêter")
    print(f"{'='*55}\n")

    try:
        while True:
            time.sleep(0.5)
            if not t_dms.is_alive():
                print("\n[Main] DMS terminé — arrêt automatique.")
                break
    except KeyboardInterrupt:
        signal_handler(None, None)

    if not _refs.get("done"):
        _refs["done"] = True
        try:
            stop_event.set()
            sender._stop_event.set()
            sender._running = False
            cv2.destroyAllWindows()
        except Exception:
            pass
        stats = sender.get_stats()
        print(f"\n{'='*55}")
        print(f"  ✅ Système arrêté.")
        print(f"  Conducteur             : {conducteur_id}")
        print(f"  Événements → Supabase : {stats['envoyes']}")
        print(f"  Erreurs d'envoi       : {stats['erreurs']}")
        print(f"{'='*55}")
        os._exit(0)


if __name__ == "__main__":
    main()