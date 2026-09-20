import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../config/app_theme.dart';
import '../providers/conducteur_provider.dart';
import '../widgets/score_gauge_widget.dart';

class ScoreScreen extends StatelessWidget {
  const ScoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final c     = context.watch<ConducteurProvider>();
    final color = AppTheme.getNiveauColor(c.niveauRisque);
    final isWide = MediaQuery.of(context).size.width > 600;

    final details = [
      _DetailItem('Fatigue',     c.score?.nbFatigue     ?? 0, 20, const Color(0xFFEF4444)),
      _DetailItem('Téléphone',   c.score?.nbTelephone   ?? 0, 10, const Color(0xFFEC4899)),
      _DetailItem('Ceinture',    c.score?.nbCeinture    ?? 0, 10, const Color(0xFFF97316)),
      _DetailItem('Distraction', c.score?.nbDistraction ?? 0, 10, const Color(0xFFEAB308)),
      _DetailItem('FCW',         c.score?.nbFcw         ?? 0, 10, AppTheme.purple),
      _DetailItem('LDW',         c.score?.nbLdw         ?? 0, 10, AppTheme.cyan),
    ];

    return ListView(
      padding: EdgeInsets.symmetric(
        horizontal: isWide ? 24 : 16,
        vertical:   16,
      ),
      children: [
        // ── Jauge ──────────────────────────────────────
        ScoreGaugeWidget(score: c.scoreVal, niveau: c.niveauRisque),

        const SizedBox(height: 16),

        // ── Stats Total / Graves ────────────────────────
        Row(children: [
          Expanded(child: _StatBox(
            val:   '${c.score?.nbTotal ?? 0}',
            label: 'Total alertes',
            sub:   '7 jours',
            color: AppTheme.purple,
          )),
          const SizedBox(width: 12),
          Expanded(child: _StatBox(
            val: '${((c.score?.ratioGraves ?? 0) *
                (c.score?.nbTotal ?? 0)).round()}',
            label: 'Alertes graves',
            sub:   'prioritaires',
            color: const Color(0xFFEF4444),
          )),
        ]),

        const SizedBox(height: 16),

        // ── Détail catégories ───────────────────────────
        _buildDetailCard(details),

        const SizedBox(height: 16),

        // ── Graphique historique ────────────────────────
        if (c.historiqueScore.isNotEmpty)
          _buildHistoChart(c),

        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildDetailCard(List<_DetailItem> details) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF12121F), Color(0xFF0E0E1B)],
          begin:  Alignment.topLeft,
          end:    Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border:       Border.all(
          color: Colors.white.withOpacity(0.07)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 3, height: 18,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFA855F7), Color(0xFF06B6D4)],
                    begin:  Alignment.topCenter,
                    end:    Alignment.bottomCenter,
                  ),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 10),
              const Text(
                'Détail par catégorie',
                style: TextStyle(
                  fontSize:   15,
                  fontWeight: FontWeight.w700,
                  color:      Color(0xFFE2E8F0),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Padding(
            padding: EdgeInsets.only(left: 13),
            child:   Text(
              'Pondération score · fenêtre 7 jours',
              style: TextStyle(
                fontSize: 11,
                color:    Color(0xFF475569),
              ),
            ),
          ),
          const SizedBox(height: 20),
          ...details.asMap().entries.map((e) =>
            _DetailBar(
              item:      e.value,
              animIndex: e.key,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoChart(ConducteurProvider c) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF12121F), Color(0xFF0E0E1B)],
          begin:  Alignment.topLeft,
          end:    Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border:       Border.all(
          color: Colors.white.withOpacity(0.07)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 3, height: 18,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFA855F7), Color(0xFF3B82F6)],
                    begin:  Alignment.topCenter,
                    end:    Alignment.bottomCenter,
                  ),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 10),
              const Text(
                'Évolution du score',
                style: TextStyle(
                  fontSize:   15,
                  fontWeight: FontWeight.w700,
                  color:      Color(0xFFE2E8F0),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Padding(
            padding: EdgeInsets.only(left: 13),
            child:   Text(
              '7 derniers calculs horodatés',
              style: TextStyle(
                fontSize: 11,
                color:    Color(0xFF475569),
              ),
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 200,
            child:  LineChart(_buildChart(c)),
          ),
        ],
      ),
    );
  }

  LineChartData _buildChart(ConducteurProvider c) {
    final spots = c.historiqueScore.reversed.toList()
        .asMap()
        .entries
        .map((e) => FlSpot(
              e.key.toDouble(),
              e.value.scoreValeur * 100,
            ))
        .toList();

    return LineChartData(
      gridData: FlGridData(
        show:             true,
        drawVerticalLine: false,
        getDrawingHorizontalLine: (_) => FlLine(
          color:       Colors.white.withOpacity(0.04),
          strokeWidth: 1,
        ),
      ),
      titlesData: FlTitlesData(
        leftTitles: AxisTitles(
          sideTitles: SideTitles(
            showTitles:   true,
            reservedSize: 40,
            getTitlesWidget: (v, _) => Text(
              '${v.toInt()}%',
              style: const TextStyle(
                fontSize: 10,
                color:    Color(0xFF475569),
              ),
            ),
          ),
        ),
        bottomTitles: AxisTitles(
            sideTitles: SideTitles(showTitles: false)),
        rightTitles: AxisTitles(
            sideTitles: SideTitles(showTitles: false)),
        topTitles: AxisTitles(
            sideTitles: SideTitles(showTitles: false)),
      ),
      borderData: FlBorderData(show: false),
      minY: 0, maxY: 100,
      lineBarsData: [
        LineChartBarData(
          spots:    spots,
          isCurved: true,
          curveSmoothness: 0.35,
          gradient: const LinearGradient(
            colors: [Color(0xFFA855F7), Color(0xFF3B82F6)],
          ),
          barWidth: 3,
          belowBarData: BarAreaData(
            show: true,
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end:   Alignment.bottomCenter,
              colors: [
                AppTheme.purple.withOpacity(0.2),
                AppTheme.purple.withOpacity(0.0),
              ],
            ),
          ),
          dotData: FlDotData(
            show: true,
            getDotPainter: (spot, _, __, ___) {
              final c = spot.y < 25
                  ? const Color(0xFF10B981)
                  : spot.y < 50
                      ? const Color(0xFFEAB308)
                      : spot.y < 75
                          ? const Color(0xFFF97316)
                          : const Color(0xFFEF4444);
              return FlDotCirclePainter(
                radius:      5,
                color:       c,
                strokeColor: const Color(0xFF0D0D1A),
                strokeWidth: 2,
              );
            },
          ),
        ),
      ],
    );
  }
}

