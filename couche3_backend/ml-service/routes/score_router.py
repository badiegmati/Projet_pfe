"""
score_router.py — Routes FastAPI pour le scoring ML
Alpha Technology — PFE 2024-2025

CORRECTIONS :
  - _conducteur_existe() sans colonne actif
  - GET /api/ml/conducteurs sans colonnes actif et en_ligne
  - VALEURS_DEFAUT sans vitesse_moyenne
"""

import re
import logging
from datetime import date

from fastapi        import APIRouter, Depends, HTTPException
from pydantic       import ValidationError
from sqlalchemy.orm import Session
from sqlalchemy     import text

from database              import get_db
from schemas.score_schema  import ScoreRequest, ScoreResponse
from services.ml_score_service import calculer_score_ml

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ml", tags=["Score ML"])


# ══════════════════════════════════════════════════════════════
# CONSTANTES
# ══════════════════════════════════════════════════════════════
VALEURS_DEFAUT = {
    "nb_fatigue":     0,
    "nb_telephone":   0,
    "nb_ceinture":    0,
    "nb_tabagisme":   0,
    "nb_distraction": 0,
    "nb_head_pose":   0,
    "nb_fcw":         0,
    "nb_ldw":         0,
    "nb_total":       0,
    "score_valeur":   0.0,
    "score_pct":      0.0,
    "ratio_graves":   0.0,
    "niveau_risque":  "FAIBLE",
    "date_calcul":    str(date.today()),
    "message":        "Aucun événement détecté — score par défaut",
}


# ══════════════════════════════════════════════════════════════
# HELPERS PRIVÉS
# ══════════════════════════════════════════════════════════════

def _valider_id(conducteur_id: str) -> None:
    """Valide le format ^C[0-9]+$ — HTTP 400 si invalide"""
    if not re.match(r"^C[0-9]+$", conducteur_id):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Format ID invalide : '{conducteur_id}'. "
                f"Attendu : C suivi de chiffres (ex: C10, C15)"
            )
        )


def _conducteur_existe(conducteur_id: str, db: Session) -> bool:
    """
    Vérifie que le conducteur existe en base.
    CORRECTION : sans filtre actif (colonne supprimée)
    """
    try:
        sql   = text(
            "SELECT COUNT(1) FROM conducteurs WHERE id = :cid"
        )
        count = db.execute(sql, {"cid": conducteur_id}).scalar()
        return int(count or 0) > 0
    except Exception as exc:
        logger.error(
            "[ROUTER] Erreur vérification conducteur %s : %s",
            conducteur_id, exc
        )
        return False


def _securiser_resultat(conducteur_id: str, resultat: dict) -> dict:
    """
    Complète le dict avec les valeurs par défaut
    pour les champs manquants.
    """
    resultat["conducteur_id"] = conducteur_id
    manquants = []
    for champ, defaut in VALEURS_DEFAUT.items():
        if champ not in resultat or resultat[champ] is None:
            resultat[champ] = defaut
            manquants.append(champ)
    if manquants:
        logger.warning(
            "[ROUTER] Champs complétés pour %s : %s",
            conducteur_id, ", ".join(manquants)
        )
    return resultat


def _resultat_vers_response(
    conducteur_id: str,
    resultat: dict
) -> ScoreResponse:
    """Convertit le dict en ScoreResponse Pydantic"""
    resultat = _securiser_resultat(conducteur_id, resultat)
    try:
        return ScoreResponse(**resultat)
    except ValidationError as ve:
        logger.error(
            "[ROUTER] ValidationError pour %s : %s",
            conducteur_id, ve
        )
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne ML pour '{conducteur_id}'"
        )


