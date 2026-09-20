"""
feature_extractor.py — Extraction des 9 features comportementales
depuis PostgreSQL 18 pour le modèle Random Forest

Alpha Technology — PFE 2024-2025

CORRECTIONS :
  - vitesse_kmh supprimée (colonne absente de evenements)
  - vitesse_moyenne_kmh supprimée des features
  - Fenêtre : 1 AN (365 jours) — données Supabase mai 2026

FEATURES (9) :
  1. freq_fatigue_par_heure
  2. freq_telephone_par_heure
  3. freq_ceinture_par_heure
  4. freq_tabagisme_par_heure
  5. freq_distraction_par_heure
  6. nb_alertes_fcw
  7. nb_alertes_ldw
  8. nb_total_alertes
  9. ratio_alertes_graves
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger(__name__)

# ══════════════════════════════════════════════════════════════
# CONSTANTES
# Fenêtre 1 AN — données historiques Supabase mai 2026
# ══════════════════════════════════════════════════════════════
FENETRE_JOURS  = 365
HEURES_FENETRE = FENETRE_JOURS * 24  # 8760 heures

# Types d'événements graves (CRITIQUE + ELEVE)
TYPES_GRAVES = {
    "FATIGUE_EYES_CLOSED",  # CRITIQUE
    "FCW_DANGER",           # CRITIQUE
    "FATIGUE_EYES_DROWSY",  # ELEVE
    "FATIGUE_DROP",         # ELEVE
    "PHONE",                # ELEVE
    "SEATBELT",             # ELEVE
    "FCW_WARNING",          # ELEVE
}


def extraire_features(
    conducteur_id: str,
    db: Session
) -> Optional[Dict[str, float]]:
    """
    Extrait les 9 features comportementales depuis PostgreSQL
    Fenêtre : 1 an (données historiques Supabase mai 2026)

    CORRECTION : pas de colonne vitesse_kmh dans evenements
    → vitesse_moyenne supprimée

    Args:
        conducteur_id : ID conducteur (ex: "C10")
        db            : Session SQLAlchemy

    Returns:
        Dict des features ou None si aucune donnée
    """
    depuis = datetime.utcnow() - timedelta(days=FENETRE_JOURS)

    logger.info(
        "[FEATURES] Extraction conducteur=%s depuis=%s",
        conducteur_id, depuis.date()
    )

    # ── Comptage par type d'événement ──────────────────────────
    # CORRECTION : sans AVG(vitesse_kmh) — colonne inexistante
    sql_comptage = text("""
        SELECT
            type_evenement,
            COUNT(*) AS nb
        FROM evenements
        WHERE conducteur_id = :cid
          AND date_heure    >= :depuis
        GROUP BY type_evenement
        ORDER BY type_evenement
    """)

    rows = db.execute(
        sql_comptage,
        {"cid": conducteur_id, "depuis": depuis}
    ).fetchall()

    if not rows:
        logger.warning(
            "[FEATURES] Aucun événement pour conducteur=%s",
            conducteur_id
        )
        return None

    # ── Construction dictionnaire compteurs ─────────────────────
    counts: Dict[str, int] = {}
    for row in rows:
        counts[row[0]] = int(row[1])

    logger.debug("[FEATURES] Compteurs bruts : %s", counts)

    # ── Calcul compteurs par catégorie ──────────────────────────
    nb_fatigue = (
        counts.get("FATIGUE_EYES_CLOSED", 0)
        + counts.get("FATIGUE_EYES_DROWSY", 0)
        + counts.get("FATIGUE_YAWN",        0)
        + counts.get("FATIGUE_DROP",        0)
    )
    nb_telephone   = counts.get("PHONE",       0)
    nb_ceinture    = counts.get("SEATBELT",    0)
    nb_tabagisme   = counts.get("SMOKING",     0)
    nb_distraction = counts.get("DISTRACTION", 0)
    nb_head_pose   = counts.get("HEAD_POSE",   0)

    nb_fcw = (
        counts.get("FCW_WARNING", 0)
        + counts.get("FCW_DANGER", 0)
    )
    nb_ldw = (
        counts.get("LDW_LEFT",  0)
        + counts.get("LDW_RIGHT", 0)
    )

    nb_total = sum(counts.values())

    # ── Ratio événements graves ─────────────────────────────────
    nb_graves = sum(
        nb for t, nb in counts.items()
        if t in TYPES_GRAVES
    )
    ratio_graves = nb_graves / nb_total if nb_total > 0 else 0.0

    # ── Fréquences par heure (sur 8760h = 365 jours) ────────────
    freq_fatigue     = nb_fatigue     / HEURES_FENETRE
    freq_telephone   = nb_telephone   / HEURES_FENETRE
    freq_ceinture    = nb_ceinture    / HEURES_FENETRE
    freq_tabagisme   = nb_tabagisme   / HEURES_FENETRE
    freq_distraction = nb_distraction / HEURES_FENETRE

    # ── Vecteur final 9 features ─────────────────────────────────
    features = {
        # Features ML (9 — sans vitesse)
        "freq_fatigue_par_heure":     round(freq_fatigue,     8),
        "freq_telephone_par_heure":   round(freq_telephone,   8),
        "freq_ceinture_par_heure":    round(freq_ceinture,    8),
        "freq_tabagisme_par_heure":   round(freq_tabagisme,   8),
        "freq_distraction_par_heure": round(freq_distraction, 8),
        "nb_alertes_fcw":             float(nb_fcw),
        "nb_alertes_ldw":             float(nb_ldw),
        "nb_total_alertes":           float(nb_total),
        "ratio_alertes_graves":       round(ratio_graves,     6),
        # Compteurs bruts pour sauvegarde PostgreSQL (préfixe _)
        "_nb_fatigue":     nb_fatigue,
        "_nb_telephone":   nb_telephone,
        "_nb_ceinture":    nb_ceinture,
        "_nb_tabagisme":   nb_tabagisme,
        "_nb_distraction": nb_distraction,
        "_nb_head_pose":   nb_head_pose,
        "_nb_fcw":         nb_fcw,
        "_nb_ldw":         nb_ldw,
        "_nb_total":       nb_total,
        "_ratio_graves":   ratio_graves,
    }

    logger.info(
        "[FEATURES] conducteur=%s | total=%d | fatigue=%d | "
        "telephone=%d | fcw=%d | ldw=%d | ratio_graves=%.4f",
        conducteur_id, nb_total, nb_fatigue,
        nb_telephone, nb_fcw, nb_ldw, ratio_graves
    )

    return features