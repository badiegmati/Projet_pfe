import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../config/app_theme.dart';

class BottomNavWidget extends StatelessWidget {
  final int currentIndex;
  final int nbNonLues;
  final Function(int) onTap;

  const BottomNavWidget({
    super.key,
    required this.currentIndex,
    required this.nbNonLues,
    required this.onTap,
  });

  static const _items = [
    _NavData(Icons.home_outlined,          Icons.home_rounded,         'Accueil'),
    _NavData(Icons.shield_outlined,        Icons.shield_rounded,       'Score'),
    _NavData(Icons.history_rounded,        Icons.history_rounded,      'Historique'),
    _NavData(Icons.notifications_outlined, Icons.notifications_rounded,'Alertes'),
    _NavData(Icons.message_outlined,       Icons.message_rounded,      'Messages'),
  ];

  @override
  Widget build(BuildContext context) {
    final size   = MediaQuery.of(context).size;
    final isWide = size.width > 600;
    // Sur tablette/desktop : rail latéral simulé via NavigationRail
    if (isWide) return _buildRail(context);
    return _buildBar(context);
  }

  // ── Barre mobile ───────────────────────────────────────
  Widget _buildBar(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0D0D1A),
        border: Border(
          top: BorderSide(color: Colors.white.withOpacity(0.07), width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.6),
            blurRadius: 24,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 68,
          child: Row(
            children: List.generate(_items.length, (i) => _BarItem(
              data:     _items[i],
              index:    i,
              selected: currentIndex == i,
              badge:    i == 3 ? nbNonLues : 0,
              onTap:    () {
                HapticFeedback.selectionClick();
                onTap(i);
              },
            )),
          ),
        ),
      ),
    );
  }

  // ── Rail tablette ──────────────────────────────────────
  Widget _buildRail(BuildContext context) {
    return Container(
      width: 80,
      decoration: BoxDecoration(
        color: const Color(0xFF0D0D1A),
        border: Border(
          right: BorderSide(color: Colors.white.withOpacity(0.07)),
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 16),
            // Logo
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.blue, AppTheme.cyan],
                  begin: Alignment.topLeft,
                  end:   Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.blue.withOpacity(0.4),
                    blurRadius: 16,
                  ),
                ],
              ),
              child: const Icon(Icons.shield_rounded,
                  size: 22, color: Colors.white),
            ),
            const SizedBox(height: 24),
            ...List.generate(_items.length, (i) => _RailItem(
              data:     _items[i],
              index:    i,
              selected: currentIndex == i,
              badge:    i == 3 ? nbNonLues : 0,
              onTap:    () {
                HapticFeedback.selectionClick();
                onTap(i);
              },
            )),
          ],
        ),
      ),
    );
  }
}

// ── Données item ────────────────────────────────────────
class _NavData {
  final IconData icon;
  final IconData iconSel;
  final String   label;
  const _NavData(this.icon, this.iconSel, this.label);
}

// ── Item barre mobile ────────────────────────────────────
class _BarItem extends StatefulWidget {
  final _NavData   data;
  final int        index;
  final bool       selected;
  final int        badge;
  final VoidCallback onTap;

  const _BarItem({
    required this.data,
    required this.index,
    required this.selected,
    required this.badge,
    required this.onTap,
  });

  @override
  State<_BarItem> createState() => _BarItemState();
}

