"""
health_router.py — Route de santé du service ML
Alpha Technology — PFE 2024-2025
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

from database import get_db

router = APIRouter(tags=["Sante"])


@router.get(
    "/health",
    summary="Verification sante du service ML"
)
async def health(db: Session = Depends(get_db)):
    """
    GET /health
    Verifie l'etat du service ML et de la connexion PostgreSQL
    """
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status":    "UP" if db_ok else "DEGRADED",
        # CORRECTION : tiret simple au lieu de tiret long
        "service":   "Alpha Technology ML Service - ADAS/DMS",
        "version":   "1.0.0",
        "modele":    "Random Forest (scikit-learn 1.4.2)",
        "features":  10,
        "classes":   ["FAIBLE", "MODERE", "ELEVE", "CRITIQUE"],
        "database":  "OK" if db_ok else "KO",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@router.get(
    "/",
    summary="Page d'accueil du service ML"
)
async def root():
    """GET / — Information du service"""
    return {
        "service":     "Alpha Technology ML Score Service",
        "description": "Microservice scoring risque conducteur ADAS/DMS",
        "version":     "1.0.0",
        "endpoints": {
            "health":      "GET  /health",
            "score_post":  "POST /api/ml/score",
            "score_get":   "GET  /api/ml/score/{conducteur_id}",
            "conducteurs": "GET  /api/ml/conducteurs",
            "docs":        "GET  /docs",
            "redoc":       "GET  /redoc"
        }
    }