class ScoreModel {
  final String conducteurId;
  final double scoreValeur;
  final String niveauRisque;
  final int nbFatigue;
  final int nbTelephone;
  final int nbCeinture;
  final int nbTabagisme;
  final int nbDistraction;
  final int nbFcw;
  final int nbLdw;
  final int nbTotal;
  final double ratioGraves;
  final double vitesseMoyenne;
  final DateTime dateCalcul;

  ScoreModel({
    required this.conducteurId,
    required this.scoreValeur,
    required this.niveauRisque,
    required this.nbFatigue,
    required this.nbTelephone,
    required this.nbCeinture,
    required this.nbTabagisme,
    required this.nbDistraction,
    required this.nbFcw,
    required this.nbLdw,
    required this.nbTotal,
    required this.ratioGraves,
    required this.vitesseMoyenne,
    required this.dateCalcul,
  });

  factory ScoreModel.fromJson(Map<String, dynamic> json) {
    return ScoreModel(
      conducteurId:  json['conducteurId']  ?? '',
      scoreValeur:   (json['scoreValeur']  ?? 0).toDouble(),
      niveauRisque:  json['niveauRisque']  ?? 'FAIBLE',
      nbFatigue:     json['nbFatigue']     ?? 0,
      nbTelephone:   json['nbTelephone']   ?? 0,
      nbCeinture:    json['nbCeinture']    ?? 0,
      nbTabagisme:   json['nbTabagisme']   ?? 0,
      nbDistraction: json['nbDistraction'] ?? 0,
      nbFcw:         json['nbFcw']         ?? 0,
      nbLdw:         json['nbLdw']         ?? 0,
      nbTotal:       json['nbTotal']       ?? 0,
      ratioGraves:   (json['ratioGraves']  ?? 0).toDouble(),
      vitesseMoyenne:(json['vitesseMoyenne']?? 0).toDouble(),
      dateCalcul:    DateTime.tryParse(json['dateCalcul'] ?? '')
                     ?? DateTime.now(),
    );
  }

  double get scorePct => scoreValeur * 100;
}