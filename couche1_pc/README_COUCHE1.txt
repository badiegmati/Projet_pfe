════════════════════════════════════════════════════════════════════
  COUCHE 1 — PC Python 3.10
  ADAS/DMS — Alpha Technology | PFE 2024-2025
════════════════════════════════════════════════════════════════════

── DESCRIPTION GÉNÉRALE ────────────────────────────────────────────

  La Couche 1 est le programme Python qui tourne sur le PC.
  Elle détecte les comportements dangereux du conducteur via
  les caméras et envoie les données vers Supabase (cloud).

  RÈGLE ABSOLUE :
    Couche 1  →  Supabase UNIQUEMENT
    Spring Boot ← Supabase (polling indépendant toutes les 5s)
    AUCUN lien direct entre Couche 1 et Spring Boot

── STRUCTURE DES FICHIERS ──────────────────────────────────────────

  couche1_pc/
  │
  ├── config/
  │   └── config.json
  │       Rôle   : Configuration complète du système
  │       Contenu:
  │         conducteur_id   = identifiant du conducteur actif
  │                           Format : "C" + chiffres (ex: "C15")
  │         dms_cam_index   = index caméra DMS  (0 = PC intégrée)
  │         adas_cam_index  = index caméra ADAS (1 = USB externe)
  │         supabase url    = URL du projet Supabase
  │         supabase key    = clé API Supabase
  │       Modifier: changer conducteur_id → relancer main.py
  │
  ├── modules/
  │   ├── dms/
  │   │   └── DMS.py
  │   │       Rôle   : Détection comportements conducteur
  │   │       Caméra : CAM1 PC intégrée (index 0)
  │   │       Détecte:
  │   │         FATIGUE_EYES_CLOSED → yeux fermés > 2 secondes
  │   │         FATIGUE_EYES_DROWSY → somnolence (yeux mi-clos)
  │   │         FATIGUE_YAWN        → bâillement détecté
  │   │         FATIGUE_DROP        → tête qui tombe
  │   │         DISTRACTION         → regard détourné de la route
  │   │         PHONE               → téléphone détecté en main
  │   │         SMOKING             → main près de la bouche
  │   │         SEATBELT            → ceinture absente
  │   │       Technologie: MediaPipe FaceMesh + YOLOv8n
  │   │       Appelle: log_event_to_db() → Shared.py → SQLite
  │   │
  │   └── adas/
  │       └── ADAS.py
  │           Rôle   : Détection dangers sur la route
  │           Caméra : CAM2 USB externe (index 1)
  │           Détecte:
  │             FCW_WARNING → véhicule devant à < 15m
  │             FCW_DANGER  → véhicule devant à < 7m (collision)
  │             LDW_LEFT    → déviation voie gauche
  │             LDW_RIGHT   → déviation voie droite
  │           Technologie: YOLOv8n + Canny + Hough
  │           Appelle: log_event_to_db() → Shared.py → SQLite
  │
  ├── database/
  │   └── events.db
  │       Rôle   : Base SQLite locale (store-and-forward)
  │       Créée  : Automatiquement au premier lancement
  │       Contenu: Événements en attente d'envoi Supabase
  │       Pourquoi: Si Supabase inaccessible → stocke localement
  │                 puis renvoie quand connexion rétablie
  │       Nettoyage: Événements envoyés > 10 jours → supprimés
  │
  ├── Shared.py
  │   Rôle   : Module partagé entre DMS.py et ADAS.py
  │   Contient:
  │     set_config()       → appelé par main.py au démarrage
  │                          injecte conducteur_id et chemin SQLite
  │     init_db()          → crée la table events dans SQLite
  │     log_event_to_db()  → INSERT événement dans SQLite
  │                          avec GPS courant automatique
  │     get_pending_events() → lit les événements non envoyés
  │     mark_event_sent()  → marque un événement envoyé
  │     update_gps_context() → mis à jour par gps_simulator.py
  │     SEVERITY           → dictionnaire sévérité par type
  │     CATEGORIE          → dictionnaire catégorie (DMS/ADAS)
  │
  ├── sqlite_manager.py
  │   Rôle   : Statistiques et monitoring de la base SQLite
  │   Contient:
  │     get_stats()        → total, envoyés, en_attente, échecs
  │     get_recent_events() → N derniers événements (debug)
  │     afficher_stats()   → résumé lisible terminal
  │   Utilisé par: thread_monitoring dans main.py
  │
  ├── gps_simulator.py
  │   Rôle   : Simule un trajet GPS dans la zone de Tunis
  │   Fonctionnement:
  │     Toutes les 5 secondes :
  │       1. Calcule nouvelle position (cap + vitesse variables)
  │       2. Met à jour Shared.py (contexte GPS partagé)
  │          → Les événements DMS/ADAS auront des coords GPS
  │       3. Envoie position → Supabase (gps_logs_supabase)
  │   Zone: Centre 36.8065°N 10.1815°E, rayon 15km
  │   Vitesse: 0 à 130 km/h (variation réaliste)
  │
  ├── supabase_sender.py
  │   Rôle   : Envoi SQLite → Supabase toutes les 5 secondes
  │   Fonctionnement:
  │     Thread 1 (Events):
  │       Lit SQLite (envoye=0) → INSERT Supabase evenements_bruts
  │       → marque envoye=1 dans SQLite
  │       → retry automatique si échec (max 3 fois)
  │     Thread 2 (GPS):
  │       Reçoit positions GPS via callback
  │       → INSERT Supabase gps_logs_supabase
  │   Reconnexion: automatique si Supabase inaccessible
  │
  ├── supabase_validator.py
  │   Rôle   : Vérifie que conducteur_id existe dans Supabase
  │   Fonctionnement:
  │     Au démarrage de main.py :
  │       SELECT dans conducteurs_cache WHERE id = 'C15'
  │       → Trouvé    : continuer
  │       → Introuvable: afficher message + arrêter
  │       → Supabase inaccessible: mode hors-ligne (continuer)
  │   Important: AUCUN appel vers Spring Boot
  │              Lecture Supabase UNIQUEMENT
  │
  ├── main.py
  │   Rôle   : Orchestrateur principal
  │   Lancement: python main.py  (SANS argument)
  │   Séquence au démarrage:
  │     1. Lire config/config.json
  │        → conducteur_id = "C15"
  │     2. Valider format ID (C + chiffres)
  │     3. Vérifier C15 dans Supabase (conducteurs_cache)
  │     4. Initialiser SQLite via Shared.py
  │     5. Démarrer GPS Simulator
  │     6. Démarrer Supabase Sender
  │     7. Détecter caméras disponibles
  │        → CAM1 PC  (index 0) : DMS obligatoire
  │        → CAM2 USB (index 1) : ADAS optionnel
  │     8. Lancer threads:
  │        Thread DMS      → run_dms() dans DMS.py
  │        Thread ADAS     → run_adas() dans ADAS.py (si USB)
  │        Thread Cleanup  → purge SQLite toutes les 24h
  │        Thread Monitor  → stats toutes les 60s
  │     9. Attendre Ctrl+C
  │    10. Arrêt propre de tous les threads
  │   Changer conducteur:
  │     Modifier config.json → conducteur_id = "C26"
  │     Relancer python main.py → utilise C26 automatiquement
  │
  └── requirements.txt
      Rôle   : Liste des dépendances Python à installer
      Contenu:
        opencv-python==4.9.0.80  → traitement image caméras
        mediapipe==0.10.11       → détection visage/mains
        ultralytics==8.1.47      → YOLOv8n détection objets
        numpy==1.26.4            → calculs matriciels
        supabase==1.2.0          → client Supabase (cloud)
        httpx==0.24.1            → HTTP client (requis par supabase)
        requests==2.31.0         → requêtes HTTP générales

