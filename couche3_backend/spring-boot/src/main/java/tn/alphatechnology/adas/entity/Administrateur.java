package tn.alphatechnology.adas.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "administrateurs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Administrateur {

    @Id
    @Column(name = "id", length = 20)
    private String id;

    @Column(name = "mot_de_passe", nullable = false, length = 255)
    private String motDePasse;

    @Builder.Default
    @Column(name = "actif", nullable = false)
    private Boolean actif = true;

    @Builder.Default
    @Column(name = "date_creation", nullable = false, updatable = false)
    private OffsetDateTime dateCreation = OffsetDateTime.now();
}