package tn.alphatechnology.adas.dto;

import lombok.*;

/** Seuls email et telephone sont modifiables */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateGestionnaireDTO {
    private String email;
    private String telephone;
}