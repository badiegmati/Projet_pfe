@echo off
chcp 65001 >nul
color 0B
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║      COUCHE 3 — ML SERVICE FASTAPI — RESUME COMPLET                       ║
echo ║      Alpha Technology — PFE 2024-2025 — ADAS/DMS                          ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  ROLE DU ML SERVICE — FASTAPI                                               │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   FastAPI ML Service est le MOTEUR DE SCORING INTELLIGENT du systeme ADAS/DMS.
echo.
echo   Il assure :
echo     [RF]      Modele Random Forest (100 arbres, 9 features, 4 classes)
echo     [HYBRID]  Score final = RF x 60%% + Algorithme direct x 40%%
echo     [SCHED]   Recalcul automatique toutes les heures (APScheduler)
echo     [API]     REST API FastAPI (port 8001) avec Swagger UI
echo     [SAVE]    Sauvegarde scores_risque + update conducteurs.score_journalier
echo     [VALID]   Validation format ID ^C[0-9]+$ + existence conducteur
echo.
echo   FLUX PRINCIPAL :
echo   Spring Boot (declencheur) ou APScheduler (horaire)
echo     → FastAPI POST /api/ml/score
echo       → feature_extractor.py (9 features depuis PostgreSQL)
echo       → Random Forest predict_proba (4 classes)
echo       → Score RF x 0.60 + Score direct x 0.40
echo       → INSERT scores_risque (PostgreSQL dms-adas2)
echo       → UPDATE conducteurs.score_journalier (PostgreSQL)
echo.
echo   BASE DE DONNEES : postgresql://postgres:123@localhost:5432/dms-adas2
echo   PAS de RabbitMQ — calcul declenche directement par Spring Boot
echo   PAS de gps_logs_supabase — table GPS supprimee
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  CONFIGURATION                                                              │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   SERVER :
echo     Port    : 8001
echo     Host    : 0.0.0.0
echo     Docs    : http://localhost:8001/docs  (Swagger UI)
echo     Redoc   : http://localhost:8001/redoc
echo.
echo   POSTGRESQL 18 LOCAL :
echo     URL      : postgresql://postgres:123@localhost:5432/dms-adas2
echo     Pool     : pool_size=5, max_overflow=10
echo     Recycle  : 1800 secondes (30 min)
echo     PrePing  : True (verification avant utilisation)
echo.
echo   MODELE RANDOM FOREST :
echo     n_estimators : 100 arbres
echo     max_depth    : 8
echo     random_state : 42 (reproductibilite)
echo     n_jobs       : -1 (parallelisation maximale)
echo     Donnees      : 28 profils synthetiques (7 par classe)
echo     Classes      : 0=FAIBLE, 1=MODERE, 2=ELEVE, 3=CRITIQUE
echo     Initialise   : en memoire au demarrage (pas de fichier .pkl)
echo.
echo   SCHEDULER APScheduler :
echo     Timezone : Africa/Tunis
echo     Trigger  : interval, hours=1
echo     Max inst : 1 (pas de chevauchement)
echo     Coalesce : True
echo.
echo   CORS :
echo     Origines : http://localhost:5173 (React Vite)
echo                http://localhost:3000
echo                http://localhost:8080 (Spring Boot)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  STRUCTURE DES FICHIERS                                                     │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   couche3_backend/ml-service/
echo   ├── main.py                        ← Point entree FastAPI + lifespan
echo   │                                    Startup : DB + RF + scheduler
echo   │                                    Shutdown : arret propre
echo   ├── database.py                    ← Connexion PostgreSQL SQLAlchemy
echo   │                                    SessionLocal + get_db() + tester_connexion()
echo   ├── requirements.txt               ← Dependances Python
echo   ├── schemas/
echo   │   └── score_schema.py            ← Modeles Pydantic
echo   │                                    ScoreRequest, ScoreResponse (sans vitesse)
echo   │                                    FeatureVector (9 features)
echo   │                                    ConducteurScoreInfo
echo   ├── services/
echo   │   ├── feature_extractor.py       ← Extraction 9 features PostgreSQL
echo   │   │                                Fenetre 1 AN (365 jours)
echo   │   │                                Sans vitesse_kmh (colonne absente)
echo   │   └── ml_score_service.py        ← Random Forest + scoring hybride
echo   │                                    initialiser_modele() au demarrage
echo   │                                    calculer_score_ml() par conducteur
echo   │                                    _calculer_score_direct() complement
echo   │                                    _sauvegarder_score() PostgreSQL
echo   └── routes/
echo       ├── score_router.py            ← Endpoints /api/ml/**
echo       │                                POST /api/ml/score
echo       │                                GET  /api/ml/score/{id}
echo       │                                GET  /api/ml/conducteurs
echo       └── health_router.py           ← GET /health + GET /
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  9 FEATURES COMPORTEMENTALES                                                │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Fenetre : 1 AN (365 jours = 8760 heures)
echo   Source  : table evenements (PostgreSQL dms-adas2)
echo   Requete : GROUP BY type_evenement, COUNT(*)
echo.
echo   FEATURE 1  : freq_fatigue_par_heure
echo     = (FATIGUE_EYES_CLOSED + FATIGUE_EYES_DROWSY +
echo        FATIGUE_YAWN + FATIGUE_DROP) / 8760
echo.
echo   FEATURE 2  : freq_telephone_par_heure
echo     = PHONE / 8760
echo.
echo   FEATURE 3  : freq_ceinture_par_heure
echo     = SEATBELT / 8760
echo.
echo   FEATURE 4  : freq_tabagisme_par_heure
echo     = SMOKING / 8760
echo.
echo   FEATURE 5  : freq_distraction_par_heure
echo     = DISTRACTION / 8760
echo.
echo   FEATURE 6  : nb_alertes_fcw
echo     = FCW_WARNING + FCW_DANGER
echo.
echo   FEATURE 7  : nb_alertes_ldw
echo     = LDW_LEFT + LDW_RIGHT
echo.
echo   FEATURE 8  : nb_total_alertes
echo     = somme de tous les evenements
echo.
echo   FEATURE 9  : ratio_alertes_graves
echo     = nb_graves / nb_total
echo     Graves = FATIGUE_EYES_CLOSED, FCW_DANGER (CRITIQUE)
echo            + FATIGUE_EYES_DROWSY, FATIGUE_DROP, PHONE,
echo              SEATBELT, FCW_WARNING (ELEVE)
echo.
echo   NOTE : vitesse_moyenne supprimee (vitesse_kmh absent de evenements)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  ALGORITHME DE SCORING HYBRIDE                                              │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ETAPE 1 : Extraction 9 features depuis PostgreSQL
echo.
echo   ETAPE 2 : Prediction Random Forest
echo     predict_proba(X) → [P(FAIBLE), P(MODERE), P(ELEVE), P(CRITIQUE)]
echo     Centres intervalles : [0.125, 0.375, 0.625, 0.875]
echo     score_rf = somme(probas * centres)
echo.
echo   ETAPE 3 : Score direct (algorithme metier)
echo     score += min(nb_fatigue     * 0.08, 0.30)
echo     score += min(nb_telephone   * 0.10, 0.20)
echo     score += min(nb_ceinture    * 0.05, 0.10)
echo     score += min(nb_tabagisme   * 0.03, 0.08)
echo     score += min(nb_distraction * 0.04, 0.10)
echo     score += min(nb_head_pose   * 0.03, 0.06)
echo     score += min(nb_fcw         * 0.06, 0.12)
echo     score += min(nb_ldw         * 0.03, 0.06)
echo     score += ratio_graves       * 0.10
echo.
echo   ETAPE 4 : Score final hybride
echo     score_final = (score_rf * 0.60) + (score_direct * 0.40)
echo     Clamp [0.0000, 1.0000]
echo.
echo   ETAPE 5 : Determination niveau de risque
echo     [0.00 - 0.25[ → FAIBLE   (vert)
echo     [0.25 - 0.50[ → MODERE   (jaune)
echo     [0.50 - 0.75[ → ELEVE    (orange)
echo     [0.75 - 1.00] → CRITIQUE (rouge)
echo.
echo   ETAPE 6 : Sauvegarde PostgreSQL
echo     INSERT scores_risque (SANS vitesse_moyenne)
echo     UPDATE conducteurs.score_journalier
echo     ON CONFLICT (conducteur_id, date_calcul, heure_calcul)
echo     DO UPDATE SET score_valeur, niveau_risque, timestamp
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  ENDPOINTS API REST ML SERVICE                                              │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ── SANTE ──────────────────────────────────────────────────────────────────
echo     GET  /            ← Page accueil (liste endpoints)
echo     GET  /health      ← Status UP/DEGRADED + database OK/KO
echo     GET  /docs        ← Swagger UI (documentation interactive)
echo     GET  /redoc       ← ReDoc (documentation alternative)
echo.
echo   ── SCORING ────────────────────────────────────────────────────────────────
echo     POST /api/ml/score
echo       Body   : {"conducteur_id": "C10"}
echo       Retour : ScoreResponse complet
echo       Codes  : 200 OK / 400 ID invalide / 404 introuvable / 500 erreur
echo.
echo     GET  /api/ml/score/{conducteur_id}
echo       Raccourci GET equivalent au POST
echo       Exemple : GET /api/ml/score/C10
echo       Codes   : 200 OK / 400 ID invalide / 404 introuvable / 500 erreur
echo.
echo   ── CONDUCTEURS ────────────────────────────────────────────────────────────
echo     GET  /api/ml/conducteurs
echo       Retour : {total, conducteurs[]} tries par score DESC
echo       Champs : id, nom, prenom, nom_vehicule,
echo                score_journalier, score_pct, niveau_risque,
echo                cree_par_gestionnaire
echo       NOTE   : SANS colonnes actif et en_ligne (supprimees)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  VALIDATIONS ET REGLES METIER                                               │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   REGLE 1 — Format ID Conducteur
echo     Regex      : ^C[0-9]+$ (obligatoire)
echo     Exemples   : C10, C12, C16, C25
echo     Si invalide: HTTP 400 avec message explicite
echo     Valide dans: _valider_id() dans score_router.py
echo.
echo   REGLE 2 — Existence conducteur en base
echo     SELECT COUNT(1) FROM conducteurs WHERE id = :cid
echo     NOTE : SANS filtre actif (colonne supprimee)
echo     Si absent  : HTTP 404
echo     Valide dans: _conducteur_existe() dans score_router.py
echo.
echo   REGLE 3 — Conducteur sans evenements
echo     Retourne score=0.0, niveau=FAIBLE, nb_total=0
echo     Message : "Aucun evenement detecte"
echo     PAS de HTTP 404 — reponse ScoreResponse valide
echo.
echo   REGLE 4 — Champs manquants dans reponse ML
echo     _securiser_resultat() complete avec VALEURS_DEFAUT
echo     Evite ValidationError Pydantic
echo     Champs par defaut : 0 (entiers), 0.0 (floats),
echo       "FAIBLE" (niveau), date du jour (date_calcul)
echo.
echo   REGLE 5 — Colonne actif absente
echo     conducteurs : PAS de WHERE actif = TRUE
echo     main.py scheduler : SELECT id FROM conducteurs (sans filtre)
echo     score_router : _conducteur_existe() sans actif
echo     GET /conducteurs : sans WHERE actif
echo.
echo   REGLE 6 — Colonne vitesse_moyenne absente
echo     scores_risque : INSERT sans vitesse_moyenne
echo     ScoreResponse : sans champ vitesse_moyenne
echo     feature_extractor : sans AVG(vitesse_kmh)
echo     VALEURS_DEFAUT : sans vitesse_moyenne
echo.
echo   REGLE 7 — Fenetre 1 AN obligatoire
echo     datetime.utcnow() - timedelta(days=365)
echo     = 8760 heures pour calcul frequences
echo     Necessite car donnees Supabase datent de mai 2026
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  DONNEES D'ENTRAINEMENT RANDOM FOREST                                       │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   28 profils synthetiques — 7 par niveau de risque
echo.
echo   FAIBLE (score cible ≈ 0.10) — 7 profils :
echo     freq_fatigue ≈ 0.000-0.000342  nb_total = 0-2
echo     ratio_graves ≈ 0.00-0.20
echo     Profil : conducteur tres prudent, rares evenements mineurs
echo.
echo   MODERE (score cible ≈ 0.35) — 7 profils :
echo     freq_fatigue ≈ 0.000913-0.002283  nb_total = 5-10
echo     ratio_graves ≈ 0.29-0.40
echo     Profil : quelques evenements, surtout mineurs
echo.
echo   ELEVE (score cible ≈ 0.62) — 7 profils :
echo     freq_fatigue ≈ 0.003425-0.005707  nb_total = 15-25
echo     ratio_graves ≈ 0.55-0.70
echo     Profil : evenements frequents, majorite graves
echo.
echo   CRITIQUE (score cible ≈ 0.88) — 7 profils :
echo     freq_fatigue ≈ 0.008561-0.013699  nb_total = 40-60
echo     ratio_graves ≈ 0.83-0.92
echo     Profil : tres nombreux evenements graves
echo.
echo   Labels : 0=FAIBLE, 1=MODERE, 2=ELEVE, 3=CRITIQUE
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  TABLES POSTGRESQL UTILISEES PAR ML SERVICE                                 │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   LECTURE :
echo     evenements       ← extraction 9 features (GROUP BY type_evenement)
echo     conducteurs      ← verification existence + liste pour scheduler
echo.
echo   ECRITURE :
echo     scores_risque    ← INSERT avec ON CONFLICT DO UPDATE
echo       Colonnes ecrites :
echo         conducteur_id, date_calcul, heure_calcul
echo         score_valeur, niveau_risque
echo         nb_fatigue, nb_telephone, nb_ceinture
echo         nb_tabagisme, nb_distraction, nb_head_pose
echo         nb_fcw, nb_ldw, nb_total
echo         ratio_graves, timestamp
echo       SANS : vitesse_moyenne (colonne supprimee)
echo       UNIQUE(conducteur_id, date_calcul, heure_calcul)
echo.
echo     conducteurs      ← UPDATE score_journalier + date_modification
echo.
echo   BASE : dms-adas2 (CORRECTION vs version initiale adas_dms)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  RESULTATS TESTS — 10/10 OK                                                 │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Health check              : OK — status=UP, database=OK
echo   Root endpoint             : OK — liste endpoints
echo   Score C10 (GET)           : OK — 0.6247 (62.5%%) ELEVE
echo   Score C12 (GET)           : OK — 0.4375 (43.8%%) MODERE
echo   Score C16 (GET)           : OK — 0.0000 (0.0%%)  FAIBLE (0 evt)
echo   Score C10 (POST)          : OK — 0.6247 (62.5%%) ELEVE
echo   Liste conducteurs         : OK — 5 conducteurs
echo   ID invalide ABC → 400     : OK — HTTP 400 attendu
echo   ID invalide G1  → 400     : OK — HTTP 400 attendu
echo   Conducteur C99  → 404     : OK — HTTP 404 attendu
echo.
echo   COHERENCE INTER-MOTEURS C10 :
echo     Spring Boot (expert)    : 0.6247 → ELEVE
echo     FastAPI (RF hybride)    : 0.6247 → ELEVE
echo     Verdict                 : MEME SCORE ET NIVEAU CONFIRME
echo.
echo   SCORES PAR CONDUCTEUR :
echo     C10 Trabelsi Ahmed    : 74 evt → 0.6247 (62.5%%) ELEVE
echo     C12 Mansouri Sami     : 20 evt → 0.4375 (43.8%%) MODERE
echo     C16 Khelifi Youssef   :  0 evt → 0.0000 ( 0.0%%) FAIBLE
echo     C17 gmati badie       :  0 evt → 0.0000 ( 0.0%%) FAIBLE
echo     C13 Bouazizi Mohamed  :  0 evt → 0.0000 ( 0.0%%) FAIBLE
echo.
echo   VERIFICATION POSTGRESQL (via Spring Boot) :
echo     scores_risque id=119  : C10 / 0.6247 / ELEVE / nb_total=74
echo     Historique C10        : 10 scores enregistres
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  CORRECTIONS APPLIQUEES VS VERSION INITIALE                                 │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   CORRECTION 1 : database.py
echo     adas_dms → dms-adas2 (nom base PostgreSQL correct)
echo.
echo   CORRECTION 2 : main.py scheduler
echo     WHERE actif = TRUE → supprime (colonne inexistante)
echo     SELECT id FROM conducteurs ORDER BY id
echo.
echo   CORRECTION 3 : main.py logging
echo     open(sys.stdout.fileno()...) → io.TextIOWrapper (Windows OK)
echo.
echo   CORRECTION 4 : score_router.py — _conducteur_existe()
echo     AND actif = TRUE → supprime (colonne inexistante)
echo.
echo   CORRECTION 5 : score_router.py — GET /conducteurs
echo     c.en_ligne → supprime (colonne inexistante)
echo     WHERE actif = TRUE → supprime
echo.
echo   CORRECTION 6 : score_router.py — VALEURS_DEFAUT
echo     vitesse_moyenne → supprime (champ inexistant)
echo.
echo   CORRECTION 7 : feature_extractor.py
echo     AVG(vitesse_kmh) → supprime (colonne absente de evenements)
echo     10 features → 9 features (sans vitesse)
echo     7 jours → 365 jours (fenetre 1 an)
echo.
echo   CORRECTION 8 : ml_score_service.py
echo     vitesse_moyenne_kmh en feature → supprime
echo     X_train 10 colonnes → 9 colonnes
echo     INSERT vitesse_moyenne → supprime (colonne absente)
echo     vitesse > 100 bonus → supprime
echo.
echo   CORRECTION 9 : score_schema.py
echo     vitesse_moyenne: float → supprime de ScoreResponse
echo     FeatureVector 10 → 9 features
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  COMMANDES UTILES                                                           │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   DEMARRER ML SERVICE :
echo     cd couche3_backend\ml-service
echo     python main.py
echo.
echo   VERIFIER SANTE :
echo     curl http://localhost:8001/health
echo.
echo   TESTER SCORE C10 (GET) :
echo     curl http://localhost:8001/api/ml/score/C10
echo.
echo   TESTER SCORE C10 (POST) :
echo     curl -X POST http://localhost:8001/api/ml/score
echo          -H "Content-Type: application/json"
echo          -d "{\"conducteur_id\": \"C10\"}"
echo.
echo   LISTE CONDUCTEURS :
echo     curl http://localhost:8001/api/ml/conducteurs
echo.
echo   SWAGGER UI (navigateur) :
echo     http://localhost:8001/docs
echo.
echo   INSTALLER DEPENDANCES :
echo     pip install -r requirements.txt
echo.
echo   LOGS AU DEMARRAGE (attendus) :
echo     [DB]      Connexion PostgreSQL 18 OK — dms-adas2
echo     [ML]      Construction modele Random Forest (9 features)...
echo     [ML]      Modele RF entraine : 100 arbres, 4 classes, 9 features
echo     [ML]      Modele RF pret pour scoring
echo     [STARTUP] Modele Random Forest OK
echo     [STARTUP] Scheduler OK — calcul scores / heure
echo     [STARTUP] ML Service pret sur http://localhost:8001
echo.
echo   PREFIXES LOGS EN COURS :
echo     [DB]        → database.py (connexion)
echo     [ML]        → ml_score_service.py (modele + calcul)
echo     [FEATURES]  → feature_extractor.py (extraction)
echo     [ROUTE]     → score_router.py (endpoints)
echo     [ROUTER]    → score_router.py (helpers)
echo     [SCHEDULER] → main.py (job horaire)
echo     [STARTUP]   → main.py (demarrage)
echo     [SHUTDOWN]  → main.py (arret)
echo.

echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║  ML SERVICE FASTAPI — TERMINE ET VALIDE                                   ║
echo ║                                                                            ║
echo ║  Statut   : 10/10 tests OK — 100%% operationnel                           ║
echo ║  Modele   : Random Forest (100 arbres, 9 features, 4 classes)             ║
echo ║  Hybride  : RF x 60%% + Direct x 40%%                                     ║
echo ║  Fenetre  : 1 AN (365 jours) — donnees Supabase mai 2026                 ║
echo ║  Base     : dms-adas2 / postgres / 123                                    ║
echo ║  Port     : 8001                                                           ║
echo ║                                                                            ║
echo ║  Coherence inter-moteurs C10 :                                            ║
echo ║    Spring Boot : 0.6247 → ELEVE                                           ║
echo ║    FastAPI ML  : 0.6247 → ELEVE  CONFIRME                                ║
echo ║                                                                            ║
echo ║  Prochain : SPRINT 5 → Frontend React 18 + Vite + Tailwind CSS           ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
pause