"""
score_schema.py — Schémas Pydantic pour l'API ML
Alpha Technology — PFE 2024-2025
CORRECTION : vitesse_moyenne supprimée (absent de scores_risque)
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class ScoreRequest(BaseModel):
    """
    Requête de calcul de score pour un conducteur
    Envoyée par Spring Boot ou appelée par le scheduler
    """
    conducteur_id: str = Field(
        ...,
        description="ID conducteur format C+chiffres",
        example="C10"
    )


class ScoreResponse(BaseModel):
    """
    Réponse score de risque calculé par le ML
    CORRECTION : vitesse_moyenne supprimée
    """
    conducteur_id:  str
    score_valeur:   float = Field(ge=0.0, le=1.0)
    score_pct:      float
    niveau_risque:  str
    nb_fatigue:     int
    nb_telephone:   int
    nb_ceinture:    int
    nb_tabagisme:   int
    nb_distraction: int
    nb_head_pose:   int
    nb_fcw:         int
    nb_ldw:         int
    nb_total:       int
    ratio_graves:   float
    date_calcul:    str
    message:        str

    class Config:
        json_schema_extra = {
            "example": {
                "conducteur_id":  "C10",
                "score_valeur":   0.6846,
                "score_pct":      68.5,
                "niveau_risque":  "ELEVE",
                "nb_fatigue":     9,
                "nb_telephone":   2,
                "nb_ceinture":    2,
                "nb_tabagisme":   0,
                "nb_distraction": 0,
                "nb_head_pose":   0,
                "nb_fcw":         0,
                "nb_ldw":         0,
                "nb_total":       13,
                "ratio_graves":   0.8462,
                "date_calcul":    "2026-05-11",
                "message":        "Score calculé avec succès"
            }
        }


class FeatureVector(BaseModel):
    """
    Vecteur de 9 features pour le modèle Random Forest
    (vitesse_moyenne_kmh supprimée — non disponible dans evenements)
    """
    freq_fatigue_par_heure:     float
    freq_telephone_par_heure:   float
    freq_ceinture_par_heure:    float
    freq_tabagisme_par_heure:   float
    freq_distraction_par_heure: float
    nb_alertes_fcw:             float
    nb_alertes_ldw:             float
    nb_total_alertes:           float
    ratio_alertes_graves:       float


class ConducteurScoreInfo(BaseModel):
    """Information résumée pour un conducteur"""
    conducteur_id:  str
    score_valeur:   float
    niveau_risque:  str
    nb_total:       int
    date_calcul:    Optional[str] = None