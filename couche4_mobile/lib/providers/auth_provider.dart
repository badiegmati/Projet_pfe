import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  bool       _loading = false;
  String?    _error;

  UserModel? get user     => _user;
  bool       get loading  => _loading;
  String?    get error    => _error;
  bool       get isLoggedIn => _user != null;

  /// Restaurer session au démarrage
  void initFromStorage() {
    _user = AuthService.getStoredUser();
    if (_user != null) {
      print('[AuthProvider] Session restaurée : ${_user!.id}');
    }
    notifyListeners();
  }

  /// Connexion
  Future<void> login(String id, String motDePasse) async {
    _loading = true;
    _error   = null;
    notifyListeners();

    try {
      _user  = await AuthService.login(id, motDePasse);
      _error = null;
      print('[AuthProvider] ✅ Login OK : ${_user!.id}');
    } catch (e) {
      _user  = null;
      _error = e.toString().replaceAll('Exception: ', '');
      print('[AuthProvider] ❌ Login erreur : $_error');
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  /// Déconnexion
  Future<void> logout() async {
    await AuthService.logout();
    _user  = null;
    _error = null;
    notifyListeners();
  }
}