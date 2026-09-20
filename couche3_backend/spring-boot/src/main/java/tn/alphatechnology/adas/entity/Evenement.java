package tn.alphatechnology.adas.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Entité Evenement — FIX ENUM PostgreSQL
 *
 * PROBLÈME : PostgreSQL a des types categorie_enum et severite_enum
 * SOLUTION : Changer columnDefinition de "categorie_enum" → "VARCHAR(10)"
 *            et utiliser @Enumerated(EnumType.STRING)
 *            PostgreSQL accepte VARCHAR là où un enum est attendu
 *            via cast implicite si on change la colonne en VARCHAR
 *
 * ALTERNATIVE CHOISIE : Modifier les colonnes PostgreSQL en VARCHAR
 * (plus simple que configurer un custom UserType Hibernate)
 */
@Entity
@Table(name = "evenements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Evenement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "supabase_id", unique = true)
    private Long supabaseId;

    @Column(name = "conducteur_id", nullable = false, length = 20)
    private String conducteurId;

    @Column(name = "vehicule_nom", length = 100)
    private String vehiculeNom;

    @Column(name = "type_evenement", nullable = false, length = 50)
    private String typeEvenement;

    /**
     * FIX : columnDefinition = "VARCHAR(10)" au lieu de "categorie_enum"
     * La colonne PostgreSQL sera modifiée en VARCHAR
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "categorie", nullable = false, length = 10)
    private CategorieEnum categorie;

    @Column(name = "date_heure", nullable = false)
    private OffsetDateTime dateHeure;

    @Builder.Default
    @Column(name = "duree_secondes", precision = 8, scale = 2)
    private BigDecimal dureeSecondes = BigDecimal.ZERO;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    /**
     * FIX : columnDefinition = "VARCHAR(10)" au lieu de "severite_enum"
     */
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "severite", nullable = false, length = 10)
    private SeveriteEnum severite = SeveriteEnum.MODERE;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public enum CategorieEnum { DMS, ADAS }
    public enum SeveriteEnum  { FAIBLE, MODERE, ELEVE, CRITIQUE }
}