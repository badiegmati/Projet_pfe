package tn.alphatechnology.adas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO Score de risque
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreDTO {

    private Long       id;
    private String     conducteurId;
    private LocalDate  dateCalcul;
    private BigDecimal scoreValeur;
    private Double     scorePct;
    private String     niveauRisque;
    private int        nbFatigue;
    private int        nbTelephone;
    private int        nbCeinture;
    private int        nbTabagisme;
    private int        nbDistraction;
    private int        nbHeadPose;
    private int        nbFcw;
    private int        nbLdw;
    private int        nbTotal;
    private BigDecimal vitesseMoyenne;
    private BigDecimal ratioGraves;
}