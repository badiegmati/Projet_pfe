package tn.alphatechnology.adas.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Entité Notification
 * MODIFICATION : suppression colonne vitesse_kmh
 * (absente de la table notifications dans dms-adas2)
 */
@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conducteur_id", nullable = false, length = 20)
    private String conducteurId;

    @Column(name = "titre", nullable = false, length = 200)
    private String titre;

    @Column(name = "corps", columnDefinition = "TEXT")
    private String corps;

    @Column(name = "type_alerte", length = 50)
    private String typeAlerte;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    // vitesse_kmh SUPPRIMÉ — absent de la table dms-adas2

    @Builder.Default
    @Column(name = "lue", nullable = false)
    private Boolean lue = false;

    @Builder.Default
    @Column(name = "date_envoi", nullable = false)
    private OffsetDateTime dateEnvoi = OffsetDateTime.now();
}