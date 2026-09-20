import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'dart:math' as math;
import '../config/app_config.dart';
import '../config/app_theme.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _idCtrl  = TextEditingController();
  final _mdpCtrl = TextEditingController();
  bool _showMdp  = false;

  // Animations
  late final AnimationController _entryCtrl;
  late final AnimationController _bgCtrl;
  late final AnimationController _shakeCtrl;
  late final Animation<double>   _fadeAnim;
  late final Animation<Offset>   _slideAnim;
  late final Animation<double>   _bgRotAnim;
  late final Animation<double>   _shakeAnim;

  @override
  void initState() {
    super.initState();

    _entryCtrl = AnimationController(
      vsync:    this,
      duration: const Duration(milliseconds: 900),
    );
    _bgCtrl = AnimationController(
      vsync:    this,
      duration: const Duration(seconds: 20),
    )..repeat();
    _shakeCtrl = AnimationController(
      vsync:    this,
      duration: const Duration(milliseconds: 500),
    );

    _fadeAnim = CurvedAnimation(
      parent: _entryCtrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.08), end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _entryCtrl, curve: Curves.easeOutCubic));
    _bgRotAnim = Tween<double>(begin: 0, end: 2 * math.pi)
        .animate(_bgCtrl);
    _shakeAnim = Tween<double>(begin: 0, end: 1)
        .animate(_shakeCtrl);

    _entryCtrl.forward();
  }

  @override
  void dispose() {
    _idCtrl.dispose();
    _mdpCtrl.dispose();
    _entryCtrl.dispose();
    _bgCtrl.dispose();
    _shakeCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    HapticFeedback.mediumImpact();

    final auth = context.read<AuthProvider>();
    await auth.login(_idCtrl.text.trim(), _mdpCtrl.text);

    if (!mounted) return;
    if (auth.error != null) {
      _shakeCtrl.forward(from: 0);
      HapticFeedback.heavyImpact();
      _showError(auth.error!);
    }
  }

  void _showError(String msg) {
    String readable = msg;
    if (msg.contains('Timeout') || msg.contains('timeout')) {
      readable = '⏱️ Serveur inaccessible — vérifiez ${AppConfig.baseUrl}';
    } else if (msg.contains('réseau') || msg.contains('Socket')) {
      readable = '🔌 Pas de connexion réseau';
    } else if (msg.contains('SESSION_EXPIRED')) {
      readable = '⚠️ Session expirée — reconnectez-vous';
    }

    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Row(
        children: [
          const Icon(Icons.error_rounded, color: Colors.white, size: 18),
          const SizedBox(width: 10),
          Expanded(child: Text(readable,
              style: const TextStyle(fontSize: 13))),
        ],
      ),
      backgroundColor: const Color(0xFFEF4444),
      behavior:        SnackBarBehavior.floating,
      duration:        const Duration(seconds: 5),
      margin:          const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14)),
    ));
  }

  void _remplir(String id, String mdp) {
    setState(() {
      _idCtrl.text  = id;
      _mdpCtrl.text = mdp;
    });
    HapticFeedback.selectionClick();
  }

  @override
  Widget build(BuildContext context) {
    final auth    = context.watch<AuthProvider>();
    final size    = MediaQuery.of(context).size;
    final isWide  = size.width > 600;

    return Scaffold(
      body: Stack(
        children: [
          // ── Fond animé ─────────────────────────────────
          _AnimatedBackground(rotAnim: _bgRotAnim),

          // ── Contenu ────────────────────────────────────
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(
                  horizontal: isWide ? size.width * 0.25 : 24,
                  vertical:   32,
                ),
                child: FadeTransition(
                  opacity: _fadeAnim,
                  child:   SlideTransition(
                    position: _slideAnim,
                    child:    Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Logo + titre
                        _buildHeader(),
                        const SizedBox(height: 48),

                        // Card formulaire avec shake
                        AnimatedBuilder(
                          animation: _shakeAnim,
                          builder: (_, child) => Transform.translate(
                            offset: Offset(
                              math.sin(_shakeAnim.value * math.pi * 6) * 8
                                  * (1 - _shakeAnim.value),
                              0,
                            ),
                            child: child,
                          ),
                          child: _buildFormCard(auth),
                        ),

                        const SizedBox(height: 20),
                        _buildTestAccounts(),
                        const SizedBox(height: 16),
                        _buildFooter(),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        // Logo animé
        TweenAnimationBuilder<double>(
          tween:    Tween(begin: 0, end: 1),
          duration: const Duration(milliseconds: 1000),
          curve:    Curves.elasticOut,
          builder: (_, v, child) => Transform.scale(
            scale: v, child: child),
          child: Container(
            width: 90, height: 90,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF3B82F6), Color(0xFF06B6D4)],
                begin:  Alignment.topLeft,
                end:    Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(26),
              boxShadow: [
                BoxShadow(
                  color:      AppTheme.blue.withOpacity(0.5),
                  blurRadius: 40,
                  spreadRadius: 4,
                ),
              ],
            ),
            child: const Icon(Icons.shield_rounded,
                size: 46, color: Colors.white),
          ),
        ),

        const SizedBox(height: 20),

        const Text(
          'Alpha Technology',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize:      28,
            fontWeight:    FontWeight.w900,
            color:         Color(0xFFE2E8F0),
            letterSpacing: 0.5,
          ),
        ),

        const SizedBox(height: 6),

        ShaderMask(
          shaderCallback: (bounds) => const LinearGradient(
            colors: [Color(0xFF3B82F6), Color(0xFF06B6D4)],
          ).createShader(bounds),
          child: const Text(
            'Système ADAS/DMS · Conducteur',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize:   14,
              fontWeight: FontWeight.w600,
              color:      Colors.white,
              letterSpacing: 0.3,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFormCard(AuthProvider auth) {
    return Container(
      decoration: BoxDecoration(
        color:        const Color(0xFF12121F).withOpacity(0.95),
        borderRadius: BorderRadius.circular(24),
        border:       Border.all(
          color: Colors.white.withOpacity(0.09),
        ),
        boxShadow: [
          BoxShadow(
            color:      Colors.black.withOpacity(0.5),
            blurRadius: 50,
            offset:     const Offset(0, 24),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Column(
          children: [
            // Barre dégradée top
            Container(
              height: 3,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF3B82F6), Color(0xFF06B6D4)],
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(28),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Badge Espace Conducteur
                    Align(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 7),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              AppTheme.blue.withOpacity(0.15),
                              AppTheme.cyan.withOpacity(0.08),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(999),
                          border:       Border.all(
                            color: AppTheme.blue.withOpacity(0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.directions_car_rounded,
                                size: 14, color: AppTheme.blue),
                            const SizedBox(width: 7),
                            Text(
                              'Espace Conducteur',
                              style: TextStyle(
                                fontSize:   12,
                                fontWeight: FontWeight.w700,
                                color:      AppTheme.blue,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 28),

                    // Identifiant
                    _ProField(
                      controller: _idCtrl,
                      label:      'Identifiant',
                      hint:       'ex: C10',
                      icon:       Icons.person_rounded,
                      validator:  (v) => (v?.isEmpty ?? true)
                          ? 'Champ requis' : null,
                      onNext: () =>
                          FocusScope.of(context).nextFocus(),
                    ),

                    const SizedBox(height: 16),

                    // Mot de passe
                    _ProField(
                      controller: _mdpCtrl,
                      label:      'Mot de passe',
                      hint:       '••••••••',
                      icon:       Icons.lock_rounded,
                      obscure:    !_showMdp,
                      validator:  (v) => (v?.isEmpty ?? true)
                          ? 'Champ requis' : null,
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
                      onDone: _login,
                    ),

                    const SizedBox(height: 28),

                    // Bouton connexion
                    _LoginButton(
                      loading:  auth.loading,
                      onPressed: auth.loading ? null : _login,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTestAccounts() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color:        Colors.white.withOpacity(0.025),
        borderRadius: BorderRadius.circular(16),
        border:       Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Compte de démonstration',
            style: TextStyle(
              fontSize:   11,
              fontWeight: FontWeight.w600,
              color:      Color(0xFF475569),
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 10),

          _TestAccountTile(
            role:  'Conducteur',
            id:    'C10',
            mdp:   'Cond123456',
            color: AppTheme.blue,
            icon:  Icons.person_rounded,
            onTap: () => _remplir('C10', 'Cond123456'),
          ),

          const SizedBox(height: 10),

          // Info rôles
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color:        AppTheme.orange.withOpacity(0.06),
              borderRadius: BorderRadius.circular(10),
              border:       Border.all(
                  color: AppTheme.orange.withOpacity(0.15)),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline_rounded,
                    size: 13, color: AppTheme.orange),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'App réservée aux conducteurs.\n'
                    'Gestionnaires & Admin → Interface Web',
                    style: TextStyle(
                      fontSize: 11,
                      color:    AppTheme.orange.withOpacity(0.9),
                      height:   1.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter() {
    return Column(
      children: [
        Text(
          'Backend: ${AppConfig.baseUrl}',
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 10,
            color:    Color(0xFF334155),
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Alpha Technology © 2024–2025',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 11,
            color:    Color(0xFF334155),
          ),
        ),
      ],
    );
  }
}

// ── Fond animé orbes ─────────────────────────────────────
class _AnimatedBackground extends StatelessWidget {
  final Animation<double> rotAnim;
  const _AnimatedBackground({required this.rotAnim});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: rotAnim,
      builder: (_, __) {
        final t = rotAnim.value / (2 * math.pi);
        return Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end:   Alignment.bottomRight,
              colors: [
                Color(0xFF0D0D1A),
                Color(0xFF0A0A18),
                Color(0xFF050510),
              ],
            ),
          ),
          child: Stack(
            children: [
              // Orbe bleu
              Positioned(
                top:  -100 + 60 * math.sin(t * 2 * math.pi),
                left: -80  + 40 * math.cos(t * 2 * math.pi),
                child: Container(
                  width: 300, height: 300,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        const Color(0xFF3B82F6).withOpacity(0.15),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              // Orbe cyan
              Positioned(
                bottom: -80  + 50 * math.sin(t * 2 * math.pi + 1),
                right:  -100 + 40 * math.cos(t * 2 * math.pi + 1),
                child: Container(
                  width: 280, height: 280,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        const Color(0xFF06B6D4).withOpacity(0.12),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              // Orbe purple
              Positioned(
                top:  MediaQueryData.fromView(
                  WidgetsBinding.instance.platformDispatcher.views.first,
                ).size.height * 0.4,
                right: 30 + 20 * math.sin(t * 2 * math.pi + 2),
                child: Container(
                  width: 180, height: 180,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        const Color(0xFFA855F7).withOpacity(0.08),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ── Champ de formulaire pro ───────────────────────────────
class _ProField extends StatefulWidget {
  final TextEditingController controller;
  final String  label;
  final String  hint;
  final IconData icon;
  final bool    obscure;
  final String? Function(String?)? validator;
  final Widget? suffix;
  final VoidCallback? onNext;
  final VoidCallback? onDone;

  const _ProField({
    required this.controller,
    required this.label,
    required this.hint,
    required this.icon,
    this.obscure   = false,
    this.validator,
    this.suffix,
    this.onNext,
    this.onDone,
  });

  @override
  State<_ProField> createState() => _ProFieldState();
}

class _ProFieldState extends State<_ProField> {
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
                    color:      AppTheme.blue.withOpacity(0.2),
                    blurRadius: 16,
                  ),
                ]
              : [],
        ),
        child: TextFormField(
          controller:  widget.controller,
          obscureText: widget.obscure,
          validator:   widget.validator,
          style: const TextStyle(
            color:      Color(0xFFE2E8F0),
            fontSize:   15,
            fontWeight: FontWeight.w500,
          ),
          textInputAction: widget.onDone != null
              ? TextInputAction.done
              : TextInputAction.next,
          onFieldSubmitted: (_) {
  if (widget.onDone != null) {
    widget.onDone!();
  } else {
    widget.onNext?.call();
  }
},
          decoration: InputDecoration(
            labelText:  widget.label,
            hintText:   widget.hint,
            prefixIcon: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              child: Icon(
                widget.icon,
                size:  20,
                color: _focused ? AppTheme.blue : AppTheme.textMuted,
              ),
            ),
            suffixIcon: widget.suffix,
            filled:     true,
            fillColor:  _focused
                ? const Color(0xFF1A1A30)
                : const Color(0xFF14141F),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide:   BorderSide(
                color: Colors.white.withOpacity(0.08)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(
                color: AppTheme.blue.withOpacity(0.6), width: 1.5),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide:   const BorderSide(
                color: Color(0xFFEF4444)),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide:   const BorderSide(
                color: Color(0xFFEF4444), width: 1.5),
            ),
            labelStyle: TextStyle(
              color: _focused ? AppTheme.blue : AppTheme.textMuted,
              fontWeight: FontWeight.w500,
            ),
            hintStyle: TextStyle(
              color: AppTheme.textMuted.withOpacity(0.5)),
          ),
        ),
      ),
    );
  }
}

// ── Bouton login animé ────────────────────────────────────
class _LoginButton extends StatefulWidget {
  final bool loading;
  final VoidCallback? onPressed;
  const _LoginButton({required this.loading, this.onPressed});

  @override
  State<_LoginButton> createState() => _LoginButtonState();
}

class _LoginButtonState extends State<_LoginButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _scaleAnim;
  bool _pressed = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 150));
    _scaleAnim = Tween<double>(begin: 1.0, end: 0.96)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: widget.onPressed != null
          ? (_) { _ctrl.forward(); setState(() => _pressed = true); }
          : null,
      onTapUp: widget.onPressed != null
          ? (_) {
              _ctrl.reverse();
              setState(() => _pressed = false);
              widget.onPressed?.call();
            }
          : null,
      onTapCancel: () {
        _ctrl.reverse();
        setState(() => _pressed = false);
      },
      child: ScaleTransition(
        scale: _scaleAnim,
        child: AnimatedContainer(
          duration:     const Duration(milliseconds: 200),
          height:       56,
          decoration: BoxDecoration(
            gradient: widget.loading
                ? LinearGradient(colors: [
                    AppTheme.blue.withOpacity(0.5),
                    AppTheme.cyan.withOpacity(0.5),
                  ])
                : const LinearGradient(
                    colors: [Color(0xFF3B82F6), Color(0xFF06B6D4)],
                    begin:  Alignment.centerLeft,
                    end:    Alignment.centerRight,
                  ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: widget.loading
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
            child: widget.loading
                ? const SizedBox(
                    width: 22, height: 22,
                    child: CircularProgressIndicator(
                      color:      Colors.white,
                      strokeWidth: 2.5,
                    ),
                  )
                : const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.bolt_rounded,
                          size: 20, color: Colors.white),
                      SizedBox(width: 8),
                      Text(
                        'Se connecter',
                        style: TextStyle(
                          fontSize:   16,
                          fontWeight: FontWeight.w700,
                          color:      Colors.white,
                          letterSpacing: 0.4,
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

// ── Bouton compte test ───────────────────────────────────
class _TestAccountTile extends StatefulWidget {
  final String role;
  final String id;
  final String mdp;
  final Color  color;
  final IconData icon;
  final VoidCallback onTap;

  const _TestAccountTile({
    required this.role,
    required this.id,
    required this.mdp,
    required this.color,
    required this.icon,
    required this.onTap,
  });

  @override
  State<_TestAccountTile> createState() => _TestAccountTileState();
}

class _TestAccountTileState extends State<_TestAccountTile> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      onTapDown:   (_) => setState(() => _pressed = true),
      onTapUp:     (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale:    _pressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 120),
        child:    AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding:  const EdgeInsets.symmetric(
              horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: _pressed
                ? widget.color.withOpacity(0.15)
                : widget.color.withOpacity(0.07),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: widget.color.withOpacity(_pressed ? 0.4 : 0.2)),
          ),
          child: Row(
            children: [
              Container(
                width: 32, height: 32,
                decoration: BoxDecoration(
                  color:        widget.color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Icon(widget.icon,
                    size: 16, color: widget.color),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.role,
                    style: TextStyle(
                      fontSize:   12,
                      fontWeight: FontWeight.w700,
                      color:      widget.color,
                    )),
                  Text(
                    '${widget.id}  ·  ${widget.mdp}',
                    style: TextStyle(
                      fontSize: 11,
                      color:    widget.color.withOpacity(0.6),
                    )),
                ],
              ),
              const Spacer(),
              Icon(Icons.arrow_forward_ios_rounded,
                  size: 12, color: widget.color.withOpacity(0.5)),
            ],
          ),
        ),
      ),
    );
  }
}