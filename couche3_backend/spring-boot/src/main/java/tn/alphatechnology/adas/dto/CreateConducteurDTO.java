package tn.alphatechnology.adas.dto;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO création conducteur par GestionnaireFlotte
 *
 * RÈGLES FORMAT ID :
 *   Format : C + chiffres uniquement
 *   Exemples valides   : C10, C11, C15, C26, C112
 *   Exemples invalides : COND01, C-10, 10, c10
 *
 * CHAMPS IMMUABLES après création (côté conducteur) :
 *   id, nom, prenom, nom_vehicule
 *
 * CHAMPS MODIFIABLES par conducteur :
 *   email, telephone, mot_de_passe
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateConducteurDTO {

    /**
     * ID conducteur — format obligatoire C + chiffres
     * Ex: C10, C15, C26
     */
    @NotBlank(message = "L'identifiant est obligatoire")
    @Pattern(
        regexp  = "^C[0-9]+$",
        message = "Format ID invalide. Attendu: C + chiffres. Ex: C10, C15, C26"
    )
    private String id;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 100, message = "Nom : 2 à 100 caractères")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 100, message = "Prénom : 2 à 100 caractères")
    private String prenom;

    @Min(value = 18, message = "Âge minimum : 18 ans")
    @Max(value = 80, message = "Âge maximum : 80 ans")
    private Integer age;

    private String telephone;
    private String email;

    @NotBlank(message = "Le nom du véhicule est obligatoire")
    @Size(max = 100, message = "Nom véhicule : maximum 100 caractères")
    private String nomVehicule;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Mot de passe : minimum 8 caractères")
    private String motDePasse;
}