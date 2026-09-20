package tn.alphatechnology.adas.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.alphatechnology.adas.entity.*;
import tn.alphatechnology.adas.repository.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.*;

/**
 * ScoreService — VERSION CORRIGÉE
 * MODIFICATIONS :
 *   - Suppression avgVitessePourConducteur (vitesseKmh absent)
 *   - Suppression vitesseMoyenne du builder ScoreRisque
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScoreService {

    private final EvenementRepository   evenementRepo;
    private final ScoreRisqueRepository scoreRepo;
    private final ConducteurRepository  conducteurRepo;

    @Transactional
public void calculerEtSauvegarderScore(String conducteurId) {

    // CORRECTION : tous les événements (pas juste 7j)
    // Les données Supabase datent de mai 2026
    OffsetDateTime depuis = OffsetDateTime.now().minusDays(365);

    log.info("[SCORE] Calcul conducteur={} fenetre=1an", conducteurId);

    List<Object[]> resultats = evenementRepo
            .countByTypeForConducteur(conducteurId, depuis);

    // ... reste du code identique

        Map<String, Long> counts = new HashMap<>();
        for (Object[] row : resultats) {
            counts.put((String) row[0], (Long) row[1]);
        }

        // Compteurs individuels
        int nbFatigue = (int)(
                counts.getOrDefault("FATIGUE_EYES_CLOSED", 0L)
              + counts.getOrDefault("FATIGUE_EYES_DROWSY", 0L)
              + counts.getOrDefault("FATIGUE_YAWN",        0L)
              + counts.getOrDefault("FATIGUE_DROP",        0L));

        int nbTelephone   = counts.getOrDefault("PHONE",       0L).intValue();
        int nbCeinture    = counts.getOrDefault("SEATBELT",    0L).intValue();
        int nbTabagisme   = counts.getOrDefault("SMOKING",     0L).intValue();
        int nbDistraction = counts.getOrDefault("DISTRACTION", 0L).intValue();
        int nbHeadPose    = counts.getOrDefault("HEAD_POSE",   0L).intValue();

        int nbFcw = (int)(
                counts.getOrDefault("FCW_WARNING", 0L)
              + counts.getOrDefault("FCW_DANGER",  0L));

        int nbLdw = (int)(
                counts.getOrDefault("LDW_LEFT",  0L)
              + counts.getOrDefault("LDW_RIGHT", 0L));

        int nbTotal = counts.values().stream()
                .mapToInt(Long::intValue).sum();

        // Ratio graves (CRITIQUE + ELEVE)
        List<Evenement> tousEvts = evenementRepo
                .findByConducteurIdAndDateHeureAfter(conducteurId, depuis);

        long nbGraves = tousEvts.stream()
                .filter(e ->
                    e.getSeverite() == Evenement.SeveriteEnum.CRITIQUE
                 || e.getSeverite() == Evenement.SeveriteEnum.ELEVE)
                .count();

        double ratioGraves = nbTotal > 0
                ? (double) nbGraves / nbTotal : 0.0;

        log.info("[SCORE] fatigue={} tel={} ceinture={} tabac={} " +
                 "dist={} fcw={} ldw={} total={} graves={}",
                nbFatigue, nbTelephone, nbCeinture,
                nbTabagisme, nbDistraction,
                nbFcw, nbLdw, nbTotal, nbGraves);

        // Algorithme scoring
        double score = 0.0;
        score += Math.min(nbFatigue     * 0.08, 0.30);
        score += Math.min(nbTelephone   * 0.10, 0.20);
        score += Math.min(nbCeinture    * 0.05, 0.10);
        score += Math.min(nbTabagisme   * 0.03, 0.08);
        score += Math.min(nbDistraction * 0.04, 0.10);
        score += Math.min(nbHeadPose    * 0.03, 0.06);
        score += Math.min(nbFcw         * 0.06, 0.12);
        score += Math.min(nbLdw         * 0.03, 0.06);
        score += ratioGraves * 0.10;

        // Clamp [0.0, 1.0]
        score = Math.min(Math.max(score, 0.0), 1.0);

        // Niveau risque
        ScoreRisque.NiveauRisqueEnum niveau;
        if      (score < 0.25) niveau = ScoreRisque.NiveauRisqueEnum.FAIBLE;
        else if (score < 0.50) niveau = ScoreRisque.NiveauRisqueEnum.MODERE;
        else if (score < 0.75) niveau = ScoreRisque.NiveauRisqueEnum.ELEVE;
        else                   niveau = ScoreRisque.NiveauRisqueEnum.CRITIQUE;

        BigDecimal scoreVal = BigDecimal.valueOf(score)
                .setScale(4, RoundingMode.HALF_UP);

        log.info("[SCORE] score={} ({}%) niveau={}",
                scoreVal,
                scoreVal.multiply(BigDecimal.valueOf(100))
                        .setScale(1, RoundingMode.HALF_UP),
                niveau);

        // Sauvegarde scores_risque
        ScoreRisque sr = ScoreRisque.builder()
                .conducteurId(conducteurId)
                .dateCalcul(LocalDate.now())
                .heureCalcul(LocalTime.now())
                .scoreValeur(scoreVal)
                .niveauRisque(niveau)
                .nbFatigue(nbFatigue)
                .nbTelephone(nbTelephone)
                .nbCeinture(nbCeinture)
                .nbTabagisme(nbTabagisme)
                .nbDistraction(nbDistraction)
                .nbHeadPose(nbHeadPose)
                .nbFcw(nbFcw)
                .nbLdw(nbLdw)
                .nbTotal(nbTotal)
                // vitesseMoyenne SUPPRIMÉ
                .ratioGraves(BigDecimal.valueOf(ratioGraves)
                        .setScale(4, RoundingMode.HALF_UP))
                .timestamp(OffsetDateTime.now())
                .build();

        scoreRepo.save(sr);
        log.info("[SCORE] INSERT scores_risque OK");

        // Mise à jour score_journalier
        conducteurRepo.findById(conducteurId).ifPresent(c -> {
            c.setScoreJournalier(scoreVal);
            c.setDateModification(OffsetDateTime.now());
            conducteurRepo.save(c);
            log.info("[SCORE] UPDATE score_journalier={}", scoreVal);
        });
    }

    public Optional<ScoreRisque> getScoreActuel(String conducteurId) {
        return scoreRepo
                .findTopByConducteurIdOrderByTimestampDesc(conducteurId);
    }

    public List<ScoreRisque> getHistorique7Jours(String conducteurId) {
        LocalDate fin   = LocalDate.now();
        LocalDate debut = fin.minusDays(7);
        return scoreRepo
                .findByConducteurIdAndDateCalculBetweenOrderByDateCalculDesc(
                        conducteurId, debut, fin);
    }
}