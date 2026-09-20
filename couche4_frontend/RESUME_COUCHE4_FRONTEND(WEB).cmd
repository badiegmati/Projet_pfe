@echo off
chcp 65001 >nul
color 0A
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║      COUCHE 4 — FRONTEND REACT 18 — RESUME COMPLET                        ║
echo ║      Alpha Technology — PFE 2024-2025 — ADAS/DMS                          ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

timeout /t 2 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  VUE D'ENSEMBLE — ARCHITECTURE FRONTEND                                     │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   React 18 + Vite (port 5173)
echo     → Proxy /api → Spring Boot :8080
echo     → JWT stocké localStorage
echo     → 3 rôles → 3 dashboards distincts
echo     → Dark theme néon (purple/cyan/green)
echo     → Animations Framer Motion + CSS custom
echo.
echo   STACK TECHNIQUE :
echo     React         : 18.3.1
echo     Vite          : 5.2.0 (bundler)
echo     Tailwind CSS  : 3.4.3 (utilitaires)
echo     React Router  : 6.22.3 (SPA routing)
echo     Axios         : 1.6.8 (HTTP)
echo     Chart.js      : 4.4.2 (graphiques)
echo     Leaflet       : 1.9.4 (cartes GPS)
echo     Framer Motion : 12.38.0 (animations)
echo     OGL           : 1.0.11 (WebGL aurora)
echo     Lucide React  : 0.372.0 (icônes)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  STRUCTURE DES FICHIERS                                                     │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   couche4_frontend/
echo   ├── index.html              ← Point entrée HTML + Leaflet CSS CDN
echo   ├── package.json            ← Dépendances npm
echo   ├── vite.config.js          ← Proxy /api → :8080
echo   ├── tailwind.config.js      ← Dark palette néon custom
echo   ├── postcss.config.js       ← Autoprefixer
echo   └── src/
echo       ├── main.jsx            ← ReactDOM.createRoot
echo       ├── App.jsx             ← Router principal + PrivateRoute
echo       ├── index.css           ← Classes CSS dark custom
echo       ├── api/
echo       │   └── apiService.js   ← Axios centralisé + JWT interceptors
echo       ├── context/
echo       │   └── AuthContext.jsx ← Auth global (token/role/id/nom)
echo       ├── hooks/
echo       │   └── useAuth.js      ← useContext(AuthContext)
echo       ├── components/
echo       │   ├── common/
echo       │   │   ├── NavBar.jsx          ← Navigation adaptative
echo       │   │   ├── ScoreBadge.jsx      ← Badge niveau risque
echo       │   │   ├── LoadingSpinner.jsx  ← Spinner double anneau
echo       │   │   └── AnimatedCard.jsx    ← Card avec animations
echo       │   ├── conducteur/
echo       │   │   ├── MonCompteConducteur.jsx
echo       │   │   ├── ScoreJauge.jsx      ← Canvas arc (0-100%)
echo       │   │   ├── GraphiqueScore.jsx  ← Line Chart.js
echo       │   │   ├── HistoriqueEvenements.jsx
echo       │   │   └── MapLeaflet.jsx      ← Carte dark GPS
echo       │   ├── effects/
echo       │   │   ├── SoftAurora.css
echo       │   │   └── SoftAurora.jsx      ← WebGL OGL shader
echo       │   ├── gestionnaire/
echo       │   │   ├── ListeConducteurs.jsx
echo       │   │   └── DetailConducteur.jsx ← Panel 4 onglets
echo       │   └── messagerie/
echo       │       └── MessageForm.jsx      ← Chat bidirectionnel
echo       └── pages/
echo           ├── LoginPage.jsx
echo           ├── DashboardConducteur.jsx
echo           ├── DashboardGestionnaire.jsx
echo           └── DashboardAdministrateur.jsx
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  ROUTING — App.jsx                                                          │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ROUTES PUBLIQUES :
echo     /login           → LoginPage (3 rôles)
echo     /                → HomeRedirect (redirige selon JWT)
echo.
echo   ROUTES PRIVÉES (avec JWT) :
echo     /conducteur/*    → DashboardConducteur    [ROLE_CONDUCTEUR]
echo     /gestionnaire/*  → DashboardGestionnaire  [ROLE_GESTIONNAIRE]
echo     /admin/*         → DashboardAdministrateur [ROLE_ADMINISTRATEUR]
echo.
echo   PrivateRoute :
echo     if (loading) → LoadingSpinner
echo     if (!user)   → redirect /login
echo     if (role ∉ roles) → redirect /login
echo     else         → render children
echo.
echo   HomeRedirect (selon JWT) :
echo     CONDUCTEUR    → /conducteur/dashboard
echo     GESTIONNAIRE  → /gestionnaire/dashboard
echo     ADMINISTRATEUR→ /admin/dashboard
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  AUTHENTIFICATION — AuthContext + useAuth                                   │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   FLUX LOGIN :
echo     LoginPage → authAPI.login(id, mdp)
echo       → POST /api/auth/login (Spring Boot)
echo         → JWT reçu { token, id, role, nom }
echo           → localStorage :
echo               - token
echo               - userId
echo               - userRole
echo               - userName
echo           → setUser({ token, id, role, nom })
echo           → navigate selon role
echo.
echo   PERSISTANCE SESSION :
echo     useEffect au démarrage AuthProvider :
echo       localStorage.getItem('token')
echo       localStorage.getItem('userId')
echo       localStorage.getItem('userRole')
echo       localStorage.getItem('userName')
echo       → setUser(...)
echo.
echo   LOGOUT :
echo     localStorage.clear()
echo     setUser(null)
echo     navigate('/login')
echo.
echo   JWT AUTO-INJECT (Axios interceptor) :
echo     Authorization: Bearer {token}
echo     Si 401 → logout automatique + redirect /login
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  DASHBOARD GESTIONNAIRE — STRUCTURE DÉTAILLÉE                               │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   DashboardGestionnaire.jsx :
echo     ├── NavBar (fixed top)
echo     ├── GestSidebar (240px)
echo     │   ├── Profil card (avatar + stats)
echo     │   ├── Navigation (5 items)
echo     │   └── Score moyen flotte + alerte critiques
echo     └── Main (flex-1)
echo         ├── Tab: dashboard   ← vue synthèse flotte
echo         ├── Tab: conducteurs ← CRUD complet + recherche + filtres
echo         ├── Tab: vehicules   ← CRUD véhicules
echo         ├── Tab: messages    ← messagerie avec conducteurs
echo         └── Tab: profil      ← compte gestionnaire
echo.
echo   STATE PRINCIPAL :
echo     activeTab   = 'dashboard' | 'conducteurs' | 'vehicules' | 'messages' | 'profil'
echo     conducteurs = []  ← /api/gestionnaire/conducteurs
echo     vehicules   = []  ← /api/gestionnaire/vehicules
echo     profil      = {}  ← /api/gestionnaire/profil
echo     selected    = null  ← conducteur sélectionné (détail panel)
echo     alerteCond  = null  ← conducteur pour alerte critique
echo     searchTerm  = ''    ← recherche conducteurs
echo.
echo   POLLING 30s automatique :
echo     charger() → Promise.allSettled([conducteurs, vehicules, profil])
echo     useEffect → charger() + setInterval(30000)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  SIDEBAR GESTIONNAIRE — GestSidebar                                         │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   PROFIL CARD (BG_CARD2) :
echo     Avatar : initial nom (gradient green→cyan + glow)
echo     Nom gestionnaire + ID + "Gestionnaire"
echo     Stats mini (grille 2 colonnes) :
echo       - Conducteurs count (vert)
echo       - Véhicules count   (cyan)
echo.
echo   NAVIGATION (5 items) :
echo     LayoutDashboard → Tableau de bord
echo     Users           → Conducteurs [badge rouge si critiques]
echo     Car             → Véhicules
echo     MessageSquare   → Messages
echo     Shield          → Mon Compte
echo.
echo     Active : border-left green + gradient bg
echo     Badge rouge pulsant si nbCritiques ^> 0
echo.
echo   SCORE MOYEN FLOTTE :
echo     Pourcentage 2rem bold (gradient green→cyan)
echo     Barre progress 6px (couleur selon niveau)
echo     Alerte : si nbCritiques ^> 0
echo       → fond rouge pulse + icon AlertTriangle
echo       → "X conducteur(s) critique(s)"
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  TAB DASHBOARD — DashboardTab                                               │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   EN-TÊTE :
echo     "Bonjour, {nomGestionnaire} 👋" (gradient green→cyan)
echo     Date du jour (weekday long)
echo     Boutons :
echo       - Actualiser (RefreshCw)
echo       - + Nouveau conducteur (gradient green→cyan)
echo.
echo   KPI CARDS (4 colonnes) :
echo     1. Conducteurs actifs  (vert)
echo     2. Véhicules           (cyan)
echo     3. Score moyen flotte  (couleur selon niveau)
echo     4. Alertes critiques   (rouge pulse si ^> 0)
echo.
echo   LIGNE 2 : Distribution + Bar Chart
echo     [240px] DoughnutChart (distribution niveaux)
echo       - FAIBLE   (vert)
echo       - MODÉRÉ   (jaune)
echo       - ÉLEVÉ    (orange)
echo       - CRITIQUE (rouge)
echo       - Cutout 68%%, total au centre
echo.
echo     [flex-1] BarChartScores (top 8 conducteurs)
echo       - Labels : initiales + nom
echo       - Scores : pourcentage 0-100
echo       - Couleurs selon niveau (vert/jaune/orange/rouge)
echo       - Hauteur : 200px
echo.
echo   LIGNE 3 : Liste conducteurs + MiniDetail
echo     [flex-1] ConducteursList
echo       - Avatar + nom + score bar
echo       - Bouton Alerte si critique (pulse)
echo       - Click → setSelected
echo       - Recherche en temps réel
echo.
echo     [380px si selected] MiniDetail (slide-in)
echo       - Score 2.5rem bold
echo       - Compteurs : Fatigue, Téléphone, Total
echo       - Derniers 5 événements
echo       - Bouton "Envoyer alerte" si critique
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  TAB CONDUCTEURS — ConducteursTab                                           │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   EN-TÊTE :
echo     Titre + count conducteurs
echo     Bouton "+ Nouveau conducteur" (gradient green→cyan)
echo.
echo   FILTRES :
echo     1. Recherche input (Search icon)
echo        → filtre sur nom + prenom + id
echo     2. Boutons filtres niveaux :
echo        - TOUS (gris)
echo        - CRITIQUE (rouge)
echo        - ELEVE (orange)
echo        - MODERE (jaune)
echo        - FAIBLE (vert)
echo.
echo   GRILLE CONDUCTEURS :
echo     Grid : repeat(auto-fill, minmax(300px, 1fr))
echo     Gap : 0.875rem
echo.
echo     Chaque ConducteurCard :
echo       - Ligne top gradient couleur niveau
echo       - Orbe déco top-right radial
echo       - Avatar initiales (couleur niveau)
echo       - Nom + badge "CRITIQUE" si score ^>= 0.75
echo       - ID + véhicule
echo       - Boutons : Edit (cyan) + Trash (rouge)
echo       - Score bar progress 6px
echo       - Footer : email + bouton "Alerter" si critique
echo       - Click → onDetail (ouvre DetailPannel)
echo       - Hover : translateY(-2px) + shadow
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  TAB VÉHICULES — VehiculesTab                                               │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   EN-TÊTE :
echo     Titre + count véhicules
echo     Bouton "+ Nouveau véhicule" (gradient cyan→blue)
echo.
echo   GRILLE VÉHICULES :
echo     Grid : repeat(auto-fill, minmax(280px, 1fr))
echo.
echo     Chaque VehiculeCard :
echo       - Ligne top gradient cyan→blue
echo       - Icon Car cyan dans carré
echo       - Nom véhicule + immatriculation
echo       - Marque + modèle + année
echo       - Bouton Trash (rouge)
echo       - Statut assignation :
echo         • Point vert + "Assigné à {id}" si conducteurId
echo         • Point gris + "Non assigné" sinon
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  TAB MESSAGES — MessagesTab                                                 │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   LAYOUT GRILLE (260px + flex-1) :
echo     [260px] Liste conducteurs (sidebar)
echo       - Scroll vertical max-height 480px
echo       - Avatar + nom + badge niveau
echo       - Click → setSelected
echo       - Active : border-left green + bg gradient
echo.
echo     [flex-1] Zone conversation
echo       - Si selected :
echo         → MessageForm
echo           • destinataireId : selected.id
echo           • destinataireNom : prenom + nom
echo           • preaRempli : alerte si score ^>= 0.75
echo           • Polling 15s automatique
echo       - Sinon :
echo         → État vide "Sélectionnez un conducteur"
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  TAB PROFIL — ProfilTab                                                     │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   AVATAR + INFOS (DarkCard) :
echo     Avatar 64px (gradient green→cyan + glow)
echo     Nom gestionnaire + ID
echo     Badge "GESTIONNAIRE DE FLOTTE" (vert)
echo.
echo   CHAMPS IMMUABLES (DarkCard) :
echo     🔒 Identifiant       → profil.id
echo     🔒 Nom gestionnaire  → profil.nomGestionnaire
echo     Read-only, fond rgba(255,255,255,0.02)
echo     "Gérées par l'administrateur"
echo.
echo   CHAMPS MODIFIABLES (DarkCard) :
echo     Email    (type email)
echo     Téléphone (type tel)
echo.
echo     Formulaire :
echo       PUT /api/gestionnaire/profil
echo       Data : { email, telephone }
echo       Success : "✓ Profil mis à jour" (disparaît 3s)
echo       Erreur  : fond rouge transparent
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  MODALES — Formulaires et Alertes                                           │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ModalAlerte (alerte critique) :
echo     Trigger : score conducteur ^>= 0.75
echo     Header  : Icon AlertTriangle rouge pulse
echo     Message : pré-rempli avec score + nom
echo     Textarea: éditable (4 rows)
echo     Boutons :
echo       - Annuler (btn-ghost)
echo       - Envoyer alerte (gradient red→pink pulse)
echo     Envoi :
echo       messageAPI.envoyer(...)
echo       → setSent(true) → auto-close 2s
echo.
echo   FormulaireConducteur (création + édition) :
echo     MODE CRÉATION :
echo       Champs requis :
echo         - id (format C+chiffres)
echo         - nom, prenom
echo         - nomVehicule
echo         - motDePasse (min 8 chars)
echo         - age, email, telephone (optionnels)
echo       Envoi : gestionnaireAPI.creerConducteur(...)
echo.
echo     MODE ÉDITION :
echo       Champs VERROUILLÉS (locked=true) :
echo         - id, nom, prenom, nomVehicule
echo         → grisés, cursor not-allowed
echo       Champs MODIFIABLES :
echo         - email, telephone, motDePasse (optionnel)
echo       Envoi : gestionnaireAPI.modifierConducteur(...)
echo.
echo   FormulaireVehicule (création uniquement) :
echo     Champs :
echo       - nomVehicule * (requis)
echo       - immatriculation, marque, modele, annee
echo     Envoi : gestionnaireAPI.creerVehicule(...)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  CHARTS — Chart.js                                                          │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   DistribDoughnut (distribution niveaux) :
echo     Library  : Chart.js Doughnut
echo     Cutout   : 68%%
echo     Données  : [FAIBLE, MODERE, ELEVE, CRITIQUE]
echo     Couleurs : [GREEN, YELLOW, ORANGE, RED]
echo     Centre   : total count (gradient green→cyan)
echo     Légende  : bottom, police 10px muted
echo     Hauteur  : 200px
echo.
echo   BarChartScores (top conducteurs) :
echo     Library  : Chart.js Bar
echo     Données  : scores 0-100
echo     Couleurs : selon niveau (vert/jaune/orange/rouge)
echo     Radius   : 6px bords arrondis
echo     Axes     : Y [0-100], X [noms]
echo     Tooltip  : dark custom "X%%"
echo     Hauteur  : 200px
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  DESIGN SYSTEM — PALETTE DARK NÉON                                          │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   COULEURS DE BASE :
echo     BG       = #0D0D1A   (fond principal)
echo     BG_CARD  = #12121F   (cards)
echo     BG_CARD2 = #1A1A2E   (sidebar card)
echo     BORDER   = rgba(255,255,255,0.06)
echo     TEXT     = #F1F5F9   (texte principal)
echo     MUTED    = #475569   (texte secondaire)
echo.
echo   ACCENTS NÉON :
echo     PURPLE   = #A855F7   (admin)
echo     PINK     = #EC4899   (accents)
echo     CYAN     = #06B6D4   (gestionnaire)
echo     BLUE     = #3B82F6   (liens)
echo     GREEN    = #10B981   (gestionnaire principal)
echo     ORANGE   = #F97316   (élevé)
echo     RED      = #EF4444   (critique)
echo     YELLOW   = #EAB308   (modéré)
echo.
echo   CLASSES CSS CUSTOM (index.css) :
echo     .card          → gradient dark + hover
echo     .card-glass    → backdrop-filter blur(16px)
echo     .btn-primary   → gradient purple→pink + glow
echo     .btn-cyan      → gradient cyan→blue
echo     .btn-danger    → gradient red→pink
echo     .btn-ghost     → transparent + border subtle
echo     .input-field   → dark bg + focus glow
echo     .nav-item      → sidebar item + active state
echo     .stat-card     → card + top border gradient hover
echo     .gradient-text → background-clip text
echo     .skeleton      → shimmer dark animation
echo     .glow-orb      → blur(80px) radial decoration
echo     .progress-neon → barre néon purple→pink
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  ANIMATIONS — CSS KEYFRAMES                                                 │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   @keyframes pulse-neon :
echo     0%%,100%% → box-shadow: 0 0 10px rgba(168,85,247,0.3)
echo     50%%      → box-shadow: 0 0 30px rgba(168,85,247,0.8)
echo     Usage : badge CRITIQUE, alertes
echo.
echo   @keyframes slide-up :
echo     from → opacity: 0, translateY(24px)
echo     to   → opacity: 1, translateY(0)
echo     Usage : cards, tabs, listes
echo.
echo   @keyframes fade-in :
echo     from → opacity: 0
echo     to   → opacity: 1
echo     Usage : modales, success messages
echo.
echo   @keyframes float :
echo     0%%,100%% → translateY(0)
echo     50%%      → translateY(-10px)
echo     Usage : décorations hover
echo.
echo   @keyframes shimmer-dark :
echo     0%%   → backgroundPosition: -200%% 0
echo     100%% → backgroundPosition:  200%% 0
echo     Usage : skeleton loading
echo.
echo   @keyframes glow-pulse :
echo     0%%,100%% → opacity: 0.5
echo     50%%      → opacity: 1
echo     Usage : orbes décoratifs
echo.
echo   @keyframes spin-slow :
echo     from → rotate(0deg)
echo     to   → rotate(360deg)
echo     Usage : anneaux décoratifs (12s)
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  RÈGLES MÉTIER FRONTEND                                                     │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   1. FORMAT ID CONDUCTEUR :
echo      Regex : ^C[0-9]+$
echo      Exemples : C10, C15, C21
echo      Validation : placeholder dans formulaire
echo.
echo   2. CHAMPS IMMUABLES CONDUCTEUR (édition) :
echo      id, nom, prenom, nomVehicule
echo      → locked=true, cursor not-allowed, grisés
echo.
echo   3. CHAMPS MODIFIABLES CONDUCTEUR :
echo      email, telephone, motDePasse (optionnel)
echo      → PUT /api/gestionnaire/conducteurs/{id}
echo.
echo   4. CHAMPS IMMUABLES GESTIONNAIRE :
echo      id, nomGestionnaire
echo      → affichés read-only dans ProfilTab
echo.
echo   5. CHAMPS MODIFIABLES GESTIONNAIRE :
echo      email, telephone
echo      → PUT /api/gestionnaire/profil
echo.
echo   6. ALERTE CRITIQUE AUTO :
echo      Si score ^>= 0.75 (75%%)
echo      → badge "CRITIQUE" pulse
echo      → bouton "Alerter" visible
echo      → message pré-rempli automatique
echo.
echo   7. POLLING 30s AUTOMATIQUE :
echo      chargerDonnees() toutes les 30 secondes
echo      → conducteurs, vehicules, profil
echo.
echo   8. SOFT DELETE UNIQUEMENT :
echo      Jamais de DELETE physique
echo      → API /supprimerConducteur → actif=false
echo.
echo   9. VALIDATION FRONTEND :
echo      Mot de passe : min 8 caractères
echo      Email : type="email" HTML5
echo      Téléphone : type="tel" HTML5
echo.
echo   10. NAVIGATION ISOLÉE :
echo       Gestionnaire voit UNIQUEMENT ses conducteurs
echo       → filtre backend WHERE creeParGestionnaire = {id}
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  COMPARAISON — 3 DASHBOARDS                                                 │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   ┌───────────────────┬─────────────────┬─────────────────┬─────────────────┐
echo   │ Fonctionnalité    │ Conducteur      │ Gestionnaire    │ Admin           │
echo   ├───────────────────┼─────────────────┼─────────────────┼─────────────────┤
echo   │ Couleur accent    │ Blue/Cyan       │ Green/Cyan      │ Purple/Pink     │
echo   │ Avatar            │ Initiales       │ Initial nom     │ Crown icon      │
echo   │ Score visible     │ OUI (jauge)     │ Liste flotte    │ NON             │
echo   │ Événements        │ OUI (polling)   │ Via détail      │ NON             │
echo   │ Carte GPS         │ OUI             │ Via détail      │ NON             │
echo   │ Messages          │ Gestionnaire    │ Tous conducteurs│ NON             │
echo   │ CRUD conducteurs  │ NON             │ OUI             │ NON             │
echo   │ CRUD véhicules    │ NON             │ OUI             │ NON             │
echo   │ CRUD gestionnaires│ NON             │ NON             │ OUI             │
echo   │ Profil modifiable │ email/tel/mdp   │ email/tel       │ NON             │
echo   │ Notifications     │ OUI (badge)     │ Via messages    │ NON             │
echo   │ Sidebar stats     │ Score perso     │ Score flotte    │ Nb gestionnaires│
echo   │ Charts            │ Line (évolution)│ Doughnut + Bar  │ Bar (évolution) │
echo   │ Alerte critique   │ Reçoit          │ Envoie          │ NON             │
echo   └───────────────────┴─────────────────┴─────────────────┴─────────────────┘
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  COMPOSANTS RÉUTILISABLES                                                   │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   DarkCard :
echo     Props : title, subtitle, children, delay, accent, headerRight
echo     Rôle  : Container card dark uniforme
echo     Ligne top gradient couleur accent
echo     Hover : border + shadow accent
echo.
echo   KpiCard :
echo     Props : label, value, sub, icon, color, delay, pulse
echo     Rôle  : Stat card animée
echo     Ligne top, orbe déco, icon carrée
echo     Hover : translateY(-3px) + shadow
echo     Pulse : animation si critique
echo.
echo   DistribDoughnut :
echo     Props : distrib {FAIBLE, MODERE, ELEVE, CRITIQUE}
echo     Rôle  : Graphique distribution niveaux
echo     Cutout 68%%, total centre
echo.
echo   BarChartScores :
echo     Props : labels, scores
echo     Rôle  : Bar chart scores conducteurs
echo     Couleurs selon niveau
echo.
echo   ConducteursList :
echo     Props : conducteurs, selected, onSelect, onAlerte
echo     Rôle  : Liste cliquable conducteurs
echo     Avatar + nom + score bar
echo     Bouton Alerte si critique
echo.
echo   MiniDetail :
echo     Props : conducteur, onClose, onAlerte
echo     Rôle  : Panel détail conducteur (slide-in)
echo     Score + compteurs + événements
echo.
echo   ModalAlerte :
echo     Props : conducteur, expediteurId, onClose
echo     Rôle  : Modale envoi alerte critique
echo     Message pré-rempli éditable
echo.
echo   FormulaireConducteur :
echo     Props : conducteur, gestionnaireId, erreur, onSave, onClose
echo     Rôle  : Formulaire création + édition
echo     Champs locked si édition
echo.
echo   FormulaireVehicule :
echo     Props : gestionnaireId, onSave, onClose
echo     Rôle  : Formulaire création véhicule
echo.
echo   ActionBtn :
echo     Props : icon, color, title, onClick
echo     Rôle  : Bouton action (Edit/Delete)
echo     Hover : background + border color
echo.
echo   ModalOverlay :
echo     Props : children, onClose
echo     Rôle  : Fond modal blur
echo     Click overlay → onClose
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  COMMANDES DÉVELOPPEMENT                                                    │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   INSTALLATION :
echo     cd couche4_frontend
echo     npm install
echo.
echo   DÉVELOPPEMENT (port 5173) :
echo     npm run dev
echo     → Proxy /api → http://localhost:8080
echo     → Hot reload activé
echo     → Accès : http://localhost:5173
echo.
echo   BUILD PRODUCTION :
echo     npm run build
echo     → Sortie : dist/
echo     → Minification + optimisation
echo     → Tree-shaking automatique
echo.
echo   PREVIEW BUILD :
echo     npm run preview
echo     → Serve dist/ en local
echo.
echo   LINTER (optionnel) :
echo     npm run lint
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  COMPTES DE TEST                                                            │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   Conducteur :
echo     ID  : C10
echo     MDP : Cond123456
echo     Couleur : Blue/Cyan
echo     Dashboard : Score + Événements + Carte GPS + Messages
echo.
echo   Gestionnaire :
echo     ID  : G1
echo     MDP : Gest123456
echo     Couleur : Green/Cyan
echo     Dashboard : CRUD Conducteurs + Véhicules + Messages + Stats flotte
echo.
echo   Administrateur :
echo     ID  : 00000000
echo     MDP : Admis123456
echo     Couleur : Purple/Pink
echo     Dashboard : CRUD Gestionnaires + Stats système
echo.

timeout /t 3 /nobreak >nul

echo ┌─────────────────────────────────────────────────────────────────────────────┐
echo │  STATUT GLOBAL — COUCHE 4                                                   │
echo └─────────────────────────────────────────────────────────────────────────────┘
echo.
echo   LoginPage              → ✅ Aurora WebGL + 3 rôles
echo   DashboardConducteur    → ✅ Score + Carte + Historique + Messages
echo   DashboardGestionnaire  → ✅ CRUD Conducteurs/Véhicules + Messagerie
echo   DashboardAdmin         → ✅ CRUD Gestionnaires + Stats
echo   Authentification JWT   → ✅ Auto-inject + logout 401
echo   Polling 30s            → ✅ Actif (conducteurs, véhicules, profil)
echo   Formulaires            → ✅ Création + Édition (champs locked)
echo   Messagerie             → ✅ Bidirectionnelle + polling 15s
echo   Charts                 → ✅ Doughnut + Bar + Line (Chart.js)
echo   Carte GPS              → ✅ Leaflet dark + markers colorés
echo   Animations             → ✅ CSS keyframes + Framer Motion
echo   Dark theme néon        → ✅ Purple/Cyan/Green
echo   Responsive             → ✅ Grid auto-fill + breakpoints
echo.
echo   → Application web ADAS/DMS opérationnelle
echo   → Port 5173 → proxy → Spring Boot :8080
echo   → JWT localStorage → persistance session
echo   → 3 dashboards distincts par rôle
echo.

echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║  COUCHE 4 FRONTEND REACT 18 TERMINÉE ✓                                    ║
echo ║  Statut : Production-ready — Dark theme néon — 3 dashboards OK             ║
echo ║  Prochain : Déploiement + Tests end-to-end                                ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
pause