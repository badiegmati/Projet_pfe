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
echo     [STORE] Stockage dans PostgreSQL 18 local (dms-adas2)
echo     [AUTH]  Authentification JWT pour 3 roles
echo     [API]   REST API complete pour Admin, Gestionnaire, Conducteur
echo     [SCORE] Calcul score de risque conducteur (fenetre 1 an)
echo     [NOTIF] Generation notifications automatiques
echo     [MSG]   Messagerie bidirectionnelle Gestionnaire-Conducteur
echo.
echo   FLUX PRINCIPAL :
echo   Supabase evenements_bruts (traite=false)
echo     → Spring Boot @Scheduled 5s
echo       → Validation conducteur_id (^C[0-9]+$)
echo       → Verification conducteur existe PostgreSQL
echo       → Filtre duree >= 2 secondes
echo       → INSERT evenements      (PostgreSQL dms-adas2)
echo       → INSERT notifications   (PostgreSQL dms-adas2)
echo       → UPSERT journal         (PostgreSQL dms-adas2)
echo       → Calcul score           (PostgreSQL dms-adas2)
echo       → PATCH traite=true      (Supabase)
echo.
echo   PAS de RabbitMQ — flux direct Supabase → Spring Boot → PostgreSQL
echo   PAS de gps_logs_supabase — table GPS supprimee de Supabase
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
echo     URL      : jdbc:postgresql://localhost:5432/dms-adas2
echo     Username : postgres
echo     Password : 123
echo     DDL-auto : validate (schema gere manuellement pgAdmin 4)
echo     Pool     : HikariCP (max=10, min=2)
echo.
echo   SUPABASE :
echo     URL   : https://oedgxwumddmfklalyiay.supabase.co
echo     Poll  : 5000ms (5 secondes)
echo     Table : evenements_bruts (SEULE table utilisee)
echo     PAS de gps_logs_supabase
echo.
echo   JWT :
echo     Secret     : AlphaTechnologyADASDMSPFE2025SecretKey256Bits!!
echo     Expiration : 86400000ms (24 heures)
echo     Algorithme : HMAC-SHA256
echo.
echo   CORS :
echo     Origines autorisees : localhost:* (tous ports)
echo     Methodes : GET POST PUT DELETE OPTIONS PATCH
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  STRUCTURE DES FICHIERS                                                     │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   couche3_backend/spring-boot/
echo   ├── pom.xml                             ← Spring Boot 3.2.5 + Java 21
echo   └── src/main/
echo       ├── java/tn/alphatechnology/adas/
echo       │   ├── AdasDmsApplication.java     ← Point entree + @EnableScheduling
echo       │   ├── config/
echo       │   │   ├── SecurityConfig.java     ← JWT stateless + CORS pattern *
echo       │   │   ├── CorsConfig.java         ← CorsFilter bean
echo       │   │   └── WebConfig.java          ← WebMvcConfigurer /api/**
echo       │   ├── controller/                 ← 8 controllers REST
echo       │   │   ├── AuthController.java
echo       │   │   ├── AdminController.java
echo       │   │   ├── GestionnaireController.java
echo       │   │   ├── ConducteurController.java
echo       │   │   ├── ScoreController.java
echo       │   │   ├── MessageController.java
echo       │   │   ├── NotificationController.java
echo       │   │   └── HealthController.java
echo       │   ├── service/                    ← 8 services metier
echo       │   │   ├── AuthService.java
echo       │   │   ├── SupabasePollerService.java
echo       │   │   ├── AdminService.java
echo       │   │   ├── GestionnaireService.java
echo       │   │   ├── ConducteurService.java
echo       │   │   ├── ScoreService.java
echo       │   │   ├── MessageService.java
echo       │   │   └── NotificationService.java
echo       │   ├── entity/                     ← 9 entites JPA
echo       │   │   ├── Administrateur.java
echo       │   │   ├── GestionnaireFlotte.java ← SANS actif
echo       │   │   ├── Conducteur.java         ← SANS actif, SANS enLigne
echo       │   │   ├── Vehicule.java           ← SANS actif
echo       │   │   ├── Evenement.java          ← enums en STRING
echo       │   │   ├── ScoreRisque.java        ← SANS vitesseMoyenne
echo       │   │   ├── Notification.java       ← SANS vitesseKmh
echo       │   │   ├── Message.java
echo       │   │   └── JournalEvenement.java
echo       │   ├── repository/                 ← 9 repositories Spring Data
echo       │   ├── dto/                        ← 9 DTOs
echo       │   │   ├── LoginDTO.java
echo       │   │   ├── LoginResponseDTO.java
echo       │   │   ├── CreateGestionnaireDTO.java
echo       │   │   ├── CreateConducteurDTO.java ← @Pattern(^C[0-9]+$)
echo       │   │   ├── UpdateGestionnaireDTO.java ← email+telephone seulement
echo       │   │   ├── UpdateConducteurDTO.java   ← email+tel+mdp seulement
echo       │   │   ├── ConducteurDTO.java
echo       │   │   ├── ScoreDTO.java
echo       │   │   └── MessageDTO.java
echo       │   ├── security/
echo       │   │   ├── JWTService.java         ← generateToken + validate
echo       │   │   ├── JWTFilter.java          ← OncePerRequestFilter
echo       │   │   └── UserDetailsServiceImpl  ← 3 tables lookup
echo       │   └── init/
echo       │       └── DataInitializer.java    ← Comptes + scores test
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
echo     Cree par DataInitializer + INSERT SQL pgAdmin
echo.
echo   GESTIONNAIRE G1 (test — insere manuellement) :
echo     ID  : G1
echo     MDP : Gest123456
echo     Nom : BenAli Mohamed
echo     Role: GESTIONNAIRE
echo     Les autres gestionnaires (G2, G3...) → crees par Admin via API
echo     Format obligatoire : G + chiffres (G1, G2, G3...)
echo.
echo   CONDUCTEUR C10 (donnees Supabase existantes) :
echo     ID  : C10    MDP : Cond123456
echo     Nom : Trabelsi Ahmed
echo     Vehicule : Toyota Corolla 2022
echo     Cree par G1
echo.
echo   CONDUCTEUR C12 :
echo     ID  : C12    MDP : Cond123456
echo     Nom : Mansouri Sami
echo     Vehicule : Volkswagen Golf 2021
echo     Cree par G1
echo.
echo   CONDUCTEUR C16 :
echo     ID  : C16    MDP : Cond123456
echo     Nom : Khelifi Youssef
echo     Vehicule : Peugeot 308 2020
echo     Cree par G1
echo.
echo   NOTE : DataInitializer recrée les comptes si absents
echo          et met à jour les hash BCrypt a chaque demarrage
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  HIERARCHIE DES ROLES — STRICTE                                             │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ADMINISTRATEUR (00000000 / Admis123456)
echo   │ → Cree / Modifie / Supprime GestionnairesFlotte
echo   │ → Champs inseres : id, nom_gestionnaire, mot_de_passe
echo   │ → Champs IMMUABLES (GestionnaireFlotte ne peut pas modifier) :
echo   │     id, nom_gestionnaire, mot_de_passe
echo   │ → Champs MODIFIABLES par GestionnaireFlotte :
echo   │     email, telephone
echo   │
echo   └── GESTIONNAIRE DE FLOTTE (G1, G2, G3...)
echo       │ → Cree / Modifie / Supprime Conducteurs
echo       │ → Cree / Modifie / Supprime Vehicules
echo       │ → Associe vehicule a conducteur
echo       │ → Voit UNIQUEMENT ses propres conducteurs
echo       │   (filtre : cree_par_gestionnaire = jwt.getId())
echo       │ → Champs inseres Conducteur :
echo       │     id (^C[0-9]+$), nom, prenom,
echo       │     nom_vehicule, mot_de_passe
echo       │ → Champs IMMUABLES (Conducteur ne peut pas modifier) :
echo       │     id, nom, prenom, nom_vehicule
echo       │ → Champs MODIFIABLES par Conducteur :
echo       │     email, telephone, mot_de_passe
echo       │
echo       └── CONDUCTEUR (C10, C12, C16, C25...)
echo           → Voit UNIQUEMENT ses propres donnees
echo           → Dashboard : score, historique, notifications, messages
echo           → MonCompte : modifie email, telephone, mot_de_passe
echo           → Recoit automatiquement les evenements DMS/ADAS
echo             detectes par main.py via Supabase → Spring Boot
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  ENDPOINTS API REST — LISTE COMPLETE                                        │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ── PUBLICS (sans JWT) ──────────────────────────────────────────────────────
echo     GET  /api/health
echo     POST /api/auth/login       ← { id, motDePasse } → JWT token
echo     GET  /api/conducteurs/{id}/existe  ← utilise par main.py
echo.
echo   ── ADMINISTRATEUR (/api/admin/**) ─────────────────────────────────────────
echo     GET    /api/admin/gestionnaires
echo     GET    /api/admin/gestionnaires/{id}
echo     POST   /api/admin/gestionnaires    ← cree G2, G3...
echo     PUT    /api/admin/gestionnaires/{id}  ← email+telephone SEULEMENT
echo     DELETE /api/admin/gestionnaires/{id}  ← DELETE physique (sans actif)
echo     GET    /api/admin/profil
echo.
echo   ── GESTIONNAIRE (/api/gestionnaire/**) ────────────────────────────────────
echo     GET    /api/gestionnaire/conducteurs        ← SES conducteurs
echo     GET    /api/gestionnaire/conducteurs/{id}
echo     POST   /api/gestionnaire/conducteurs        ← cree C11, C21...
echo     PUT    /api/gestionnaire/conducteurs/{id}
echo     DELETE /api/gestionnaire/conducteurs/{id}   ← DELETE physique
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
echo     PUT    /api/conducteur/{id}/profil   ← email+tel+mdp SEULEMENT
echo     GET    /api/conducteur/{id}/score
echo     GET    /api/conducteur/{id}/score/historique
echo     GET    /api/conducteur/{id}/evenements
echo     GET    /api/conducteur/{id}/historique     ← HistoriqueNotifications
echo     GET    /api/conducteur/{id}/tableau-bord   ← stats DMS+ADAS
echo.
echo   ── NOTIFICATIONS ───────────────────────────────────────────────────────────
echo     GET    /api/notifications/{conducteurId}
echo     GET    /api/notifications/{conducteurId}/non-lues  ← badge React
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
echo │  SUPABASE POLLER — FLUX AUTOMATIQUE DETAILLE                                │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Classe  : SupabasePollerService.java
echo   Methode : pollSupabase() — @Scheduled toutes les 5 secondes
echo.
echo   ETAPE 1 : GET Supabase
echo     URL : {supabase-url}/rest/v1/evenements_bruts
echo           ?traite=eq.false^&order=id.asc^&limit=50
echo     Headers : apikey + Authorization Bearer
echo.
echo   ETAPE 2 : Pour chaque evenement JSON :
echo     a. existsBySupabaseId(supId)
echo        → deja dans PostgreSQL : IGNORE_MARK (marquer + skip)
echo     b. conducteur_id matches ^C[0-9]+$
echo        → format invalide : IGNORE_MARK
echo     c. conducteurRepo.findById(conducteurId)
echo        → conducteur inconnu PostgreSQL : IGNORE_RETRY (pas de patch)
echo     d. duree_secondes >= 2.0
echo        → trop court : IGNORE_MARK
echo     e. Parsing categorie (DMS/ADAS) + severite + timestamp UTC
echo        Normalisation : "2026-05-10 07:02:06+00"
echo                      → "2026-05-10T07:02:06+00:00"
echo     f. evenementRepo.save(evt)
echo     g. notificationRepo.save(notif) avec titre prefixe:
echo        [CRITIQUE] / [ELEVE] / [MODERE] / [FAIBLE]
echo     h. journalRepo UPSERT (compteur journalier date evenement)
echo     i. conducteursAScorer.add(conducteurId)
echo     → Resultat : INSERE
echo.
echo   ETAPE 3 : PATCH Supabase traite=true
echo     URL : ?id=in.(55,56,57,...)
echo     Body: {"traite": true}
echo     Methode HTTP : PATCH (Apache HttpClient5 requis)
echo     Ids patches : INSERE + IGNORE_MARK
echo     Ids PAS patches : IGNORE_RETRY (reessai au prochain cycle)
echo.
echo   ETAPE 4 : Calcul score pour chaque conducteur traite
echo     scoreService.calculerEtSauvegarderScore(conducteurId)
echo.
echo   ENUM TraitementResult :
echo     INSERE       → INSERT OK + PATCH traite=true
echo     IGNORE_MARK  → doublon/invalide/trop_court + PATCH traite=true
echo     IGNORE_RETRY → conducteur inconnu + PAS de PATCH (reessai)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  SCORE DE RISQUE — ALGORITHME COMPLET                                       │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Classe  : ScoreService.java
echo   Fenetre : 1 AN (minusDays(365)) — donnees Supabase mai 2026
echo   Plage   : [0.0000 — 1.0000]
echo.
echo   COMPTAGE PAR TYPE :
echo     countByTypeForConducteur() — requete JPQL GROUP BY type
echo.
echo   POIDS :
echo     Fatigue     (EYES_CLOSED+DROWSY+YAWN+DROP) : *0.08 max 0.30
echo     Telephone   (PHONE)                         : *0.10 max 0.20
echo     Ceinture    (SEATBELT)                      : *0.05 max 0.10
echo     Tabagisme   (SMOKING)                       : *0.03 max 0.08
echo     Distraction (DISTRACTION)                   : *0.04 max 0.10
echo     HeadPose    (HEAD_POSE)                     : *0.03 max 0.06
echo     FCW         (FCW_WARNING+FCW_DANGER)        : *0.06 max 0.12
echo     LDW         (LDW_LEFT+LDW_RIGHT)            : *0.03 max 0.06
echo     Ratio graves (CRITIQUE+ELEVE / total)       : *0.10
echo     TOTAL MAX : 1.0 (clamp applique)
echo.
echo   NIVEAUX DE RISQUE :
echo     [0.00 - 0.25[ → FAIBLE   vert
echo     [0.25 - 0.50[ → MODERE   jaune
echo     [0.50 - 0.75[ → ELEVE    orange
echo     [0.75 - 1.00] → CRITIQUE rouge
echo.
echo   APRES CALCUL :
echo     INSERT scores_risque (PostgreSQL)
echo     UPDATE conducteurs.score_journalier (PostgreSQL)
echo     UPDATE conducteurs.date_modification
echo.
echo   NOTE : vitesseMoyenne SUPPRIMEE (vitesseKmh absent de Supabase)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  SECURITE JWT                                                               │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   JWTService.java :
echo     generateToken(id, role, nom)  → HMAC-SHA256, 24h
echo     extractId(token)              → subject (id utilisateur)
echo     extractRole(token)            → claim "role"
echo     isTokenValid(token)           → check expiration
echo.
echo   JWTFilter.java (OncePerRequestFilter) :
echo     Intercepte chaque requete HTTP
echo     Extrait "Authorization: Bearer TOKEN"
echo     Valide + injecte SecurityContextHolder
echo     Prefixe ROLE_ ajoute automatiquement
echo     Ex: "GESTIONNAIRE" → "ROLE_GESTIONNAIRE"
echo.
echo   UserDetailsServiceImpl.java :
echo     loadUserByUsername(id) cherche dans ordre :
echo       1. administrateurs     → ROLE_ADMINISTRATEUR
echo       2. gestionnaires_flotte → ROLE_GESTIONNAIRE
echo       3. conducteurs          → ROLE_CONDUCTEUR
echo     UsernameNotFoundException si non trouve
echo.
echo   SecurityConfig — Acces :
echo     PUBLIC   : /api/health, /api/auth/login, /api/conducteurs/*/existe
echo     ADMIN    : /api/admin/**
echo     GEST     : /api/gestionnaire/** (GEST + ADMIN)
echo     COND     : /api/conducteur/**  (COND + GEST + ADMIN)
echo     NOTIF    : /api/notifications/** (tous)
echo     MSG      : /api/messages/**     (tous)
echo     SCORES   : /api/scores/**       (tous)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  BASE PostgreSQL dms-adas2 — TABLES                                         │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   administrateurs
echo     id(PK), mot_de_passe, actif, date_creation
echo     1 enregistrement : 00000000 / Admis123456
echo.
echo   gestionnaires_flotte
echo     id(PK), nom_gestionnaire, mot_de_passe, email, telephone,
echo     cree_par_admin(FK), date_creation, date_modification
echo     SANS colonne actif
echo     1 enregistrement test : G1 / Gest123456
echo     Autres → crees par Admin via POST /api/admin/gestionnaires
echo.
echo   conducteurs
echo     id(PK CHECK ^C[0-9]+$), nom, prenom, age, telephone, email,
echo     nom_vehicule, mot_de_passe, score_journalier,
echo     cree_par_gestionnaire(FK), date_creation, date_modification
echo     SANS colonnes actif et en_ligne
echo     3 enregistrements test : C10, C12, C16
echo     Autres → crees par Gestionnaire via POST /api/gestionnaire/conducteurs
echo.
echo   vehicules
echo     id(PK SERIAL), nom_vehicule, immatriculation, marque, modele, annee,
echo     conducteur_id(FK), cree_par_gestionnaire(FK), date_creation
echo     SANS colonne actif
echo.
echo   evenements
echo     id(PK), supabase_id(UNIQUE), conducteur_id(FK),
echo     vehicule_nom, type_evenement, categorie(VARCHAR 10),
echo     date_heure, duree_secondes, latitude, longitude,
echo     severite(VARCHAR 10), created_at
echo     SANS : vitesse_kmh, cap_degres, ear_ratio, mar_ratio,
echo            head_pose_angle, ttc_value, deviation_voie, distance_m
echo.
echo   scores_risque
echo     id(PK), conducteur_id(FK), date_calcul, heure_calcul,
echo     score_valeur, niveau_risque(VARCHAR 10),
echo     nb_fatigue, nb_telephone, nb_ceinture, nb_tabagisme,
echo     nb_distraction, nb_head_pose, nb_fcw, nb_ldw, nb_total,
echo     ratio_graves, timestamp
echo     SANS colonne vitesse_moyenne
echo     UNIQUE(conducteur_id, date_calcul, heure_calcul)
echo.
echo   journal_evenements
echo     id(PK), conducteur_id(FK), date_journee, nb_evenements
echo     UNIQUE(conducteur_id, date_journee)
echo.
echo   notifications
echo     id(PK), conducteur_id(FK), titre, corps, type_alerte,
echo     latitude, longitude, lue, date_envoi
echo     SANS colonne vitesse_kmh
echo.
echo   messages
echo     id(PK), expediteur_id, destinataire_id, contenu,
echo     date_envoi, lu, statut(VARCHAR 10), id_message_parent(FK)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  REGLES METIER CRITIQUES                                                    │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   REGLE 1 — Format ID Conducteur
echo     Obligatoire : C + chiffres uniquement (^C[0-9]+$)
echo     Exemples    : C10, C12, C16, C25, C112
echo     Validation  : @Pattern(CreateConducteurDTO) + GestionnaireService
echo     Si invalide : HTTP 400 avec message explicite
echo.
echo   REGLE 2 — Format ID Gestionnaire
echo     Obligatoire : G + chiffres uniquement (^G[0-9]+$)
echo     Exemples    : G1, G2, G3
echo     Validation  : AdminService.creerGestionnaire()
echo     Si invalide : HTTP 400
echo.
echo   REGLE 3 — Champs immuables Conducteur
echo     PUT /api/conducteur/{id}/profil
echo     UpdateConducteurDTO : email, telephone, motDePasse UNIQUEMENT
echo     id, nom, prenom, nomVehicule → IGNORES meme si envoyes
echo.
echo   REGLE 4 — Champs immuables Gestionnaire
echo     PUT /api/admin/gestionnaires/{id}
echo     UpdateGestionnaireDTO : email, telephone UNIQUEMENT
echo     id, nomGestionnaire, motDePasse → IGNORES meme si envoyes
echo.
echo   REGLE 5 — Isolation Gestionnaire
echo     findByCreeParGestionnaire(auth.getName())
echo     Gestionnaire voit UNIQUEMENT ses conducteurs
echo     Acces a conducteur d'un autre gestionnaire → HTTP 403
echo.
echo   REGLE 6 — DELETE physique (pas de soft delete)
echo     Pas de colonne actif sur gestionnaires et conducteurs
echo     → deleteById() directement
echo     G1 protege contre suppression (compte de test)
echo.
echo   REGLE 7 — Filtre duree >= 2 secondes
echo     Applique dans SupabasePollerService
echo     duree < 2.0 → IGNORE_MARK (marque traite=true, pas d'INSERT)
echo     Evite les faux positifs courts de detection
echo.
echo   REGLE 8 — Anti-doublon supabase_id
echo     existsBySupabaseId(supId) avant chaque INSERT
echo     Evite les re-insertions si Spring Boot redemarre
echo     Index UNIQUE sur evenements.supabase_id
echo.
echo   REGLE 9 — Fenetre calcul score = 1 AN
echo     OffsetDateTime.now().minusDays(365)
echo     Necessite car donnees Supabase datent de mai 2026
echo.
echo   REGLE 10 — Endpoint public /existe
echo     GET /api/conducteurs/{id}/existe → {"existe": true/false}
echo     Pas de JWT requis — utilise par main.py au demarrage
echo     Si false → main.py refuse de demarrer (sys.exit(1))
echo.
echo   REGLE 11 — IGNORE_RETRY pour conducteur inconnu
echo     Si conducteur_id non trouve dans PostgreSQL :
echo     → NE PAS marquer traite=true dans Supabase
echo     → Reessayer au prochain cycle (5s)
echo     Utile si Spring Boot demarre avant que le conducteur soit cree
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  RESULTATS TESTS POWERSHELL — 100% OK                                       │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Login 5 comptes          : OK
echo     Admin 00000000         : ADMINISTRATEUR
echo     Gest  G1               : GESTIONNAIRE - BenAli Mohamed
echo     Cond  C10              : CONDUCTEUR - Trabelsi Ahmed
echo     Cond  C12              : CONDUCTEUR - Mansouri Sami
echo     Cond  C16              : CONDUCTEUR - Khelifi Youssef
echo.
echo   Endpoint /existe         :
echo     C10 existe: True       : OK
echo     C16 existe: True       : OK
echo.
echo   Admin gestionnaires      : 2 gestionnaires (G1 + 1 cree)     : OK
echo   Gest conducteurs G1      : 4 conducteurs                      : OK
echo   Score C10                : 0.7000 (ELEVE)                     : OK
echo   Historique C10           : 7 jours                            : OK
echo   Tableau bord C10         : 74 evenements total                 : OK
echo   Notifications C10        : 74 generees automatiquement         : OK
echo   Non lues C10             : 74                                  : OK
echo   Message G1 → C10         : id=2 envoye                        : OK
echo   Conversation C10-G1      : 2 messages                         : OK
echo.
echo   Donnees Supabase stockees dans PostgreSQL :
echo     C10 : 75 evenements (ids 55-129) → 74 notifications
echo     C12 : 20 evenements (ids 88-107)
echo     C16 : 25 evenements (ids 130-154)
echo     Total : 120 evenements Supabase traites
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  DEPENDANCES pom.xml — IMPORTANTES                                          │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   spring-boot-starter-web        ← REST API
echo   spring-boot-starter-data-jpa   ← PostgreSQL JPA
echo   spring-boot-starter-security   ← JWT + roles
echo   spring-boot-starter-validation ← @Valid @Pattern
echo   postgresql (runtime)           ← Driver JDBC
echo   jjwt-api/impl/jackson 0.11.5   ← JWT generation
echo   httpclient5                    ← PATCH Supabase (OBLIGATOIRE)
echo   lombok                         ← @Getter @Builder etc.
echo.
echo   PAS de spring-boot-starter-amqp (RabbitMQ supprime)
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
echo     Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login"
echo       -Method POST -ContentType "application/json"
echo       -Body '{"id":"00000000","motDePasse":"Admis123456"}'
echo.
echo   TESTER LOGIN GESTIONNAIRE :
echo     Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login"
echo       -Method POST -ContentType "application/json"
echo       -Body '{"id":"G1","motDePasse":"Gest123456"}'
echo.
echo   TESTER LOGIN CONDUCTEUR :
echo     Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login"
echo       -Method POST -ContentType "application/json"
echo       -Body '{"id":"C10","motDePasse":"Cond123456"}'
echo.
echo   VERIFIER CONDUCTEUR (main.py) :
echo     curl http://localhost:8080/api/conducteurs/C10/existe
echo.
echo   CREER GESTIONNAIRE G2 (Admin requis) :
echo     POST /api/admin/gestionnaires
echo     Body: {"id":"G2","nomGestionnaire":"Dupont Ali","motDePasse":"Gest2024!!"}
echo.
echo   CREER CONDUCTEUR C21 (Gestionnaire G2 requis) :
echo     POST /api/gestionnaire/conducteurs
echo     Body: {"id":"C21","nom":"Baldi","prenom":"Omar","age":30,
echo            "nomVehicule":"Renault Clio 2023","motDePasse":"Cond2024!!"}
echo.
echo   LOGS EN DIRECT :
echo     Terminal mvn spring-boot:run
echo     Prefixes des logs :
echo       [POLLER] → SupabasePollerService
echo       [SCORE]  → ScoreService
echo       [INIT]   → DataInitializer
echo       [AUTH]   → AuthService
echo       [GEST]   → GestionnaireService
echo       [COND]   → ConducteurService
echo       [ADMIN]  → AdminService
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  ARCHITECTURE TECHNIQUE RESUMEE                                             │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   CLIENT (main.py / React)
echo          │
echo          │ HTTP REST
echo          ▼
echo   SPRING BOOT :8080
echo     SecurityConfig ← JWT validation
echo     Controllers    ← routing HTTP
echo     Services       ← logique metier
echo     Repositories   ← Spring Data JPA
echo          │
echo          │ JDBC / HikariCP
echo          ▼
echo   POSTGRESQL 18 :5432 (dms-adas2)
echo.
echo   SUPABASE CLOUD
echo     evenements_bruts
echo          │ GET polling 5s
echo          ▼
echo   SupabasePollerService (@Scheduled)
echo     → evenements
echo     → notifications
echo     → journal_evenements
echo     → scores_risque
echo     → PATCH traite=true
echo.

echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║  COUCHE 3 SPRING BOOT — TERMINEE ET VALIDEE ✓                             ║
echo ║                                                                            ║
echo ║  Statut    : 100%% operationnel                                            ║
echo ║  Tests     : Login 5 comptes OK / 74 evenements C10 / Scores OK           ║
echo ║  Flux      : Supabase → PostgreSQL automatique (5s)                        ║
echo ║  Securite  : JWT 24h / BCrypt 12 / 3 roles isoles                         ║
echo ║                                                                            ║
echo ║  Prochain  : SPRINT 4 → ML Service FastAPI (port 8001)                    ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
pause