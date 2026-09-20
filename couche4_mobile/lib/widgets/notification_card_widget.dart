import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../config/app_theme.dart';
import '../models/notification_model.dart';

class NotificationCardWidget extends StatefulWidget {
  final NotificationModel notification;
  final VoidCallback      onMarquerLue;
  final int               animIndex;

  const NotificationCardWidget({
    super.key,
    required this.notification,
    required this.onMarquerLue,
    this.animIndex = 0,
  });

  @override
  State<NotificationCardWidget> createState() =>
      _NotificationCardWidgetState();
}

class _NotificationCardWidgetState extends State<NotificationCardWidget>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _fadeAnim;
  late final Animation<Offset>   _slideAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 400));
    _fadeAnim  = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0.05, 0), end: Offset.zero,
    ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));

    Future.delayed(
      Duration(milliseconds: widget.animIndex * 55),
      () { if (mounted) _ctrl.forward(); },
    );
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final n     = widget.notification;
    final unread = !n.lue;

    return FadeTransition(
      opacity:  _fadeAnim,
      child:    SlideTransition(
        position: _slideAnim,
        child:    AnimatedContainer(
          duration: const Duration(milliseconds: 350),
          curve:    Curves.easeOutCubic,
          decoration: BoxDecoration(
            color: unread
                ? const Color(0xFF13131F)
                : const Color(0xFF0F0F1A),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: unread
                  ? AppTheme.purple.withOpacity(0.3)
                  : Colors.white.withOpacity(0.06),
              width: unread ? 1.5 : 1,
            ),
            boxShadow: unread
                ? [
                    BoxShadow(
                      color:      AppTheme.purple.withOpacity(0.1),
                      blurRadius: 20,
                      offset:     const Offset(0, 4),
                    ),
                  ]
                : [],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Barre latérale colorée
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 350),
                    width: 4,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end:   Alignment.bottomCenter,
                        colors: unread
                            ? [AppTheme.purple, AppTheme.cyan]
                            : [Colors.transparent, Colors.transparent],
                      ),
                    ),
                  ),

                  // Contenu
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Indicateur rond
                          _PulsingDot(active: unread),

                          const SizedBox(width: 12),

                          // Texte
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  n.titre,
                                  style: TextStyle(
                                    fontSize:   13.5,
                                    fontWeight: unread
                                        ? FontWeight.w700
                                        : FontWeight.w500,
                                    color: unread
                                        ? const Color(0xFFE2E8F0)
                                        : AppTheme.textMuted,
                                    height: 1.3,
                                  ),
                                ),

                                if (n.corps != null &&
                                    n.corps!.isNotEmpty) ...[
                                  const SizedBox(height: 5),
                                  Text(
                                    n.corps!,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color:    Color(0xFF64748B),
                                      height:   1.5,
                                    ),
                                  ),
                                ],

                                const SizedBox(height: 8),

                                // Meta
                                Wrap(
                                  spacing:            8,
                                  runSpacing:         4,
                                  crossAxisAlignment: WrapCrossAlignment.center,
                                  children: [
                                    Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(Icons.access_time_rounded,
                                            size:  11,
                                            color: AppTheme.textMuted),
                                        const SizedBox(width: 4),
                                        Text(
                                          _formatDate(n.dateEnvoi),
                                          style: const TextStyle(
                                            fontSize: 11,
                                            color:    Color(0xFF475569),
                                          ),
                                        ),
                                      ],
                                    ),
                                    if (n.vitesseKmh != null)
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.speed_rounded,
                                              size:  11,
                                              color: AppTheme.orange),
                                          const SizedBox(width: 4),
                                          Text(
                                            '${n.vitesseKmh!.toStringAsFixed(0)} km/h',
                                            style: TextStyle(
                                              fontSize: 11,
                                              color:    AppTheme.orange,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ],
                                      ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                          // Bouton ✓ Lu
                          if (unread) ...[
                            const SizedBox(width: 10),
                            _MarkReadButton(
                              onTap: () {
                                HapticFeedback.lightImpact();
                                widget.onMarquerLue();
                              },
                            ),
                          ],
                        ],
                      ),
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

  String _formatDate(DateTime dt) =>
      '${dt.day.toString().padLeft(2, '0')}/'
      '${dt.month.toString().padLeft(2, '0')} '
      '${dt.hour.toString().padLeft(2, '0')}:'
      '${dt.minute.toString().padLeft(2, '0')}';
}

// ── Point pulsant ────────────────────────────────────────
class _PulsingDot extends StatefulWidget {
  final bool active;
  const _PulsingDot({required this.active});

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _pulse;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 1400))
      ..repeat(reverse: true);
    _pulse = Tween<double>(begin: 0.6, end: 1.4).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    if (!widget.active) {
      return Container(
        width: 8, height: 8,
        margin: const EdgeInsets.only(top: 5),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: AppTheme.textMuted.withOpacity(0.3),
        ),
      );
    }
    return SizedBox(
      width: 16, height: 16,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Halo pulsant
          ScaleTransition(
            scale: _pulse,
            child: Container(
              width: 14, height: 14,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.purple.withOpacity(0.2),
              ),
            ),
          ),
          // Point central
          Container(
            width: 8, height: 8,
            decoration: BoxDecoration(
              shape:    BoxShape.circle,
              color:    AppTheme.purple,
              boxShadow: [
                BoxShadow(
                  color:      AppTheme.purple.withOpacity(0.6),
                  blurRadius: 6,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Bouton marquer lu ─────────────────────────────────────
class _MarkReadButton extends StatefulWidget {
  final VoidCallback onTap;
  const _MarkReadButton({required this.onTap});

  @override
  State<_MarkReadButton> createState() => _MarkReadButtonState();
}

class _MarkReadButtonState extends State<_MarkReadButton>
    with SingleTickerProviderStateMixin {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      onTapDown:   (_) => setState(() => _hovered = true),
      onTapUp:     (_) => setState(() => _hovered = false),
      onTapCancel: () => setState(() => _hovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding:  const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          gradient: _hovered
              ? const LinearGradient(
                  colors: [AppTheme.purple, AppTheme.cyan])
              : null,
          color: _hovered ? null : AppTheme.purple.withOpacity(0.12),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: AppTheme.purple.withOpacity(0.4),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.done_rounded,
                size:  12,
                color: _hovered ? Colors.white : AppTheme.purple),
            const SizedBox(width: 4),
            Text(
              'Lu',
              style: TextStyle(
                fontSize:   11,
                fontWeight: FontWeight.w700,
                color:      _hovered ? Colors.white : AppTheme.purple,
              ),
            ),
          ],
        ),
      ),
    );
  }
}