package tn.alphatechnology.adas.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

/**
 * Entité GestionnaireFlotte
 * MODIFICATION : suppression colonne actif
 * (absente de la table dms-adas2)
 */
@Entity
@Table(name = "gestionnaires_flotte")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GestionnaireFlotte {

    @Id
    @Column(name = "id", length = 20)
    private String id;

    @Column(name = "nom_gestionnaire", nullable = false, length = 100)
    private String nomGestionnaire;

    @Column(name = "mot_de_passe", nullable = false, length = 255)
    private String motDePasse;

    @Builder.Default
    @Column(name = "email", nullable = false, length = 200)
    private String email = "";

    @Builder.Default
    @Column(name = "telephone", nullable = false, length = 20)
    private String telephone = "";

    // actif SUPPRIMÉ — absent de la table dms-adas2

    @Column(name = "cree_par_admin", nullable = false, length = 20)
    private String creeParAdmin;

    @Builder.Default
    @Column(name = "date_creation", nullable = false, updatable = false)
    private OffsetDateTime dateCreation = OffsetDateTime.now();

    @Builder.Default
    @Column(name = "date_modification")
    private OffsetDateTime dateModification = OffsetDateTime.now();
}