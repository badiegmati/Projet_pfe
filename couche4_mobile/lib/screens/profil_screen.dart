import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/conducteur_provider.dart';
import '../services/api_service.dart';

class ProfilScreen extends StatefulWidget {
  const ProfilScreen({super.key});

  @override
  State<ProfilScreen> createState() => _ProfilScreenState();
}

class _ProfilScreenState extends State<ProfilScreen>
    with SingleTickerProviderStateMixin {
  final _emailCtrl = TextEditingController();
  final _telCtrl   = TextEditingController();
  final _mdpCtrl   = TextEditingController();
  final _confCtrl  = TextEditingController();
  bool _saving  = false;
  bool _showMdp = false;
  String? _success;
  String? _erreur;

  late final AnimationController _entryCtrl;
  late final Animation<double>   _entryFade;
  late final Animation<Offset>   _entrySlide;

  @override
  void initState() {
    super.initState();
    _entryCtrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 700));
    _entryFade  = CurvedAnimation(parent: _entryCtrl, curve: Curves.easeOut);
    _entrySlide = Tween<Offset>(
      begin: const Offset(0, 0.06), end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _entryCtrl, curve: Curves.easeOutCubic));
    _entryCtrl.forward();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final p = context.read<ConducteurProvider>().profil;
      _emailCtrl.text = p?['email'] ?? '';
      _telCtrl.text   = p?['telephone'] ?? '';
    });
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _telCtrl.dispose();
    _mdpCtrl.dispose();
    _confCtrl.dispose();
    _entryCtrl.dispose();
    super.dispose();
  }

  Future<void> _sauvegarder() async {
    setState(() { _erreur = null; _success = null; });

    if (_mdpCtrl.text.isNotEmpty && _mdpCtrl.text != _confCtrl.text) {
      setState(() => _erreur = 'Les mots de passe ne correspondent pas');
      HapticFeedback.heavyImpact();
      return;
    }
    if (_mdpCtrl.text.isNotEmpty && _mdpCtrl.text.length < 8) {
      setState(() => _erreur = 'Mot de passe trop court (min 8 caractères)');
      HapticFeedback.heavyImpact();
      return;
    }

    setState(() => _saving = true);
    HapticFeedback.mediumImpact();

    try {
      final auth = context.read<AuthProvider>();
      final data = <String, dynamic>{};
      if (_emailCtrl.text.isNotEmpty) data['email']     = _emailCtrl.text;
      if (_telCtrl.text.isNotEmpty)   data['telephone'] = _telCtrl.text;
      if (_mdpCtrl.text.isNotEmpty)   data['motDePasse']= _mdpCtrl.text;

      await ApiService.modifierProfil(auth.user!.id, data);

      HapticFeedback.lightImpact();
      setState(() {
        _success = 'Profil mis à jour avec succès';
        _mdpCtrl.clear();
        _confCtrl.clear();
      });

      await context.read<ConducteurProvider>().refresh(auth.user!.id);

      Future.delayed(const Duration(seconds: 4), () {
        if (mounted) setState(() => _success = null);
      });
    } catch (e) {
      setState(() => _erreur = e.toString().replaceAll('Exception: ', ''));
      HapticFeedback.heavyImpact();
    } finally {
      setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c    = context.watch<ConducteurProvider>();
    final auth = context.watch<AuthProvider>();
    final p    = c.profil;
    final isWide = MediaQuery.of(context).size.width > 600;

    return Scaffold(
      backgroundColor: const Color(0xFF0D0D1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D1A),
        elevation:       0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_rounded,
            color: Color(0xFF64748B),
            size:  20,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: ShaderMask(
          shaderCallback: (b) => const LinearGradient(
            colors: [Color(0xFF3B82F6), Color(0xFF06B6D4)],
          ).createShader(b),
          child: const Text(
            'Mon Profil',
            style: TextStyle(
              fontSize:   17,
              fontWeight: FontWeight.w800,
              color:      Colors.white,
            ),
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            height: 1,
            color:  Colors.white.withOpacity(0.07),
          ),
        ),
      ),
      body: FadeTransition(
        opacity: _entryFade,
        child: SlideTransition(
          position: _entrySlide,
          child:    ListView(
            padding: EdgeInsets.symmetric(
              horizontal: isWide ? 48 : 16,
              vertical:   20,
            ),
            children: [
              // ── Avatar hero ─────────────────────────────
              _buildAvatarCard(p, auth),

              const SizedBox(height: 16),

              // ── Champs immuables ─────────────────────────
              _ProSection(
                title:    '🔒 Informations immuables',
                subtitle: 'Gérées par votre gestionnaire de flotte',
                accentColor: const Color(0xFF334155),
                child: Column(
                  children: [
                    _LockedField(label: 'Identifiant',      val: p?['id']),
                    _LockedField(label: 'Nom',              val: p?['nom']),
                    _LockedField(label: 'Prénom',           val: p?['prenom']),
                    _LockedField(label: 'Véhicule assigné', val: p?['nomVehicule']),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // ── Champs modifiables ───────────────────────
              _ProSection(
                title:       'Informations modifiables',
                subtitle:    'Vous pouvez modifier ces champs librement',
                accentColor: AppTheme.blue,
                child: Column(
                  children: [
                    _EditField(
                      controller: _emailCtrl,
                      label:      'Email',
                      hint:       'exemple@email.com',
                      icon:       Icons.email_outlined,
                      iconColor:  AppTheme.cyan,
                      keyboard:   TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 12),
                    _EditField(
                      controller: _telCtrl,
                      label:      'Téléphone',
                      hint:       '+216 XX XXX XXX',
                      icon:       Icons.phone_outlined,
                      iconColor:  AppTheme.green,
                      keyboard:   TextInputType.phone,
                    ),
                    const SizedBox(height: 20),
                    Divider(color: Colors.white.withOpacity(0.06)),
                    const SizedBox(height: 14),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Changer le mot de passe',
                        style: TextStyle(
                          fontSize:   13,
                          fontWeight: FontWeight.w600,
                          color:      AppTheme.textMuted,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    _EditField(
                      controller: _mdpCtrl,
                      label:      'Nouveau mot de passe',
                      hint:       'Min. 8 caractères',
                      icon:       Icons.lock_rounded,
                      iconColor:  AppTheme.textMuted,
                      obscure:    !_showMdp,
                      suffix: IconButton(
                        icon: Icon(
                          _showMdp
                              ? Icons.visibility_off_rounded
                              : Icons.visibility_rounded,
                          color: AppTheme.textMuted,
                          size: 20,
                        ),
                        onPressed: () =>
                            setState(() => _showMdp = !_showMdp),
                      ),
                    ),
                    const SizedBox(height: 12),
                    _EditField(
                      controller: _confCtrl,
                      label:      'Confirmer le mot de passe',
                      hint:       'Répéter',
                      icon:       Icons.lock_rounded,
                      iconColor:  AppTheme.textMuted,
                      obscure:    !_showMdp,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // ── Messages feedback ────────────────────────
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _erreur != null
                    ? _FeedbackBanner(
                        key:     const ValueKey('err'),
                        message: _erreur!,
                        isError: true,
                      )
                    : _success != null
                        ? _FeedbackBanner(
                            key:     const ValueKey('ok'),
                            message: _success!,
                            isError: false,
                          )
                        : const SizedBox.shrink(),
              ),

              if (_erreur != null || _success != null)
                const SizedBox(height: 12),

              // ── Bouton ───────────────────────────────────
              _SaveButton(saving: _saving, onTap: _sauvegarder),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatarCard(Map<String, dynamic>? p, AuthProvider auth) {
    final initials =
        '${p?['prenom']?[0] ?? ''}${p?['nom']?[0] ?? ''}'.toUpperCase();
    final color = AppTheme.getNiveauColor(
        context.watch<ConducteurProvider>().niveauRisque);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF12121F), Color(0xFF0E0E1B)],
          begin:  Alignment.topLeft,
          end:    Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border:       Border.all(
          color: Colors.white.withOpacity(0.08)),
        boxShadow: [
          BoxShadow(
            color:      Colors.black.withOpacity(0.4),
            blurRadius: 24,
            offset:     const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          // Avatar
          TweenAnimationBuilder<double>(
            tween:    Tween(begin: 0.0, end: 1.0),
            duration: const Duration(milliseconds: 800),
            curve:    Curves.elasticOut,
            builder:  (_, v, child) =>
                Transform.scale(scale: v, child: child),
            child: Container(
              width: 80, height: 80,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF3B82F6), Color(0xFF06B6D4)],
                  begin:  Alignment.topLeft,
                  end:    Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color:      AppTheme.blue.withOpacity(0.5),
                    blurRadius: 28,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  initials,
                  style: const TextStyle(
                    fontSize:   28,
                    fontWeight: FontWeight.w900,
                    color:      Colors.white,
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(height: 16),

          Text(
            '${p?['prenom'] ?? ''} ${p?['nom'] ?? ''}',
            style: const TextStyle(
              fontSize:   20,
              fontWeight: FontWeight.w800,
              color:      Color(0xFFE2E8F0),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            auth.user?.id ?? '',
            style: const TextStyle(
              fontSize: 13,
              color:    Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 12),

          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Badge rôle
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 5),
                decoration: BoxDecoration(
                  color:        AppTheme.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(999),
                  border:       Border.all(
                    color: AppTheme.blue.withOpacity(0.3)),
                ),
                child: Text(
                  'CONDUCTEUR',
                  style: TextStyle(
                    fontSize:      11,
                    fontWeight:    FontWeight.w800,
                    color:         AppTheme.blue,
                    letterSpacing: 1.0,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Badge niveau risque
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 5),
                decoration: BoxDecoration(
                  color:        color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(999),
                  border:       Border.all(
                    color: color.withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6, height: 6,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: color,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      context.watch<ConducteurProvider>().niveauRisque,
                      style: TextStyle(
                        fontSize:      11,
                        fontWeight:    FontWeight.w700,
                        color:         color,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Section container ─────────────────────────────────────
class _ProSection extends StatelessWidget {
  final String  title;
  final String  subtitle;
  final Color   accentColor;
  final Widget  child;

  const _ProSection({
    required this.title,
    required this.subtitle,
    required this.accentColor,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color:        const Color(0xFF12121F),
        borderRadius: BorderRadius.circular(20),
        border:       Border.all(
          color: Colors.white.withOpacity(0.07)),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Column(
          children: [
            // Barre dégradée
            Container(
              height: 3,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    accentColor,
                    accentColor.withOpacity(0.0),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(18),
              child:   Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(
                    fontSize:   14,
                    fontWeight: FontWeight.w700,
                    color:      Color(0xFFCBD5E1),
                  )),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(
                    fontSize: 11,
                    color:    Color(0xFF475569),
                  )),
                  const SizedBox(height: 18),
                  child,
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Champ verrouillé ──────────────────────────────────────
class _LockedField extends StatelessWidget {
  final String  label;
  final dynamic val;
  const _LockedField({required this.label, this.val});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.lock_rounded,
                  size: 11, color: Color(0xFF334155)),
              const SizedBox(width: 5),
              Text(label, style: const TextStyle(
                fontSize:   11,
                color:      Color(0xFF475569),
                fontWeight: FontWeight.w500,
              )),
            ],
          ),
          const SizedBox(height: 5),
          Container(
            width:   double.infinity,
            padding: const EdgeInsets.symmetric(
                horizontal: 14, vertical: 13),
            decoration: BoxDecoration(
              color:        Colors.white.withOpacity(0.02),
              borderRadius: BorderRadius.circular(12),
              border:       Border.all(
                color: Colors.white.withOpacity(0.04)),
            ),
            child: Text(
              val?.toString() ?? '—',
              style: const TextStyle(
                fontSize:   14,
                color:      Color(0xFF64748B),
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Champ éditable ────────────────────────────────────────
class _EditField extends StatefulWidget {
  final TextEditingController controller;
  final String    label;
  final String    hint;
  final IconData  icon;
  final Color     iconColor;
  final bool      obscure;
  final Widget?   suffix;
  final TextInputType keyboard;

  const _EditField({
    required this.controller,
    required this.label,
    required this.hint,
    required this.icon,
    required this.iconColor,
    this.obscure  = false,
    this.suffix,
    this.keyboard = TextInputType.text,
  });

  @override
  State<_EditField> createState() => _EditFieldState();
}

class _EditFieldState extends State<_EditField> {
  bool _focused = false;

  @override
  Widget build(BuildContext context) {
    return Focus(
      onFocusChange: (f) => setState(() => _focused = f),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          boxShadow: _focused
              ? [
                  BoxShadow(
                    color:      widget.iconColor.withOpacity(0.15),
                    blurRadius: 14,
                  ),
                ]
              : [],
        ),
        child: TextField(
          controller:   widget.controller,
          obscureText:  widget.obscure,
          keyboardType: widget.keyboard,
          style: const TextStyle(
            color:      Color(0xFFE2E8F0),
            fontSize:   14,
            fontWeight: FontWeight.w500,
          ),
          decoration: InputDecoration(
            labelText:  widget.label,
            hintText:   widget.hint,
            prefixIcon: Icon(widget.icon,
                size: 20,
                color: _focused
                    ? widget.iconColor
                    : AppTheme.textMuted),
            suffixIcon: widget.suffix,
            filled:     true,
            fillColor:  _focused
                ? const Color(0xFF1A1A2E)
                : const Color(0xFF14141F),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(
                color: Colors.white.withOpacity(0.08)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(
                color: widget.iconColor.withOpacity(0.5),
                width: 1.5,
              ),
            ),
            labelStyle: TextStyle(
              color: _focused ? widget.iconColor : AppTheme.textMuted,
              fontWeight: FontWeight.w500,
            ),
            hintStyle: TextStyle(
              color: AppTheme.textMuted.withOpacity(0.4)),
          ),
        ),
      ),
    );
  }
}

// ── Bannière feedback ─────────────────────────────────────
class _FeedbackBanner extends StatelessWidget {
  final String message;
  final bool   isError;
  const _FeedbackBanner({
    super.key,
    required this.message,
    required this.isError,
  });

  @override
  Widget build(BuildContext context) {
    final color = isError
        ? const Color(0xFFEF4444)
        : const Color(0xFF10B981);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color:        color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
        border:       Border.all(color: color.withOpacity(0.25)),
      ),
      child: Row(
        children: [
          Icon(
            isError
                ? Icons.error_outline_rounded
                : Icons.check_circle_outline_rounded,
            size:  18,
            color: color,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                fontSize:   13,
                color:      color.withOpacity(0.9),
                fontWeight: FontWeight.w500,
                height:     1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Bouton sauvegarder ────────────────────────────────────
class _SaveButton extends StatefulWidget {
  final bool         saving;
  final VoidCallback onTap;
  const _SaveButton({required this.saving, required this.onTap});

  @override
  State<_SaveButton> createState() => _SaveButtonState();
}

class _SaveButtonState extends State<_SaveButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 150));
    _scale = Tween<double>(begin: 1.0, end: 0.96)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: widget.saving
          ? null : (_) => _ctrl.forward(),
      onTapUp: widget.saving
          ? null : (_) {
              _ctrl.reverse();
              widget.onTap();
            },
      onTapCancel: () => _ctrl.reverse(),
      child: ScaleTransition(
        scale: _scale,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          height: 56,
          decoration: BoxDecoration(
            gradient: widget.saving
                ? null
                : const LinearGradient(
                    colors: [Color(0xFF3B82F6), Color(0xFF06B6D4)],
                    begin:  Alignment.centerLeft,
                    end:    Alignment.centerRight,
                  ),
            color: widget.saving
                ? const Color(0xFF1A1A2E) : null,
            borderRadius: BorderRadius.circular(16),
            boxShadow: widget.saving
                ? []
                : [
                    BoxShadow(
                      color:      AppTheme.blue.withOpacity(0.4),
                      blurRadius: 20,
                      offset:     const Offset(0, 6),
                    ),
                  ],
          ),
          child: Center(
            child: widget.saving
                ? const SizedBox(
                    width: 22, height: 22,
                    child: CircularProgressIndicator(
                      color: Colors.white, strokeWidth: 2.5),
                  )
                : const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.save_rounded,
                          size: 18, color: Colors.white),
                      SizedBox(width: 8),
                      Text(
                        'Sauvegarder les modifications',
                        style: TextStyle(
                          fontSize:   15,
                          fontWeight: FontWeight.w700,
                          color:      Colors.white,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}