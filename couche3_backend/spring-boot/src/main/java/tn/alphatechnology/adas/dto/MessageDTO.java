package tn.alphatechnology.adas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * DTO pour l'envoi d'un message
 * champ : destinatairesId → getter Lombok : getDestinatairesId()
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {

    @NotBlank(message = "L'expéditeur est obligatoire")
    private String expediteurId;

    @NotBlank(message = "Le destinataire est obligatoire")
    private String destinatairesId;

    @NotBlank(message = "Le contenu est obligatoire")
    private String contenu;

    private Long idMessageParent;
}