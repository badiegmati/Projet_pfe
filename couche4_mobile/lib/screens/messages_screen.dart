import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'dart:async';
import '../config/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/conducteur_provider.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen>
    with TickerProviderStateMixin {
  final _ctrl   = TextEditingController();
  final _scroll = ScrollController();
  bool  _sending  = false;
  Timer? _timer;
  String? _gestionnaireId;

  late final AnimationController _headerCtrl;
  late final Animation<double>   _headerFade;

  @override
  void initState() {
    super.initState();
    _headerCtrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 600));
    _headerFade = CurvedAnimation(
      parent: _headerCtrl, curve: Curves.easeOut);
    _headerCtrl.forward();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final c = context.read<ConducteurProvider>();
      _gestionnaireId = c.profil?['creeParGestionnaire']
                     ?? c.profil?['gestionnaireId'];
      if (_gestionnaireId != null) {
        _charger();
        _timer = Timer.periodic(
          const Duration(seconds: 15), (_) => _charger());
      }
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _scroll.dispose();
    _timer?.cancel();
    _headerCtrl.dispose();
    super.dispose();
  }

  void _charger() {
    final auth = context.read<AuthProvider>();
    final c    = context.read<ConducteurProvider>();
    if (_gestionnaireId == null) return;
    c.chargerMessages(auth.user!.id, _gestionnaireId!).then((_) {
      Future.delayed(const Duration(milliseconds: 100), () {
        if (_scroll.hasClients) {
          _scroll.animateTo(
            _scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 350),
            curve:    Curves.easeOutCubic,
          );
        }
      });
    });
  }

  Future<void> _envoyer() async {
    if (_ctrl.text.trim().isEmpty || _sending) return;
    HapticFeedback.lightImpact();

    final auth = context.read<AuthProvider>();
    final c    = context.read<ConducteurProvider>();
    if (_gestionnaireId == null) return;

    setState(() => _sending = true);
    try {
      await c.envoyerMessage(
        auth.user!.id, _gestionnaireId!, _ctrl.text.trim());
      _ctrl.clear();
      _charger();
    } catch (_) {}
    finally {
      setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final c    = context.watch<ConducteurProvider>();

    if (_gestionnaireId == null) {
      return _buildNoGestionnaire();
    }

    return Column(
      children: [
        // ── Header ──────────────────────────────────────
        FadeTransition(
          opacity: _headerFade,
          child:   _buildHeader(),
        ),

        // ── Messages ────────────────────────────────────
        Expanded(
          child: Container(
            color: const Color(0xFF0A0A15),
            child: c.messages.isEmpty
                ? _buildEmptyMessages()
                : ListView.builder(
                    controller: _scroll,
                    padding:    const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    itemCount:  c.messages.length,
                    itemBuilder: (_, i) {
                      final msg    = c.messages[i];
                      final isMine = msg.expediteurId == auth.user!.id;
                      // Grouper : n'affiche la date que si différente
                      final showDate = i == 0 ||
                          !_sameDay(c.messages[i - 1].dateEnvoi,
                              msg.dateEnvoi);
                      return Column(
                        children: [
                          if (showDate)
                            _DateSeparator(date: msg.dateEnvoi),
                          _MessageBubble(
                            content:   msg.contenu,
                            isMine:    isMine,
                            time:      msg.dateEnvoi,
                            animIndex: i,
                          ),
                        ],
                      );
                    },
                  ),
          ),
        ),

        // ── Saisie ──────────────────────────────────────
        _buildInputBar(),
      ],
    );
  }

  bool _sameDay(DateTime a, DateTime b) =>
      a.day == b.day && a.month == b.month && a.year == b.year;

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF0D0D1A),
        border: Border(
          bottom: BorderSide(color: Colors.white.withOpacity(0.07)),
        ),
        boxShadow: [
          BoxShadow(
            color:      Colors.black.withOpacity(0.3),
            blurRadius: 16,
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppTheme.green.withOpacity(0.3),
                  AppTheme.cyan.withOpacity(0.2),
                ],
              ),
              borderRadius: BorderRadius.circular(12),
              border:       Border.all(
                color: AppTheme.green.withOpacity(0.3)),
            ),
            child: Icon(Icons.support_agent_rounded,
                size: 20, color: AppTheme.green),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Mon Gestionnaire',
                  style: TextStyle(
                    fontSize:   14,
                    fontWeight: FontWeight.w700,
                    color:      Color(0xFFE2E8F0),
                  ),
                ),
                Row(
                  children: [
                    Container(
                      width: 6, height: 6,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.green,
                        boxShadow: [
                          BoxShadow(
                            color:      AppTheme.green.withOpacity(0.6),
                            blurRadius: 6,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 5),
                    const Text(
                      'Conversation bidirectionnelle',
                      style: TextStyle(
                        fontSize: 11,
                        color:    Color(0xFF475569),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputBar() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0D0D1A),
        border: Border(
          top: BorderSide(color: Colors.white.withOpacity(0.07)),
        ),
        boxShadow: [
          BoxShadow(
            color:      Colors.black.withOpacity(0.4),
            blurRadius: 20,
            offset:     const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(
              horizontal: 12, vertical: 10),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // Champ texte
              Expanded(
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  decoration: BoxDecoration(
                    color:        const Color(0xFF14141F),
                    borderRadius: BorderRadius.circular(20),
                    border:       Border.all(
                      color: _ctrl.text.isNotEmpty
                          ? AppTheme.blue.withOpacity(0.4)
                          : Colors.white.withOpacity(0.08),
                    ),
                  ),
                  child: TextField(
                    controller:  _ctrl,
                    maxLines:    4,
                    minLines:    1,
                    style: const TextStyle(
                      color:    Color(0xFFE2E8F0),
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      hintText:  'Votre message…',
                      hintStyle: const TextStyle(
                        color:   Color(0xFF334155),
                        fontSize: 14,
                      ),
                      border:         InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
              ),

              const SizedBox(width: 8),

              // Bouton envoi
              _SendButton(
                enabled:  _ctrl.text.trim().isNotEmpty && !_sending,
                sending:  _sending,
                onTap:    _envoyer,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNoGestionnaire() {
    return Center(
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
            child: const Icon(Icons.message_outlined,
                size: 36, color: Color(0xFF334155)),
          ),
          const SizedBox(height: 16),
          const Text(
            'Aucun gestionnaire assigné',
            style: TextStyle(
              fontSize:   15,
              fontWeight: FontWeight.w600,
              color:      Color(0xFF475569),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyMessages() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.chat_bubble_outline_rounded,
              size: 48, color: AppTheme.textMuted.withOpacity(0.3)),
          const SizedBox(height: 12),
          const Text(
            'Démarrez la conversation',
            style: TextStyle(
              fontSize:   14,
              color:      Color(0xFF334155),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Bulle de message ─────────────────────────────────────
class _MessageBubble extends StatefulWidget {
  final String   content;
  final bool     isMine;
  final DateTime time;
  final int      animIndex;

  const _MessageBubble({
    required this.content,
    required this.isMine,
    required this.time,
    required this.animIndex,
  });

  @override
  State<_MessageBubble> createState() => _MessageBubbleState();
}

class _MessageBubbleState extends State<_MessageBubble>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _fadeAnim;
  late final Animation<Offset>   _slideAnim;
  late final Animation<double>   _scaleAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync:    this,
      duration: const Duration(milliseconds: 400),
    );
    _fadeAnim  = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: Offset(widget.isMine ? 0.1 : -0.1, 0),
      end:   Offset.zero,
    ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));
    _scaleAnim = Tween<double>(begin: 0.9, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOutBack));

    Future.delayed(
      Duration(milliseconds: math_min(widget.animIndex * 40, 400)),
      () { if (mounted) _ctrl.forward(); },
    );
  }

  int math_min(int a, int b) => a < b ? a : b;

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final maxW = MediaQuery.of(context).size.width * 0.75;

    return FadeTransition(
      opacity:  _fadeAnim,
      child:    SlideTransition(
        position: _slideAnim,
        child:    ScaleTransition(
          scale:  _scaleAnim,
          child:  Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child:   Row(
              mainAxisAlignment: widget.isMine
                  ? MainAxisAlignment.end
                  : MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // Avatar autre
                if (!widget.isMine)
                  Container(
                    width: 28, height: 28,
                    margin: const EdgeInsets.only(right: 8, bottom: 2),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppTheme.green, AppTheme.cyan],
                      ),
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: const Icon(Icons.person_rounded,
                        size: 14, color: Colors.white),
                  ),

                // Bulle
                ConstrainedBox(
                  constraints: BoxConstraints(maxWidth: maxW),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      gradient: widget.isMine
                          ? const LinearGradient(
                              colors: [
                                Color(0xFF3B82F6),
                                Color(0xFF2563EB),
                              ],
                              begin: Alignment.topLeft,
                              end:   Alignment.bottomRight,
                            )
                          : null,
                      color: widget.isMine
                          ? null
                          : const Color(0xFF1A1A2E),
                      borderRadius: BorderRadius.only(
                        topLeft:     const Radius.circular(18),
                        topRight:    const Radius.circular(18),
                        bottomLeft:  Radius.circular(
                            widget.isMine ? 18 : 4),
                        bottomRight: Radius.circular(
                            widget.isMine ? 4 : 18),
                      ),
                      border: widget.isMine
                          ? null
                          : Border.all(
                              color: Colors.white.withOpacity(0.08)),
                      boxShadow: [
                        BoxShadow(
                          color: widget.isMine
                              ? AppTheme.blue.withOpacity(0.3)
                              : Colors.black.withOpacity(0.2),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          widget.content,
                          style: TextStyle(
                            fontSize: 14,
                            color:    widget.isMine
                                ? Colors.white
                                : const Color(0xFFCBD5E1),
                            height:   1.45,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              _fmt(widget.time),
                              style: TextStyle(
                                fontSize: 10,
                                color:    widget.isMine
                                    ? Colors.white.withOpacity(0.5)
                                    : const Color(0xFF475569),
                              ),
                            ),
                            if (widget.isMine) ...[
                              const SizedBox(width: 4),
                              Icon(Icons.done_all_rounded,
                                  size:  12,
                                  color: Colors.white.withOpacity(0.5)),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _fmt(DateTime dt) =>
      '${dt.hour.toString().padLeft(2, '0')}:'
      '${dt.minute.toString().padLeft(2, '0')}';
}

// ── Séparateur de date ────────────────────────────────────
class _DateSeparator extends StatelessWidget {
  final DateTime date;
  const _DateSeparator({required this.date});

  @override
  Widget build(BuildContext context) {
    final now   = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final d     = DateTime(date.year, date.month, date.day);
    final label = d == today
        ? "Aujourd'hui"
        : d == today.subtract(const Duration(days: 1))
            ? 'Hier'
            : '${date.day.toString().padLeft(2, '0')}/'
              '${date.month.toString().padLeft(2, '0')}/'
              '${date.year}';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child:   Row(
        children: [
          Expanded(
            child: Container(
              height: 1,
              color: Colors.white.withOpacity(0.06),
            ),
          ),
          const SizedBox(width: 10),
          Container(
            padding: const EdgeInsets.symmetric(
                horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color:        Colors.white.withOpacity(0.04),
              borderRadius: BorderRadius.circular(999),
              border:       Border.all(
                color: Colors.white.withOpacity(0.07)),
            ),
            child: Text(
              label,
              style: const TextStyle(
                fontSize:   11,
                color:      Color(0xFF475569),
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Container(
              height: 1,
              color: Colors.white.withOpacity(0.06),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Bouton envoi animé ────────────────────────────────────
class _SendButton extends StatefulWidget {
  final bool       enabled;
  final bool       sending;
  final VoidCallback onTap;
  const _SendButton({
    required this.enabled,
    required this.sending,
    required this.onTap,
  });

  @override
  State<_SendButton> createState() => _SendButtonState();
}

class _SendButtonState extends State<_SendButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _scaleAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 200));
    _scaleAnim = Tween<double>(begin: 1.0, end: 0.88)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: widget.enabled
          ? (_) => _ctrl.forward() : null,
      onTapUp: widget.enabled
          ? (_) {
              _ctrl.reverse();
              widget.onTap();
            }
          : null,
      onTapCancel: () => _ctrl.reverse(),
      child: ScaleTransition(
        scale: _scaleAnim,
        child: AnimatedContainer(
          duration:     const Duration(milliseconds: 250),
          width:        48, height: 48,
          decoration: BoxDecoration(
            gradient: widget.enabled
                ? const LinearGradient(
                    colors: [Color(0xFF3B82F6), Color(0xFF06B6D4)],
                    begin:  Alignment.topLeft,
                    end:    Alignment.bottomRight,
                  )
                : null,
            color: widget.enabled
                ? null
                : const Color(0xFF1A1A2E),
            borderRadius: BorderRadius.circular(15),
            boxShadow: widget.enabled
                ? [
                    BoxShadow(
                      color:      AppTheme.blue.withOpacity(0.4),
                      blurRadius: 16,
                      offset:     const Offset(0, 4),
                    ),
                  ]
                : [],
          ),
          child: widget.sending
              ? const Center(
                  child: SizedBox(
                    width: 18, height: 18,
                    child: CircularProgressIndicator(
                      color:       Colors.white,
                      strokeWidth: 2,
                    ),
                  ),
                )
              : Icon(
                  Icons.send_rounded,
                  size:  18,
                  color: widget.enabled
                      ? Colors.white
                      : const Color(0xFF334155),
                ),
        ),
      ),
    );
  }
}