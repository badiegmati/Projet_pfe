"""
ml_score_service.py — Service ML Random Forest pour scoring de risque
Alpha Technology — PFE 2024-2025

CORRECTIONS :
  - vitesse_moyenne supprimée (absente de scores_risque et evenements)
  - 9 features (sans vitesse_moyenne_kmh)
  - Colonne actif supprimée de conducteurs
  - Données d'entraînement adaptées à 9 features
"""

import logging
import numpy as np
from datetime import datetime, date
from typing import Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import text
from sklearn.ensemble import RandomForestClassifier

from services.feature_extractor import extraire_features

logger = logging.getLogger(__name__)

# ══════════════════════════════════════════════════════════════
# NIVEAUX DE RISQUE
# ══════════════════════════════════════════════════════════════
FEATURE_NAMES = [
    "freq_fatigue_par_heure",
    "freq_telephone_par_heure",
    "freq_ceinture_par_heure",
    "freq_tabagisme_par_heure",
    "freq_distraction_par_heure",
    "nb_alertes_fcw",
    "nb_alertes_ldw",
    "nb_total_alertes",
    "ratio_alertes_graves",
]


def _creer_modele_rf() -> RandomForestClassifier:
    """
    Crée et entraîne le modèle Random Forest
    sur données synthétiques représentatives.

    9 features (vitesse supprimée) :
    [freq_fat, freq_tel, freq_cei, freq_tab, freq_dist,
     nb_fcw, nb_ldw, nb_total, ratio_graves]

    4 classes : 0=FAIBLE, 1=MODERE, 2=ELEVE, 3=CRITIQUE
    """
    logger.info("[ML] Construction modèle Random Forest (9 features)...")

    X_train = np.array([
        # ── FAIBLE (score ≈ 0.10) ───────────────────────────────
        # [freq_fat, freq_tel, freq_cei, freq_tab, freq_dist,
        #  nb_fcw, nb_ldw, nb_total, ratio_graves]
        [0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0, 0,  0, 0.00],
        [0.000114, 0.000000, 0.000000, 0.000000, 0.000000, 0, 0,  1, 0.00],
        [0.000228, 0.000114, 0.000000, 0.000000, 0.000114, 0, 0,  2, 0.10],
        [0.000342, 0.000000, 0.000114, 0.000000, 0.000000, 0, 0,  2, 0.20],
        [0.000114, 0.000114, 0.000000, 0.000114, 0.000000, 0, 0,  2, 0.15],
        [0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0, 0,  0, 0.00],
        [0.000228, 0.000000, 0.000000, 0.000000, 0.000114, 0, 0,  2, 0.05],

        # ── MODERE (score ≈ 0.35) ───────────────────────────────
        [0.001141, 0.000342, 0.000228, 0.000114, 0.000342, 0, 1,  5, 0.30],
        [0.001370, 0.000571, 0.000342, 0.000228, 0.000457, 1, 0,  7, 0.35],
        [0.001712, 0.000457, 0.000228, 0.000114, 0.000571, 0, 1,  8, 0.40],
        [0.000913, 0.000685, 0.000342, 0.000228, 0.000342, 1, 0,  6, 0.33],
        [0.002283, 0.000342, 0.000114, 0.000000, 0.000228, 0, 2,  8, 0.38],
        [0.001141, 0.000571, 0.000457, 0.000342, 0.000571, 1, 1, 10, 0.40],
        [0.002055, 0.000228, 0.000228, 0.000114, 0.000342, 0, 1,  7, 0.29],

        # ── ELEVE (score ≈ 0.62) ────────────────────────────────
        [0.003425, 0.001141, 0.000913, 0.000571, 0.001141, 2, 2, 15, 0.55],
        [0.003995, 0.001370, 0.001141, 0.000685, 0.001370, 3, 1, 18, 0.60],
        [0.004566, 0.001712, 0.000913, 0.000457, 0.000913, 2, 3, 20, 0.65],
        [0.005707, 0.001141, 0.001370, 0.000913, 0.001712, 4, 2, 25, 0.70],
        [0.004337, 0.001484, 0.001027, 0.000571, 0.001255, 3, 2, 22, 0.62],
        [0.005136, 0.001370, 0.000799, 0.000685, 0.001484, 2, 3, 21, 0.67],
        [0.003767, 0.001255, 0.001141, 0.000457, 0.001027, 3, 1, 17, 0.58],

        # ── CRITIQUE (score ≈ 0.88) ─────────────────────────────
        [0.009132, 0.002853, 0.002283, 0.001712, 0.003425, 6, 4, 40, 0.85],
        [0.010274, 0.003425, 0.002853, 0.002283, 0.003995, 8, 5, 50, 0.90],
        [0.011416, 0.003995, 0.002055, 0.001370, 0.003196, 7, 6, 55, 0.88],
        [0.013699, 0.004566, 0.003425, 0.002853, 0.004566, 10,5, 60, 0.92],
        [0.009703, 0.003196, 0.002511, 0.002055, 0.003653, 8, 4, 48, 0.87],
        [0.010845, 0.003767, 0.003082, 0.002511, 0.004337, 9, 5, 53, 0.91],
        [0.008561, 0.002853, 0.002169, 0.001598, 0.002967, 6, 5, 42, 0.83],
    ])

    # Labels : 0=FAIBLE, 1=MODERE, 2=ELEVE, 3=CRITIQUE
    y_train = np.array([
        0, 0, 0, 0, 0, 0, 0,   # FAIBLE   (7)
        1, 1, 1, 1, 1, 1, 1,   # MODERE   (7)
        2, 2, 2, 2, 2, 2, 2,   # ELEVE    (7)
        3, 3, 3, 3, 3, 3, 3,   # CRITIQUE (7)
    ])

    modele = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1
    )
    modele.fit(X_train, y_train)

    logger.info(
        "[ML] Modèle RF entraîné : %d arbres, %d classes, %d features",
        modele.n_estimators,
        len(modele.classes_),
        len(FEATURE_NAMES)
    )
    return modele


