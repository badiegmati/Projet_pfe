package tn.alphatechnology.adas.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

/**
 * Entité Vehicule
 * MODIFICATION : suppression colonne actif
 * (absente de la table vehicules dans dms-adas2)
 */
@Entity
@Table(name = "vehicules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Vehicule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_vehicule", nullable = false, length = 100)
    private String nomVehicule;

    @Column(name = "immatriculation", length = 20)
    private String immatriculation;

    @Builder.Default
    @Column(name = "marque", length = 50)
    private String marque = "Inconnu";

    @Builder.Default
    @Column(name = "modele", length = 50)
    private String modele = "Inconnu";

    @Column(name = "annee")
    private Integer annee;

    @Column(name = "conducteur_id", length = 20)
    private String conducteurId;

    // actif SUPPRIMÉ — absent de la table dms-adas2

    @Column(name = "cree_par_gestionnaire", length = 20)
    private String creeParGestionnaire;

    @Builder.Default
    @Column(name = "date_creation", nullable = false, updatable = false)
    private OffsetDateTime dateCreation = OffsetDateTime.now();
}