class _BarItemState extends State<_BarItem>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _scaleAnim;
  late final Animation<double>   _fadeAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync:    this,
      duration: const Duration(milliseconds: 300),
    );
    _scaleAnim = Tween<double>(begin: 1.0, end: 1.18).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut),
    );
    _fadeAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOut),
    );
    if (widget.selected) _ctrl.value = 1.0;
  }

  @override
  void didUpdateWidget(_BarItem old) {
    super.didUpdateWidget(old);
    if (widget.selected && !old.selected) _ctrl.forward(from: 0);
    if (!widget.selected && old.selected) _ctrl.reverse();
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final color = widget.selected ? AppTheme.cyan : AppTheme.textMuted;

    return Expanded(
      child: GestureDetector(
        onTap: widget.onTap,
        behavior: HitTestBehavior.opaque,
        child: AnimatedBuilder(
          animation: _ctrl,
          builder: (_, __) => Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Pill indicateur sélectionné
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                curve:    Curves.easeOutCubic,
                width:    widget.selected ? 44 : 0,
                height:   2,
                decoration: BoxDecoration(
                  gradient: widget.selected
                      ? const LinearGradient(
                          colors: [AppTheme.blue, AppTheme.cyan])
                      : null,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 6),

              // Icône avec badge
              Stack(
                clipBehavior: Clip.none,
                children: [
                  // Fond pill animé
                  if (widget.selected)
                    Positioned.fill(
                      child: FadeTransition(
                        opacity: _fadeAnim,
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppTheme.cyan.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ),

                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    child: ScaleTransition(
                      scale: _scaleAnim,
                      child: Icon(
                        widget.selected
                            ? widget.data.iconSel
                            : widget.data.icon,
                        size:  22,
                        color: color,
                      ),
                    ),
                  ),

                  // Badge notifications
                  if (widget.badge > 0)
                    Positioned(
                      top: -4, right: -2,
                      child: _Badge(count: widget.badge),
                    ),
                ],
              ),

              const SizedBox(height: 3),

              // Label
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  fontSize:   widget.selected ? 10.5 : 10,
                  fontWeight: widget.selected
                      ? FontWeight.w700
                      : FontWeight.w400,
                  color: color,
                  letterSpacing: widget.selected ? 0.3 : 0,
                ),
                child: Text(widget.data.label),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Item rail tablette ───────────────────────────────────
class _RailItem extends StatefulWidget {
  final _NavData   data;
  final int        index;
  final bool       selected;
  final int        badge;
  final VoidCallback onTap;

  const _RailItem({
    required this.data,
    required this.index,
    required this.selected,
    required this.badge,
    required this.onTap,
  });

  @override
  State<_RailItem> createState() => _RailItemState();
}

class _RailItemState extends State<_RailItem>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _scaleAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 300));
    _scaleAnim = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut));
    if (widget.selected) _ctrl.value = 1.0;
  }

  @override
  void didUpdateWidget(_RailItem old) {
    super.didUpdateWidget(old);
    if (widget.selected && !old.selected) _ctrl.forward(from: 0);
    if (!widget.selected && old.selected) _ctrl.reverse();
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Tooltip(
        message: widget.data.label,
        child: GestureDetector(
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            width: 56, height: 56,
            decoration: BoxDecoration(
              color: widget.selected
                  ? AppTheme.cyan.withOpacity(0.12)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(16),
              border: widget.selected
                  ? Border.all(color: AppTheme.cyan.withOpacity(0.3))
                  : null,
            ),
            child: Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                ScaleTransition(
                  scale: _scaleAnim,
                  child: Icon(
                    widget.selected
                        ? widget.data.iconSel
                        : widget.data.icon,
                    size: 24,
                    color: widget.selected
                        ? AppTheme.cyan
                        : AppTheme.textMuted,
                  ),
                ),
                if (widget.badge > 0)
                  Positioned(
                    top: 6, right: 6,
                    child: _Badge(count: widget.badge),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Badge rouge animé ────────────────────────────────────
class _Badge extends StatefulWidget {
  final int count;
  const _Badge({required this.count});

  @override
  State<_Badge> createState() => _BadgeState();
}

class _BadgeState extends State<_Badge>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _pulse;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync:    this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _pulse = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _pulse,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
        constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
          ),
          borderRadius: BorderRadius.circular(999),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFEF4444).withOpacity(0.6),
              blurRadius: 8,
            ),
          ],
        ),
        child: Text(
          widget.count > 99 ? '99+' : '${widget.count}',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize:   8,
            fontWeight: FontWeight.w800,
            color:      Colors.white,
          ),
        ),
      ),
    );
  }
}