// ── Barre de détail animée ────────────────────────────────
class _DetailItem {
  final String label;
  final int    val;
  final int    max;
  final Color  color;
  const _DetailItem(this.label, this.val, this.max, this.color);
}

class _DetailBar extends StatefulWidget {
  final _DetailItem item;
  final int         animIndex;
  const _DetailBar({required this.item, required this.animIndex});

  @override
  State<_DetailBar> createState() => _DetailBarState();
}

class _DetailBarState extends State<_DetailBar>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _bar;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync:    this,
      duration: const Duration(milliseconds: 900),
    );
    _bar = Tween<double>(
      begin: 0,
      end:   (widget.item.val / widget.item.max).clamp(0, 1),
    ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));

    Future.delayed(
      Duration(milliseconds: 200 + widget.animIndex * 80),
      () { if (mounted) _ctrl.forward(); },
    );
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child:   AnimatedBuilder(
        animation: _bar,
        builder: (_, __) => Column(
          children: [
            Row(
              children: [
                // Indicateur couleur
                Container(
                  width: 8, height: 8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: widget.item.color,
                    boxShadow: [
                      BoxShadow(
                        color:      widget.item.color.withOpacity(0.5),
                        blurRadius: 6,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  widget.item.label,
                  style: const TextStyle(
                    fontSize:   13,
                    color:      Color(0xFF94A3B8),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Spacer(),
                Text(
                  '${widget.item.val}',
                  style: TextStyle(
                    fontSize:   13,
                    fontWeight: FontWeight.w800,
                    color:      widget.item.color,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Barre
            Stack(
              children: [
                Container(
                  height: 7,
                  decoration: BoxDecoration(
                    color:        Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                FractionallySizedBox(
                  widthFactor: _bar.value,
                  child: Container(
                    height: 7,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          widget.item.color.withOpacity(0.7),
                          widget.item.color,
                        ],
                      ),
                      borderRadius: BorderRadius.circular(4),
                      boxShadow: [
                        BoxShadow(
                          color:      widget.item.color.withOpacity(0.4),
                          blurRadius: 6,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Stat Box ──────────────────────────────────────────────
class _StatBox extends StatefulWidget {
  final String val;
  final String label;
  final String sub;
  final Color  color;
  const _StatBox({
    required this.val,
    required this.label,
    required this.sub,
    required this.color,
  });

  @override
  State<_StatBox> createState() => _StatBoxState();
}

class _StatBoxState extends State<_StatBox>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _fade;
  late final Animation<double>   _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync:    this,
      duration: const Duration(milliseconds: 600),
    );
    _fade  = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _scale = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOutBack));
    _ctrl.forward();
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fade,
      child:   ScaleTransition(
        scale: _scale,
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                widget.color.withOpacity(0.1),
                widget.color.withOpacity(0.04),
              ],
              begin: Alignment.topLeft,
              end:   Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            border:       Border.all(
              color: widget.color.withOpacity(0.25)),
            boxShadow: [
              BoxShadow(
                color:      widget.color.withOpacity(0.08),
                blurRadius: 16,
                offset:     const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              Text(
                widget.val,
                style: TextStyle(
                  fontSize:   36,
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
              const SizedBox(height: 4),
              Text(widget.label, style: const TextStyle(
                fontSize:   12,
                fontWeight: FontWeight.w600,
                color:      Color(0xFFCBD5E1),
              )),
              Text(widget.sub, style: const TextStyle(
                fontSize: 10,
                color:    Color(0xFF475569),
              )),
            ],
          ),
        ),
      ),
    );
  }
}