package tn.alphatechnology.adas.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginResponseDTO {
    private String token;
    private String id;
    private String role;
    private String nom;
    private String prenom;
    private String telephone;
    private String nomVehicule;
}