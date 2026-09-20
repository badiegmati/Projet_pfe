@echo off
chcp 65001 >nul
color 0B
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║      COUCHE 4 MOBILE — APPLICATION FLUTTER — RESUME COMPLET               ║
echo ║      Alpha Technology — PFE 2024-2025 — ADAS/DMS                          ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

timeout /t 2 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  VUE D'ENSEMBLE — ARCHITECTURE MOBILE                                       │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Flutter (Dart) — Application Mobile Conducteurs
echo     → HTTP → Spring Boot :8080
echo     → JWT stocké SharedPreferences
echo     → Rôle CONDUCTEUR uniquement
echo     → Dark theme néon (Blue/Cyan)
echo     → Portrait uniquement
echo     → Polling 30s données / 15s messages
echo.
echo   STACK TECHNIQUE :
echo     Flutter       : SDK stable
echo     Dart          : Langage principal
echo     Provider      : State management
echo     http          : Requêtes HTTP
echo     shared_prefs  : Persistance locale JWT
echo     fl_chart      : Graphique LineChart historique
echo     CustomPaint   : Jauge arc animée score
echo.
echo   CIBLES SUPPORTÉES :
echo     Chrome        → flutter run -d chrome (localhost:8080)
echo     Émulateur Android → baseUrl = 10.0.2.2:8080
echo     Device physique   → baseUrl = IP_locale:8080
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  STRUCTURE DES FICHIERS — ARBORESCENCE COMPLÈTE                             │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   couche4_mobile/
echo   ├── pubspec.yaml              ← Dépendances Flutter
echo   ├── web/
echo   │   └── index.html            ← Point entrée web
echo   └── lib/
echo       ├── main.dart             ← Entry point + MultiProvider
echo       ├── config/
echo       │   ├── app_config.dart   ← URLs, endpoints, timeouts
echo       │   └── app_theme.dart    ← Palette dark néon + ThemeData
echo       ├── models/
echo       │   ├── user_model.dart         ← Utilisateur connecté
echo       │   ├── score_model.dart        ← Score complet conducteur
echo       │   ├── evenement_model.dart    ← Événements ADAS/DMS
echo       │   └── notification_model.dart ← Notifs + Messages
echo       ├── services/
echo       │   ├── api_service.dart    ← HTTP calls + JWT headers
echo       │   ├── auth_service.dart   ← Login + logout + rôle check
echo       │   └── storage_service.dart← SharedPreferences wrapper
echo       ├── providers/
echo       │   ├── auth_provider.dart      ← État auth global
echo       │   └── conducteur_provider.dart← Données + polling Timer
echo       ├── screens/
echo       │   ├── login_screen.dart         ← Formulaire + animation
echo       │   ├── dashboard_screen.dart     ← Shell + BottomNav
echo       │   ├── score_screen.dart         ← Jauge + LineChart
echo       │   ├── historique_screen.dart    ← Liste événements filtrée
echo       │   ├── notifications_screen.dart ← Notifs + marquer lue
echo       │   ├── messages_screen.dart      ← Chat bidirectionnel
echo       │   └── profil_screen.dart        ← Profil + modification
echo       └── widgets/
echo           ├── score_gauge_widget.dart      ← Arc CustomPaint animé
echo           ├── event_card_widget.dart       ← Card événement colorée
echo           ├── notification_card_widget.dart← Card notif + action
echo           └── bottom_nav_widget.dart       ← BottomNav + badge
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  main.dart — POINT D'ENTRÉE                                                 │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   RÔLE : Initialisation complète de l'application
echo.
echo   SÉQUENCE DÉMARRAGE :
echo     1. WidgetsFlutterBinding.ensureInitialized()
echo     2. SystemChrome → Portrait uniquement (portraitUp + portraitDown)
echo     3. SystemChrome → Status bar transparent + icônes claires
echo     4. StorageService.init() → SharedPreferences
echo     5. runApp(AdasDmsApp())
echo.
echo   PROVIDER TREE :
echo     MultiProvider
echo       ├── ChangeNotifierProvider → AuthProvider()..initFromStorage()
echo       └── ChangeNotifierProvider → ConducteurProvider()
echo     child: MaterialApp
echo       ├── title: 'ADAS/DMS — Conducteur'
echo       ├── theme: AppTheme.darkTheme
echo       └── home: AppRoot()
echo.
echo   AppRoot — ROUTING CONDITIONNEL :
echo     Consumer^<AuthProvider^>
echo       if (auth.isLoggedIn) → DashboardScreen()
echo       else                 → LoginScreen()
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  config/app_config.dart — CONFIGURATION GLOBALE                             │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   RÔLE : Centralise toutes les constantes de configuration
echo.
echo   URL BACKEND :
echo     baseUrl = 'http://localhost:8080'
echo     apiUrl  = '$baseUrl/api'
echo.
echo   ADAPTER SELON LA CIBLE :
echo     Chrome (web)       → http://localhost:8080     (défaut)
echo     Émulateur Android  → http://10.0.2.2:8080
echo     Device physique    → http://192.168.1.X:8080
echo.
echo   ENDPOINTS :
echo     loginEndpoint         = '/auth/login'
echo     conducteurEndpoint    = '/conducteur'
echo     scoresEndpoint        = '/scores'
echo     notificationsEndpoint = '/notifications'
echo     messagesEndpoint      = '/messages'
echo.
echo   CONSTANTES :
echo     pollingInterval = 30 (secondes)
echo     connectTimeout  = 15000 (ms)
echo     receiveTimeout  = 15000 (ms)
echo.
echo   CLÉS SHARED PREFERENCES :
echo     tokenKey    = 'jwt_token'
echo     userIdKey   = 'user_id'
echo     userRoleKey = 'user_role'
echo     userNameKey = 'user_name'
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  config/app_theme.dart — DESIGN SYSTEM DARK NÉON                           │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   RÔLE : Définit toute la palette de couleurs + ThemeData Material 3
echo.
echo   COULEURS BACKGROUNDS :
echo     bg900 = #0D0D1A  ← fond principal (scaffold)
echo     bg800 = #12121F  ← cards, appbar
echo     bg700 = #1A1A2E  ← inputs, sidebar items
echo     bg600 = #1E1E35  ← hover states
echo     bg500 = #252540  ← elements actifs
echo.
echo   ACCENTS NÉON :
echo     purple = #A855F7  ← primaire (BottomNav actif)
echo     pink   = #EC4899  ← accents secondaires
echo     cyan   = #06B6D4  ← secondaire
echo     blue   = #3B82F6  ← conducteur (login, avatar)
echo     green  = #10B981  ← niveau FAIBLE
echo     orange = #F97316  ← niveau ÉLEVÉ
echo     red    = #EF4444  ← niveau CRITIQUE
echo     yellow = #EAB308  ← niveau MODÉRÉ
echo.
echo   TEXTES :
echo     textPrimary = #F1F5F9  ← texte principal
echo     textMuted   = #475569  ← texte secondaire/labels
echo     border      = rgba(255,255,255,0.06)
echo.
echo   MÉTHODES UTILITAIRES :
echo     getNiveauColor(String niveau) → Color
echo       FAIBLE   → green
echo       MODERE   → yellow
echo       ELEVE    → orange
echo       CRITIQUE → red
echo.
echo     getNiveauLabel(double score) → String
echo       score ^< 0.25 → 'FAIBLE'
echo       score ^< 0.50 → 'MODERE'
echo       score ^< 0.75 → 'ELEVE'
echo       score ≥ 0.75 → 'CRITIQUE'
echo.
echo   THEMEDATA :
echo     useMaterial3: true
echo     brightness: Brightness.dark
echo     scaffoldBackgroundColor: bg900
echo     colorScheme: primary=purple, secondary=cyan
echo     appBarTheme: bg800 + elevation 0
echo     cardTheme: bg800 + radius 16
echo     inputDecoration: filled bg700 + focus purple
echo     elevatedButton: blue + radius 12
echo     bottomNavBar: bg800 + selected purple
echo     IMPORTANT: Pas de fontFamily custom (police système)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  models/ — STRUCTURES DE DONNÉES                                            │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ── user_model.dart ─────────────────────────────────────────────────────────
echo   RÔLE : Représente l'utilisateur connecté (JWT payload)
echo   Champs :
echo     id    (String) ← identifiant conducteur (ex: C10)
echo     role  (String) ← toujours CONDUCTEUR dans cette app
echo     nom   (String) ← nom affiché
echo     token (String) ← JWT Bearer
echo   factory fromJson({ id, role, nom, token })
echo.
echo   ── score_model.dart ────────────────────────────────────────────────────────
echo   RÔLE : Score de risque complet calculé par Spring Boot
echo   Champs :
echo     conducteurId   (String)
echo     scoreValeur    (double) ← 0.0 à 1.0
echo     niveauRisque   (String) ← FAIBLE/MODERE/ELEVE/CRITIQUE
echo     nbFatigue      (int)    ← événements fatigue DMS
echo     nbTelephone    (int)    ← événements téléphone
echo     nbCeinture     (int)    ← ceinture non portée
echo     nbTabagisme    (int)    ← tabagisme détecté
echo     nbDistraction  (int)    ← distractions
echo     nbFcw          (int)    ← Forward Collision Warning
echo     nbLdw          (int)    ← Lane Departure Warning
echo     nbTotal        (int)    ← total toutes alertes
echo     ratioGraves    (double) ← ratio alertes graves
echo     vitesseMoyenne (double) ← km/h moyen
echo     dateCalcul     (DateTime)
echo   Getter: scorePct → scoreValeur * 100
echo.
echo   ── evenement_model.dart ────────────────────────────────────────────────────
echo   RÔLE : Événement ADAS ou DMS détecté par le véhicule
echo   Champs :
echo     id             (int)
echo     typeEvenement  (String) ← ex: FATIGUE_EYES_CLOSED
echo     categorie      (String) ← ADAS ou DMS
echo     severite       (String) ← FAIBLE/MODERE/ELEVE/CRITIQUE
echo     dureeSecondes  (double)
echo     vitesseKmh     (double?) ← nullable
echo     latitude       (double?) ← GPS nullable
echo     longitude      (double?) ← GPS nullable
echo     dateHeure      (DateTime)
echo   Getters:
echo     typeLabel → label FR (ex: FATIGUE_EYES_CLOSED → Yeux fermés)
echo     hasGps    → latitude != null ^&^& longitude != null
echo.
echo   TYPES D'ÉVÉNEMENTS :
echo     FATIGUE_EYES_CLOSED → Yeux fermés
echo     FATIGUE_EYES_DROWSY → Somnolence
echo     FATIGUE_YAWN        → Baillement
echo     FATIGUE_DROP        → Tête tombante
echo     DISTRACTION         → Distraction
echo     PHONE               → Téléphone
echo     SMOKING             → Tabagisme
echo     SEATBELT            → Ceinture absente
echo     FCW_WARNING         → Alerte collision
echo     FCW_DANGER          → Danger collision
echo     LDW_LEFT            → Sortie voie G
echo     LDW_RIGHT           → Sortie voie D
echo.
echo   ── notification_model.dart ─────────────────────────────────────────────────
echo   RÔLE : Contient 2 classes — NotificationModel + MessageModel
echo.
echo   NotificationModel :
echo     id         (int)
echo     titre      (String)
echo     corps      (String?) ← nullable
echo     lue        (bool)
echo     dateEnvoi  (DateTime)
echo     vitesseKmh (double?) ← nullable
echo.
echo   MessageModel :
echo     id              (int)
echo     expediteurId    (String)
echo     destinataireId  (String)
echo     contenu         (String)
echo     lu              (bool)
echo     dateEnvoi       (DateTime)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  services/ — COUCHE HTTP ET PERSISTANCE                                     │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ── api_service.dart ────────────────────────────────────────────────────────
echo   RÔLE : Centralise tous les appels HTTP vers Spring Boot
echo.
echo   HEADERS AUTO-INJECTÉS :
echo     Content-Type: application/json
echo     Accept: application/json
echo     Authorization: Bearer {token} (si connecté)
echo.
echo   GESTION ERREURS (_handleError) :
echo     401 → SESSION_EXPIRED
echo     403 → Accès refusé
echo     404 → Ressource introuvable
echo     405 → Méthode non autorisée
echo     500 → Erreur serveur interne
echo     body['erreur'] ou body['message'] → message backend
echo.
echo   ENDPOINTS IMPLÉMENTÉS :
echo     POST /api/auth/login               ← login(id, mdp)
echo     GET  /api/conducteur/{id}/profil   ← getProfil(id)
echo     PUT  /api/conducteur/{id}/profil   ← modifierProfil(id, data)
echo     GET  /api/scores/{id}/actuel       ← getScore(id)
echo     GET  /api/scores/{id}/historique   ← getHistoriqueScore(id)
echo     GET  /api/conducteur/{id}/evenements← getEvenements(id)
echo     GET  /api/conducteur/{id}/tableau-bord← getTableauBord(id)
echo     GET  /api/notifications/{id}       ← getNotifications(id)
echo     PUT  /api/notifications/{id}/lu    ← marquerNotificationLue(id)
echo     GET  /api/messages/{id}?avec={gid} ← getMessages(cid, avec)
echo     POST /api/messages                 ← envoyerMessage(data)
echo.
echo   DEBUG LOGS (console) :
echo     [API] POST http://localhost:8080/api/auth/login
echo     [API] Body: {"id":"C10","motDePasse":"***"}
echo     [API] Login status: 200
echo.
echo   ── auth_service.dart ───────────────────────────────────────────────────────
echo   RÔLE : Logique métier d'authentification
echo.
echo   login(id, motDePasse) :
echo     1. ApiService.login(id, mdp)
echo     2. Vérifier token présent dans réponse
echo     3. Vérifier role == 'CONDUCTEUR' (sinon Exception)
echo     4. StorageService.saveToken(token)
echo     5. StorageService.saveUser(id, role, nom)
echo     6. return UserModel
echo.
echo   logout() :
echo     StorageService.clear()
echo.
echo   getStoredUser() :
echo     if (!isLoggedIn) → null
echo     else → UserModel depuis SharedPreferences
echo.
echo   ── storage_service.dart ────────────────────────────────────────────────────
echo   RÔLE : Wrapper SharedPreferences pour persistance JWT
echo.
echo   init() → SharedPreferences.getInstance() (obligatoire avant runApp)
echo.
echo   MÉTHODES :
echo     saveToken(token)           ← écriture JWT
echo     getToken()                 ← lecture JWT
echo     saveUser(id, role, nom)    ← écriture infos user
echo     getUserId()                ← lecture id
echo     getUserRole()              ← lecture rôle
echo     getUserName()              ← lecture nom
echo     clear()                    ← suppression (logout)
echo     isLoggedIn (getter)        ← token != null ^&^& id != null
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  providers/ — STATE MANAGEMENT (PROVIDER PATTERN)                          │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ── auth_provider.dart ──────────────────────────────────────────────────────
echo   RÔLE : État d'authentification global (ChangeNotifier)
echo.
echo   STATE :
echo     _user    (UserModel?) ← null si non connecté
echo     _loading (bool)       ← spinner pendant login
echo     _error   (String?)    ← message d'erreur
echo.
echo   GETTERS :
echo     isLoggedIn → _user != null
echo     user       → UserModel?
echo     loading    → bool
echo     error      → String?
echo.
echo   MÉTHODES :
echo     initFromStorage()
echo       → AuthService.getStoredUser()
echo       → Restaure session au démarrage app
echo.
echo     login(id, motDePasse)
echo       → _loading = true + notifyListeners()
echo       → AuthService.login(id, mdp)
echo       → Si succès : _user = UserModel
echo       → Si erreur : _user = null + _error = message
echo       → _loading = false + notifyListeners()
echo.
echo     logout()
echo       → AuthService.logout()
echo       → _user = null + _error = null
echo       → notifyListeners()
echo.
echo   ── conducteur_provider.dart ────────────────────────────────────────────────
echo   RÔLE : Données conducteur + polling automatique
echo.
echo   STATE :
echo     profil          (Map^<String,dynamic^>?)
echo     score           (ScoreModel?)
echo     historiqueScore (List^<ScoreModel^>)
echo     evenements      (List^<EvenementModel^>)
echo     notifications   (List^<NotificationModel^>)
echo     messages        (List^<MessageModel^>)
echo     tableau         (Map^<String,dynamic^>?)
echo     _loading        (bool) ← premier chargement
echo     _refreshing     (bool) ← refresh manuel
echo     _error          (String?)
echo     lastUpdate      (DateTime?)
echo     _pollingTimer   (Timer?)
echo.
echo   GETTERS CALCULÉS :
echo     nbNonLues   → notifications.where(!lue).length
echo     scoreVal    → score?.scoreValeur ou profil['scoreJournalier']
echo     niveauRisque→ calculé depuis scoreVal (0.25/0.50/0.75)
echo.
echo   FLUX PRINCIPAL _fetchAll(conducteurId) :
echo     Future.wait (eagerError: false) :
echo       1. GET /conducteur/{id}/profil        → profil
echo       2. GET /scores/{id}/actuel            → score
echo       3. GET /scores/{id}/historique        → historiqueScore
echo       4. GET /conducteur/{id}/evenements    → evenements
echo       5. GET /notifications/{id}            → notifications
echo       6. GET /conducteur/{id}/tableau-bord  → tableau
echo     eagerError:false → continue même si 1 appel échoue
echo.
echo   POLLING 30s :
echo     _pollingTimer = Timer.periodic(30s, _fetchAll)
echo     stopPolling() → _pollingTimer?.cancel()
echo     dispose()     → cancel + super.dispose()
echo.
echo   AUTRES MÉTHODES :
echo     chargerDonnees(id) → _fetchAll + _startPolling
echo     refresh(id)        → _refreshing=true + _fetchAll
echo     chargerMessages(conducteurId, avec)
echo     marquerLue(notifId) → API + mise à jour locale
echo     envoyerMessage(from, to, contenu)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  screens/ — ÉCRANS DE L'APPLICATION                                         │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ── login_screen.dart ───────────────────────────────────────────────────────
echo   RÔLE : Écran de connexion — premier écran si non connecté
echo.
echo   STRUCTURE :
echo     Scaffold
echo     └── Container (gradient bg900→purple→blue)
echo         └── SafeArea → SingleChildScrollView
echo             ├── Logo shield (glow blue)
echo             ├── Titre 'Alpha Technology'
echo             ├── Sous-titre gradient Blue→Cyan
echo             ├── Card formulaire (bg800)
echo             │   ├── Badge 'Espace Conducteur'
echo             │   ├── TextFormField Identifiant (ex: C10)
echo             │   ├── TextFormField Mot de passe (toggle visibility)
echo             │   └── ElevatedButton 'Se connecter' (blue)
echo             ├── Comptes test (bouton cliquable → auto-rempli)
echo             ├── Info backend (URL affichée)
echo             └── Copyright
echo.
echo   ANIMATION :
echo     AnimationController 800ms → FadeTransition
echo     Curve: Curves.easeOut
echo.
echo   GESTION ERREURS :
echo     Timeout  → '⏱ Serveur inaccessible — vérifiez Spring Boot'
echo     Réseau   → '🔌 Pas de connexion — URL: {AppConfig.baseUrl}'
echo     401      → 'Identifiant ou mot de passe incorrect'
echo     Accès refusé → 'App réservée aux conducteurs'
echo     Affichage → SnackBar floating 5s
echo.
echo   ── dashboard_screen.dart ───────────────────────────────────────────────────
echo   RÔLE : Shell principal — contient la BottomNav et les 5 onglets
echo.
echo   STRUCTURE :
echo     Scaffold
echo     ├── AppBar
echo     │   ├── Logo shield gradient blue→cyan
echo     │   ├── Bouton Refresh (ou spinner si refreshing)
echo     │   └── PopupMenu → Déconnexion (rouge)
echo     ├── Body → _screens[_currentIndex]
echo     └── BottomNavWidget (5 onglets)
echo.
echo   5 ÉCRANS :
echo     index 0 → _HomeTab    (accueil résumé)
echo     index 1 → ScoreScreen (jauge + détail)
echo     index 2 → HistoriqueScreen (événements filtrés)
echo     index 3 → NotificationsScreen (alertes)
echo     index 4 → MessagesScreen (chat gestionnaire)
echo.
echo   initState :
echo     conducteur.chargerDonnees(auth.user!.id)
echo   dispose :
echo     conducteur.stopPolling()
echo.
echo   _HomeTab (onglet accueil) :
echo     RefreshIndicator (pull-to-refresh)
echo     ├── Salutation card (avatar initiale + nom + ID + véhicule)
echo     ├── 4 KPI Cards (GridView 2x2)
echo     │   ├── Score risque    (couleur niveau)
echo     │   ├── Total alertes   (orange)
echo     │   ├── Fatigue DMS     (rouge)
echo     │   └── Notifications   (cyan)
echo     ├── Score bar card
echo     │   ├── Label + Badge niveau
echo     │   ├── LinearProgressIndicator (10px, couleur niveau)
echo     │   ├── Pourcentage 28sp bold
echo     │   └── Heure dernière MàJ
echo     └── Derniers 5 événements (EventCardWidget)
echo.
echo   ── score_screen.dart ───────────────────────────────────────────────────────
echo   RÔLE : Détail complet du score de risque
echo.
echo   STRUCTURE :
echo     ListView
echo     ├── ScoreGaugeWidget (jauge arc animée)
echo     ├── 2 StatBox : Total alertes (purple) + Graves (rouge)
echo     ├── Card Détail par catégorie
echo     │   ├── Fatigue     (rouge,   /20) + LinearProgressIndicator
echo     │   ├── Téléphone   (pink,    /10)
echo     │   ├── Ceinture    (orange,  /10)
echo     │   ├── Distraction (yellow,  /10)
echo     │   ├── FCW         (purple,  /10)
echo     │   └── LDW         (cyan,    /10)
echo     └── Card Évolution score (LineChart fl_chart)
echo         ├── Hauteur: 180px
echo         ├── Courbe purple + gradient under
echo         ├── Points colorés selon niveau
echo         └── Axe Y: 0-100%%
echo.
echo   LINECHART :
echo     spots = historiqueScore.reversed.asMap().entries
echo             .map((e) → FlSpot(index, score*100))
echo     Points colorés :
echo       y ^< 25 → green / y ^< 50 → yellow
echo       y ^< 75 → orange / y ≥ 75 → red
echo.
echo   ── historique_screen.dart ──────────────────────────────────────────────────
echo   RÔLE : Liste filtrée de tous les événements ADAS/DMS
echo.
echo   STATE :
echo     _filtreCategorie = 'TOUS' / 'DMS' / 'ADAS'
echo     _filtreSeverite  = 'TOUS' / 'CRITIQUE' / 'ELEVE' / 'MODERE' / 'FAIBLE'
echo.
echo   STRUCTURE :
echo     Column
echo     ├── Zone filtres (bg800)
echo     │   ├── Filtre Catégorie (chips horizontaux)
echo     │   │   TOUS / DMS (cyan) / ADAS (purple)
echo     │   ├── Filtre Sévérité (chips horizontaux)
echo     │   │   TOUS / CRITIQUE(rouge) / ELEVE(orange) / MODERE(jaune) / FAIBLE(vert)
echo     │   └── Compteur '{n} événement(s) trouvé(s)'
echo     └── ListView.separated
echo         └── EventCardWidget × n (filtrés)
echo         (ou état vide si aucun résultat)
echo.
echo   FILTRAGE LOCAL :
echo     evenements.where((e) →
echo       okCat = filtre TOUS ou e.categorie == filtre
echo       okSev = filtre TOUS ou e.severite == filtre
echo     ).toList()
echo.
echo   ── notifications_screen.dart ───────────────────────────────────────────────
echo   RÔLE : Liste des notifications + marquer comme lue
echo.
echo   STRUCTURE :
echo     Column
echo     ├── Header (bg800)
echo     │   ├── '{n} notifications'
echo     │   └── Badge rouge '{n} non lues' (si ^> 0)
echo     └── Expanded
echo         ├── Si vide → icon + message
echo         └── ListView.separated
echo             └── NotificationCardWidget × n
echo                 onMarquerLue → conducteur.marquerLue(id)
echo.
echo   ── messages_screen.dart ────────────────────────────────────────────────────
echo   RÔLE : Chat bidirectionnel conducteur ↔ gestionnaire
echo.
echo   POLLING 15s :
echo     Timer.periodic(15s, _charger)
echo     _charger → chargerMessages(conducteurId, gestionnaireId)
echo     auto-scroll vers bas après chargement
echo.
echo   GESTIONNAIRE ID :
echo     profil['creeParGestionnaire'] ou profil['gestionnaireId']
echo.
echo   STRUCTURE :
echo     Column
echo     ├── Header conversation (avatar gestionnaire vert)
echo     ├── Expanded ListView.builder (messages)
echo     │   ├── Mes messages (droite) → gradient blue
echo     │   │   BorderRadius: topL/topR/bottomL=16, bottomR=4
echo     │   └── Messages reçus (gauche) → bg700
echo     │       BorderRadius: topL/topR/bottomR=16, bottomL=4
echo     └── Input zone
echo         ├── TextField (multiline max 3 lignes)
echo         └── Bouton send (gradient blue→cyan, rond 44px)
echo.
echo   ── profil_screen.dart ──────────────────────────────────────────────────────
echo   RÔLE : Affichage et modification du profil conducteur
echo.
echo   STRUCTURE :
echo     ListView
echo     ├── Avatar hero (initiales + gradient blue→cyan + glow)
echo     │   ├── Nom complet (20sp bold)
echo     │   ├── ID (muted)
echo     │   └── Badge CONDUCTEUR (bleu)
echo     ├── Section IMMUABLES (ligne top muted)
echo     │   ├── 🔒 Identifiant    (read-only grisé)
echo     │   ├── 🔒 Nom            (read-only grisé)
echo     │   ├── 🔒 Prénom         (read-only grisé)
echo     │   └── 🔒 Véhicule assigné (read-only grisé)
echo     ├── Section MODIFIABLES (ligne top blue)
echo     │   ├── Email    (emailAddress)
echo     │   ├── Téléphone (phone)
echo     │   ├── Nouveau mot de passe (min 8, toggle visibility)
echo     │   └── Confirmer mot de passe
echo     ├── Message erreur (fond rouge) ou succès (fond vert, 3s)
echo     └── Bouton Sauvegarder (blue 52px)
echo         PUT /api/conducteur/{id}/profil
echo         { email?, telephone?, motDePasse? }
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  widgets/ — COMPOSANTS RÉUTILISABLES                                        │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ── score_gauge_widget.dart ─────────────────────────────────────────────────
echo   RÔLE : Jauge arc animée pour afficher le score de risque
echo.
echo   TECHNIQUE : CustomPaint + AnimationController
echo.
echo   ANIMATION :
echo     AnimationController duration: 1200ms
echo     Tween(begin: 0, end: score)
echo     Curve: Curves.easeOutCubic
echo     didUpdateWidget → re-animate si score change
echo.
echo   _GaugePainter (CustomPainter) :
echo     Arc fond    : white 6%%, strokeWidth 20, round cap
echo     Arc coloré  : color, strokeWidth 20, round cap
echo     Angle start : π × 0.75 (bas-gauche)
echo     Angle total : π × 1.5  (270 degrés)
echo     Sweep       : total × score
echo     Centre haut : '{score*100}%%' (18%% taille, bold)
echo     Centre bas  : 'Score' (14px, muted)
echo     shouldRepaint → score ou color changé
echo.
echo   ── event_card_widget.dart ──────────────────────────────────────────────────
echo   RÔLE : Card affichant un événement ADAS ou DMS
echo.
echo   COULEUR selon sévérité :
echo     CRITIQUE → red / ELEVE → orange / MODERE → yellow / default → green
echo.
echo   ICÔNE selon type :
echo     PHONE/PHONE_CALL  → phone_android
echo     SMOKING           → smoking_rooms
echo     SEATBELT          → airline_seat_recline_normal
echo     FCW_*             → directions_car
echo     LDW_*             → swap_horiz
echo     default (fatigue) → remove_red_eye_outlined
echo.
echo   STRUCTURE : Row
echo     ├── Icon carré 40px (couleur sévérité + border)
echo     └── Column
echo         ├── Row: typeLabel + badge sévérité coloré
echo         └── Row: badge catégorie + date + vitesse km/h
echo             ADAS → purple / DMS → cyan
echo.
echo   ── notification_card_widget.dart ───────────────────────────────────────────
echo   RÔLE : Card notification avec action marquer lue
echo.
echo   ANIMATION : AnimatedContainer 300ms
echo     Non lue → fond purple 5%% + border purple 20%%
echo     Lue     → fond bg800 + border white 6%%
echo.
echo   STRUCTURE : Row
echo     ├── Point 8px (purple pulsant si non lue / gris si lue)
echo     ├── Column
echo     │   ├── Titre (bold si non lue, muted si lue)
echo     │   ├── Corps (si présent)
echo     │   └── Row: date + vitesse km/h (si présent)
echo     └── Bouton '✓ Lu' (si !lue) → onMarquerLue()
echo.
echo   ── bottom_nav_widget.dart ──────────────────────────────────────────────────
echo   RÔLE : Barre de navigation inférieure avec badge notifications
echo.
echo   5 ONGLETS :
echo     0 → Icons.home_outlined        'Accueil'
echo     1 → Icons.shield_outlined      'Score'
echo     2 → Icons.history              'Historique'
echo     3 → Icons.notifications_outlined 'Alertes' [badge rouge nbNonLues]
echo     4 → Icons.chat_bubble_outline  'Messages'
echo.
echo   BADGE NOTIFICATIONS :
echo     Si nbNonLues ^> 0 → badge rouge sur l'icône Alertes
echo     Texte du badge: '{nbNonLues}'
echo.
echo   Style:
echo     selectedItemColor:   purple
echo     unselectedItemColor: textMuted
echo     type: fixed (pas d'animation shift)
echo     backgroundColor: bg800
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  FLUX COMPLET — AUTHENTIFICATION                                            │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   DÉMARRAGE APPLICATION :
echo     main() → StorageService.init()
echo            → runApp(AdasDmsApp)
echo              → AuthProvider.initFromStorage()
echo                → StorageService.isLoggedIn ?
echo                  OUI → _user = UserModel (depuis SharedPrefs)
echo                        → AppRoot → DashboardScreen
echo                  NON → AppRoot → LoginScreen
echo.
echo   FLUX LOGIN :
echo     _login() dans LoginScreen
echo       → AuthProvider.login(id, mdp)
echo         → AuthService.login(id, mdp)
echo           → ApiService.login() → POST /api/auth/login
echo             → Réponse { token, id, role, nom }
echo               → role == 'CONDUCTEUR' ? OUI → continuer
echo               → role != 'CONDUCTEUR' → Exception accès refusé
echo               → StorageService.save(token, id, role, nom)
echo               → return UserModel
echo           → _user = UserModel
echo           → notifyListeners()
echo             → AppRoot reconstruit
echo               → auth.isLoggedIn = true
echo               → DashboardScreen affiché
echo.
echo   FLUX LOGOUT :
echo     PopupMenu → 'Déconnexion'
echo       → AuthProvider.logout()
echo         → AuthService.logout()
echo           → StorageService.clear()
echo         → _user = null
echo         → notifyListeners()
echo           → AppRoot → LoginScreen
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  FLUX COMPLET — DONNÉES CONDUCTEUR                                          │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   DashboardScreen.initState() :
echo     conducteur.chargerDonnees(auth.user!.id)
echo.
echo   chargerDonnees(id) :
echo     _loading = true → spinner affiché
echo     ↓
echo     _fetchAll(id) :
echo       Future.wait (eagerError: false) :
echo         1. GET /conducteur/{id}/profil        → profil
echo         2. GET /scores/{id}/actuel            → score
echo         3. GET /scores/{id}/historique        → historiqueScore[]
echo         4. GET /conducteur/{id}/evenements    → evenements[]
echo         5. GET /notifications/{id}            → notifications[]
echo         6. GET /conducteur/{id}/tableau-bord  → tableau
echo       lastUpdate = DateTime.now()
echo     ↓
echo     _loading = false → contenu affiché
echo     ↓
echo     _startPolling(id) :
echo       Timer.periodic(30s) → _fetchAll(id) + notifyListeners()
echo.
echo   REFRESH MANUEL :
echo     Bouton AppBar → conducteur.refresh(id)
echo     Pull-to-refresh → conducteur.refresh(id)
echo       _refreshing = true → petit spinner AppBar
echo       _fetchAll(id)
echo       _refreshing = false
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  PROBLÈME CORS — SOLUTION APPLIQUÉE                                         │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   PROBLÈME :
echo     Flutter Chrome utilise un port ALÉATOIRE (ex: 53862, 54123...)
echo     Spring Boot refusait les requêtes → Failed to fetch
echo.
echo   ERREUR OBSERVÉE :
echo     ClientFailed to fetch, uri=http://localhost:8080/api/auth/login
echo.
echo   CAUSE :
echo     SecurityConfig.corsConfigurationSource() utilisait setAllowedOrigins()
echo     avec une liste fixe de ports → ne couvre pas les ports Flutter aléatoires
echo.
echo   SOLUTION APPLIQUÉE dans SecurityConfig.java :
echo     AVANT : config.setAllowedOrigins(origins)
echo     APRÈS : config.setAllowedOriginPatterns(List.of(
echo               "http://localhost:*",
echo               "http://127.0.0.1:*",
echo               "http://10.0.2.2:*"
echo             ))
echo.
echo   RÉSULTAT :
echo     Tous les ports localhost autorisés
echo     Chrome Flutter → OK (port aléatoire couvert)
echo     Émulateur Android → OK (10.0.2.2)
echo     Application web React → OK (localhost:5173)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  RÈGLES MÉTIER MOBILE                                                       │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   1. RÔLE EXCLUSIF CONDUCTEUR
echo      AuthService vérifie role == 'CONDUCTEUR'
echo      Autres rôles → Exception + message clair
echo.
echo   2. CHAMPS IMMUABLES (ProfilScreen)
echo      id, nom, prenom, nomVehicule
echo      → _LockedField (fond grisé, non éditable, cursor disabled)
echo.
echo   3. CHAMPS MODIFIABLES (ProfilScreen)
echo      email, telephone, motDePasse (optionnel)
echo      → PUT /api/conducteur/{id}/profil
echo.
echo   4. VALIDATION MOT DE PASSE
echo      Min 8 caractères
echo      Confirmation identique obligatoire
echo      Vérification côté client avant envoi
echo.
echo   5. POLLING 30s AUTOMATIQUE
echo      Timer.periodic dans ConducteurProvider
echo      stopPolling() dans dispose() de DashboardScreen
echo.
echo   6. POLLING MESSAGES 15s
echo      Timer dans MessagesScreen
echo      chargerMessages() toutes les 15 secondes
echo      auto-scroll vers bas après chargement
echo.
echo   7. MARQUER NOTIFICATION LUE
echo      PUT /api/notifications/{id}/lu
echo      Mise à jour locale immédiate (optimistic update)
echo.
echo   8. SESSION PERSISTANTE
echo      SharedPreferences survit à fermeture de l'app
echo      initFromStorage() restaure au démarrage
echo.
echo   9. GESTIONNAIRE ID (messages)
echo      profil['creeParGestionnaire']
echo      ou profil['gestionnaireId'] (fallback)
echo.
echo   10. URL SELON CIBLE
echo       Chrome web    → localhost:8080
echo       Émulateur     → 10.0.2.2:8080 (dans app_config.dart)
echo       Device réel   → IP_LAN:8080
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  COMPARAISON MOBILE vs WEB (Rôle Conducteur)                               │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ┌──────────────────────┬───────────────────┬───────────────────┐
echo   │ Fonctionnalité       │ Flutter Mobile    │ React Web         │
echo   ├──────────────────────┼───────────────────┼───────────────────┤
echo   │ Couleur accent       │ Blue/Cyan         │ Blue/Cyan         │
echo   │ Score visible        │ OUI (arc animé)   │ OUI (canvas)      │
echo   │ Chart historique     │ fl_chart LineChart│ Chart.js Line     │
echo   │ Carte GPS            │ NON (prévu)       │ OUI (Leaflet)     │
echo   │ Messages             │ OUI (polling 15s) │ OUI (polling 15s) │
echo   │ Notifications        │ OUI (badge)       │ OUI (badge)       │
echo   │ Profil modifiable    │ email/tel/mdp     │ email/tel/mdp     │
echo   │ Persistance session  │ SharedPreferences │ localStorage      │
echo   │ Polling données      │ 30s               │ 30s               │
echo   │ Navigation           │ BottomNavigationBar│ Sidebar tabs     │
echo   │ Orientation          │ Portrait only     │ Responsive        │
echo   │ Rôles supportés      │ CONDUCTEUR seul   │ 3 rôles           │
echo   │ State management     │ Provider pattern  │ Context + useState│
echo   │ HTTP client          │ package:http      │ Axios             │
echo   │ Animations           │ AnimationController│ Framer Motion    │
echo   │ Graphique jauge      │ CustomPaint arc   │ Canvas HTML5      │
echo   └──────────────────────┴───────────────────┴───────────────────┘
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  COMMANDES DE DÉVELOPPEMENT                                                 │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   INSTALLATION :
echo     cd couche4_mobile
echo     flutter pub get
echo.
echo   NETTOYAGE :
echo     flutter clean
echo     flutter pub get
echo.
echo   LANCEMENT CHROME (recommandé) :
echo     flutter run -d chrome
echo     → Utilise localhost:8080
echo     → CORS Spring Boot : setAllowedOriginPatterns("http://localhost:*")
echo.
echo   LANCEMENT ÉMULATEUR ANDROID :
echo     Modifier app_config.dart :
echo       baseUrl = 'http://10.0.2.2:8080'
echo     flutter run -d emulator-5554
echo.
echo   LANCEMENT DEVICE PHYSIQUE :
echo     Modifier app_config.dart :
echo       baseUrl = 'http://192.168.1.X:8080'
echo     flutter run -d {device_id}
echo.
echo   BUILD WEB :
echo     flutter build web
echo     → Sortie: build/web/
echo.
echo   BUILD APK :
echo     flutter build apk --release
echo     → Sortie: build/app/outputs/flutter-apk/
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  COMPTE DE TEST                                                             │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   CONDUCTEUR (seul rôle accepté dans l'app mobile) :
echo     ID  : C10
echo     MDP : Cond123456
echo.
echo   Après connexion :
echo     Dashboard → Score + KPI + Derniers événements
echo     Score     → Jauge arc + Détail catégories + LineChart
echo     Historique→ Tous événements + Filtres catégorie/sévérité
echo     Alertes   → Notifications + Marquer lue
echo     Messages  → Chat avec gestionnaire G1
echo     Profil    → Infos + Modifier email/tel/mdp
echo.
echo   ORDRE DE DÉMARRAGE OBLIGATOIRE :
echo     1. PostgreSQL (port 5432)
echo     2. Spring Boot → mvn spring-boot:run (port 8080)
echo     3. Flutter → flutter run -d chrome
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  STATUT GLOBAL — COUCHE 4 MOBILE                                           │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   main.dart                  → OK MultiProvider + portrait + status bar
echo   app_config.dart            → OK URLs constantes (plus de _getBaseUrl())
echo   app_theme.dart             → OK Dark néon + ThemeData Material 3
echo   user_model.dart            → OK fromJson complet
echo   score_model.dart           → OK Tous champs + scorePct getter
echo   evenement_model.dart       → OK GPS + typeLabel + hasGps
echo   notification_model.dart    → OK NotificationModel + MessageModel
echo   api_service.dart           → OK JWT auto-inject + 11 endpoints + debug logs
echo   auth_service.dart          → OK Vérification rôle CONDUCTEUR + logs
echo   storage_service.dart       → OK SharedPreferences wrapper complet
echo   auth_provider.dart         → OK Login + logout + initFromStorage
echo   conducteur_provider.dart   → OK Future.wait + polling 30s + marquerLue
echo   login_screen.dart          → OK Animation fade + SnackBar + comptes test
echo   dashboard_screen.dart      → OK BottomNav 5 onglets + refresh + HomeTab
echo   score_screen.dart          → OK Jauge + détail catégories + LineChart
echo   historique_screen.dart     → OK Filtres catégorie/sévérité + liste
echo   notifications_screen.dart  → OK Badge non-lues + marquerLue
echo   messages_screen.dart       → OK Chat bulles + polling 15s + scroll
echo   profil_screen.dart         → OK Locked fields + modification + feedback
echo   score_gauge_widget.dart    → OK CustomPaint arc 270° + animation 1.2s
echo   event_card_widget.dart     → OK Icône + sévérité + catégorie + vitesse
echo   notification_card_widget.dart→ OK AnimatedContainer + badge Lu
echo   bottom_nav_widget.dart     → OK 5 tabs + badge rouge non-lues
echo   SecurityConfig.java (CORS) → OK setAllowedOriginPatterns localhost:*
echo.
echo   → Application Flutter opérationnelle sur Chrome
echo   → Backend Spring Boot : http://localhost:8080
echo   → SharedPreferences → session persistante
echo   → Polling 30s données + 15s messages
echo   → Portrait uniquement — Dark theme Blue/Cyan
echo   → CORS corrigé : tous ports localhost autorisés
echo.

echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║  COUCHE 4 MOBILE FLUTTER TERMINÉE ✓                                       ║
echo ║  Statut : Opérationnel — Chrome + Android — CORS OK                       ║
echo ║  Compte test : C10 / Cond123456                                            ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
pause