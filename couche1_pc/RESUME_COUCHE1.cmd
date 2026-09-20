# `RESUME_COUCHE1.cmd` — Documentation complète

```batch
@echo off
chcp 65001 >nul
color 0A
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║         COUCHE 1 — PC PYTHON — RESUME COMPLET                             ║
echo ║         Alpha Technology — PFE 2024-2025 — ADAS/DMS                       ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  ROLE DE LA COUCHE 1                                                        │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   La Couche 1 est le CERVEAU de detection installe sur le PC du vehicule.
echo.
echo   Elle detecte en temps reel :
echo     [DMS] Fatigue conducteur   : yeux fermes, baillement, tete tombante
echo     [DMS] Distraction          : regard detourne de la route
echo     [DMS] Telephone            : detection via YOLOv8n
echo     [DMS] Cigarette            : mains pres de la bouche
echo     [DMS] Ceinture             : absence de ceinture de securite
echo     [ADAS] FCW                 : vehicule trop proche (collision imminente)
echo     [ADAS] LDW                 : sortie de voie (gauche ou droite)
echo.
echo   FLUX DE DONNEES :
echo   PC Python → SQLite (local) → Supabase (cloud) → Spring Boot → PostgreSQL
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  STRUCTURE DES FICHIERS                                                     │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   couche1_pc/
echo   ├── config/
echo   │   └── config.json          ← CONFIGURATION PRINCIPALE
echo   ├── database/
echo   │   └── events.db            ← SQLITE (cree automatiquement)
echo   ├── DMS.py                   ← DETECTION CONDUCTEUR (CAM PC index=0)
echo   ├── ADAS.py                  ← DETECTION ROUTE    (CAM USB index=1)
echo   ├── Shared.py                ← MODULE PARTAGE DMS+ADAS
echo   ├── sqlite_manager.py        ← GESTIONNAIRE SQLITE
echo   ├── gps_simulator.py         ← SIMULATEUR GPS TUNIS
echo   ├── supabase_sender.py       ← ENVOI VERS SUPABASE
echo   ├── main.py                  ← ORCHESTRATEUR PRINCIPAL
echo   └── requirements.txt         ← DEPENDANCES PYTHON
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  FICHIER 1 : config/config.json                                             │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ROLE : Fichier de configuration central lu par main.py au demarrage.
echo          Aucun argument en ligne de commande — tout est dans ce fichier.
echo.
echo   SECTIONS :
echo.
echo   [detection]
echo     conducteur_id   : ID du conducteur actif (format C+chiffres ex: C10)
echo     dms_cam_index   : Index camera DMS  (0 = camera PC integree)
echo     adas_cam_index  : Index camera ADAS (1 = camera USB externe)
echo     use_video       : false = camera live / true = fichier video
echo.
echo   [sqlite]
echo     db_path         : Chemin base SQLite locale (database/events.db)
echo     retention_jours : Duree conservation evenements envoyes (10 jours)
echo     cleanup_interval_h : Frequence purge automatique (24h)
echo.
echo   [supabase]
echo     url             : URL du projet Supabase cloud
echo     key             : Cle API anonyme Supabase
echo     table_evenements: Nom table evenements (evenements_bruts)
echo     table_gps       : Nom table GPS (gps_logs_supabase)
echo.
echo   [gps_simulation]
echo     lat_centre      : Latitude centre simulation (36.8065 = Tunis)
echo     lon_centre      : Longitude centre simulation (10.1815 = Tunis)
echo     rayon_km        : Rayon de deplacement simule (15 km)
echo     vitesse_min/max : Plage vitesse simulee (0 a 130 km/h)
echo.
echo   [sender]
echo     intervalle_envoi_s : Frequence envoi Supabase (5 secondes)
echo     batch_size         : Nombre evenements par envoi (20 max)
echo     retry_max          : Tentatives si echec reseau (3 max)
echo.
echo   CHANGER DE CONDUCTEUR :
echo     Modifier conducteur_id dans config.json
echo     Exemple : "conducteur_id": "C15"
echo     Puis relancer : python main.py
echo     Le systeme utilisera automatiquement C15
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  FICHIER 2 : Shared.py                                                      │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ROLE : Module partage entre DMS.py et ADAS.py.
echo          Pont entre la detection et le stockage SQLite.
echo.
echo   FONCTIONS PRINCIPALES :
echo.
echo   set_db_path(path)
echo     → Definit le chemin SQLite depuis main.py
echo     → Appele une seule fois au demarrage
echo.
echo   set_context(conducteur_id, lat, lon, vitesse, cap)
echo     → Injecte le contexte GPS dans chaque evenement
echo     → Appele toutes les secondes par gps_context_updater
echo     → Permet a DMS/ADAS de ne pas gerer le GPS directement
echo.
echo   init_db()
echo     → Cree la table events_pending dans SQLite
echo     → Appele par DMS.py et ADAS.py au demarrage
echo.
echo   log_event_to_db(event_type, duree_secondes)
echo     → Enregistre un evenement detecte dans SQLite
echo     → REGLE CRITIQUE : duree_secondes ^>= 2.0 obligatoire
echo     → Si duree ^< 2.0 → evenement ignore silencieusement
echo     → Enrichit automatiquement avec GPS courant
echo     → Appele depuis DMS.py et ADAS.py
echo.
echo   SEVERITE DES EVENEMENTS :
echo     CRITIQUE : FATIGUE_EYES_CLOSED, FCW_DANGER
echo     ELEVE    : FATIGUE_EYES_DROWSY, FATIGUE_DROP, PHONE, SEATBELT, FCW_WARNING
echo     MODERE   : FATIGUE_YAWN, DISTRACTION, SMOKING, LDW_LEFT, LDW_RIGHT
echo.
echo   REGLE DUREE ^>= 2 SECONDES :
echo     Pourquoi ? Eviter les faux positifs courts (clignement normal des yeux)
echo     Seuls les evenements persistants sont significatifs
echo     Filtre applique dans Shared.py ET SQLiteManager (double securite)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  FICHIER 3 : DMS.py (Driver Monitoring System)                              │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ROLE : Detection comportement conducteur via CAM PC (index=0).
echo          Utilise MediaPipe FaceMesh + YOLOv8n.
echo.
echo   DETECTION IMPLEMENTEE :
echo.
echo   [Yeux - EyeClosureTracker]
echo     EAR (Eye Aspect Ratio) calcule sur 6 landmarks par oeil
echo     EAR ^< 0.22 → yeux consideres fermes
echo     15 frames fermes → FATIGUE_EYES_DROWSY (somnolence)
echo     FPS*2 frames fermes + duree reelle ^>= 2s → FATIGUE_EYES_CLOSED
echo     Duree reelle mesuree via time.time() (chronometre precis)
echo.
echo   [Baillement - EventLogger]
echo     MAR (Mouth Aspect Ratio) calcule sur landmarks bouche
echo     MAR ^> 0.20 pendant 10 frames → FATIGUE_YAWN
echo     Duree reelle mesuree depuis debut condition
echo.
echo   [Tete tombante]
echo     Pitch ratio calcule depuis landmarks nez/menton/front
echo     Pitch ^< 0.80 pendant 20 frames → FATIGUE_DROP
echo.
echo   [Distraction]
echo     Yaw ratio (position horizontale du nez)
echo     Yaw ^< 0.35 ou ^> 0.65 pendant 12 frames → DISTRACTION
echo.
echo   [Telephone - YoloWorker]
echo     YOLOv8n classe 67 (cell phone)
echo     Detection toutes les 10 frames (thread separe)
echo     8 frames positives → PHONE
echo.
echo   [Cigarette]
echo     Landmarks mains + position bouche
echo     Index + majeur pres de la bouche → SMOKING
echo.
echo   [Ceinture]
echo     Analyse region droite image (HSV + Canny + Hough)
echo     Lignes diagonales detectees = ceinture presente
echo     Absence 40 frames → SEATBELT
echo.
echo   MODIFICATIONS vs version originale :
echo     SOURCE global supprime → cam_index en parametre
echo     run_dms(stop_event, cam_index=0)
echo     Duree reelle calculee et passee a log_event_to_db()
echo     Nettoyage OpenCV securise (getWindowProperty avant destroy)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  FICHIER 4 : ADAS.py (Advanced Driver Assistance System)                   │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ROLE : Detection dangers sur la route via CAM USB (index=1).
echo          Utilise YOLOv8n + Canny + Hough Lines.
echo.
echo   DETECTION IMPLEMENTEE :
echo.
echo   [FCW - Forward Collision Warning - FcwTracker]
echo     YOLOv8n detecte vehicules (car/moto/bus/camion)
echo     Distance estimee par formule monoculaire :
echo       distance = (hauteur_reelle * focale) / hauteur_pixels
echo       Hauteur reelle = 1.5m, Focale = 600px
echo     Vehicule dans zone centrale (30% a 70% largeur image)
echo     Distance ^< 15m pendant 6 frames → FCW_WARNING
echo     Distance ^< 7m  pendant 4 frames → FCW_DANGER
echo     Duree reelle mesuree depuis debut condition
echo.
echo   [LDW - Lane Departure Warning - LdwTracker]
echo     Pipeline : Canny edges → ROI trapezoidale → Hough Lines
echo     Lignes gauche (pente negative) et droite (pente positive) extrapolees
echo     Centre voie = moyenne historique 10 dernieres positions
echo     Offset ^> 8% de la largeur pendant 8 frames → LDW_LEFT ou LDW_RIGHT
echo     Duree reelle mesuree depuis debut derive
echo.
echo   MODIFICATIONS vs version originale :
echo     SOURCE global supprime → cam_index en parametre
echo     run_adas(stop_event, cam_index=1)
echo     Duree reelle calculee par FcwTracker + LdwTracker
echo     Nettoyage OpenCV securise
echo.
echo   LOGIQUE 2 CAMERAS :
echo     Si CAM USB disponible → DMS + ADAS actifs simultanement
echo     Si CAM USB absente   → DMS seulement (ADAS desactive)
echo     Detection automatique au demarrage par main.py
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  FICHIER 5 : sqlite_manager.py                                              │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ROLE : Gestionnaire SQLite pour le pattern store-and-forward.
echo          Garantit qu'aucun evenement n'est perdu en cas de coupure reseau.
echo.
echo   PATTERN STORE-AND-FORWARD :
echo     1. DMS/ADAS detecte un evenement
echo     2. Shared.log_event_to_db() → INSERT dans SQLite (local, instantane)
echo     3. SQLiteManager.get_pending_events() → lit evenements non envoyes
echo     4. SupabaseSender envoie vers Supabase cloud
echo     5. SQLiteManager.mark_as_sent() → marque comme envoye
echo     Si reseau coupe → events restent en SQLite → envoyes au retour reseau
echo.
echo   METHODES :
echo.
echo   get_pending_events(batch_size=20)
echo     → SELECT events WHERE sent=0 AND duree_secondes ^>= 2.0
echo     → Retourne liste de dicts
echo     → Filtre duree ^>= 2s (deuxieme verification apres Shared.py)
echo.
echo   mark_as_sent(event_ids)
echo     → UPDATE events SET sent=1 WHERE id IN (...)
echo     → Appele apres confirmation envoi Supabase
echo.
echo   purge_old_events()
echo     → DELETE events WHERE sent=1 AND created_at ^< (aujourd'hui - 10j)
echo     → Evite que la base SQLite grossisse indefiniment
echo     → Execute toutes les 24h par cleanup_thread
echo.
echo   get_stats()
echo     → Retourne total / envoyes / en_attente
echo     → Affiche dans monitoring_thread toutes les 60 secondes
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  FICHIER 6 : gps_simulator.py                                               │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ROLE : Simule un trajet GPS realiste autour de Tunis.
echo          Remplace un vrai module GPS (non disponible en PFE).
echo.
echo   FONCTIONNEMENT :
echo     Centre : Tunis (36.8065, 10.1815)
echo     Rayon  : 15 km autour du centre
echo     Update : toutes les secondes (thread daemon)
echo     Vitesse: entre 0 et 130 km/h (variation progressive)
echo     Cap    : change de -5 a +5 degres par seconde (tournant realiste)
echo.
echo   ALGORITHME MOUVEMENT :
echo     1. Cap += random(-5, +5) → tournant progressif
echo     2. delta_lat = 0.0001 * cos(cap) * random(0.5, 1.5)
echo     3. delta_lon = 0.0001 * sin(cap) * random(0.5, 1.5)
echo     4. Si nouvelle position hors rayon → inverser cap (demi-tour)
echo     5. Vitesse += random(-5, +5) → acceleration/deceleration naturelle
echo.
echo   get_position() → (latitude, longitude, vitesse_kmh, cap_degres)
echo     Thread-safe via threading.Lock()
echo     Appele par gps_context_updater toutes les secondes
echo     Appele par supabase_sender pour enrichir chaque evenement
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  FICHIER 7 : supabase_sender.py                                             │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ROLE : Envoie les evenements SQLite vers Supabase cloud.
echo          Tourne dans un thread daemon — envoi toutes les 5 secondes.
echo.
echo   FONCTIONNEMENT :
echo.
echo   _loop() toutes les 5 secondes :
echo     1. _send_batch() → envoie evenements en attente
echo     2. _send_gps()   → envoie position GPS courante
echo     3. stop_event.wait(5s) → attente interruptible par Ctrl+C
echo.
echo   _send_batch() :
echo     get_pending_events(20) depuis SQLite
echo     Pour chaque evenement :
echo       Filtre duree ^>= 2.0s (double securite)
echo       Enrichit payload avec GPS courant
echo       Calcule CRC anti-doublon (MD5 type+timestamp)
echo       _insert_retry() avec 3 tentatives max
echo     mark_as_sent() pour les evenements envoyes
echo.
echo   _insert_retry() :
echo     Tentative 1 → si SSL timeout → attente 2s (interruptible)
echo     Tentative 2 → si SSL timeout → attente 4s (interruptible)
echo     Tentative 3 → si echec → abandon (garde en SQLite)
echo     Si stop_event set pendant attente → abandon immediat
echo.
echo   _send_gps() :
echo     Envoie position courante dans gps_logs_supabase
echo     Non critique → 1 seule tentative, echec ignore
echo     SSL timeout → log discret tous les 10 echecs
echo.
echo   GESTION CTRL+C :
echo     stop_event.set() → coupe IMMEDIATEMENT tous les retries SSL
echo     stop_immediat() → arret sans flush (evenements restent en SQLite)
echo     Prochain lancement → les evenements non envoyes seront envoyes
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  FICHIER 8 : main.py (Orchestrateur principal)                              │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ROLE : Point d'entree unique du systeme.
echo          Coordonne tous les composants.
echo          LANCEMENT : python main.py (sans argument)
echo.
echo   SEQUENCE DE DEMARRAGE :
echo.
echo   Etape 0 : Detecter structure + importer DMS/ADAS
echo     Structure plate  : DMS.py dans couche1_pc/
echo     Structure modules: modules/dms/DMS.py
echo     Import automatique de run_dms et run_adas
echo.
echo   Etape 1 : Charger config/config.json
echo     Lire conducteur_id, cam indexes, config supabase...
echo.
echo   Etape 2 : Valider format conducteur_id
echo     Regex : ^C[0-9]+$ (C suivi de chiffres uniquement)
echo     Ex valides : C10, C15, C19, C26, C112
echo     Ex invalides: 10, C, COND10, c10
echo.
echo   Etape 3 : Connexion Supabase
echo     create_client(url, key) avec supabase==1.2.1
echo.
echo   Etape 4 : Verification conducteur dans Supabase
echo     Cherche dans evenements_bruts et gps_logs_supabase
echo     TROUVE     → demarrage direct
echo     NON TROUVE → demarrage automatique (premier lancement)
echo     AUCUN MENU INTERACTIF → tout est automatique
echo.
echo   Etape 5 : Initialiser SQLite
echo     set_db_path() → set_context() → init_db() → SQLiteManager()
echo.
echo   Etape 6 : GPS Simulator
echo     Demarre le thread GPS
echo     Injecte position initiale dans Shared.set_context()
echo.
echo   Etape 7 : Supabase Sender
echo     Demarre le thread d'envoi (intervalle 5s)
echo.
echo   Etape 8 : Detection cameras
echo     cv2.VideoCapture(0).isOpened() → test DMS
echo     cv2.VideoCapture(1).isOpened() → test ADAS
echo     2 cameras : DMS + ADAS actifs
echo     1 camera  : DMS seulement
echo     0 camera  : ERREUR + exit
echo.
echo   Etape 9-10 : Lancer les threads
echo     GPS-Context  : met a jour Shared.set_context() chaque seconde
echo     DMS-Thread   : run_dms(stop_event, cam_index=0)
echo     ADAS-Thread  : run_adas(stop_event, cam_index=1) si disponible
echo     Cleanup      : purge SQLite toutes les 24h
echo     Monitor      : stats toutes les 60 secondes
echo.
echo   Etape 11 : Signal handler SIGINT (Ctrl+C)
echo     stop_event.set()       → signal arret a tous les threads
echo     sender._stop_event.set → coupe retries SSL immediatement
echo     cv2.destroyAllWindows  → ferme fenetres camera
echo     get_stats()            → affiche resume
echo     os._exit(0)            → sortie immediate ^< 0.5s
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  FLUX COMPLET DE DONNEES                                                    │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   [CAM PC]          [CAM USB]
echo   DMS.py            ADAS.py
echo      │                  │
echo      └──────┬───────────┘
echo             │ log_event_to_db(event, duree^>=2s)
echo             ▼
echo         Shared.py
echo      (enrichit GPS)
echo             │ INSERT
echo             ▼
echo       events_pending
echo       (SQLite local)
echo             │ toutes les 5s
echo             ▼
echo   SQLiteManager.get_pending_events()
echo             │ filtre duree^>=2s
echo             ▼
echo   SupabaseSender._insert_retry()
echo             │ HTTP REST
echo             ▼
echo    Supabase Cloud
echo    evenements_bruts    gps_logs_supabase
echo             │
echo             │ polling 5s (Spring Boot)
echo             ▼
echo    PostgreSQL 18 local
echo             │
echo             │ polling 30s (React)
echo             ▼
echo    Dashboard conducteur
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  REGLES METIER CRITIQUES                                                    │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   REGLE 1 — Format conducteur_id
echo     Obligatoire : C + chiffres uniquement
echo     Exemples : C10 (gest.1 cond.0), C15 (gest.1 cond.5), C26 (gest.2 cond.6)
echo     Validation : regex ^C[0-9]+$
echo     Si invalide → programme refuse de demarrer
echo.
echo   REGLE 2 — Duree evenement ^>= 2 secondes
echo     Objectif : eliminer les faux positifs courts
echo     Appliquee dans Shared.py (premiere verification)
echo     Appliquee dans SQLiteManager (deuxieme verification)
echo     Durees typiques : yeux fermes=2.5s, baillement=3s, seatbelt=5s
echo.
echo   REGLE 3 — Store-and-forward SQLite
echo     Aucun evenement perdu si reseau coupe
echo     SQLite stocke AVANT d'envoyer Supabase
echo     Evenements non envoyes → envoyes au prochain cycle (5s)
echo     Evenements non envoyes au Ctrl+C → envoyes au prochain lancement
echo.
echo   REGLE 4 — Lancement sans argument
echo     python main.py → lit config.json automatiquement
echo     Changer conducteur → modifier config.json seulement
echo     Pas de python main.py --conducteur C15 (INTERDIT)
echo.
echo   REGLE 5 — Ctrl+C immediat
echo     stop_event coupe TOUS les threads en meme temps
echo     os._exit(0) → retour prompt PS en moins de 0.5 seconde
echo     Aucune attente reseau SSL lors de l'arret
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  COMMANDES UTILES                                                           │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   INSTALLATION :
echo     pip install -r requirements.txt
echo.
echo   LANCEMENT :
echo     cd couche1_pc
echo     python main.py
echo.
echo   CHANGER DE CONDUCTEUR :
echo     Editer config/config.json
echo     Modifier : "conducteur_id": "C15"
echo     Relancer : python main.py
echo.
echo   VERIFIER STRUCTURE :
echo     python check_structure.py
echo.
echo   VERIFIER SUPABASE :
echo     python -c "from supabase import create_client; print('OK')"
echo.
echo   VERIFIER CAMERAS :
echo     python -c "import cv2; c=cv2.VideoCapture(0); print('CAM0:', c.isOpened()); c.release()"
echo     python -c "import cv2; c=cv2.VideoCapture(1); print('CAM1:', c.isOpened()); c.release()"
echo.
echo   ARRETER :
echo     Ctrl+C dans le terminal → arret immediat ^< 0.5s
echo.
echo   VERSIONS PACKAGES :
echo     supabase==1.2.1  postgrest==0.10.8  gotrue==1.3.0
echo     opencv-python==4.9.0.80  mediapipe==0.10.11
echo     ultralytics==8.1.47  numpy==1.26.4
echo.

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  TABLES SUPABASE NECESSAIRES                                                │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   TABLE 1 : evenements_bruts
echo     Recoit tous les evenements DMS + ADAS depuis le PC
echo     Colonnes : conducteur_id, type_evenement, categorie, severite,
echo                timestamp_utc, duree_secondes, latitude, longitude,
echo                vitesse_kmh, cap_degres, ear_ratio, mar_ratio,
echo                head_pose_angle, ttc_value, deviation_voie, traite, crc
echo     RLS : DESACTIVE (ALTER TABLE evenements_bruts DISABLE ROW LEVEL SECURITY)
echo.
echo   TABLE 2 : gps_logs_supabase
echo     Recoit la position GPS toutes les 5 secondes
echo     Colonnes : conducteur_id, timestamp_utc, latitude, longitude,
echo                vitesse_kmh, cap_degres
echo     RLS : DESACTIVE (ALTER TABLE gps_logs_supabase DISABLE ROW LEVEL SECURITY)
echo.
echo   VERIFIER DONNEES SUPABASE :
echo     Dashboard Supabase → Table Editor → evenements_bruts
echo     Vous devez voir les lignes avec conducteur_id = "C10" (ou votre ID)
echo     et duree_secondes ^>= 2.0 pour tous les evenements
echo.

echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║  COUCHE 1 TERMINEE ✓                                                       ║
echo ║  Statut : DMS actif + Supabase connecte + Store-and-forward operationnel   ║
echo ║  Prochain : SPRINT 3 → Spring Boot + PostgreSQL 18                         ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
pause
```