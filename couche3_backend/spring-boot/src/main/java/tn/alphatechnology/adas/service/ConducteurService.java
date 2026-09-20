package tn.alphatechnology.adas.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.alphatechnology.adas.dto.UpdateConducteurDTO;
import tn.alphatechnology.adas.entity.*;
import tn.alphatechnology.adas.repository.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;

/**
 * ConducteurService — adapté sans colonnes actif/en_ligne
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConducteurService {

    private final ConducteurRepository       conducteurRepo;
    private final EvenementRepository        evenementRepo;
    private final NotificationRepository     notificationRepo;
    private final JournalEvenementRepository journalRepo;
    private final PasswordEncoder            passwordEncoder;

public Conducteur getProfil(String conducteurId) {
    Conducteur cond = conducteurRepo.findById(conducteurId)
            .orElseThrow(() -> new RuntimeException(
                    "Conducteur introuvable : " + conducteurId));
    cond.setMotDePasse(null);
    return cond;
}

    @Transactional
    public Conducteur modifierProfil(String conducteurId,
                                      UpdateConducteurDTO dto) {
        Conducteur cond = getProfil(conducteurId);
        boolean modifie = false;

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            cond.setEmail(dto.getEmail());
            modifie = true;
        }
        if (dto.getTelephone() != null && !dto.getTelephone().isBlank()) {
            cond.setTelephone(dto.getTelephone());
            modifie = true;
        }
        if (dto.getMotDePasse() != null && !dto.getMotDePasse().isBlank()) {
            if (dto.getMotDePasse().length() < 8) {
                throw new RuntimeException(
                        "Mot de passe trop court (minimum 8 caracteres)");
            }
            cond.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
            modifie = true;
        }

        if (modifie) {
            cond.setDateModification(OffsetDateTime.now());
        }
        return conducteurRepo.save(cond);
    }

    public boolean conducteurExiste(String conducteurId) {
        // MODIFICATION : existsById() sans actif
        return conducteurRepo.existsById(conducteurId);
    }

    public List<Evenement> getEvenements(String conducteurId) {
        return evenementRepo
                .findByConducteurIdOrderByDateHeureDesc(conducteurId);
    }

    public List<Notification> getNotifications(String conducteurId) {
        return notificationRepo
                .findByConducteurIdOrderByDateEnvoiDesc(conducteurId);
    }

    public long countNotificationsNonLues(String conducteurId) {
        return notificationRepo
                .countByConducteurIdAndLueFalse(conducteurId);
    }

    @Transactional
    public void marquerNotificationLue(Long notifId) {
        notificationRepo.findById(notifId).ifPresent(n -> {
            n.setLue(true);
            notificationRepo.save(n);
        });
    }
// Dans ConducteurService.java
// AVANT (problème) :
OffsetDateTime depuis = OffsetDateTime.now().minusDays(7);

// APRÈS (correction) — utiliser tous les événements :
public Map<String, Object> getTableauBord(String conducteurId) {
    Conducteur cond = getProfil(conducteurId);

    // CORRECTION : tous les événements (pas de filtre 7j)
    List<Evenement> tousEvenements = evenementRepo
            .findByConducteurIdOrderByDateHeureDesc(conducteurId);

    // Événements 7 derniers jours (pour comparaison)
    OffsetDateTime depuis7j = OffsetDateTime.now().minusDays(7);
    List<Evenement> evenements7j = evenementRepo
            .findByConducteurIdAndDateHeureAfter(conducteurId, depuis7j);

    long nbFatigue    = tousEvenements.stream()
            .filter(e -> e.getTypeEvenement().startsWith("FATIGUE")).count();
    long nbPhone      = tousEvenements.stream()
            .filter(e -> "PHONE".equals(e.getTypeEvenement())).count();
    long nbSeatbelt   = tousEvenements.stream()
            .filter(e -> "SEATBELT".equals(e.getTypeEvenement())).count();
    long nbSmoking    = tousEvenements.stream()
            .filter(e -> "SMOKING".equals(e.getTypeEvenement())).count();
    long nbDistract   = tousEvenements.stream()
            .filter(e -> "DISTRACTION".equals(e.getTypeEvenement())).count();
    long nbFcw        = tousEvenements.stream()
            .filter(e -> e.getTypeEvenement().startsWith("FCW")).count();
    long nbLdw        = tousEvenements.stream()
            .filter(e -> e.getTypeEvenement().startsWith("LDW")).count();

    Optional<JournalEvenement> journal = journalRepo
            .findByConducteurIdAndDateJournee(conducteurId, LocalDate.now());

    Map<String, Object> tableau = new LinkedHashMap<>();
    tableau.put("conducteurId",        conducteurId);
    tableau.put("nom",                 cond.getNom());
    tableau.put("prenom",              cond.getPrenom());
    tableau.put("nomVehicule",         cond.getNomVehicule());
    tableau.put("scoreJournalier",     cond.getScoreJournalier());

    Map<String, Long> dms = new LinkedHashMap<>();
    dms.put("fatigue",     nbFatigue);
    dms.put("telephone",   nbPhone);
    dms.put("ceinture",    nbSeatbelt);
    dms.put("tabagisme",   nbSmoking);
    dms.put("distraction", nbDistract);
    dms.put("totalDms",    nbFatigue + nbPhone + nbSeatbelt
                          + nbSmoking + nbDistract);
    tableau.put("dms", dms);

    Map<String, Long> adas = new LinkedHashMap<>();
    adas.put("fcw",       nbFcw);
    adas.put("ldw",       nbLdw);
    adas.put("totalAdas", nbFcw + nbLdw);
    tableau.put("adas", adas);

    tableau.put("totalEvenements",     tousEvenements.size());
    tableau.put("evenements7Jours",    evenements7j.size());
    tableau.put("evenementsAujourdhui",
            journal.map(JournalEvenement::getNbEvenements).orElse(0));
    tableau.put("notificationsNonLues",
            countNotificationsNonLues(conducteurId));

    return tableau;

    }
}