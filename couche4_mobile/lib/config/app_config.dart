class AppConfig {

  // ══════════════════════════════════════════════════
  // URL BACKEND
  // ══════════════════════════════════════════════════

  /// flutter run -d chrome  → localhost:8080
  /// Émulateur Android      → 10.0.2.2:8080
  /// Device physique        → 192.168.1.x:8080
  static const String baseUrl = 'http://localhost:8080';

  static const String apiUrl  = '$baseUrl/api';

  // ── Endpoints ────────────────────────────────────
  static const String loginEndpoint         = '/auth/login';
  static const String conducteurEndpoint    = '/conducteur';
  static const String scoresEndpoint        = '/scores';
  static const String notificationsEndpoint = '/notifications';
  static const String messagesEndpoint      = '/messages';

  // ── Polling ──────────────────────────────────────
  static const int pollingInterval = 30; // secondes

  // ── SharedPreferences keys ────────────────────────
  static const String tokenKey    = 'jwt_token';
  static const String userIdKey   = 'user_id';
  static const String userRoleKey = 'user_role';
  static const String userNameKey = 'user_name';

  // ── Timeouts (ms) ────────────────────────────────
  static const int connectTimeout = 15000;
  static const int receiveTimeout = 15000;
}