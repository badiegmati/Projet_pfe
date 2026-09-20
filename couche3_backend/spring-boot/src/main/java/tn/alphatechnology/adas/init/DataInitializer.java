package tn.alphatechnology.adas.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import tn.alphatechnology.adas.entity.*;
import tn.alphatechnology.adas.repository.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AdministrateurRepository     adminRepo;
    private final GestionnaireFlotteRepository gestRepo;
    private final ConducteurRepository         conducteurRepo;
    private final ScoreRisqueRepository        scoreRepo;
    private final PasswordEncoder              passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("[INIT] Base : dms-adas2 — Initialisation...");
        creerAdministrateur();
        creerGestionnaireTest();
        creerConducteurC10();
        creerConducteurC12();
        creerConducteurC16();
        creerScoresTestC10();
        creerScoresTestC12();
        log.info("[INIT] Comptes :");
        log.info("[INIT]   ADMIN  : 00000000 / Admis123456");
        log.info("[INIT]   GEST   : G1       / Gest123456");
        log.info("[INIT]   COND   : C10      / Cond123456");
        log.info("[INIT]   COND   : C12      / Cond123456");
        log.info("[INIT]   COND   : C16      / Cond123456");
    }

    private void creerAdministrateur() {
        String hash = passwordEncoder.encode("Admis123456");
        if (!adminRepo.existsById("00000000")) {
            Administrateur a = new Administrateur();
            a.setId("00000000");
            a.setMotDePasse(hash);
            a.setActif(true);
            a.setDateCreation(OffsetDateTime.now());
            adminRepo.save(a);
            log.info("[INIT] Admin 00000000 cree");
        } else {
            adminRepo.findById("00000000").ifPresent(a -> {
                a.setMotDePasse(hash);
                adminRepo.save(a);
                log.info("[INIT] Admin 00000000 hash mis a jour");
            });
        }
    }

    private void creerGestionnaireTest() {
        String hash = passwordEncoder.encode("Gest123456");
        if (!gestRepo.existsById("G1")) {
            GestionnaireFlotte g = GestionnaireFlotte.builder()
                    .id("G1")
                    .nomGestionnaire("BenAli Mohamed")
                    .motDePasse(hash)
                    .email("benali.mohamed@alphatech.tn")
                    .telephone("+216 71 000 001")
                    .creeParAdmin("00000000")
                    .dateCreation(OffsetDateTime.now())
                    .dateModification(OffsetDateTime.now())
                    .build();
            gestRepo.save(g);
            log.info("[INIT] Gestionnaire G1 cree");
        } else {
            gestRepo.findById("G1").ifPresent(g -> {
                g.setMotDePasse(hash);
                gestRepo.save(g);
                log.info("[INIT] G1 hash mis a jour");
            });
        }
    }

    private void creerConducteurC10() {
        String hash = passwordEncoder.encode("Cond123456");
        if (!conducteurRepo.existsById("C10")) {
            Conducteur c = Conducteur.builder()
                    .id("C10")
                    .nom("Trabelsi")
                    .prenom("Ahmed")
                    .age(32)
                    .telephone("+216 55 000 010")
                    .email("ahmed.trabelsi@gmail.com")
                    .nomVehicule("Toyota Corolla 2022")
                    .motDePasse(hash)
                    .scoreJournalier(BigDecimal.ZERO)
                    .creeParGestionnaire("G1")
                    .dateCreation(OffsetDateTime.now())
                    .dateModification(OffsetDateTime.now())
                    .build();
            conducteurRepo.save(c);
            log.info("[INIT] Conducteur C10 cree");
        } else {
            conducteurRepo.findById("C10").ifPresent(c -> {
                c.setMotDePasse(hash);
                conducteurRepo.save(c);
                log.info("[INIT] C10 hash mis a jour");
            });
        }
    }

    private void creerConducteurC12() {
        String hash = passwordEncoder.encode("Cond123456");
        if (!conducteurRepo.existsById("C12")) {
            Conducteur c = Conducteur.builder()
                    .id("C12")
                    .nom("Mansouri")
                    .prenom("Sami")
                    .age(28)
                    .telephone("+216 55 000 012")
                    .email("sami.mansouri@gmail.com")
                    .nomVehicule("Volkswagen Golf 2021")
                    .motDePasse(hash)
                    .scoreJournalier(BigDecimal.ZERO)
                    .creeParGestionnaire("G1")
                    .dateCreation(OffsetDateTime.now())
                    .dateModification(OffsetDateTime.now())
                    .build();
            conducteurRepo.save(c);
            log.info("[INIT] Conducteur C12 cree");
        } else {
            conducteurRepo.findById("C12").ifPresent(c -> {
                c.setMotDePasse(hash);
                conducteurRepo.save(c);
                log.info("[INIT] C12 hash mis a jour");
            });
        }
    }

    private void creerConducteurC16() {
        String hash = passwordEncoder.encode("Cond123456");
        if (!conducteurRepo.existsById("C16")) {
            Conducteur c = Conducteur.builder()
                    .id("C16")
                    .nom("Khelifi")
                    .prenom("Youssef")
                    .age(35)
                    .telephone("+216 55 000 016")
                    .email("youssef.khelifi@gmail.com")
                    .nomVehicule("Peugeot 308 2020")
                    .motDePasse(hash)
                    .scoreJournalier(BigDecimal.ZERO)
                    .creeParGestionnaire("G1")
                    .dateCreation(OffsetDateTime.now())
                    .dateModification(OffsetDateTime.now())
                    .build();
            conducteurRepo.save(c);
            log.info("[INIT] Conducteur C16 cree");
        } else {
            conducteurRepo.findById("C16").ifPresent(c -> {
                c.setMotDePasse(hash);
                conducteurRepo.save(c);
                log.info("[INIT] C16 hash mis a jour");
            });
        }
    }

    private void creerScoresTestC10() {
        try {
            LocalDate today = LocalDate.now();
            LocalDate debut = today.minusDays(6);
            List<ScoreRisque> existants = scoreRepo
                    .findByConducteurIdAndDateCalculBetweenOrderByDateCalculDesc(
                            "C10", debut, today);
            scoreRepo.deleteAll(existants);
            for (int i = 6; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                double scoreVal = 0.10 + (0.15 * (6 - i));
                ScoreRisque score = ScoreRisque.builder()
                        .conducteurId("C10")
                        .dateCalcul(date)
                        .heureCalcul(LocalTime.of(8, 0))
                        .scoreValeur(BigDecimal.valueOf(scoreVal)
                                .setScale(4, java.math.RoundingMode.HALF_UP))
                        .niveauRisque(
                            scoreVal < 0.25 ? ScoreRisque.NiveauRisqueEnum.FAIBLE :
                            scoreVal < 0.50 ? ScoreRisque.NiveauRisqueEnum.MODERE :
                            scoreVal < 0.75 ? ScoreRisque.NiveauRisqueEnum.ELEVE :
                                              ScoreRisque.NiveauRisqueEnum.CRITIQUE)
                        .nbFatigue((int)(5 * scoreVal))
                        .nbTelephone((int)(3 * scoreVal))
                        .nbCeinture((int)(2 * scoreVal))
                        .nbTabagisme(0)
                        .nbDistraction((int)(4 * scoreVal))
                        .nbHeadPose((int)(2 * scoreVal))
                        .nbFcw((int)(3 * scoreVal))
                        .nbLdw((int)(2 * scoreVal))
                        .nbTotal((int)(25 * scoreVal))
                        .ratioGraves(BigDecimal.valueOf(scoreVal * 0.5)
                                .setScale(4, java.math.RoundingMode.HALF_UP))
                        .timestamp(OffsetDateTime.now())
                        .build();
                scoreRepo.save(score);
            }
            log.info("[INIT] 7 scores de test crees pour C10");
        } catch (Exception e) {
            log.warn("[INIT] Erreur creation scores C10: {}", e.getMessage());
        }
    }

    private void creerScoresTestC12() {
        try {
            LocalDate today = LocalDate.now();
            LocalDate debut = today.minusDays(6);
            List<ScoreRisque> existants = scoreRepo
                    .findByConducteurIdAndDateCalculBetweenOrderByDateCalculDesc(
                            "C12", debut, today);
            scoreRepo.deleteAll(existants);
            for (int i = 6; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                double scoreVal = 0.20 + (0.10 * (6 - i));
                ScoreRisque score = ScoreRisque.builder()
                        .conducteurId("C12")
                        .dateCalcul(date)
                        .heureCalcul(LocalTime.of(8, 0))
                        .scoreValeur(BigDecimal.valueOf(scoreVal)
                                .setScale(4, java.math.RoundingMode.HALF_UP))
                        .niveauRisque(
                            scoreVal < 0.25 ? ScoreRisque.NiveauRisqueEnum.FAIBLE :
                            scoreVal < 0.50 ? ScoreRisque.NiveauRisqueEnum.MODERE :
                            scoreVal < 0.75 ? ScoreRisque.NiveauRisqueEnum.ELEVE :
                                              ScoreRisque.NiveauRisqueEnum.CRITIQUE)
                        .nbFatigue((int)(4 * scoreVal))
                        .nbTelephone((int)(2 * scoreVal))
                        .nbCeinture((int)(1 * scoreVal))
                        .nbTabagisme(0)
                        .nbDistraction((int)(3 * scoreVal))
                        .nbHeadPose((int)(1 * scoreVal))
                        .nbFcw((int)(2 * scoreVal))
                        .nbLdw((int)(1 * scoreVal))
                        .nbTotal((int)(20 * scoreVal))
                        .ratioGraves(BigDecimal.valueOf(scoreVal * 0.4)
                                .setScale(4, java.math.RoundingMode.HALF_UP))
                        .timestamp(OffsetDateTime.now())
                        .build();
                scoreRepo.save(score);
            }
            log.info("[INIT] 7 scores de test crees pour C12");
        } catch (Exception e) {
            log.warn("[INIT] Erreur creation scores C12: {}", e.getMessage());
        }
    }
}