# ── Instance globale ────────────────────────────────────────────
_modele_rf: Optional[RandomForestClassifier] = None


def initialiser_modele():
    """Initialise le modèle Random Forest au démarrage"""
    global _modele_rf
    _modele_rf = _creer_modele_rf()
    logger.info("[ML] Modèle RF prêt pour scoring")


def _determiner_niveau(score: float) -> str:
    """Détermine le niveau de risque selon le score [0,1]"""
    if score < 0.25:
        return "FAIBLE"
    elif score < 0.50:
        return "MODERE"
    elif score < 0.75:
        return "ELEVE"
    else:
        return "CRITIQUE"


def calculer_score_ml(
    conducteur_id: str,
    db: Session
) -> Optional[Dict]:
    """
    Calcule le score de risque via Random Forest
    Sauvegarde dans scores_risque + met à jour score_journalier

    CORRECTION : vitesse supprimée partout
    """
    global _modele_rf

    if _modele_rf is None:
        logger.warning("[ML] Modèle non initialisé — init en cours")
        initialiser_modele()

    logger.info(
        "[ML] Début calcul score conducteur=%s", conducteur_id
    )

    # ── Extraction features ──────────────────────────────────────
    features = extraire_features(conducteur_id, db)

    if features is None:
        logger.warning(
            "[ML] Pas de données pour conducteur=%s — score=0",
            conducteur_id
        )
        return {
            "conducteur_id":  conducteur_id,
            "score_valeur":   0.0,
            "score_pct":      0.0,
            "niveau_risque":  "FAIBLE",
            "nb_fatigue":     0,
            "nb_telephone":   0,
            "nb_ceinture":    0,
            "nb_tabagisme":   0,
            "nb_distraction": 0,
            "nb_head_pose":   0,
            "nb_fcw":         0,
            "nb_ldw":         0,
            "nb_total":       0,
            "ratio_graves":   0.0,
            "date_calcul":    date.today().isoformat(),
            "message":        "Aucun événement détecté"
        }

    # ── Vecteur 9 features pour le modèle ───────────────────────
    X = np.array([[
        features["freq_fatigue_par_heure"],
        features["freq_telephone_par_heure"],
        features["freq_ceinture_par_heure"],
        features["freq_tabagisme_par_heure"],
        features["freq_distraction_par_heure"],
        features["nb_alertes_fcw"],
        features["nb_alertes_ldw"],
        features["nb_total_alertes"],
        features["ratio_alertes_graves"],
    ]])

    # ── Prédiction Random Forest ─────────────────────────────────
    # Centres des intervalles : [0.125, 0.375, 0.625, 0.875]
    probas   = _modele_rf.predict_proba(X)[0]
    centres  = np.array([0.125, 0.375, 0.625, 0.875])
    score_rf = float(np.dot(probas, centres))

    # ── Score direct (algorithme métier) ────────────────────────
    score_direct = _calculer_score_direct(features)

    # ── Score final = RF×60% + Direct×40% ───────────────────────
    score_final = (score_rf * 0.60) + (score_direct * 0.40)
    score_final = round(min(max(score_final, 0.0), 1.0), 4)
    niveau      = _determiner_niveau(score_final)

    logger.info(
        "[ML] conducteur=%s | rf=%.4f | direct=%.4f "
        "| final=%.4f (%.1f%%) | %s",
        conducteur_id, score_rf, score_direct,
        score_final, score_final * 100, niveau
    )

    # ── Sauvegarde PostgreSQL ────────────────────────────────────
    _sauvegarder_score(conducteur_id, score_final, niveau, features, db)

    return {
        "conducteur_id":  conducteur_id,
        "score_valeur":   score_final,
        "score_pct":      round(score_final * 100, 1),
        "niveau_risque":  niveau,
        "nb_fatigue":     features["_nb_fatigue"],
        "nb_telephone":   features["_nb_telephone"],
        "nb_ceinture":    features["_nb_ceinture"],
        "nb_tabagisme":   features["_nb_tabagisme"],
        "nb_distraction": features["_nb_distraction"],
        "nb_head_pose":   features["_nb_head_pose"],
        "nb_fcw":         features["_nb_fcw"],
        "nb_ldw":         features["_nb_ldw"],
        "nb_total":       features["_nb_total"],
        "ratio_graves":   round(features["_ratio_graves"], 4),
        "date_calcul":    date.today().isoformat(),
        "message":        "Score calculé avec succès via Random Forest"
    }


