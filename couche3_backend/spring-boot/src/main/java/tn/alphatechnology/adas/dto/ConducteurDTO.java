
package tn.alphatechnology.adas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO Conducteur — Réponse API (sans mot de passe)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConducteurDTO {

    private String     id;
    private String     nom;
    private String     prenom;
    private Integer    age;
    private String     telephone;
    private String     email;
    private String     nomVehicule;
    private BigDecimal scoreJournalier;
    private Double     scorePct;
    private String     niveauRisque;
    private Boolean    enLigne;
    private Boolean    actif;
    private String     gestionnaireId;
    private Instant    dateCreation;
}