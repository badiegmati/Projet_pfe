"""
main.py — Point d'entrée FastAPI ML Service
Alpha Technology — PFE 2024-2025

PORT     : 8001
DB       : postgresql://postgres:123@localhost:5432/dms-adas2
MODELE   : Random Forest (scikit-learn)
SCHEDULE : Calcul scores toutes les heures (APScheduler)

CORRECTIONS :
  - Colonne actif supprimée de conducteurs → SELECT sans filtre actif
  - Encoding UTF-8 Windows corrigé (io.TextIOWrapper)
"""

import io
import sys
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

from database import tester_connexion, SessionLocal
from services.ml_score_service import initialiser_modele, calculer_score_ml
from routes.score_router  import router as score_router
from routes.health_router import router as health_router

# ══════════════════════════════════════════════════════════════
# CONFIGURATION LOGGING — encodage UTF-8 Windows (correction)
# ══════════════════════════════════════════════════════════════
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════
# SCHEDULER — Calcul scores toutes les heures
# ══════════════════════════════════════════════════════════════
scheduler = BackgroundScheduler(timezone="Africa/Tunis")


def job_calcul_scores_tous():
    """
    Job planifié — calcule le score de tous les conducteurs
    Exécuté toutes les heures.
    CORRECTION : pas de filtre actif (colonne supprimée)
    """
    from sqlalchemy import text

    logger.info("[SCHEDULER] Début calcul scores horaire...")
    db = SessionLocal()

    try:
        # CORRECTION : sans WHERE actif = TRUE (colonne inexistante)
        rows = db.execute(
            text("SELECT id FROM conducteurs ORDER BY id")
        ).fetchall()

        conducteurs = [r[0] for r in rows]
        logger.info(
            "[SCHEDULER] %d conducteur(s) à scorer",
            len(conducteurs)
        )

        ok = 0
        ko = 0
        for cid in conducteurs:
            try:
                resultat = calculer_score_ml(cid, db)
                if resultat and resultat.get("nb_total", 0) > 0:
                    logger.info(
                        "[SCHEDULER] OK %s score=%.4f (%s)",
                        cid,
                        resultat["score_valeur"],
                        resultat["niveau_risque"]
                    )
                    ok += 1
                else:
                    logger.debug(
                        "[SCHEDULER] Pas de données pour %s", cid
                    )
            except Exception as e:
                logger.error(
                    "[SCHEDULER] Erreur score %s : %s", cid, e
                )
                ko += 1

        logger.info("[SCHEDULER] Fin : %d OK, %d KO", ok, ko)

    except Exception as e:
        logger.error("[SCHEDULER] Erreur critique : %s", e)
    finally:
        db.close()


# ══════════════════════════════════════════════════════════════
# LIFESPAN
# ══════════════════════════════════════════════════════════════
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Cycle de vie FastAPI
    Startup  : DB + modèle RF + scheduler
    Shutdown : arrêt propre
    """
    # ── STARTUP ─────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info(" Alpha Technology — ML Score Service")
    logger.info(" PFE ADAS/DMS 2024-2025 — Port 8001")
    logger.info("=" * 60)

    # 1. Tester connexion PostgreSQL
    if not tester_connexion():
        logger.error("[STARTUP] Impossible de connecter PostgreSQL !")
        logger.error(
            "[STARTUP] Vérifiez PostgreSQL 18 sur port 5432 "
            "— base dms-adas2"
        )

    # 2. Initialiser le modèle Random Forest
    try:
        initialiser_modele()
        logger.info("[STARTUP] Modèle Random Forest OK")
    except Exception as e:
        logger.error("[STARTUP] Erreur init modèle : %s", e)

    # 3. Démarrer le scheduler
    try:
        scheduler.add_job(
            job_calcul_scores_tous,
            trigger="interval",
            hours=1,
            id="calcul_scores_horaire",
            replace_existing=True,
            max_instances=1,
            coalesce=True
        )
        scheduler.start()
        logger.info("[STARTUP] Scheduler OK — calcul scores / heure")
    except Exception as e:
        logger.error("[STARTUP] Erreur scheduler : %s", e)

    logger.info(
        "[STARTUP] ML Service prêt sur http://localhost:8001"
    )
    logger.info("[STARTUP] Docs : http://localhost:8001/docs")
    logger.info("=" * 60)

    yield

    # ── SHUTDOWN ─────────────────────────────────────────────
    logger.info("[SHUTDOWN] Arrêt scheduler...")
    try:
        if scheduler.running:
            scheduler.shutdown(wait=False)
            logger.info("[SHUTDOWN] Scheduler arrêté OK")
    except Exception as e:
        logger.error("[SHUTDOWN] Erreur arrêt : %s", e)

    logger.info("[SHUTDOWN] ML Service arrêté proprement")


# ══════════════════════════════════════════════════════════════
# APPLICATION FASTAPI
# ══════════════════════════════════════════════════════════════
app = FastAPI(
    title="Alpha Technology — ML Score Service",
    description="""
## Microservice scoring risque conducteur ADAS/DMS

**Niveaux de risque :**
- FAIBLE   : 0.00 à 0.25
- MODERE   : 0.25 à 0.50
- ELEVE    : 0.50 à 0.75
- CRITIQUE : 0.75 à 1.00

**9 Features comportementales (vitesse supprimée) :**
freq_fatigue, freq_telephone, freq_ceinture,
freq_tabagisme, freq_distraction, nb_fcw, nb_ldw,
nb_total_alertes, ratio_alertes_graves
    """,
    version="1.0.0",
    contact={
        "name":  "Alpha Technology",
        "email": "contact@alphatechnology.tn"
    },
    lifespan=lifespan
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ROUTERS ───────────────────────────────────────────────────
app.include_router(health_router)
app.include_router(score_router)


# ══════════════════════════════════════════════════════════════
# POINT D'ENTRÉE
# ══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8001,
            reload=False,
            log_level="info",
            access_log=True
        )
    except (KeyboardInterrupt, SystemExit):
        pass