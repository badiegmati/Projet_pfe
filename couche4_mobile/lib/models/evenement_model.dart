class EvenementModel {
  final int id;
  final String typeEvenement;
  final String categorie;
  final String severite;
  final double dureeSecondes;
  final double? vitesseKmh;
  final double? latitude;
  final double? longitude;
  final DateTime dateHeure;

  EvenementModel({
    required this.id,
    required this.typeEvenement,
    required this.categorie,
    required this.severite,
    required this.dureeSecondes,
    this.vitesseKmh,
    this.latitude,
    this.longitude,
    required this.dateHeure,
  });

  factory EvenementModel.fromJson(Map<String, dynamic> json) {
    return EvenementModel(
      id:             json['id'] ?? 0,
      typeEvenement:  json['typeEvenement']  ?? '',
      categorie:      json['categorie']      ?? '',
      severite:       json['severite']       ?? '',
      dureeSecondes:  (json['dureeSecondes'] ?? 0).toDouble(),
      vitesseKmh:     json['vitesseKmh'] != null
                      ? (json['vitesseKmh']).toDouble() : null,
      latitude:       json['latitude']  != null
                      ? (json['latitude']).toDouble()  : null,
      longitude:      json['longitude'] != null
                      ? (json['longitude']).toDouble() : null,
      dateHeure:      DateTime.tryParse(json['dateHeure'] ?? '')
                      ?? DateTime.now(),
    );
  }

  String get typeLabel {
    const labels = {
      'FATIGUE_EYES_CLOSED': 'Yeux fermés',
      'FATIGUE_EYES_DROWSY': 'Somnolence',
      'FATIGUE_YAWN':        'Baillement',
      'FATIGUE_DROP':        'Tête tombante',
      'DISTRACTION':         'Distraction',
      'PHONE':               'Téléphone',
      'SMOKING':             'Tabagisme',
      'SEATBELT':            'Ceinture absente',
      'FCW_WARNING':         'Alerte collision',
      'FCW_DANGER':          'Danger collision',
      'LDW_LEFT':            'Sortie voie G',
      'LDW_RIGHT':           'Sortie voie D',
    };
    return labels[typeEvenement] ?? typeEvenement;
  }

  bool get hasGps => latitude != null && longitude != null;
}