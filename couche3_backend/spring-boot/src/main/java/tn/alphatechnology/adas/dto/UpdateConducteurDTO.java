package tn.alphatechnology.adas.dto;

import lombok.*;

/** Seuls email, telephone, mot_de_passe modifiables */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateConducteurDTO {
    private String email;
    private String telephone;
    private String motDePasse;
}