import 'package:flutter/material.dart';
import '../config/app_theme.dart';
import '../models/evenement_model.dart';

class EventCardWidget extends StatefulWidget {
  final EvenementModel evenement;
  final int            animIndex;

  const EventCardWidget({
    super.key,
    required this.evenement,
    this.animIndex = 0,
  });

  @override
  State<EventCardWidget> createState() => _EventCardWidgetState();
}

class _EventCardWidgetState extends State<EventCardWidget>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _fadeAnim;
  late final Animation<Offset>   _slideAnim;
  bool _pressed = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync:    this,
      duration: const Duration(milliseconds: 450),
    );
    _fadeAnim = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.15),
      end:   Offset.zero,
    ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));

    Future.delayed(
      Duration(milliseconds: widget.animIndex * 60),
      () { if (mounted) _ctrl.forward(); },
    );
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  Color get _sevColor {
    switch (widget.evenement.severite) {
      case 'CRITIQUE': return const Color(0xFFEF4444);
      case 'ELEVE':    return const Color(0xFFF97316);
      case 'MODERE':   return const Color(0xFFEAB308);
      default:         return const Color(0xFF10B981);
    }
  }

  IconData get _icon {
    switch (widget.evenement.typeEvenement) {
      case 'PHONE':
      case 'PHONE_CALL':   return Icons.phone_android_rounded;
      case 'SMOKING':      return Icons.smoking_rooms_rounded;
      case 'SEATBELT':     return Icons.airline_seat_recline_normal_rounded;
      case 'FCW_WARNING':
      case 'FCW_DANGER':   return Icons.directions_car_rounded;
      case 'LDW_LEFT':
      case 'LDW_RIGHT':    return Icons.swap_horiz_rounded;
      default:             return Icons.visibility_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _sevColor;
    final e     = widget.evenement;
    final isADAS = e.categorie == 'ADAS';

    return FadeTransition(
      opacity: _fadeAnim,
      child:   SlideTransition(
        position: _slideAnim,
        child: GestureDetector(
          onTapDown: (_) => setState(() => _pressed = true),
          onTapUp:   (_) => setState(() => _pressed = false),
          onTapCancel: () => setState(() => _pressed = false),
          child: AnimatedScale(
            scale:    _pressed ? 0.97 : 1.0,
            duration: const Duration(milliseconds: 120),
            curve:    Curves.easeOut,
            child: Container(
              padding: const EdgeInsets.all(0),
              decoration: BoxDecoration(
                color: const Color(0xFF12121F),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: color.withOpacity(0.2),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: color.withOpacity(0.08),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Column(
                  children: [
                    // Barre colorée top
                    Container(
                      height: 3,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [color, color.withOpacity(0.3)],
                        ),
                      ),
                    ),

                    Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          // Icône conteneur
                          _buildIconBox(color),

                          const SizedBox(width: 14),

                          // Contenu
                          Expanded(child: _buildContent(e, color, isADAS)),
                        ],
                      ),
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

  Widget _buildIconBox(Color color) {
    return Container(
      width: 48, height: 48,
      decoration: BoxDecoration(
        color:        color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(14),
        border:       Border.all(color: color.withOpacity(0.25)),
        boxShadow: [
          BoxShadow(color: color.withOpacity(0.15), blurRadius: 12),
        ],
      ),
      child: Icon(_icon, size: 22, color: color),
    );
  }

  Widget _buildContent(EvenementModel e, Color color, bool isADAS) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Ligne 1 : Type + badge sévérité
        Row(
          children: [
            Expanded(
              child: Text(
                e.typeLabel,
                style: const TextStyle(
                  fontSize:   13.5,
                  fontWeight: FontWeight.w700,
                  color:      Color(0xFFE2E8F0),
                  letterSpacing: 0.2,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 8),
            _SeverityBadge(text: e.severite, color: color),
          ],
        ),

        const SizedBox(height: 8),

        // Ligne 2 : Catégorie + date + vitesse
        Wrap(
          spacing: 8,
          runSpacing: 4,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            _CategoryChip(
              text:  e.categorie,
              color: isADAS
                  ? AppTheme.purple
                  : AppTheme.cyan,
            ),
            _MetaItem(
              icon:  Icons.access_time_rounded,
              text:  _formatDate(e.dateHeure),
              color: const Color(0xFF64748B),
            ),
            if (e.vitesseKmh != null)
              _MetaItem(
                icon:  Icons.speed_rounded,
                text:  '${e.vitesseKmh!.toStringAsFixed(0)} km/h',
                color: AppTheme.orange,
              ),
          ],
        ),
      ],
    );
  }

  String _formatDate(DateTime dt) =>
      '${dt.day.toString().padLeft(2, '0')}/'
      '${dt.month.toString().padLeft(2, '0')} '
      '${dt.hour.toString().padLeft(2, '0')}:'
      '${dt.minute.toString().padLeft(2, '0')}';
}

class _SeverityBadge extends StatelessWidget {
  final String text;
  final Color  color;
  const _SeverityBadge({required this.text, required this.color});

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color:        color.withOpacity(0.15),
      borderRadius: BorderRadius.circular(999),
      border:       Border.all(color: color.withOpacity(0.35)),
    ),
    child: Text(
      text,
      style: TextStyle(
        fontSize:   9.5,
        fontWeight: FontWeight.w800,
        color:      color,
        letterSpacing: 0.5,
      ),
    ),
  );
}

class _CategoryChip extends StatelessWidget {
  final String text;
  final Color  color;
  const _CategoryChip({required this.text, required this.color});

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
    decoration: BoxDecoration(
      color:        color.withOpacity(0.12),
      borderRadius: BorderRadius.circular(6),
    ),
    child: Text(
      text,
      style: TextStyle(
        fontSize:   9,
        fontWeight: FontWeight.w700,
        color:      color,
        letterSpacing: 0.5,
      ),
    ),
  );
}

class _MetaItem extends StatelessWidget {
  final IconData icon;
  final String   text;
  final Color    color;
  const _MetaItem({
    required this.icon,
    required this.text,
    required this.color,
  });

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 11, color: color),
      const SizedBox(width: 3),
      Text(text, style: TextStyle(
        fontSize: 11, color: color, fontWeight: FontWeight.w500)),
    ],
  );
}