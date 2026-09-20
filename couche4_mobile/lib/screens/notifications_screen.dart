import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/conducteur_provider.dart';
import '../widgets/notification_card_widget.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _fade;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 500));
    _fade = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _ctrl.forward();
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final c    = context.watch<ConducteurProvider>();
    final auth = context.watch<AuthProvider>();

    return FadeTransition(
      opacity: _fade,
      child: Column(
        children: [
          // ── Header ──────────────────────────────────────
          _buildHeader(c),

          // ── Liste ───────────────────────────────────────
          Expanded(
            child: c.notifications.isEmpty
                ? _buildEmpty()
                : RefreshIndicator(
                    color:           AppTheme.blue,
                    backgroundColor: const Color(0xFF12121F),
                    onRefresh: () => c.refresh(auth.user!.id),
                    child: ListView.builder(
                      padding:   const EdgeInsets.all(16),
                      itemCount: c.notifications.length,
                      itemBuilder: (_, i) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child:   NotificationCardWidget(
                          notification: c.notifications[i],
                          animIndex:    i,
                          onMarquerLue: () {
                            HapticFeedback.selectionClick();
                            c.marquerLue(c.notifications[i].id);
                          },
                        ),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(ConducteurProvider c) {
    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF0D0D1A),
        border: Border(
          bottom: BorderSide(color: Colors.white.withOpacity(0.07)),
        ),
      ),
      child: Row(
        children: [
          // Compteur total
          Text(
            '${c.notifications.length} notification${c.notifications.length > 1 ? 's' : ''}',
            style: const TextStyle(
              fontSize:   13,
              color:      Color(0xFF64748B),
              fontWeight: FontWeight.w500,
            ),
          ),
          const Spacer(),

          // Badge non lues
          if (c.nbNonLues > 0)
            _PulsingBadge(count: c.nbNonLues),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: TweenAnimationBuilder<double>(
        tween:    Tween(begin: 0.0, end: 1.0),
        duration: const Duration(milliseconds: 600),
        curve:    Curves.easeOutBack,
        builder: (_, v, child) =>
            Transform.scale(scale: v, child: child),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(
                color:        Colors.white.withOpacity(0.03),
                borderRadius: BorderRadius.circular(24),
                border:       Border.all(
                  color: Colors.white.withOpacity(0.06)),
              ),
              child: const Icon(
                Icons.notifications_none_rounded,
                size:  36,
                color: Color(0xFF334155),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Aucune notification',
              style: TextStyle(
                fontSize:   16,
                fontWeight: FontWeight.w700,
                color:      Color(0xFF475569),
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Les alertes ADAS/DMS\napparaîtront ici',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color:    Color(0xFF334155),
                height:   1.6,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Badge pulsant non lues ────────────────────────────────
class _PulsingBadge extends StatefulWidget {
  final int count;
  const _PulsingBadge({required this.count});

  @override
  State<_PulsingBadge> createState() => _PulsingBadgeState();
}

class _PulsingBadgeState extends State<_PulsingBadge>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _pulse;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 1200))
      ..repeat(reverse: true);
    _pulse = Tween<double>(begin: 0.95, end: 1.05)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _pulse,
      child: Container(
        padding: const EdgeInsets.symmetric(
            horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
          ),
          borderRadius: BorderRadius.circular(999),
          boxShadow: [
            BoxShadow(
              color:      const Color(0xFFEF4444).withOpacity(0.4),
              blurRadius: 12,
            ),
          ],
        ),
        child: Text(
          '${widget.count} non lue${widget.count > 1 ? 's' : ''}',
          style: const TextStyle(
            fontSize:   11,
            fontWeight: FontWeight.w800,
            color:      Colors.white,
            letterSpacing: 0.3,
          ),
        ),
      ),
    );
  }
}