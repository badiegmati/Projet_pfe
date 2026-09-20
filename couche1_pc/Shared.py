"""
Shared.py — Module partagé DMS + ADAS
Alpha Technology — PFE 2024-2025

Gère SQLite store-and-forward + contexte GPS + sévérité événements.
RÈGLE : duree_secondes >= 2.0 obligatoire pour enregistrement.
"""

import sqlite3
import os
import threading
from datetime import datetime

# ── Chemin SQLite ──────────────────────────────────────────────────────────
_DB_PATH = "database/events.db"
_lock    = threading.Lock()

# ── Contexte conducteur + GPS ──────────────────────────────────────────────
_CONTEXT = {
    "conducteur_id": "UNKNOWN",
    "latitude"     : None,
    "longitude"    : None,
    "vitesse_kmh"  : None,
    "cap_degres"   : None,
}

# ── Sévérité par type d'événement ─────────────────────────────────────────
SEVERITY = {
    "FATIGUE_EYES_CLOSED": "CRITIQUE",
    "FATIGUE_EYES_DROWSY": "ELEVE",
    "FATIGUE_YAWN"       : "MODERE",
    "FATIGUE_DROP"       : "ELEVE",
    "DISTRACTION"        : "MODERE",
    "PHONE"              : "ELEVE",
    "SMOKING"            : "MODERE",
    "SEATBELT"           : "ELEVE",
    "FCW_WARNING"        : "ELEVE",
    "FCW_DANGER"         : "CRITIQUE",
    "LDW_LEFT"           : "MODERE",
    "LDW_RIGHT"          : "MODERE",
}

# ── Catégorie par type d'événement ────────────────────────────────────────
CATEGORIE = {
    "FATIGUE_EYES_CLOSED": "DMS",
    "FATIGUE_EYES_DROWSY": "DMS",
    "FATIGUE_YAWN"       : "DMS",
    "FATIGUE_DROP"       : "DMS",
    "DISTRACTION"        : "DMS",
    "PHONE"              : "DMS",
    "SMOKING"            : "DMS",
    "SEATBELT"           : "DMS",
    "FCW_WARNING"        : "ADAS",
    "FCW_DANGER"         : "ADAS",
    "LDW_LEFT"           : "ADAS",
    "LDW_RIGHT"          : "ADAS",
}

# ── Durée minimale ────────────────────────────────────────────────────────
DUREE_MIN_SECONDES = 2.0

# ── Durées par défaut ─────────────────────────────────────────────────────
DUREE_DEFAUT = {
    "FATIGUE_EYES_CLOSED": 2.5,
    "FATIGUE_EYES_DROWSY": 2.0,
    "FATIGUE_YAWN"       : 3.0,
    "FATIGUE_DROP"       : 2.5,
    "DISTRACTION"        : 2.0,
    "PHONE"              : 2.0,
    "SMOKING"            : 2.0,
    "SEATBELT"           : 5.0,
    "FCW_WARNING"        : 2.0,
    "FCW_DANGER"         : 2.0,
    "LDW_LEFT"           : 2.0,
    "LDW_RIGHT"          : 2.0,
}


def set_db_path(path: str):
    """Définit le chemin SQLite depuis main.py."""
    global _DB_PATH
    _DB_PATH = path


def set_context(conducteur_id: str,
                lat: float = None,
                lon: float = None,
                vitesse: float = None,
                cap: float = None):
    """Injecte le contexte conducteur + GPS."""
    global _CONTEXT
    _CONTEXT["conducteur_id"] = conducteur_id
    if lat     is not None: _CONTEXT["latitude"]    = lat
    if lon     is not None: _CONTEXT["longitude"]   = lon
    if vitesse is not None: _CONTEXT["vitesse_kmh"] = vitesse
    if cap     is not None: _CONTEXT["cap_degres"]  = cap


def get_context() -> dict:
    return dict(_CONTEXT)


def init_db():
    """Initialise la base SQLite."""
    dossier = os.path.dirname(_DB_PATH)
    if dossier:
        os.makedirs(dossier, exist_ok=True)
    with _lock:
        conn = sqlite3.connect(_DB_PATH)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS events_pending (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                conducteur_id  TEXT    NOT NULL,
                type_evenement TEXT    NOT NULL,
                categorie      TEXT    NOT NULL,
                severite       TEXT    NOT NULL,
                timestamp_utc  TEXT    NOT NULL,
                duree_secondes REAL    NOT NULL DEFAULT 2.0,
                ear_ratio      REAL,
                mar_ratio      REAL,
                head_pose      REAL,
                ttc_value      REAL,
                deviation_voie REAL,
                distance_m     REAL,
                latitude       REAL,
                longitude      REAL,
                vitesse_kmh    REAL,
                cap_degres     REAL,
                sent           INTEGER DEFAULT 0,
                created_at     TEXT    DEFAULT (datetime('now'))
            )
        """)
        conn.commit()
        conn.close()
    print(f"[Shared] SQLite initialisé : {_DB_PATH}")


def log_event_to_db(event_type: str,
                    duree_secondes: float = None,
                    extra: dict = None):
    """
    Enregistre un événement dans SQLite.
    Appelé depuis DMS.py et ADAS.py.
    duree_secondes < 2.0 → ignoré silencieusement.
    """
    if extra is None:
        extra = {}

    if duree_secondes is None:
        duree_secondes = DUREE_DEFAUT.get(event_type, 2.0)

    if duree_secondes < DUREE_MIN_SECONDES:
        return

    ctx = get_context()

    record = {
        "conducteur_id" : extra.get("conducteur_id", ctx["conducteur_id"]),
        "type_evenement": event_type,
        "categorie"     : CATEGORIE.get(event_type, "DMS"),
        "severite"      : SEVERITY.get(event_type, "MODERE"),
        "timestamp_utc" : datetime.utcnow().isoformat() + "Z",
        "duree_secondes": round(duree_secondes, 2),
        "ear_ratio"     : extra.get("ear_ratio"),
        "mar_ratio"     : extra.get("mar_ratio"),
        "head_pose"     : extra.get("head_pose_angle"),
        "ttc_value"     : extra.get("ttc_value"),
        "deviation_voie": extra.get("deviation_voie"),
        "distance_m"    : extra.get("distance_m"),
        "latitude"      : extra.get("latitude",    ctx.get("latitude")),
        "longitude"     : extra.get("longitude",   ctx.get("longitude")),
        "vitesse_kmh"   : extra.get("vitesse_kmh", ctx.get("vitesse_kmh")),
        "cap_degres"    : extra.get("cap_degres",  ctx.get("cap_degres")),
    }

    with _lock:
        conn = sqlite3.connect(_DB_PATH)
        conn.execute("""
            INSERT INTO events_pending (
                conducteur_id, type_evenement, categorie, severite,
                timestamp_utc, duree_secondes,
                ear_ratio, mar_ratio, head_pose, ttc_value,
                deviation_voie, distance_m,
                latitude, longitude, vitesse_kmh, cap_degres
            ) VALUES (
                :conducteur_id, :type_evenement, :categorie, :severite,
                :timestamp_utc, :duree_secondes,
                :ear_ratio, :mar_ratio, :head_pose, :ttc_value,
                :deviation_voie, :distance_m,
                :latitude, :longitude, :vitesse_kmh, :cap_degres
            )
        """, record)
        conn.commit()
        conn.close()

    print(f"[Shared] ✅ Événement enregistré : {event_type} "
          f"({duree_secondes:.1f}s) conducteur={record['conducteur_id']}")