# ══════════════════════════════════════════════════════════════
# POST /api/ml/score
# ══════════════════════════════════════════════════════════════
@router.post(
    "/score",
    response_model=ScoreResponse,
    summary="Calculer score de risque via Random Forest"
)
async def calculer_score(
    request: ScoreRequest,
    db: Session = Depends(get_db)
):
    conducteur_id = request.conducteur_id.strip()
    _valider_id(conducteur_id)
    logger.info(
        "[ROUTE] POST /api/ml/score conducteur=%s", conducteur_id
    )

    if not _conducteur_existe(conducteur_id, db):
        raise HTTPException(
            status_code=404,
            detail=f"Conducteur '{conducteur_id}' introuvable"
        )

    try:
        resultat = calculer_score_ml(conducteur_id, db)
        if resultat is None:
            raise HTTPException(
                status_code=404,
                detail=f"Aucune donnée pour '{conducteur_id}'"
            )
        response = _resultat_vers_response(conducteur_id, resultat)
        logger.info(
            "[ROUTE] POST OK %s score=%.4f %s",
            conducteur_id, response.score_valeur, response.niveau_risque
        )
        return response
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(
            "[ROUTE] POST Erreur %s : %s", conducteur_id, exc,
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne : {str(exc)}"
        )


# ══════════════════════════════════════════════════════════════
# GET /api/ml/score/{conducteur_id}
# ══════════════════════════════════════════════════════════════
@router.get(
    "/score/{conducteur_id}",
    response_model=ScoreResponse,
    summary="Calculer score via GET"
)
async def calculer_score_get(
    conducteur_id: str,
    db: Session = Depends(get_db)
):
    conducteur_id = conducteur_id.strip()
    _valider_id(conducteur_id)
    logger.info(
        "[ROUTE] GET /api/ml/score/%s", conducteur_id
    )

    if not _conducteur_existe(conducteur_id, db):
        raise HTTPException(
            status_code=404,
            detail=f"Conducteur '{conducteur_id}' introuvable"
        )

    try:
        resultat = calculer_score_ml(conducteur_id, db)
        if resultat is None:
            raise HTTPException(
                status_code=404,
                detail=f"Aucune donnée pour '{conducteur_id}'"
            )
        response = _resultat_vers_response(conducteur_id, resultat)
        logger.info(
            "[ROUTE] GET OK %s score=%.4f %s",
            conducteur_id, response.score_valeur, response.niveau_risque
        )
        return response
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(
            "[ROUTE] GET Erreur %s : %s", conducteur_id, exc,
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne : {str(exc)}"
        )


# ══════════════════════════════════════════════════════════════
# GET /api/ml/conducteurs
# ══════════════════════════════════════════════════════════════
@router.get(
    "/conducteurs",
    summary="Liste tous les conducteurs avec leur score actuel"
)
async def get_tous_conducteurs(db: Session = Depends(get_db)):
    """
    CORRECTION : sans colonnes actif et en_ligne (supprimées)
    """
    sql = text("""
        SELECT
            c.id,
            c.nom,
            c.prenom,
            c.nom_vehicule,
            CAST(c.score_journalier AS FLOAT)       AS score_journalier,
            ROUND(
                CAST(c.score_journalier AS NUMERIC) * 100, 1
            )                                       AS score_pct,
            CASE
                WHEN c.score_journalier < 0.25 THEN 'FAIBLE'
                WHEN c.score_journalier < 0.50 THEN 'MODERE'
                WHEN c.score_journalier < 0.75 THEN 'ELEVE'
                ELSE                                'CRITIQUE'
            END                                     AS niveau_risque,
            c.cree_par_gestionnaire
        FROM   conducteurs c
        ORDER  BY c.score_journalier DESC
    """)

    try:
        rows = db.execute(sql).fetchall()
    except Exception as exc:
        logger.error(
            "[ROUTE] GET /conducteurs — Erreur SQL : %s", exc
        )
        raise HTTPException(
            status_code=500,
            detail=f"Erreur base de données : {str(exc)}"
        )

    conducteurs = [
        {
            "id":                    r[0],
            "nom":                   r[1],
            "prenom":                r[2],
            "nom_vehicule":          r[3],
            "score_journalier":      float(r[4]) if r[4] else 0.0,
            "score_pct":             float(r[5]) if r[5] else 0.0,
            "niveau_risque":         r[6],
            "cree_par_gestionnaire": r[7],
        }
        for r in rows
    ]

    logger.info(
        "[ROUTE] GET /conducteurs — %d conducteurs retournés",
        len(conducteurs)
    )
    return {"total": len(conducteurs), "conducteurs": conducteurs}