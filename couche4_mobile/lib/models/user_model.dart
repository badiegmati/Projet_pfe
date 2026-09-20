class UserModel {
  final String id;
  final String role;
  final String nom;
  final String token;

  UserModel({
    required this.id,
    required this.role,
    required this.nom,
    required this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id:    json['id']    ?? '',
      role:  json['role']  ?? '',
      nom:   json['nom']   ?? '',
      token: json['token'] ?? '',
    );
  }
}