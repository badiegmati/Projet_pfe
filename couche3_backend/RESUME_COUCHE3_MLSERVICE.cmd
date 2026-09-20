@echo off
chcp 65001 >nul
color 0E
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║      COUCHE 3 — ML SERVICE FASTAPI — RESUME COMPLET                       ║
echo ║      Alpha Technology — PFE 2024-2025 — ADAS/DMS                          ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  ROLE DU ML SERVICE                                                         │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Le ML Service calcule le score de risque comportemental
echo   de chaque conducteur en utilisant un modele Random Forest.
echo.
echo   FLUX :
echo   PostgreSQL 18 (evenements 7 jours)
echo     → Extraction 10 features comportementales
echo       → Random Forest (scikit-learn)
echo         → Score final [0.0 - 1.0]
echo           → INSERT scores_risque (PostgreSQL)
echo           → UPDATE conducteurs.score_journalier
echo.
echo   DEUX MODES DE CALCUL :
echo     1. A la demande  : GET/POST /api/ml/score/{conducteur_id}
echo     2. Automatique   : APScheduler toutes les heures
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  CONFIGURATION                                                              │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Port          : 8001
echo   Base de donnees: postgresql://postgres:123@localhost:5432/adas_dms
echo   Modele        : Random Forest (RandomForestClassifier)
echo   Arbres        : 100 (n_estimators=100)
echo   Profondeur    : 8 (max_depth=8)
echo   Reproductible : random_state=42
echo   Scheduler     : APScheduler (interval=1h)
echo   Timezone      : Africa/Tunis
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  STRUCTURE DES FICHIERS                                                     │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   couche3_backend/ml-service/
echo   ├── main.py                       ← Point entree FastAPI (port 8001)
echo   ├── database.py                   ← Connexion PostgreSQL SQLAlchemy
echo   ├── requirements.txt              ← Dependances Python
echo   ├── schemas/
echo   │   └── score_schema.py           ← Modeles Pydantic (request/response)
echo   ├── services/
echo   │   ├── feature_extractor.py      ← Extraction 10 features depuis PostgreSQL
echo   │   └── ml_score_service.py       ← Random Forest + scoring
echo   └── routes/
echo       ├── score_router.py           ← Endpoints /api/ml/score
echo       └── health_router.py          ← Endpoints /health /
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  10 FEATURES COMPORTEMENTALES                                               │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Calculees sur une fenetre de 7 jours glissants :
echo.
echo   1.  freq_fatigue_par_heure
echo         Frequence fatigue / 168 heures
echo         Types : FATIGUE_EYES_CLOSED, FATIGUE_EYES_DROWSY,
echo                 FATIGUE_YAWN, FATIGUE_DROP
echo.
echo   2.  freq_telephone_par_heure
echo         Frequence PHONE / 168 heures
echo.
echo   3.  freq_ceinture_par_heure
echo         Frequence SEATBELT / 168 heures
echo.
echo   4.  freq_tabagisme_par_heure
echo         Frequence SMOKING / 168 heures
echo.
echo   5.  freq_distraction_par_heure
echo         Frequence DISTRACTION / 168 heures
echo.
echo   6.  nb_alertes_fcw
echo         Total FCW_WARNING + FCW_DANGER
echo.
echo   7.  nb_alertes_ldw
echo         Total LDW_LEFT + LDW_RIGHT
echo.
echo   8.  vitesse_moyenne_kmh
echo         Vitesse moyenne des evenements (km/h)
echo.
echo   9.  nb_total_alertes
echo         Nombre total d'evenements toutes categories
echo.
echo   10. ratio_alertes_graves
echo         nb_graves / nb_total (CRITIQUE + ELEVE)
echo         Types graves : FATIGUE_EYES_CLOSED, FCW_DANGER,
echo           FATIGUE_EYES_DROWSY, FATIGUE_DROP, PHONE,
echo           SEATBELT, FCW_WARNING
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  MODELE RANDOM FOREST                                                       │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Donnees entrainement : 28 exemples synthetiques
echo     FAIBLE   : 7 profils (score proche 0.10)
echo     MODERE   : 7 profils (score proche 0.35)
echo     ELEVE    : 7 profils (score proche 0.62)
echo     CRITIQUE : 7 profils (score proche 0.88)
echo.
echo   Prediction : predict_proba → probabilites 4 classes
echo   Score RF = P(FAIBLE)*0.125 + P(MODERE)*0.375
echo            + P(ELEVE)*0.625  + P(CRITIQUE)*0.875
echo.
echo   Score final = (Score RF * 60%) + (Score direct * 40%)
echo.
echo   Algorithme direct (poids metier) :
echo     Fatigue     : nb * 0.08 (max 0.30)
echo     Telephone   : nb * 0.10 (max 0.20)
echo     Ceinture    : nb * 0.05 (max 0.10)
echo     Tabagisme   : nb * 0.03 (max 0.08)
echo     Distraction : nb * 0.04 (max 0.10)
echo     Head Pose   : nb * 0.03 (max 0.06)
echo     FCW         : nb * 0.06 (max 0.12)
echo     LDW         : nb * 0.03 (max 0.06)
echo     Ratio graves: ratio * 0.10
echo     Vitesse>100 : +0.04
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  NIVEAUX DE RISQUE                                                          │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   [0.00 - 0.25[ → FAIBLE   (vert)
echo   [0.25 - 0.50[ → MODERE   (jaune)
echo   [0.50 - 0.75[ → ELEVE    (orange)
echo   [0.75 - 1.00] → CRITIQUE (rouge)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  ENDPOINTS API                                                              │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   PUBLICS (sans authentification) :
echo     GET  /              → Info service
echo     GET  /health        → Sante service + DB
echo     GET  /docs          → Documentation Swagger UI
echo     GET  /redoc         → Documentation ReDoc
echo.
echo   SCORING :
echo     GET  /api/ml/score/{conducteur_id}
echo          → Calcule et retourne le score
echo          → Sauvegarde dans PostgreSQL
echo.
echo     POST /api/ml/score
echo          Body : {"conducteur_id": "C10"}
echo          → Meme resultat que GET
echo.
echo     GET  /api/ml/conducteurs
echo          → Liste tous conducteurs actifs + scores
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  SCHEDULER APSCHEDULER                                                      │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Trigger   : interval (toutes les heures)
echo   Job       : job_calcul_scores_tous()
echo   Action    :
echo     1. SELECT id FROM conducteurs WHERE actif=TRUE
echo     2. Pour chaque conducteur :
echo        calculer_score_ml(conducteur_id, db)
echo     3. Log resultats (OK / KO)
echo.
echo   Avantages :
echo     Scores toujours a jour sans intervention manuelle
echo     Recalcul automatique des 7 derniers jours
echo     Mise a jour conducteurs.score_journalier
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  RESULTATS TESTS                                                            │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   GET /health → 200 UP
echo     status   : UP
echo     database : OK
echo     modele   : Random Forest (scikit-learn 1.4.2)
echo     features : 10
echo.
echo   GET /api/ml/score/C10 → 200
echo     conducteur_id  : C10
echo     score_valeur   : 0.5528
echo     score_pct      : 55.3
echo     niveau_risque  : ELEVE
echo     nb_fatigue     : 9
echo     nb_telephone   : 2
echo     nb_ceinture    : 2
echo     nb_total       : 13
echo     vitesse_moyenne: 50.18 km/h
echo     ratio_graves   : 0.8462
echo.
echo   Coherence avec Spring Boot :
echo     Spring Boot score : 0.6846 (68.5%)
echo     ML Service score  : 0.5528 (55.3%)
echo     Ecart : normal — deux algorithmes differents
echo     Spring Boot : algorithme direct pur
echo     ML Service  : 60% RF + 40% direct
echo     Les deux retournent ELEVE → coherent
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  COMMANDES POWERSHELL — TESTS                                               │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   DEMARRER LE SERVICE :
echo     cd couche3_backend\ml-service
echo     python main.py
echo.
echo   HEALTH CHECK (PowerShell) :
echo     Invoke-RestMethod -Uri "http://localhost:8001/health"
echo.
echo   SCORE CONDUCTEUR GET (PowerShell) :
echo     Invoke-RestMethod -Uri "http://localhost:8001/api/ml/score/C10"
echo.
echo   SCORE CONDUCTEUR POST (PowerShell) :
echo     $body = '{"conducteur_id":"C10"}'
echo     Invoke-RestMethod -Uri "http://localhost:8001/api/ml/score" \
echo       -Method POST \
echo       -ContentType "application/json" \
echo       -Body $body
echo.
echo   LISTE CONDUCTEURS (PowerShell) :
echo     Invoke-RestMethod -Uri "http://localhost:8001/api/ml/conducteurs"
echo.
echo   DOCUMENTATION SWAGGER :
echo     Ouvrir navigateur : http://localhost:8001/docs
echo.
echo   IMPORTANT — PowerShell n'utilise pas curl Linux :
echo     Remplacer : curl -X POST ...
echo     Par       : Invoke-RestMethod -Method POST ...
echo.

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  SCRIPT TEST COMPLET POWERSHELL                                             │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Copier-coller dans PowerShell :
echo.
echo   $ml = "http://localhost:8001"
echo.
echo   # Health
echo   Invoke-RestMethod "$ml/health"
echo.
echo   # Score GET
echo   Invoke-RestMethod "$ml/api/ml/score/C10"
echo.
echo   # Score POST
echo   Invoke-RestMethod "$ml/api/ml/score" \
echo     -Method POST -ContentType "application/json" \
echo     -Body '{"conducteur_id":"C10"}'
echo.
echo   # Liste conducteurs
echo   Invoke-RestMethod "$ml/api/ml/conducteurs"
echo.

echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║  ML SERVICE TERMINE ✓                                                      ║
echo ║  Statut : Service actif port 8001 — Random Forest OK                      ║
echo ║  Score C10 : 0.5528 (55.3%) ELEVE — Coherent avec Spring Boot             ║
echo ║  Prochain : SPRINT 5 → Frontend React 18 + Vite + Tailwind CSS            ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
pause
