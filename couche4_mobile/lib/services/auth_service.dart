import 'api_service.dart';
import 'storage_service.dart';
import '../models/user_model.dart';

class AuthService {

  static Future<UserModel> login(String id, String motDePasse) async {

    // Appel API
    final data = await ApiService.login(id, motDePasse);

    print('[Auth] Réponse login: $data');

    // Vérifier présence du token
    if (data['token'] == null) {
      throw Exception('Réponse invalide : token manquant');
    }

    // Vérifier rôle CONDUCTEUR uniquement
    final role = data['role']?.toString() ?? '';
    if (role != 'CONDUCTEUR') {
      throw Exception(
        'Accès refusé.\n'
        'Cette application est réservée aux conducteurs.\n'
        'Votre rôle : $role',
      );
    }

    final user = UserModel.fromJson(data);

    // Sauvegarder en local
    await StorageService.saveToken(user.token);
    await StorageService.saveUser(
      id:   user.id,
      role: user.role,
      nom:  user.nom,
    );

    print('[Auth] ✅ Connecté : ${user.id} (${user.role})');
    return user;
  }

  static Future<void> logout() async {
    await StorageService.clear();
    print('[Auth] Déconnecté');
  }

  static UserModel? getStoredUser() {
    if (!StorageService.isLoggedIn) return null;

    return UserModel(
      id:    StorageService.getUserId()!,
      role:  StorageService.getUserRole()!,
      nom:   StorageService.getUserName()!,
      token: StorageService.getToken()!,
    );
  }
}