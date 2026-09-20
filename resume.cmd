@echo off
chcp 65001 >nul
color 0A
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                       PROJET ADAS / DMS — RESUME DETAILLE                     ║
echo ║                      Alpha Technology — PFE 2024-2025                         ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

echo -------------------------------------------------------------------------------
echo CHAPITRE 1 — CADRE GENERAL, ENTREPRISE, ETAT DE L'ART, METHODOLOGIE, CAHIER
echo -------------------------------------------------------------------------------
echo.
echo Entreprise d'accueil : Alpha Technology — mission : solution ADAS/DMS pour
echo gestion de flotte (supervision, scoring, notifications).
echo.
echo Probleme traite : detections embarquees DMS/ADAS (fatigue, distraction, telephone,
echo ceinture, FCW/LDW), ingestion fiable des evenements, calcul d'un score de risque
echo conducteur exploitable par gestionnaires et conducteurs.
echo.
echo Etat de l'art : combinaisons de CNN legers (YOLOv8n, MobileNet), keypoint-based
echo (EAR/MAR, head-pose), estimation TTC pour ADAS. Evaluation selon precision,
echo latence et robustesse en condition reel.
echo.
echo Methodologie : architecture multi-couches — edge (detections) -> transport
echo (Server Alpha) -> backend Spring Boot (poller, services, DB) -> scoring (RF
echo ou regles metier) -> API -> frontends Web (React) & Mobile (Flutter). Tests unitaires
echo & integration, scripts de validation inclus.
echo.
echo Cahier des charges synthetique :
echo  - Detection temps reel embarquee, filtre duree >= 2s pour reduire faux positifs.
echo  - Anti-doublon, validation ID (regex ^C[0-9]+$), stockage PostgreSQL 18.
echo  - Backend: API REST securisee JWT; roles: ADMINISTRATEUR, GESTIONNAIRE, CONDUCTEUR.
echo  - Frontend: tableaux de bord role-based; mobile Flutter reprenant fonctions essentielles.
echo.

echo -------------------------------------------------------------------------------
echo CHAPITRE 2 — ETUDE TECHNIQUE IA, CHOIX ALGORITHMIQUES DMS / ADAS, BACKEND,
echo SCORING
echo -------------------------------------------------------------------------------
echo.
echo DMS : approche hybride — detection objets/visage (YOLOv8n) + features biometriques
echo (EAR/MAR, head-pose, marquage yawn). Favorise modeles legers pour latence reduite.
echo.
echo ADAS : detection obstacles/vehicules + calcul TTC/vitesse pour declencher FCW/LDW.
echo Seuils metier appliques (ex: vitesse>100 -> penalite score).
echo.
echo Scoring : modele hybride — RandomForest (60%) + algorithme direct pondere (40%).
echo Parametres RF indicatifs : n_estimators=100, max_depth=8, random_state=42.
echo Features : 10 features comportementales sur fenetre glissante 7 jours
echo (freq fatigue, telephone, ceinture, tabagisme, distraction; nb FCW/LDW; vitesse
echo moyenne; nb total; ratio alertes graves).
echo.
echo Architecture backend : Spring Boot modulaire (poller scheduled, services, repos
echo JPA, controllers REST). Poller recupere evenements non-traites depuis Server Alpha
echo puis insert evenements, notifications, journal; patch marque traite=true; lance
echo calcul scores via ScoreService.
echo.

echo -------------------------------------------------------------------------------
echo CHAPITRE 3 — ANALYSE DES BESOINS, CONCEPTION, ARCHITECTURE GLOBALE, UML
echo -------------------------------------------------------------------------------
echo.
echo Acteurs : Administrateur, Gestionnaire, Conducteur. Besoins : gestion des
echo comptes/vehicules, visualisation score/historique, notifications, messagerie.
echo.
echo Architecture globale :
echo  - Couche embarquee (DMS/ADAS) -> Server Alpha (REST) -> Spring Boot (poller,
echo    services) -> PostgreSQL -> Frontend Web (React) / Mobile (Flutter).
echo.
echo Processus metier clefs : ingestion -> anti-doublon -> insert evenements et
echo notifications -> update journal -> calcul scores -> MAJ conducteurs.score_journalier.
echo.
echo Modelisation UML a inclure dans rapport : cas d'utilisation, diagramme de
echo classes (Conducteur, Evenement, ScoreRisque, Notification, GpsLog, JournalEvenement),
echo diagramme de sequence du poller -> server -> repositories -> scoreService.
echo.