── FLUX DE DONNÉES ─────────────────────────────────────────────────

  CAM1 PC (index 0)
      ↓
  DMS.py détecte FATIGUE_DROP
      ↓
  log_event_to_db("FATIGUE_DROP", duree_secondes=0.67)
      ↓
  Shared.py → INSERT SQLite events (envoye=0)
      ↓ (toutes les 5 secondes)
  supabase_sender.py → INSERT Supabase evenements_bruts
      ↓
  Supabase : traite=false (en attente Spring Boot)
      ↓ (Spring Boot poll toutes les 5s — INDÉPENDANT)
  Spring Boot → INSERT PostgreSQL local
  Spring Boot → INSERT notifications
  Spring Boot → calcul score RabbitMQ → ML FastAPI
  Spring Boot → PATCH Supabase traite=true

  CAM2 USB (index 1) — si branchée
      ↓
  ADAS.py détecte FCW_DANGER, distance_m=5.2
      ↓
  log_event_to_db("FCW_DANGER", duree_secondes=1.20, distance_m=5.2)
      ↓
  [même flux que ci-dessus]

  GPS Simulator (toutes les 5s)
      ↓
  Shared.py ← update_gps_context(lat, lon, vitesse, cap)
      ↓ (les événements DMS/ADAS prennent ces coords)
  supabase_sender.py → INSERT Supabase gps_logs_supabase

── TABLES SUPABASE UTILISÉES ───────────────────────────────────────

  evenements_bruts    ← reçoit tous les événements DMS + ADAS
  gps_logs_supabase   ← reçoit les positions GPS simulées
  conducteurs_cache   ← lu au démarrage pour valider conducteur_id
                        (mis à jour par Spring Boot depuis PostgreSQL)

── LOGIQUE CAMÉRAS ─────────────────────────────────────────────────

  2 caméras détectées → MODE COMPLET
    CAM1 PC  (index 0) : DMS actif  → détection conducteur
    CAM2 USB (index 1) : ADAS actif → détection route
    Les deux envoient vers Supabase

  1 caméra détectée → MODE DÉGRADÉ
    CAM1 PC  (index 0) : DMS actif
    CAM2 USB            : ADAS non démarré
    Seul DMS envoie vers Supabase
    Message : "Brancher caméra USB pour activer ADAS"

  0 caméra → ERREUR + arrêt automatique

── CHANGER DE CONDUCTEUR ───────────────────────────────────────────

  1. Ouvrir config\config.json
  2. Modifier : "conducteur_id": "C26"
     (le conducteur C26 doit exister dans Supabase/PostgreSQL)
  3. Relancer : python main.py
  → Le système utilise automatiquement C26

  AUCUNE modification du code nécessaire
  AUCUN argument à passer à python main.py

── LANCEMENT ───────────────────────────────────────────────────────

  Option 1 — Double-cliquer sur setup_et_lancement.cmd
             (installation automatique + lancement)

  Option 2 — PowerShell manuel :
             cd C:\test2-final-adas-dms\couche1_pc
             pip install -r requirements.txt
             python main.py

── VÉRIFICATION DONNÉES SUPABASE ───────────────────────────────────

  Aller sur : https://supabase.com/dashboard
  Projet → Table Editor → evenements_bruts
  → Voir les lignes avec conducteur_id = C15

  Ou SQL Editor → Exécuter :
  SELECT * FROM evenements_bruts ORDER BY id DESC LIMIT 10;

════════════════════════════════════════════════════════════════════