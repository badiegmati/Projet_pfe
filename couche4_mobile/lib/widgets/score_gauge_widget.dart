import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../config/app_theme.dart';

class ScoreGaugeWidget extends StatefulWidget {
  final double score;
  final String niveau;

  const ScoreGaugeWidget({
    super.key,
    required this.score,
    required this.niveau,
  });

  @override
  State<ScoreGaugeWidget> createState() => _ScoreGaugeWidgetState();
}

class _ScoreGaugeWidgetState extends State<ScoreGaugeWidget>
    with TickerProviderStateMixin {
  late AnimationController _gaugeCtrl;
  late AnimationController _glowCtrl;
  late Animation<double>   _gaugeAnim;
  late Animation<double>   _glowAnim;

  @override
  void initState() {
    super.initState();
    _gaugeCtrl = AnimationController(
      vsync:    this,
      duration: const Duration(milliseconds: 1400),
    );
    _glowCtrl = AnimationController(
      vsync:    this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);

    _gaugeAnim = Tween<double>(begin: 0, end: widget.score).animate(
      CurvedAnimation(parent: _gaugeCtrl, curve: Curves.easeOutCubic),
    );
    _glowAnim = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _glowCtrl, curve: Curves.easeInOut),
    );

    _gaugeCtrl.forward();
  }

  @override
  void didUpdateWidget(ScoreGaugeWidget old) {
    super.didUpdateWidget(old);
    if (old.score != widget.score) {
      _gaugeAnim = Tween<double>(begin: old.score, end: widget.score)
          .animate(CurvedAnimation(
              parent: _gaugeCtrl, curve: Curves.easeOutCubic));
      _gaugeCtrl.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _gaugeCtrl.dispose();
    _glowCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color     = AppTheme.getNiveauColor(widget.niveau);
    final screenW   = MediaQuery.of(context).size.width;
    // Taille responsive de la jauge
    final gaugeSize = screenW > 600
        ? 260.0
        : screenW > 400
            ? 220.0
            : 190.0;

    return AnimatedBuilder(
      animation: Listenable.merge([_gaugeAnim, _glowAnim]),
      builder: (_, __) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end:   Alignment.bottomRight,
            colors: [
              const Color(0xFF12121F),
              const Color(0xFF0D0D1A),
            ],
          ),
          borderRadius: BorderRadius.circular(24),
          border:       Border.all(color: color.withOpacity(0.3), width: 1.5),
          boxShadow: [
            BoxShadow(
              color:      color.withOpacity(0.15 * _glowAnim.value),
              blurRadius: 40,
              spreadRadius: 2,
            ),
            BoxShadow(
              color:      Colors.black.withOpacity(0.5),
              blurRadius: 24,
              offset:     const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          children: [
            // Jauge arc
            SizedBox(
              width:  gaugeSize,
              height: gaugeSize,
              child:  CustomPaint(
                painter: _GaugePainter(
                  score:     _gaugeAnim.value,
                  color:     color,
                  glowAlpha: _glowAnim.value,
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Badge niveau
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 20, vertical: 8),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    color.withOpacity(0.2),
                    color.withOpacity(0.08),
                  ],
                ),
                borderRadius: BorderRadius.circular(999),
                border:       Border.all(color: color.withOpacity(0.4)),
                boxShadow: [
                  BoxShadow(
                    color:      color.withOpacity(0.2 * _glowAnim.value),
                    blurRadius: 16,
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8, height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: color,
                      boxShadow: [
                        BoxShadow(color: color.withOpacity(0.7),
                            blurRadius: 6),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    AppTheme.getNiveauLabel(widget.score),
                    style: TextStyle(
                      fontSize:      14,
                      fontWeight:    FontWeight.w800,
                      color:         color,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Sous-texte
            Text(
              'Fenêtre glissante 7 jours',
              style: const TextStyle(
                fontSize: 11,
                color:    Color(0xFF475569),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GaugePainter extends CustomPainter {
  final double score;
  final Color  color;
  final double glowAlpha;

  _GaugePainter({
    required this.score,
    required this.color,
    required this.glowAlpha,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final cx     = size.width  / 2;
    final cy     = size.height / 2;
    final radius = math.min(size.width, size.height) / 2 - 24;
    const startAngle = math.pi * 0.75;
    const sweepTotal = math.pi * 1.5;

    // ── Arc fond (ticks) ───────────────────────────────
    final bgPaint = Paint()
      ..color       = Colors.white.withOpacity(0.05)
      ..style       = PaintingStyle.stroke
      ..strokeWidth = 22
      ..strokeCap   = StrokeCap.round;
    canvas.drawArc(
      Rect.fromCircle(center: Offset(cx, cy), radius: radius),
      startAngle, sweepTotal, false, bgPaint,
    );

    // ── Segments de couleur de fond ────────────────────
    final segments = [
      (0.00, 0.25, const Color(0xFF10B981)),
      (0.25, 0.50, const Color(0xFFEAB308)),
      (0.50, 0.75, const Color(0xFFF97316)),
      (0.75, 1.00, const Color(0xFFEF4444)),
    ];
    for (final seg in segments) {
      final p = Paint()
        ..color       = (seg.$3 as Color).withOpacity(0.12)
        ..style       = PaintingStyle.stroke
        ..strokeWidth = 22
        ..strokeCap   = StrokeCap.butt;
      canvas.drawArc(
        Rect.fromCircle(center: Offset(cx, cy), radius: radius),
        startAngle + sweepTotal * (seg.$1 as double),
        sweepTotal * ((seg.$2 as double) - (seg.$1 as double)),
        false, p,
      );
    }

    // ── Arc actif avec glow ────────────────────────────
    if (score > 0) {
      // Glow extérieur
      final glowPaint = Paint()
        ..color       = color.withOpacity(0.25 * glowAlpha)
        ..style       = PaintingStyle.stroke
        ..strokeWidth = 32
        ..strokeCap   = StrokeCap.round
        ..maskFilter  = const MaskFilter.blur(BlurStyle.normal, 10);
      canvas.drawArc(
        Rect.fromCircle(center: Offset(cx, cy), radius: radius),
        startAngle, sweepTotal * score, false, glowPaint,
      );

      // Arc principal
      final fgPaint = Paint()
        ..shader = SweepGradient(
          center:     Alignment.center,
          startAngle: startAngle,
          endAngle:   startAngle + sweepTotal * score,
          colors: [
            color.withOpacity(0.7),
            color,
          ],
        ).createShader(
          Rect.fromCircle(center: Offset(cx, cy), radius: radius),
        )
        ..style       = PaintingStyle.stroke
        ..strokeWidth = 22
        ..strokeCap   = StrokeCap.round;
      canvas.drawArc(
        Rect.fromCircle(center: Offset(cx, cy), radius: radius),
        startAngle, sweepTotal * score, false, fgPaint,
      );

      // Point terminal lumineux
      final endAngle = startAngle + sweepTotal * score;
      final dotX     = cx + radius * math.cos(endAngle);
      final dotY     = cy + radius * math.sin(endAngle);
      canvas.drawCircle(
        Offset(dotX, dotY), 10,
        Paint()
          ..color = color
          ..maskFilter = MaskFilter.blur(
              BlurStyle.normal, 8 * glowAlpha),
      );
      canvas.drawCircle(
        Offset(dotX, dotY), 5,
        Paint()..color = Colors.white,
      );
    }

    // ── Texte central ──────────────────────────────────
    final pct = '${(score * 100).toStringAsFixed(0)}%';

    // Valeur pourcentage
    final pctTp = TextPainter(
      text: TextSpan(
        text:  pct,
        style: TextStyle(
          fontSize:   size.width * 0.19,
          fontWeight: FontWeight.w900,
          color:      color,
          shadows: [
            Shadow(
              color:      color.withOpacity(0.5),
              blurRadius: 20,
            ),
          ],
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();

    pctTp.paint(
      canvas,
      Offset(cx - pctTp.width / 2, cy - pctTp.height / 2 - 12),
    );

    // Label "Score de risque"
    final lblTp = TextPainter(
      text: const TextSpan(
        text:  'Score de risque',
        style: TextStyle(
          fontSize: 12,
          color:    Color(0xFF64748B),
          fontWeight: FontWeight.w500,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();

    lblTp.paint(
      canvas,
      Offset(cx - lblTp.width / 2, cy + pctTp.height / 2 - 6),
    );
  }

  @override
  bool shouldRepaint(_GaugePainter old) =>
      old.score != score ||
      old.color != color ||
      old.glowAlpha != glowAlpha;
}