echo -------------------------------------------------------------------------------
echo CHAPITRE 4 — REALISATION COUCHE EMBARQUEE, IMPLEMENTATION DETECTION, TESTS
echo -------------------------------------------------------------------------------
echo.
echo Couche embarquee : scripts et modules trouves dans `couche1_pc/` (ADAS.py,
echo DMS.py, gps_simulator.py) et modele `yolov8n.pt` pour detections. Logiciel edge
echo prefiltre duree evenement >= 2s.
echo.
echo Implementation :
echo  - DMS : detection visage, EAR/MAR, head-pose, telephone, ceinture, tabagisme.
echo  - ADAS : detection vehicules/obstacles, calcul TTC, LDW/FCW.
echo.
echo Tests : jeux de donnees synthetiques pour entrainement RF (ex: 28 exemples),
echo scripts PowerShell fournis pour tests end-to-end (health, GET/POST scoring,
echo visualisation frontend). Critere duree>=2.0s applique pour filtrage.
echo.

echo -------------------------------------------------------------------------------
echo CHAPITRE 5 — DEVELOPPEMENT BACKEND, MICROSERVICE SCORING, APPS WEB & MOBILE,
echo VALIDATION GLOBALE
echo -------------------------------------------------------------------------------
echo.
echo Backend : Spring Boot with modules : Auth (JWT), Controllers (Auth, Admin,
echo Gestionnaire, Conducteur, Score, Notifications, Messages), Services (ScoreService,
echo Poller), Repositories JPA. Fichiers references dans le repertoire `couche3_backend`.
echo.
echo Microservice ML : FastAPI (dossier `couche3_backend/ml-service`) expose GET/POST
echo /api/ml/score/{conducteur_id} et scheduler APScheduler (interval=1h) pour calcul
echo periodic; model RandomForest scikit-learn + algorithme direct metier.
echo.
echo Frontend Web : React 18 + Vite. Routes protegees role-based, AuthContext,
echo apiService centralise (baseURL -> http://localhost:8080). Fichiers clefs :
echo `couche4_frontend/src/App.jsx`, `.../api/apiService.js`, pages `LoginPage.jsx`,
echo `DashboardConducteur.jsx`.
echo.
echo Mobile : Flutter app dans `couche4_mobile` (providers, services API, ecrans login,
echo dashboard, historique, messages). Commande : `flutter run`.
echo.
echo Validation globale : tests health, tests scoring, scripts de verification
echo (RESUME_COUCHE3_*.cmd) fournis. Critere acceptance : endpoints UP, scoring
echo coherent, UI mis a jour, notifications deliver.
echo.
echo -------------------------------------------------------------------------------
echo ANNEXES — REFERENCES CODE
echo -------------------------------------------------------------------------------
echo.
echo Backend principal:
echo  - couche3_backend\spring-boot\src\main\java\tn\alphatechnology\adas\AdasDmsApplication.java
echo  - ...\service\SupabasePollerService.java
echo  - ...\service\ScoreService.java
echo  - ...\config\SecurityConfig.java
echo.
echo Frontend Web:
echo  - couche4_frontend\src\App.jsx
echo  - couche4_frontend\src\api\apiService.js
echo  - couche4_frontend\src\context\AuthContext.jsx
echo  - couche4_frontend\src\pages\LoginPage.jsx
echo  - couche4_frontend\src\pages\DashboardConducteur.jsx
echo.
echo Microservice ML (optionnel) : couche3_backend\ml-service\main.py
echo.
echo Embarque : couche1_pc\ADAS.py , couche1_pc\DMS.py , yolov8n.pt
echo.
echo -------------------------------------------------------------------------------
echo FIN DU RESUME.
echo -------------------------------------------------------------------------------
pause
