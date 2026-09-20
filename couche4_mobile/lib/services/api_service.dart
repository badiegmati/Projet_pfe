import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import 'storage_service.dart';

class ApiService {

  // ── Headers avec JWT ─────────────────────────────────
  static Map<String, String> get _headers {
    final token = StorageService.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // ── Gestion erreurs centralisée ───────────────────────
  static Exception _handleError(http.Response res, String context) {
    try {
      final body = jsonDecode(res.body);
      final msg  = body['erreur'] ?? body['message'] ?? body['error'];
      if (msg != null) return Exception(msg);
    } catch (_) {}

    switch (res.statusCode) {
      case 401: return Exception('SESSION_EXPIRED');
      case 403: return Exception('Accès refusé');
      case 404: return Exception('Ressource introuvable');
      case 405: return Exception('Méthode non autorisée — vérifiez le endpoint');
      case 500: return Exception('Erreur serveur interne');
      default:  return Exception('Erreur $context (${res.statusCode})');
    }
  }

  // ════════════════════════════════════════════════════
  // AUTH
  // ════════════════════════════════════════════════════

  /// POST /api/auth/login
  /// Body : { "id": "C10", "motDePasse": "Cond123456" }
  static Future<Map<String, dynamic>> login(
      String id, String motDePasse) async {

    final url = Uri.parse('${AppConfig.apiUrl}${AppConfig.loginEndpoint}');

    // Debug
    print('[API] POST $url');
    print('[API] Body: {"id":"$id","motDePasse":"***"}');

    late http.Response res;
    try {
      res = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept':       'application/json',
        },
        body: jsonEncode({
          'id':         id,
          'motDePasse': motDePasse,
        }),
      ).timeout(
        const Duration(milliseconds: AppConfig.connectTimeout),
        onTimeout: () => throw Exception(
          'Timeout — Spring Boot ne répond pas sur ${AppConfig.baseUrl}\n'
          'Vérifiez que le backend est démarré.',
        ),
      );
    } on Exception {
      rethrow;
    } catch (e) {
      throw Exception('Erreur réseau : $e\nVérifiez que Spring Boot tourne sur ${AppConfig.baseUrl}');
    }

