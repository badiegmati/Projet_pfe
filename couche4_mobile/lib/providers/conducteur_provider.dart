import 'package:flutter/material.dart';
import 'dart:async';
import '../models/score_model.dart';
import '../models/evenement_model.dart';
import '../models/notification_model.dart';
import '../services/api_service.dart';
import '../config/app_config.dart';  // ← import ici pas en bas

class ConducteurProvider extends ChangeNotifier {
  Map<String, dynamic>? profil;
  ScoreModel?           score;
  List<ScoreModel>      historiqueScore    = [];
  List<EvenementModel>  evenements         = [];
  List<NotificationModel> notifications   = [];
  List<MessageModel>    messages           = [];
  Map<String, dynamic>? tableau;

  bool    _loading    = true;
  bool    _refreshing = false;
  String? _error;
  DateTime? lastUpdate;
  Timer?  _pollingTimer;

  bool    get loading    => _loading;
  bool    get refreshing => _refreshing;
  String? get error      => _error;

  int get nbNonLues =>
    notifications.where((n) => !n.lue).length;

  double get scoreVal {
    if (score != null) return score!.scoreValeur;
    if (profil?['scoreJournalier'] != null) {
      return double.tryParse(
        profil!['scoreJournalier'].toString()) ?? 0.0;
    }
    return 0.0;
  }

  String get niveauRisque {
    final s = scoreVal;
    if (s < 0.25) return 'FAIBLE';
    if (s < 0.50) return 'MODERE';
    if (s < 0.75) return 'ELEVE';
    return 'CRITIQUE';
  }

  Future<void> chargerDonnees(String conducteurId) async {
    _loading = true;
    _error   = null;
    notifyListeners();

    await _fetchAll(conducteurId);

    _loading = false;
    notifyListeners();

    _startPolling(conducteurId);
  }

  Future<void> refresh(String conducteurId) async {
    _refreshing = true;
    notifyListeners();
    await _fetchAll(conducteurId);
    _refreshing = false;
    notifyListeners();
  }

  Future<void> _fetchAll(String conducteurId) async {
    try {
      final results = await Future.wait([
        ApiService.getProfil(conducteurId),
        ApiService.getScore(conducteurId),
        ApiService.getHistoriqueScore(conducteurId),
        ApiService.getEvenements(conducteurId),
        ApiService.getNotifications(conducteurId),
        ApiService.getTableauBord(conducteurId),
      ], eagerError: false);

      profil = results[0] as Map<String, dynamic>;

      final scoreData = results[1];
      if (scoreData is Map<String, dynamic>) {
        score = ScoreModel.fromJson(scoreData);
      }

      final histData = results[2];
      if (histData is List) {
        historiqueScore = histData
          .map((e) => ScoreModel.fromJson(e as Map<String, dynamic>))
          .toList();
      }

      final evtData = results[3];
      if (evtData is List) {
        evenements = evtData
          .map((e) => EvenementModel.fromJson(e as Map<String, dynamic>))
          .toList();
      }

      final notifData = results[4];
      if (notifData is List) {
        notifications = notifData
          .map((n) => NotificationModel.fromJson(n as Map<String, dynamic>))
          .toList();
      }

      final tabData = results[5];
      if (tabData is Map<String, dynamic>) {
        tableau = tabData;
      }

      lastUpdate = DateTime.now();
      _error = null;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
    }
  }

  Future<void> chargerMessages(
      String conducteurId, String avec) async {
    try {
      final data = await ApiService.getMessages(conducteurId, avec);
      if (data is List) {
        messages = data
          .map((m) => MessageModel.fromJson(m as Map<String, dynamic>))
          .toList();
      }
      notifyListeners();
    } catch (_) {}
  }

  Future<void> marquerLue(int notifId) async {
    try {
      await ApiService.marquerNotificationLue(notifId);
      final idx = notifications.indexWhere((n) => n.id == notifId);
      if (idx != -1) {
        final old = notifications[idx];
        notifications[idx] = NotificationModel(
          id:         old.id,
          titre:      old.titre,
          corps:      old.corps,
          lue:        true,
          dateEnvoi:  old.dateEnvoi,
          vitesseKmh: old.vitesseKmh,
        );
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> envoyerMessage(
      String from, String to, String contenu) async {
    await ApiService.envoyerMessage({
      'expediteurId':    from,
      'destinatairesId': to,
      'contenu':         contenu,
    });
  }

  void _startPolling(String conducteurId) {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(
      const Duration(seconds: AppConfig.pollingInterval),
      (_) async {
        await _fetchAll(conducteurId);
        notifyListeners();
      },
    );
  }

  void stopPolling() {
    _pollingTimer?.cancel();
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }
}