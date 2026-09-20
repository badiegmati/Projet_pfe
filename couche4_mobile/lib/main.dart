import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'config/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/conducteur_provider.dart';
import 'services/storage_service.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Supporte toutes les orientations (responsive)
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor:             Colors.transparent,
    statusBarIconBrightness:    Brightness.light,
    systemNavigationBarColor:   Color(0xFF0D0D1A),
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  await StorageService.init();
  runApp(const AdasDmsApp());
}

class AdasDmsApp extends StatelessWidget {
  const AdasDmsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..initFromStorage()),
        ChangeNotifierProvider(create: (_) => ConducteurProvider()),
      ],
      child: MaterialApp(
        title:                    'ADAS/DMS — Alpha Technology',
        debugShowCheckedModeBanner: false,
        theme:                    AppTheme.darkTheme,
        // Transitions globales fluides
        onGenerateRoute: (settings) => PageRouteBuilder(
          settings:        settings,
          pageBuilder:     (_, __, ___) => const AppRoot(),
          transitionsBuilder: (_, anim, __, child) => FadeTransition(
            opacity: CurvedAnimation(parent: anim, curve: Curves.easeOut),
            child:   child,
          ),
          transitionDuration: const Duration(milliseconds: 400),
        ),
        home: const AppRoot(),
      ),
    );
  }
}

class AppRoot extends StatelessWidget {
  const AppRoot({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        return AnimatedSwitcher(
          duration: const Duration(milliseconds: 500),
          transitionBuilder: (child, anim) => FadeTransition(
            opacity: CurvedAnimation(parent: anim, curve: Curves.easeOut),
            child:   SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0, 0.04),
                end:   Offset.zero,
              ).animate(CurvedAnimation(parent: anim, curve: Curves.easeOut)),
              child: child,
            ),
          ),
          child: auth.isLoggedIn
              ? const DashboardScreen(key: ValueKey('dashboard'))
              : const LoginScreen(key: ValueKey('login')),
        );
      },
    );
  }
}