    print('[API] Login status: ${res.statusCode}');
    print('[API] Login body: ${res.body}');

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      return data;
    }

    throw _handleError(res, 'login');
  }

  // ════════════════════════════════════════════════════
  // PROFIL CONDUCTEUR
  // ════════════════════════════════════════════════════

  /// GET /api/conducteur/{id}/profil
  static Future<Map<String, dynamic>> getProfil(String id) async {
    final url = Uri.parse(
      '${AppConfig.apiUrl}${AppConfig.conducteurEndpoint}/$id/profil',
    );
    print('[API] GET $url');

    final res = await http.get(url, headers: _headers).timeout(
      const Duration(milliseconds: AppConfig.receiveTimeout),
      onTimeout: () => throw Exception('Timeout chargement profil'),
    );

    if (res.statusCode == 200) return jsonDecode(res.body);
    throw _handleError(res, 'getProfil');
  }

  /// PUT /api/conducteur/{id}/profil
  static Future<void> modifierProfil(
      String id, Map<String, dynamic> data) async {
    final url = Uri.parse(
      '${AppConfig.apiUrl}${AppConfig.conducteurEndpoint}/$id/profil',
    );
    print('[API] PUT $url');

    final res = await http.put(
      url,
      headers: _headers,
      body:    jsonEncode(data),
    ).timeout(const Duration(milliseconds: AppConfig.receiveTimeout));

    if (res.statusCode == 200) return;
    throw _handleError(res, 'modifierProfil');
  }

  // ════════════════════════════════════════════════════
  // SCORE
  // ════════════════════════════════════════════════════

  /// GET /api/scores/{id}/actuel
  static Future<Map<String, dynamic>> getScore(String id) async {
    final url = Uri.parse(
      '${AppConfig.apiUrl}${AppConfig.scoresEndpoint}/$id/actuel',
    );
    print('[API] GET $url');

    final res = await http.get(url, headers: _headers).timeout(
      const Duration(milliseconds: AppConfig.receiveTimeout),
      onTimeout: () => throw Exception('Timeout chargement score'),
    );

    if (res.statusCode == 200) return jsonDecode(res.body);
    if (res.statusCode == 404) return {}; // Pas de score encore
    throw _handleError(res, 'getScore');
  }

  /// GET /api/scores/{id}/historique
  static Future<List<dynamic>> getHistoriqueScore(String id) async {
    final url = Uri.parse(
      '${AppConfig.apiUrl}${AppConfig.scoresEndpoint}/$id/historique',
    );

    final res = await http.get(url, headers: _headers).timeout(
      const Duration(milliseconds: AppConfig.receiveTimeout),
    );

    if (res.statusCode == 200) return jsonDecode(res.body);
    return [];
  }

  // ════════════════════════════════════════════════════
  // ÉVÉNEMENTS
  // ════════════════════════════════════════════════════

  /// GET /api/conducteur/{id}/evenements
  static Future<List<dynamic>> getEvenements(String id) async {
    final url = Uri.parse(
      '${AppConfig.apiUrl}${AppConfig.conducteurEndpoint}/$id/evenements',
    );

    final res = await http.get(url, headers: _headers).timeout(
      const Duration(milliseconds: AppConfig.receiveTimeout),
    );

    if (res.statusCode == 200) return jsonDecode(res.body);
    return [];
  }

  // ════════════════════════════════════════════════════
  // TABLEAU DE BORD
  // ════════════════════════════════════════════════════

  /// GET /api/conducteur/{id}/tableau-bord
  static Future<Map<String, dynamic>> getTableauBord(String id) async {
    final url = Uri.parse(
      '${AppConfig.apiUrl}${AppConfig.conducteurEndpoint}/$id/tableau-bord',
    );

    final res = await http.get(url, headers: _headers).timeout(
      const Duration(milliseconds: AppConfig.receiveTimeout),
    );

    if (res.statusCode == 200) return jsonDecode(res.body);
    return {};
  }

  // ════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ════════════════════════════════════════════════════

  /// GET /api/notifications/{conducteurId}
  static Future<List<dynamic>> getNotifications(String id) async {
    final url = Uri.parse(
      '${AppConfig.apiUrl}${AppConfig.notificationsEndpoint}/$id',
    );

    final res = await http.get(url, headers: _headers).timeout(
      const Duration(milliseconds: AppConfig.receiveTimeout),
    );

    if (res.statusCode == 200) return jsonDecode(res.body);
    return [];
  }

  /// PUT /api/notifications/{notifId}/lu
  static Future<void> marquerNotificationLue(int notifId) async {
    final url = Uri.parse(
      '${AppConfig.apiUrl}${AppConfig.notificationsEndpoint}/$notifId/lu',
    );

    await http.put(url, headers: _headers).timeout(
      const Duration(milliseconds: AppConfig.receiveTimeout),
    );
  }

  // ════════════════════════════════════════════════════
  // MESSAGES
  // ════════════════════════════════════════════════════

  /// GET /api/messages/{conducteurId}?avec={gestionnaireId}
  static Future<List<dynamic>> getMessages(
      String conducteurId, String avec) async {
    final url = Uri.parse(
      '${AppConfig.apiUrl}${AppConfig.messagesEndpoint}/$conducteurId?avec=$avec',
    );

    final res = await http.get(url, headers: _headers).timeout(
      const Duration(milliseconds: AppConfig.receiveTimeout),
    );

    if (res.statusCode == 200) return jsonDecode(res.body);
    return [];
  }

  /// POST /api/messages
  static Future<void> envoyerMessage(Map<String, dynamic> data) async {
    final url = Uri.parse(
      '${AppConfig.apiUrl}${AppConfig.messagesEndpoint}',
    );

    final res = await http.post(
      url,
      headers: _headers,
      body:    jsonEncode(data),
    ).timeout(const Duration(milliseconds: AppConfig.receiveTimeout));

    if (res.statusCode == 200 || res.statusCode == 201) return;
    throw _handleError(res, 'envoyerMessage');
  }
}