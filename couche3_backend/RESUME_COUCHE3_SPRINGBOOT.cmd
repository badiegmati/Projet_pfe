@echo off
chcp 65001 >nul
color 0B
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║      COUCHE 3 — SPRING BOOT — RESUME COMPLET                              ║
echo ║      Alpha Technology — PFE 2024-2025 — ADAS/DMS                          ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  ROLE DE LA COUCHE 3 — SPRING BOOT                                         │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Spring Boot est le CERVEAU BACKEND du systeme ADAS/DMS.
echo.
echo   Il assure :
echo     [POLL]  Lecture automatique Supabase toutes les 5 secondes
echo     [STORE] Stockage dans PostgreSQL 18 local (pgAdmin 4)
echo     [AUTH]  Authentification JWT pour 3 roles
echo     [API]   REST API complete pour Admin, Gestionnaire, Conducteur
echo     [SCORE] Calcul score de risque conducteur
echo     [NOTIF] Generation notifications automatiques
echo     [MSG]   Messagerie bidirectionnelle
echo.
echo   FLUX PRINCIPAL :
echo   Supabase (evenements_bruts)
echo     → Spring Boot polling 5s
echo       → INSERT evenements      (PostgreSQL)
echo       → INSERT notifications   (PostgreSQL)
echo       → UPSERT journal         (PostgreSQL)
echo       → Calcul score           (PostgreSQL)
echo       → PATCH traite=true      (Supabase)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  CONFIGURATION — application.yml                                            │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   SERVER :
echo     Port : 8080
echo.
echo   POSTGRESQL 18 LOCAL :
echo     URL      : jdbc:postgresql://localhost:5432/adas_dms
echo     Username : postgres
echo     Password : 123
echo     Pool     : HikariCP (max=10, min=2)
echo     DDL      : none (schema gere manuellement via pgAdmin)
echo.
echo   SUPABASE :
echo     URL   : https://oedgxwumddmfklalyiay.supabase.co
echo     Key   : eyJhbGci... (cle anonyme)
echo     Poll  : 5000ms (5 secondes)
echo     Table evenements : evenements_bruts
echo     Table GPS        : gps_logs_supabase
echo.
echo   JWT :
echo     Secret     : AlphaTechnologyADASDMSPFE2025SecretKey256Bits!!
echo     Expiration : 86400000ms (24 heures)
echo     Algorithme : HMAC-SHA256
echo.
echo   CORS :
echo     Origines : http://localhost:5173 (React Vite)
echo                http://localhost:3000
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  STRUCTURE DES FICHIERS                                                     │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   couche3_backend/spring-boot/
echo   └── src/main/
echo       ├── java/tn/alphatechnology/adas/
echo       │   ├── AdasDmsApplication.java      ← Point entree + @EnableScheduling
echo       │   ├── config/
echo       │   │   ├── SecurityConfig.java       ← JWT stateless + CORS
echo       │   │   └── WebConfig.java            ← CORS hardcode
echo       │   ├── controller/                   ← 8 controllers REST
echo       │   ├── dto/                          ← 9 DTOs
echo       │   ├── entity/                       ← 10 entites JPA
echo       │   ├── repository/                   ← 10 repositories Spring Data
echo       │   ├── security/                     ← JWT service + filtre
echo       │   ├── service/                      ← 8 services metier
echo       │   └── init/DataInitializer.java     ← Donnees initiales
echo       └── resources/
echo           └── application.yml
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  COMPTES PAR DEFAUT                                                         │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ADMINISTRATEUR :
echo     ID  : 00000000
echo     MDP : Admis123456
echo     Role: ADMINISTRATEUR
echo     Cree par DataInitializer au demarrage
echo.
echo   GESTIONNAIRE G1 (pour tests) :
echo     ID  : G1
echo     MDP : Gest123456
echo     Role: GESTIONNAIRE
echo     Cree par DataInitializer — tests uniquement
echo     Les autres gestionnaires (G2,G3...) → crees par Admin via API
echo.
echo   CONDUCTEUR C10 (correspond donnees Supabase) :
echo     ID  : C10
echo     MDP : Cond123456
echo     Role: CONDUCTEUR
echo     Cree par DataInitializer — tests uniquement
echo     Les autres conducteurs → crees par Gestionnaire via API
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  HIERARCHIE DES ROLES — STRICTE                                             │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ADMINISTRATEUR (00000000)
echo   │ → Cree / Modifie / Supprime GestionnairesFlotte
echo   │ → Champs inseres : id, nom_gestionnaire, mot_de_passe
echo   │ → Champs IMMUABLES pour GestionnaireFlotte :
echo   │     id, nom_gestionnaire, mot_de_passe
echo   │ → Champs MODIFIABLES par GestionnaireFlotte :
echo   │     email, telephone
echo   │
echo   └── GESTIONNAIRE DE FLOTTE (G1, G2, G3...)
echo       │ → Cree / Modifie / Supprime Conducteurs
echo       │ → Cree / Modifie / Supprime Vehicules
echo       │ → Associe vehicule a conducteur
echo       │ → Voit UNIQUEMENT ses propres conducteurs
echo       │ → Champs inseres Conducteur :
echo       │     id (format C+chiffres), nom, prenom,
echo       │     nom_vehicule, mot_de_passe
echo       │ → Champs IMMUABLES pour Conducteur :
echo       │     id, nom, prenom, nom_vehicule
echo       │ → Champs MODIFIABLES par Conducteur :
echo       │     email, telephone, mot_de_passe
echo       │
echo       └── CONDUCTEUR (C10, C11, C21...)
echo           → Voit UNIQUEMENT ses propres donnees
echo           → Dashboard : score, historique, notifications
echo           → MonCompte : modifie email, telephone, mot_de_passe
echo           → Recoit automatiquement les evenements DMS/ADAS
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  ENDPOINTS API REST — LISTE COMPLETE                                        │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ── PUBLICS (sans JWT) ──────────────────────────────────────────────────────
echo     GET  /api/health
echo     POST /api/auth/login
echo     GET  /api/conducteurs/{id}/existe   ← utilise par main.py
echo.
echo   ── ADMINISTRATEUR (/api/admin/**) ─────────────────────────────────────────
echo     GET    /api/admin/gestionnaires
echo     POST   /api/admin/gestionnaires        ← cree G2, G3...
echo     PUT    /api/admin/gestionnaires/{id}   ← email+telephone seulement
echo     DELETE /api/admin/gestionnaires/{id}   ← soft delete
echo     GET    /api/admin/profil
echo.
echo   ── GESTIONNAIRE (/api/gestionnaire/**) ────────────────────────────────────
echo     GET    /api/gestionnaire/conducteurs
echo     POST   /api/gestionnaire/conducteurs   ← cree C11, C21...
echo     PUT    /api/gestionnaire/conducteurs/{id}
echo     DELETE /api/gestionnaire/conducteurs/{id}
echo     GET    /api/gestionnaire/vehicules
echo     POST   /api/gestionnaire/vehicules
echo     PUT    /api/gestionnaire/vehicules/{id}
echo     DELETE /api/gestionnaire/vehicules/{id}
echo     PUT    /api/gestionnaire/vehicules/{vid}/assigner/{cid}
echo     GET    /api/gestionnaire/profil
echo     PUT    /api/gestionnaire/profil
echo.
echo   ── CONDUCTEUR (/api/conducteur/**) ────────────────────────────────────────
echo     GET    /api/conducteur/{id}/profil
echo     PUT    /api/conducteur/{id}/profil     ← email+tel+mdp seulement
echo     GET    /api/conducteur/{id}/score
echo     GET    /api/conducteur/{id}/score/historique
echo     GET    /api/conducteur/{id}/evenements
echo     GET    /api/conducteur/{id}/historique
echo     GET    /api/conducteur/{id}/tableau-bord
echo.
echo   ── NOTIFICATIONS ───────────────────────────────────────────────────────────
echo     GET    /api/notifications/{conducteurId}
echo     GET    /api/notifications/{conducteurId}/non-lues
echo     PUT    /api/notifications/{id}/lu
echo.
echo   ── MESSAGES ────────────────────────────────────────────────────────────────
echo     POST   /api/messages
echo     GET    /api/messages/{conducteurId}?avec={autreId}
echo     GET    /api/messages/{conducteurId}/recus
echo     PUT    /api/messages/{id}/lu
echo.
echo   ── SCORES ──────────────────────────────────────────────────────────────────
echo     GET    /api/scores/{conducteurId}/actuel
echo     GET    /api/scores/{conducteurId}/historique
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  SUPABASE POLLER — FLUX AUTOMATIQUE                                         │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Classe : SupabasePollerService.java
echo   Methode: pollSupabase() — @Scheduled toutes les 5 secondes
echo.
echo   ETAPE 1 : GET Supabase evenements_bruts WHERE traite=false LIMIT 50
echo   ETAPE 2 : Pour chaque evenement :
echo     a. Anti-doublon  → existsBySupabaseId()
echo     b. conducteur_id → format ^C[0-9]+$ valide ?
echo     c. Conducteur    → existsByIdAndActifTrue() dans PostgreSQL
echo     d. Duree         → >= 2.0 secondes ?
echo     e. BUILD         → Evenement + Notification
echo     f. INSERT        → evenements (PostgreSQL)
echo     g. INSERT        → notifications (PostgreSQL)
echo     h. UPSERT        → journal_evenements (compteur journalier)
echo   ETAPE 3 : PATCH Supabase → traite=true pour tous les ids traites
echo   ETAPE 4 : Calcul score → ScoreService.calculerEtSauvegarderScore()
echo   ETAPE 5 : syncGps() → gps_logs_supabase → gps_logs PostgreSQL
echo.
echo   REGLES CRITIQUES :
echo     duree >= 2.0s obligatoire (filtre faux positifs)
echo     Anti-doublon via supabase_id (evite re-insertions)
echo     Apache HttpClient5 requis pour PATCH Supabase
echo     Timestamp normalise : "2026-05-10 07:02:06+00"
echo                        → "2026-05-10T07:02:06+00:00"
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  SCORE DE RISQUE — ALGORITHME                                               │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Classe  : ScoreService.java
echo   Fenetre : 7 derniers jours (glissants)
echo   Plage   : [0.0000 — 1.0000]
echo.
echo   POIDS PAR TYPE D'EVENEMENT :
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
echo   NIVEAUX DE RISQUE :
echo     [0.00 - 0.25[ → FAIBLE   (vert)
echo     [0.25 - 0.50[ → MODERE   (jaune)
echo     [0.50 - 0.75[ → ELEVE    (orange)
echo     [0.75 - 1.00] → CRITIQUE (rouge)
echo.
echo   APRES CALCUL :
echo     INSERT dans scores_risque (PostgreSQL)
echo     UPDATE conducteurs.score_journalier (PostgreSQL)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  SECURITE JWT                                                               │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   JWTService.java :
echo     generateToken(id, role, nom) → HMAC-SHA256, 24h
echo     extractId(token)             → subject du JWT
echo     extractRole(token)           → claim "role"
echo     isTokenValid(token)          → check expiration
echo.
echo   JWTFilter.java :
echo     Intercepte chaque requete HTTP
echo     Extrait "Authorization: Bearer token"
echo     Valide + injecte dans SecurityContextHolder
echo     Prefixe ROLE_ ajoute automatiquement
echo.
echo   UserDetailsServiceImpl.java :
echo     loadUserByUsername(id) cherche dans :
echo       1. administrateurs
echo       2. gestionnaires_flotte
echo       3. conducteurs
echo.
echo   ROLES SPRING SECURITY :
echo     ROLE_ADMINISTRATEUR
echo     ROLE_GESTIONNAIRE
echo     ROLE_CONDUCTEUR
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  TABLES POSTGRESQL 18 UTILISEES                                             │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   administrateurs       ← 1 admin (00000000)
echo   gestionnaires_flotte  ← G1 manuel + G2,G3... via API Admin
echo   conducteurs           ← C10 manuel + autres via API Gestionnaire
echo   vehicules             ← geres par Gestionnaire
echo   evenements            ← remplis par Supabase poller
echo   gps_logs              ← remplis par Supabase poller
echo   scores_risque         ← calcules par ScoreService
echo   notifications         ← generees automatiquement par poller
echo   messages              ← messagerie Gestionnaire-Conducteur
echo   journal_evenements    ← compteur journalier par conducteur
echo.
echo   VUE UTILE :
echo   vue_conducteurs_scores ← conducteurs + score_pct + niveau_risque
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  REGLES METIER CRITIQUES                                                    │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   REGLE 1 — Format ID Conducteur
echo     Obligatoire : C + chiffres uniquement
echo     Regex       : ^C[0-9]+$
echo     Exemples    : C10, C15, C26, C112
echo     Validation  : @Pattern dans DTO + service
echo     Si invalide : HTTP 400
echo.
echo   REGLE 2 — Format ID Gestionnaire
echo     Obligatoire : G + chiffres uniquement
echo     Regex       : ^G[0-9]+$
echo     Exemples    : G1, G2, G3
echo     Validation  : AdminService.creerGestionnaire()
echo     Si invalide : HTTP 400
echo.
echo   REGLE 3 — Champs immuables Conducteur
echo     PUT /api/conducteur/{id}/profil
echo     Accepte UNIQUEMENT : email, telephone, mot_de_passe
echo     Ignore : id, nom, prenom, nom_vehicule
echo.
echo   REGLE 4 — Champs immuables Gestionnaire
echo     PUT /api/admin/gestionnaires/{id}
echo     Accepte UNIQUEMENT : email, telephone
echo     Ignore : id, nom_gestionnaire, mot_de_passe
echo.
echo   REGLE 5 — Isolation Gestionnaire
echo     Chaque gestionnaire voit UNIQUEMENT ses conducteurs
echo     Filtre : WHERE cree_par_gestionnaire = jwt.getId()
echo.
echo   REGLE 6 — Soft Delete uniquement
echo     Jamais de DELETE physique
echo     actif = false pour desactiver
echo.
echo   REGLE 7 — Duree evenement >= 2 secondes
echo     Filtre dans SupabasePollerService
echo     Evite les faux positifs courts
echo.
echo   REGLE 8 — Endpoint public /existe
echo     GET /api/conducteurs/{id}/existe
echo     Utilise par main.py au demarrage
echo     Retourne : {"existe": true/false}
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  RESULTATS TESTS — 48/48 OK                                                 │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Endpoints publics           : 4/4  OK
echo   Authentification 3 roles    : 7/7  OK
echo   Securite JWT                : 3/3  OK
echo   Admin CRUD gestionnaires    : 7/7  OK
echo   Gestionnaire CRUD           : 10/10 OK
echo   Conducteur profil/score     : 9/9  OK
echo   Notifications               : 4/4  OK
echo   Scores                      : 2/2  OK
echo   Messagerie bidirectionnelle : 6/6  OK
echo.
echo   Donnees C10 apres test :
echo     Score       : 0.6846 (68.5%) — ELEVE
echo     Evenements  : 13 DMS/ADAS
echo     Notifications: 13 generees automatiquement
echo     Fatigue=9, Tel=2, Ceinture=2
echo     Vitesse moy : 50.18 km/h
echo     Ratio graves: 0.8462
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  COMMANDES UTILES                                                           │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   DEMARRER SPRING BOOT :
echo     cd couche3_backend\spring-boot
echo     mvn spring-boot:run
echo.
echo   VERIFIER SANTE :
echo     curl http://localhost:8080/api/health
echo.
echo   TESTER LOGIN ADMIN :
echo     curl -X POST http://localhost:8080/api/auth/login
echo          -H "Content-Type: application/json"
echo          -d "{\"id\":\"00000000\",\"motDePasse\":\"Admis123456\"}"
echo.
echo   VERIFIER CONDUCTEUR DEPUIS MAIN.PY :
echo     curl http://localhost:8080/api/conducteurs/C10/existe
echo.
echo   CREER GESTIONNAIRE G2 (Admin requis) :
echo     curl -X POST http://localhost:8080/api/admin/gestionnaires
echo          -H "Authorization: Bearer TOKEN_ADMIN"
echo          -H "Content-Type: application/json"
echo          -d "{\"id\":\"G2\",\"nomGestionnaire\":\"Gest2\",\"motDePasse\":\"Gest2024!!\"}"
echo.
echo   LOGS EN DIRECT :
echo     Voir terminal mvn spring-boot:run
echo     Prefixes : [POLLER] [SCORE] [INIT] [AUTH] [GEST] [COND] [ADMIN]
echo.

echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║  COUCHE 3 SPRING BOOT TERMINEE ✓                                           ║
echo ║  Statut : 48/48 tests OK — Flux Supabase-PostgreSQL operationnel           ║
echo ║  Prochain : ML Service FastAPI (port 8001)                                 ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
pause