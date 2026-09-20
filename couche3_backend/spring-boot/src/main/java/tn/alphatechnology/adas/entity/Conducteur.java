package tn.alphatechnology.adas.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Entité Conducteur
 * MODIFICATION : suppression colonnes actif et en_ligne
 * (absentes de la table dms-adas2)
 */
@Entity
@Table(name = "conducteurs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Conducteur {

    @Id
    @Column(name = "id", length = 20)
    private String id;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "prenom", nullable = false, length = 100)
    private String prenom;

    @Column(name = "age")
    private Integer age;

    @Builder.Default
    @Column(name = "telephone", nullable = false, length = 20)
    private String telephone = "";

    @Builder.Default
    @Column(name = "email", nullable = false, length = 200)
    private String email = "";

    @Column(name = "nom_vehicule", nullable = false, length = 100)
    private String nomVehicule;

    @Column(name = "mot_de_passe", nullable = false, length = 255)
    private String motDePasse;

    @Builder.Default
    @Column(name = "score_journalier", nullable = false,
            precision = 5, scale = 4)
    private BigDecimal scoreJournalier = BigDecimal.ZERO;

    // en_ligne SUPPRIMÉ — absent de la table dms-adas2
    // actif    SUPPRIMÉ — absent de la table dms-adas2

    @Column(name = "cree_par_gestionnaire", nullable = false, length = 20)
    private String creeParGestionnaire;

    @Builder.Default
    @Column(name = "date_creation", nullable = false, updatable = false)
    private OffsetDateTime dateCreation = OffsetDateTime.now();

    @Builder.Default
    @Column(name = "date_modification")
    private OffsetDateTime dateModification = OffsetDateTime.now();
}