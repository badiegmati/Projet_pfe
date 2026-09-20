class NotificationModel {
  final int id;
  final String titre;
  final String? corps;
  final bool lue;
  final DateTime dateEnvoi;
  final double? vitesseKmh;

  NotificationModel({
    required this.id,
    required this.titre,
    this.corps,
    required this.lue,
    required this.dateEnvoi,
    this.vitesseKmh,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id:          json['id']    ?? 0,
      titre:       json['titre'] ?? '',
      corps:       json['corps'],
      lue:         json['lue']   ?? false,
      dateEnvoi:   DateTime.tryParse(json['dateEnvoi'] ?? '')
                   ?? DateTime.now(),
      vitesseKmh:  json['vitesseKmh'] != null
                   ? (json['vitesseKmh']).toDouble() : null,
    );
  }
}

class MessageModel {
  final int id;
  final String expediteurId;
  final String destinataireId;
  final String contenu;
  final bool lu;
  final DateTime dateEnvoi;

  MessageModel({
    required this.id,
    required this.expediteurId,
    required this.destinataireId,
    required this.contenu,
    required this.lu,
    required this.dateEnvoi,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id:              json['id']              ?? 0,
      expediteurId:    json['expediteurId']    ?? '',
      destinataireId:  json['destinataireId']  ?? '',
      contenu:         json['contenu']         ?? '',
      lu:              json['lu']              ?? false,
      dateEnvoi:       DateTime.tryParse(json['dateEnvoi'] ?? '')
                       ?? DateTime.now(),
    );
  }
}