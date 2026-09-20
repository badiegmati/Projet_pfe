"""
database.py — Connexion PostgreSQL 18 via SQLAlchemy
Alpha Technology — PFE 2024-2025
Base : dms-adas2 (CORRECTION : pas adas_dms)
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import logging

logger = logging.getLogger(__name__)

# ══════════════════════════════════════════════════════════════
# CONFIGURATION CONNEXION
# Base : dms-adas2 / User : postgres / Password : 123
# ══════════════════════════════════════════════════════════════
DATABASE_URL = "postgresql://postgres:123@localhost:5432/dms-adas2"

engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,      # Vérifie connexion avant utilisation
    pool_recycle=1800,       # Recycle connexion toutes les 30 min
    echo=False               # Pas de log SQL en production
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db() -> Session:
    """
    Générateur de session — utiliser avec Depends(get_db)
    Ferme automatiquement la session après utilisation
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def tester_connexion() -> bool:
    """
    Teste la connexion à PostgreSQL au démarrage
    Retourne True si OK, False sinon
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("[DB] Connexion PostgreSQL 18 OK — dms-adas2")
        return True
    except Exception as e:
        logger.error("[DB] Erreur connexion PostgreSQL : %s", e)
        return False