def _calculer_score_direct(features: Dict) -> float:
    """
    Algorithme de scoring direct (complément au RF)
    Basé sur les poids métier — SANS vitesse
    """
    score = 0.0
    score += min(features["_nb_fatigue"]     * 0.08, 0.30)
    score += min(features["_nb_telephone"]   * 0.10, 0.20)
    score += min(features["_nb_ceinture"]    * 0.05, 0.10)
    score += min(features["_nb_tabagisme"]   * 0.03, 0.08)
    score += min(features["_nb_distraction"] * 0.04, 0.10)
    score += min(features["_nb_head_pose"]   * 0.03, 0.06)
    score += min(features["_nb_fcw"]         * 0.06, 0.12)
    score += min(features["_nb_ldw"]         * 0.03, 0.06)
    score += features["_ratio_graves"]       * 0.10
    return min(max(score, 0.0), 1.0)


def _sauvegarder_score(
    conducteur_id: str,
    score: float,
    niveau: str,
    features: Dict,
    db: Session
):
    """
    Sauvegarde dans scores_risque + update conducteurs.score_journalier
    CORRECTION : sans colonne vitesse_moyenne
    """
    maintenant   = datetime.utcnow()
    date_calcul  = maintenant.date()
    heure_calcul = maintenant.strftime("%H:%M:%S")

    try:
        # ── INSERT scores_risque (SANS vitesse_moyenne) ───────────
        sql_insert = text("""
            INSERT INTO scores_risque (
                conducteur_id, date_calcul,  heure_calcul,
                score_valeur,  niveau_risque,
                nb_fatigue,    nb_telephone,  nb_ceinture,
                nb_tabagisme,  nb_distraction, nb_head_pose,
                nb_fcw,        nb_ldw,         nb_total,
                ratio_graves,  timestamp
            ) VALUES (
                :cid,   :date,   :heure,
                :score, :niveau,
                :nb_fat, :nb_tel, :nb_cei,
                :nb_tab, :nb_dist, :nb_hp,
                :nb_fcw, :nb_ldw, :nb_total,
                :ratio,  NOW()
            )
            ON CONFLICT (conducteur_id, date_calcul, heure_calcul)
            DO UPDATE SET
                score_valeur  = EXCLUDED.score_valeur,
                niveau_risque = EXCLUDED.niveau_risque,
                nb_total      = EXCLUDED.nb_total,
                timestamp     = NOW()
        """)

        db.execute(sql_insert, {
            "cid":     conducteur_id,
            "date":    date_calcul,
            "heure":   heure_calcul,
            "score":   score,
            "niveau":  niveau,
            "nb_fat":  features["_nb_fatigue"],
            "nb_tel":  features["_nb_telephone"],
            "nb_cei":  features["_nb_ceinture"],
            "nb_tab":  features["_nb_tabagisme"],
            "nb_dist": features["_nb_distraction"],
            "nb_hp":   features["_nb_head_pose"],
            "nb_fcw":  features["_nb_fcw"],
            "nb_ldw":  features["_nb_ldw"],
            "nb_total":features["_nb_total"],
            "ratio":   round(features["_ratio_graves"], 4),
        })

        # ── UPDATE conducteurs.score_journalier ───────────────────
        sql_update = text("""
            UPDATE conducteurs
            SET score_journalier  = :score,
                date_modification = NOW()
            WHERE id = :cid
        """)
        db.execute(sql_update, {
            "score": score,
            "cid":   conducteur_id
        })

        db.commit()
        logger.info(
            "[ML] SAVE OK conducteur=%s score=%.4f niveau=%s",
            conducteur_id, score, niveau
        )

    except Exception as e:
        db.rollback()
        logger.error(
            "[ML] Erreur sauvegarde score conducteur=%s : %s",
            conducteur_id, e
        )
        raise