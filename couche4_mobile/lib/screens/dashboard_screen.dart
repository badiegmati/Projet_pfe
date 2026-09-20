import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/conducteur_provider.dart';
import '../widgets/bottom_nav_widget.dart';
import '../widgets/event_card_widget.dart';
import 'score_screen.dart';
import 'historique_screen.dart';
import 'notifications_screen.dart';
import 'messages_screen.dart';
import 'profil_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with TickerProviderStateMixin {
  int _currentIndex = 0;
  late final List<Widget> _screens;
  late final AnimationController _appBarCtrl;
  late final Animation<double>   _appBarFade;

  @override
  void initState() {
    super.initState();
    _screens = [
      const _HomeTab(),
      const ScoreScreen(),
      HistoriqueScreen(),
      NotificationsScreen(),
      MessagesScreen(),
    ];

    _appBarCtrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 600));
    _appBarFade = CurvedAnimation(
      parent: _appBarCtrl, curve: Curves.easeOut);
    _appBarCtrl.forward();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      context.read<ConducteurProvider>()
          .chargerDonnees(auth.user!.id);
    });
  }

  @override
  void dispose() {
    _appBarCtrl.dispose();
    context.read<ConducteurProvider>().stopPolling();
    super.dispose();
  }

  void _onTabChanged(int i) {
    if (_currentIndex == i) return;
    HapticFeedback.selectionClick();
    setState(() => _currentIndex = i);
  }

  @override
  Widget build(BuildContext context) {
    final conducteur = context.watch<ConducteurProvider>();
    final auth       = context.watch<AuthProvider>();
    final size       = MediaQuery.of(context).size;
    final isWide     = size.width > 600;

    return Scaffold(
      backgroundColor: const Color(0xFF0D0D1A),
      appBar: _buildAppBar(conducteur, auth),
      body: isWide
          ? Row(
              children: [
                // Rail latéral tablette/desktop
                BottomNavWidget(
                  currentIndex: _currentIndex,
                  nbNonLues:    conducteur.nbNonLues,
                  onTap:        _onTabChanged,
                ),
                // Séparateur
                Container(
                  width: 1,
                  color: Colors.white.withOpacity(0.06),
                ),
                // Contenu principal
                Expanded(
                  child: _buildBody(conducteur),
                ),
              ],
            )
          : _buildBody(conducteur),
      bottomNavigationBar: isWide
          ? null
          : BottomNavWidget(
              currentIndex: _currentIndex,
              nbNonLues:    conducteur.nbNonLues,
              onTap:        _onTabChanged,
            ),
    );
  }

  PreferredSizeWidget _buildAppBar(
      ConducteurProvider conducteur, AuthProvider auth) {
    return PreferredSize(
      preferredSize: const Size.fromHeight(64),
      child: FadeTransition(
        opacity: _appBarFade,
        child:   Container(
          decoration: BoxDecoration(
            color: const Color(0xFF0D0D1A),
            border: Border(
              bottom: BorderSide(
                color: Colors.white.withOpacity(0.07)),
            ),
            boxShadow: [
              BoxShadow(
                color:      Colors.black.withOpacity(0.3),
                blurRadius: 20,
              ),
            ],
          ),
          child: SafeArea(
            bottom: false,
            child: SizedBox(
              height: 64,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    // Logo + titre
                    Row(
                      children: [
                        Container(
                          width: 36, height: 36,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [
                                Color(0xFF3B82F6),
                                Color(0xFF06B6D4),
                              ],
                            ),
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.blue.withOpacity(0.4),
                                blurRadius: 12,
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.shield_rounded,
                            size:  18,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 10),
                        ShaderMask(
                          shaderCallback: (b) => const LinearGradient(
                            colors: [
                              Color(0xFF3B82F6),
                              Color(0xFF06B6D4),
                            ],
                          ).createShader(b),
                          child: const Text(
                            'ADAS/DMS',
                            style: TextStyle(
                              fontSize:   18,
                              fontWeight: FontWeight.w900,
                              color:      Colors.white,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const Spacer(),

                    // Refresh
                    if (conducteur.refreshing)
                      SizedBox(
                        width: 20, height: 20,
                        child: CircularProgressIndicator(
                          color:       AppTheme.blue,
                          strokeWidth: 2,
                        ),
                      )
                    else
                      _AppBarIconBtn(
                        icon:    Icons.refresh_rounded,
                        onPress: () {
                          HapticFeedback.lightImpact();
                          conducteur.refresh(auth.user!.id);
                        },
                      ),

                    const SizedBox(width: 4),

                    // Menu
                    PopupMenuButton<String>(
                      icon:  const Icon(
                        Icons.more_vert_rounded,
                        color: Color(0xFF64748B),
                        size:  22,
                      ),
                      color:         const Color(0xFF1A1A2E),
                      elevation:     12,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                        side: BorderSide(
                          color: Colors.white.withOpacity(0.08)),
                      ),
                      onSelected: (val) async {
                        if (val == 'profil') {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const ProfilScreen()),
                          );
                        } else if (val == 'logout') {
                          HapticFeedback.mediumImpact();
                          await auth.logout();
                        }
                      },
                      itemBuilder: (_) => [
                        _menuItem(
                          'profil',
                          Icons.person_rounded,
                          'Mon profil',
                          AppTheme.cyan,
                        ),
                        const PopupMenuDivider(),
                        _menuItem(
                          'logout',
                          Icons.logout_rounded,
                          'Déconnexion',
                          const Color(0xFFEF4444),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  PopupMenuItem<String> _menuItem(
      String val, IconData icon, String label, Color color) {
    return PopupMenuItem<String>(
      value: val,
      child: Row(
        children: [
          Container(
            width: 30, height: 30,
            decoration: BoxDecoration(
              color:        color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(width: 10),
          Text(label, style: TextStyle(
            color:      color,
            fontSize:   13,
            fontWeight: FontWeight.w600,
          )),
        ],
      ),
    );
  }

  Widget _buildBody(ConducteurProvider conducteur) {
    if (conducteur.loading) return _buildLoading();
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      transitionBuilder: (child, anim) => FadeTransition(
        opacity: CurvedAnimation(parent: anim, curve: Curves.easeOut),
        child:   child,
      ),
      child: KeyedSubtree(
        key:   ValueKey(_currentIndex),
        child: _screens[_currentIndex],
      ),
    );
  }

  Widget _buildLoading() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          TweenAnimationBuilder<double>(
            tween:    Tween(begin: 0.0, end: 1.0),
            duration: const Duration(milliseconds: 600),
            builder: (_, v, child) => Transform.scale(
              scale: v, child: child),
            child: Container(
              width: 64, height: 64,
              decoration: BoxDecoration(
                color:        AppTheme.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
                border:       Border.all(
                  color: AppTheme.blue.withOpacity(0.3)),
              ),
              child: const Padding(
                padding: EdgeInsets.all(16),
                child:   CircularProgressIndicator(
                  color:       AppTheme.blue,
                  strokeWidth: 2.5,
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Chargement des données…',
            style: TextStyle(
              color:    Color(0xFF475569),
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Icône AppBar ──────────────────────────────────────────
class _AppBarIconBtn extends StatefulWidget {
  final IconData icon;
  final VoidCallback onPress;
  const _AppBarIconBtn({required this.icon, required this.onPress});

  @override
  State<_AppBarIconBtn> createState() => _AppBarIconBtnState();
}

class _AppBarIconBtnState extends State<_AppBarIconBtn>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _rot;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 600));
    _rot  = Tween<double>(begin: 0, end: 1)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        _ctrl.forward(from: 0);
        widget.onPress();
      },
      child: RotationTransition(
        turns: _rot,
        child: Container(
          width: 36, height: 36,
          decoration: BoxDecoration(
            color:        Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(10),
            border:       Border.all(
              color: Colors.white.withOpacity(0.08)),
          ),
          child: Icon(widget.icon,
              size: 18, color: const Color(0xFF64748B)),
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════
// HOME TAB
// ════════════════════════════════════════════════════════
class _HomeTab extends StatelessWidget {
  const _HomeTab();

  String _formatTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1)  return "à l'instant";
    if (diff.inMinutes < 60) return 'il y a ${diff.inMinutes}min';
    return '${dt.hour.toString().padLeft(2, '0')}:'
           '${dt.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final c    = context.watch<ConducteurProvider>();
    final auth = context.watch<AuthProvider>();
    final color = AppTheme.getNiveauColor(c.niveauRisque);
    final size  = MediaQuery.of(context).size;
    final isWide = size.width > 600;

    return RefreshIndicator(
      color:           AppTheme.blue,
      backgroundColor: const Color(0xFF12121F),
      displacement:    60,
      onRefresh: () => c.refresh(auth.user!.id),
      child: ListView(
        padding: EdgeInsets.symmetric(
          horizontal: isWide ? 24 : 16,
          vertical:   16,
        ),
        children: [

          // ── Carte salutation ──────────────────────────
          _GreetingCard(
            prenom: c.profil?['prenom'] as String? ?? 'C',
            id:     c.profil?['id'] as String? ?? '',
            vehicule: c.profil?['nomVehicule'] as String? ?? '',
            score:  c.scoreVal,
            niveau: c.niveauRisque,
            color:  color,
          ),

          const SizedBox(height: 16),

          // ── KPI Grid ──────────────────────────────────
          _KpiGrid(c: c, color: color),

          const SizedBox(height: 16),

          // ── Barre score ───────────────────────────────
          _ScoreBarCard(
            scoreVal:   c.scoreVal,
            niveauRisque: c.niveauRisque,
            color:      color,
            lastUpdate: c.lastUpdate,
            formatTime: _formatTime,
          ),

          const SizedBox(height: 20),

          // ── En-tête derniers événements ───────────────
          Row(
            children: [
              Container(
                width: 3, height: 18,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF3B82F6), Color(0xFF06B6D4)],
                    begin:  Alignment.topCenter,
                    end:    Alignment.bottomCenter,
                  ),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 10),
              const Text(
                'Derniers événements',
                style: TextStyle(
                  fontSize:   15,
                  fontWeight: FontWeight.w700,
                  color:      Color(0xFFE2E8F0),
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color:        Colors.white.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '${c.evenements.length}',
                  style: const TextStyle(
                    fontSize:   11,
                    color:      Color(0xFF64748B),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          if (c.evenements.isEmpty)
            _EmptyEvents()
          else
            ...c.evenements.take(5).toList().asMap().entries.map((e) =>
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: EventCardWidget(
                  evenement:  e.value,
                  animIndex:  e.key,
                ),
              ),
            ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ── Carte salutation ──────────────────────────────────────
class _GreetingCard extends StatelessWidget {
  final String prenom;
  final String id;
  final String vehicule;
  final double score;
  final String niveau;
  final Color  color;

  const _GreetingCard({
    required this.prenom,
    required this.id,
    required this.vehicule,
    required this.score,
    required this.niveau,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end:   Alignment.bottomRight,
          colors: [
            const Color(0xFF14141F),
            const Color(0xFF0F0F1A),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border:       Border.all(
          color: Colors.white.withOpacity(0.08)),
        boxShadow: [
          BoxShadow(
            color:      Colors.black.withOpacity(0.3),
            blurRadius: 20,
            offset:     const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          // Avatar initial
          TweenAnimationBuilder<double>(
            tween:    Tween(begin: 0.0, end: 1.0),
            duration: const Duration(milliseconds: 600),
            curve:    Curves.elasticOut,
            builder: (_, v, child) => Transform.scale(
              scale: v, child: child),
            child: Container(
              width: 58, height: 58,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF3B82F6), Color(0xFF06B6D4)],
                  begin:  Alignment.topLeft,
                  end:    Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color:      AppTheme.blue.withOpacity(0.4),
                    blurRadius: 20,
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  prenom.isNotEmpty ? prenom[0].toUpperCase() : 'C',
                  style: const TextStyle(
                    fontSize:   24,
                    fontWeight: FontWeight.w900,
                    color:      Colors.white,
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(width: 16),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Bonjour, $prenom 👋',
                  style: const TextStyle(
                    fontSize:   18,
                    fontWeight: FontWeight.w800,
                    color:      Color(0xFFE2E8F0),
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color:        AppTheme.blue.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        id,
                        style: TextStyle(
                          fontSize:   11,
                          fontWeight: FontWeight.w700,
                          color:      AppTheme.blue,
                        ),
                      ),
                    ),
                    if (vehicule.isNotEmpty) ...[
                      const SizedBox(width: 6),
                      Icon(Icons.directions_car_rounded,
                          size: 11, color: AppTheme.textMuted),
                      const SizedBox(width: 3),
                      Flexible(
                        child: Text(
                          vehicule,
                          style: const TextStyle(
                            fontSize: 11,
                            color:    Color(0xFF64748B),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── KPI Grid ──────────────────────────────────────────────
class _KpiGrid extends StatelessWidget {
  final ConducteurProvider c;
  final Color              color;
  const _KpiGrid({required this.c, required this.color});

  @override
  Widget build(BuildContext context) {
    final items = [
      _KpiData(
        label: 'Score risque',
        value: '${(c.scoreVal * 100).toStringAsFixed(0)}%',
        sub:   c.niveauRisque,
        icon:  Icons.shield_rounded,
        color: color,
      ),
      _KpiData(
        label: 'Total alertes',
        value: '${c.score?.nbTotal ?? c.evenements.length}',
        sub:   '7 derniers jours',
        icon:  Icons.warning_amber_rounded,
        color: AppTheme.orange,
      ),
      _KpiData(
        label: 'Fatigue',
        value: '${c.score?.nbFatigue ?? 0}',
        sub:   'événements DMS',
        icon:  Icons.visibility_rounded,
        color: const Color(0xFFEF4444),
      ),
      _KpiData(
        label: 'Non lues',
        value: '${c.nbNonLues}',
        sub:   'notifications',
        icon:  Icons.notifications_rounded,
        color: AppTheme.cyan,
      ),
    ];

    final cols = MediaQuery.of(context).size.width > 500 ? 4 : 2;

    return GridView.count(
      shrinkWrap:  true,
      physics:     const NeverScrollableScrollPhysics(),
      crossAxisCount:   cols,
      crossAxisSpacing: 10,
      mainAxisSpacing:  10,
      childAspectRatio: cols == 4 ? 1.0 : 1.35,
      children: items.asMap().entries.map((e) =>
        _KpiCard(data: e.value, animIndex: e.key)
      ).toList(),
    );
  }
}

class _KpiData {
  final String   label;
  final String   value;
  final String   sub;
  final IconData icon;
  final Color    color;
  const _KpiData({
    required this.label,
    required this.value,
    required this.sub,
    required this.icon,
    required this.color,
  });
}

class _KpiCard extends StatefulWidget {
  final _KpiData data;
  final int      animIndex;
  const _KpiCard({required this.data, required this.animIndex});

  @override
  State<_KpiCard> createState() => _KpiCardState();
}

class _KpiCardState extends State<_KpiCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _fadeAnim;
  late final Animation<Offset>   _slideAnim;
  bool _pressed = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 400));
    _fadeAnim  = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.2), end: Offset.zero,
    ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));

    Future.delayed(
      Duration(milliseconds: widget.animIndex * 70),
      () { if (mounted) _ctrl.forward(); },
    );
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final d = widget.data;
    return FadeTransition(
      opacity:  _fadeAnim,
      child:    SlideTransition(
        position: _slideAnim,
        child:    GestureDetector(
          onTapDown:   (_) => setState(() => _pressed = true),
          onTapUp:     (_) => setState(() => _pressed = false),
          onTapCancel: () => setState(() => _pressed = false),
          child: AnimatedScale(
            scale:    _pressed ? 0.95 : 1.0,
            duration: const Duration(milliseconds: 150),
            child:    Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin:  Alignment.topLeft,
                  end:    Alignment.bottomRight,
                  colors: [
                    const Color(0xFF12121F),
                    const Color(0xFF0E0E1B),
                  ],
                ),
                borderRadius: BorderRadius.circular(16),
                border:       Border.all(
                  color: d.color.withOpacity(0.2)),
                boxShadow: [
                  BoxShadow(
                    color:      d.color.withOpacity(0.06),
                    blurRadius: 16,
                    offset:     const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icône
                  Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(
                      color:        d.color.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                      border:       Border.all(
                        color: d.color.withOpacity(0.25)),
                    ),
                    child: Icon(d.icon, size: 18, color: d.color),
                  ),
                  const Spacer(),
                  // Valeur
                  Text(
                    d.value,
                    style: TextStyle(
                      fontSize:   22,
                      fontWeight: FontWeight.w900,
                      color:      d.color,
                    ),
                  ),
                  const SizedBox(height: 2),
                  // Label
                  Text(
                    d.label,
                    style: const TextStyle(
                      fontSize:   11,
                      fontWeight: FontWeight.w600,
                      color:      Color(0xFFCBD5E1),
                    ),
                  ),
                  Text(
                    d.sub,
                    style: const TextStyle(
                      fontSize: 10,
                      color:    Color(0xFF475569),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Barre score ────────────────────────────────────────────
class _ScoreBarCard extends StatefulWidget {
  final double   scoreVal;
  final String   niveauRisque;
  final Color    color;
  final DateTime? lastUpdate;
  final String Function(DateTime) formatTime;

  const _ScoreBarCard({
    required this.scoreVal,
    required this.niveauRisque,
    required this.color,
    required this.lastUpdate,
    required this.formatTime,
  });

  @override
  State<_ScoreBarCard> createState() => _ScoreBarCardState();
}

class _ScoreBarCardState extends State<_ScoreBarCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double>   _barAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync:    this,
      duration: const Duration(milliseconds: 1200),
    );
    _barAnim = Tween<double>(begin: 0, end: widget.scoreVal)
        .animate(CurvedAnimation(
          parent: _ctrl, curve: Curves.easeOutCubic));
    _ctrl.forward();
  }

  @override
  void didUpdateWidget(_ScoreBarCard old) {
    super.didUpdateWidget(old);
    if (old.scoreVal != widget.scoreVal) {
      _barAnim = Tween<double>(
        begin: old.scoreVal, end: widget.scoreVal,
      ).animate(CurvedAnimation(
        parent: _ctrl, curve: Curves.easeOutCubic));
      _ctrl.forward(from: 0);
    }
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _barAnim,
      builder: (_, __) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end:   Alignment.bottomRight,
            colors: [
              const Color(0xFF12121F),
              const Color(0xFF0E0E1B),
            ],
          ),
          borderRadius: BorderRadius.circular(20),
          border:       Border.all(
            color: widget.color.withOpacity(0.25)),
          boxShadow: [
            BoxShadow(
              color:      widget.color.withOpacity(0.08),
              blurRadius: 24,
              offset:     const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            // Titre + badge
            Row(
              children: [
                const Text(
                  'Score de risque actuel',
                  style: TextStyle(
                    fontSize:   14,
                    fontWeight: FontWeight.w700,
                    color:      Color(0xFFCBD5E1),
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color:        widget.color.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(999),
                    border:       Border.all(
                      color: widget.color.withOpacity(0.35)),
                  ),
                  child: Text(
                    widget.niveauRisque,
                    style: TextStyle(
                      fontSize:   11,
                      fontWeight: FontWeight.w800,
                      color:      widget.color,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Barre progressive
            Stack(
              children: [
                // Fond
                Container(
                  height: 12,
                  decoration: BoxDecoration(
                    color:        Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                // Rempli
                FractionallySizedBox(
                  widthFactor: _barAnim.value.clamp(0, 1),
                  child: Container(
                    height: 12,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          widget.color.withOpacity(0.7),
                          widget.color,
                        ],
                      ),
                      borderRadius: BorderRadius.circular(6),
                      boxShadow: [
                        BoxShadow(
                          color:      widget.color.withOpacity(0.4),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),

            // Valeur + MàJ
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${(_barAnim.value * 100).toStringAsFixed(1)}%',
                  style: TextStyle(
                    fontSize:   32,
                    fontWeight: FontWeight.w900,
                    color:      widget.color,
                    shadows: [
                      Shadow(
                        color:      widget.color.withOpacity(0.4),
                        blurRadius: 16,
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                if (widget.lastUpdate != null)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text(
                        'Dernière MàJ',
                        style: TextStyle(
                          fontSize: 10,
                          color:    Color(0xFF334155),
                        ),
                      ),
                      Text(
                        widget.formatTime(widget.lastUpdate!),
                        style: const TextStyle(
                          fontSize:   12,
                          fontWeight: FontWeight.w600,
                          color:      Color(0xFF475569),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Vide ───────────────────────────────────────────────────
class _EmptyEvents extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color:        const Color(0xFF12121F),
        borderRadius: BorderRadius.circular(20),
        border:       Border.all(
          color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        children: [
          TweenAnimationBuilder<double>(
            tween:    Tween(begin: 0.0, end: 1.0),
            duration: const Duration(milliseconds: 600),
            curve:    Curves.elasticOut,
            builder: (_, v, child) =>
                Transform.scale(scale: v, child: child),
            child: Container(
              width: 64, height: 64,
              decoration: BoxDecoration(
                color:        AppTheme.green.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
                border:       Border.all(
                  color: AppTheme.green.withOpacity(0.2)),
              ),
              child: Icon(Icons.check_circle_outline_rounded,
                  size: 32, color: AppTheme.green),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Aucun événement détecté',
            style: TextStyle(
              fontSize:   15,
              fontWeight: FontWeight.w700,
              color:      Color(0xFFCBD5E1),
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Les alertes ADAS/DMS apparaîtront\nautomatiquement ici',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color:    Color(0xFF475569),
              height:   1.5,
            ),
          ),
        ],
      ),
    );
  }
}