import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class StorageService {
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Token JWT
  static Future<void> saveToken(String token) async {
    await _prefs?.setString(AppConfig.tokenKey, token);
  }
  static String? getToken() => _prefs?.getString(AppConfig.tokenKey);

  // User info
  static Future<void> saveUser({
    required String id,
    required String role,
    required String nom,
  }) async {
    await _prefs?.setString(AppConfig.userIdKey,   id);
    await _prefs?.setString(AppConfig.userRoleKey, role);
    await _prefs?.setString(AppConfig.userNameKey, nom);
  }

  static String? getUserId()   => _prefs?.getString(AppConfig.userIdKey);
  static String? getUserRole() => _prefs?.getString(AppConfig.userRoleKey);
  static String? getUserName() => _prefs?.getString(AppConfig.userNameKey);

  static Future<void> clear() async {
    await _prefs?.clear();
  }

  static bool get isLoggedIn =>
    getToken() != null && getUserId() != null;
}