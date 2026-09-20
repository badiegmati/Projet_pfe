package tn.alphatechnology.adas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LoginDTO {

    @NotBlank(message = "L'identifiant est obligatoire")
    private String id;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;
}