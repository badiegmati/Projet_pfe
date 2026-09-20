package tn.alphatechnology.adas.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateGestionnaireDTO {

    @NotBlank(message = "L'ID est obligatoire")
    private String id;

    @NotBlank(message = "Le nom est obligatoire")
    private String nomGestionnaire;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Mot de passe : minimum 8 caractères")
    private String motDePasse;

    private String email;
    private String telephone;
}