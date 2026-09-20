package tn.alphatechnology.adas.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.*;

/**
 * Entité ScoreRisque — FIX ENUM PostgreSQL
 * niveau_risque → VARCHAR(10) au lieu de niveau_risque_enum
 */
@Entity
@Table(name = "scores_risque")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ScoreRisque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conducteur_id", nullable = false, length = 20)
    private String conducteurId;

    @Column(name = "date_calcul", nullable = false)
    private LocalDate dateCalcul;

    @Column(name = "heure_calcul", nullable = false)
    private LocalTime heureCalcul;

    @Column(name = "score_valeur", nullable = false,
            precision = 5, scale = 4)
    private BigDecimal scoreValeur;

    /**
     * FIX : length = 10 sans columnDefinition enum
     * PostgreSQL colonne modifiée en VARCHAR(10)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "niveau_risque", nullable = false, length = 10)
    private NiveauRisqueEnum niveauRisque;

    @Builder.Default @Column(name = "nb_fatigue")
    private Integer nbFatigue = 0;

    @Builder.Default @Column(name = "nb_telephone")
    private Integer nbTelephone = 0;

    @Builder.Default @Column(name = "nb_ceinture")
    private Integer nbCeinture = 0;

    @Builder.Default @Column(name = "nb_tabagisme")
    private Integer nbTabagisme = 0;

    @Builder.Default @Column(name = "nb_distraction")
    private Integer nbDistraction = 0;

    @Builder.Default @Column(name = "nb_head_pose")
    private Integer nbHeadPose = 0;

    @Builder.Default @Column(name = "nb_fcw")
    private Integer nbFcw = 0;

    @Builder.Default @Column(name = "nb_ldw")
    private Integer nbLdw = 0;

    @Builder.Default @Column(name = "nb_total")
    private Integer nbTotal = 0;

    @Builder.Default
    @Column(name = "ratio_graves", precision = 5, scale = 4)
    private BigDecimal ratioGraves = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "timestamp", nullable = false)
    private OffsetDateTime timestamp = OffsetDateTime.now();

    public enum NiveauRisqueEnum { FAIBLE, MODERE, ELEVE, CRITIQUE }
}