import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/conducteur_provider.dart';
import '../widgets/event_card_widget.dart';

class HistoriqueScreen extends StatefulWidget {
  const HistoriqueScreen({super.key});

  @override
  State<HistoriqueScreen> createState() => _HistoriqueScreenState();
}

class _HistoriqueScreenState extends State<HistoriqueScreen>
    with SingleTickerProviderStateMixin {
  String _cat = 'TOUS';
  String _sev = 'TOUS';

  late final AnimationController _filterCtrl;
  late final Animation<double>   _filterFade;

  static const _cats = ['TOUS', 'DMS', 'ADAS'];
  static const _sevs = [
    'TOUS', 'CRITIQUE', 'ELEVE', 'MODERE', 'FAIBLE'];

  @override
  void initState() {
    super.initState();
    _filterCtrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 500));
    _filterFade = CurvedAnimation(
      parent: _filterCtrl, curve: Curves.easeOut);
    _filterCtrl.forward();
  }

  @override
  void dispose() { _filterCtrl.dispose(); super.dispose(); }

  Color _catColor(String cat) => switch (cat) {
    'ADAS' => AppTheme.purple,
    'DMS'  => AppTheme.cyan,
    _      => const Color(0xFF64748B),
  };

  Color _sevColor(String sev) => switch (sev) {
    'CRITIQUE' => const Color(0xFFEF4444),
    'ELEVE'    => const Color(0xFFF97316),
    'MODERE'   => const Color(0xFFEAB308),
    'FAIBLE'   => const Color(0xFF10B981),
    _          => const Color(0xFF64748B),
  };

  @override
  Widget build(BuildContext context) {
    final c    = context.watch<ConducteurProvider>();
    final auth = context.watch<AuthProvider>();

    final filtered = c.evenements.where((e) {
      final okC = _cat == 'TOUS' || e.categorie == _cat;
      final okS = _sev == 'TOUS' || e.severite  == _sev;
      return okC && okS;
    }).toList();

    return Column(
      children: [
        // ── Filtres ──────────────────────────────────────
        FadeTransition(
          opacity: _filterFade,
          child:   _buildFilters(),
        ),

        // ── Compteur résultats ───────────────────────────
        Container(
          width:   double.infinity,
          padding: const EdgeInsets.symmetric(
              horizontal: 16, vertical: 8),
          color:   const Color(0xFF0A0A15),
          child:   Row(
            children: [
              Text(
                '${filtered.length} événement${filtered.length > 1 ? 's' : ''}',
                style: const TextStyle(
                  fontSize:   12,
                  color:      Color(0xFF475569),
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Spacer(),
              if (_cat != 'TOUS' || _sev != 'TOUS')
                GestureDetector(
                  onTap: () {
                    HapticFeedback.selectionClick();
                    setState(() { _cat = 'TOUS'; _sev = 'TOUS'; });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color:        AppTheme.blue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(999),
                      border:       Border.all(
                        color: AppTheme.blue.withOpacity(0.25)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.clear_rounded,
                            size: 11, color: AppTheme.blue),
                        const SizedBox(width: 4),
                        Text(
                          'Réinitialiser',
                          style: TextStyle(
                            fontSize:   10,
                            color:      AppTheme.blue,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),

        // ── Liste ────────────────────────────────────────
        Expanded(
          child: RefreshIndicator(
            color:           AppTheme.blue,
            backgroundColor: const Color(0xFF12121F),
            onRefresh: () => c.refresh(auth.user!.id),
            child: filtered.isEmpty
                ? _buildEmpty()
                : ListView.builder(
                    padding:   const EdgeInsets.all(14),
                    itemCount: filtered.length,
                    itemBuilder: (_, i) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child:   EventCardWidget(
                        evenement: filtered[i],
                        animIndex: i,
                      ),
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildFilters() {
    return Container(
      color: const Color(0xFF0D0D1A),
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Catégorie
          _FilterRow(
            label:    'Catégorie',
            options:  _cats,
            selected: _cat,
            colorOf:  _catColor,
            onSelect: (v) {
              HapticFeedback.selectionClick();
              setState(() => _cat = v);
            },
          ),
          const SizedBox(height: 10),
          // Sévérité
          _FilterRow(
            label:    'Sévérité',
            options:  _sevs,
            selected: _sev,
            colorOf:  _sevColor,
            onSelect: (v) {
              HapticFeedback.selectionClick();
              setState(() => _sev = v);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    return ListView(
      children: [
        const SizedBox(height: 80),
        Center(
          child: TweenAnimationBuilder<double>(
            tween:    Tween(begin: 0.0, end: 1.0),
            duration: const Duration(milliseconds: 600),
            curve:    Curves.easeOutBack,
            builder: (_, v, child) =>
                Transform.scale(scale: v, child: child),
            child: Column(
              children: [
                Container(
                  width: 72, height: 72,
                  decoration: BoxDecoration(
                    color:        AppTheme.green.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(22),
                    border:       Border.all(
                      color: AppTheme.green.withOpacity(0.18)),
                  ),
                  child: Icon(
                    Icons.search_off_rounded,
                    size:  34,
                    color: AppTheme.green.withOpacity(0.7),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Aucun résultat',
                  style: TextStyle(
                    fontSize:   16,
                    fontWeight: FontWeight.w700,
                    color:      Color(0xFF475569),
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Aucun événement ne correspond\naux filtres sélectionnés',
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
        ),
      ],
    );
  }
}

// ── Ligne de filtres ──────────────────────────────────────
class _FilterRow extends StatelessWidget {
  final String         label;
  final List<String>   options;
  final String         selected;
  final Color Function(String) colorOf;
  final void Function(String)  onSelect;

  const _FilterRow({
    required this.label,
    required this.options,
    required this.selected,
    required this.colorOf,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize:   11,
            color:      Color(0xFF475569),
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: options.map((opt) {
                final active = selected == opt;
                final color  = colorOf(opt);
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child:   GestureDetector(
                    onTap: () => onSelect(opt),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 220),
                      curve:    Curves.easeOutCubic,
                      padding:  const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: active
                            ? color.withOpacity(0.15)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(999),
                        border:       Border.all(
                          color: active
                              ? color.withOpacity(0.45)
                              : Colors.white.withOpacity(0.08),
                          width: active ? 1.5 : 1,
                        ),
                        boxShadow: active
                            ? [
                                BoxShadow(
                                  color:      color.withOpacity(0.2),
                                  blurRadius: 10,
                                ),
                              ]
                            : [],
                      ),
                      child: Text(
                        opt,
                        style: TextStyle(
                          fontSize:      11.5,
                          fontWeight:    active
                              ? FontWeight.w700
                              : FontWeight.w500,
                          color:         active ? color
                              : const Color(0xFF64748B),
                          letterSpacing: 0.3,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }
}