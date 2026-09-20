package tn.alphatechnology.adas.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "journal_evenements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JournalEvenement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conducteur_id", nullable = false, length = 20)
    private String conducteurId;

    @Column(name = "date_journee", nullable = false)
    private LocalDate dateJournee;

    @Builder.Default
    @Column(name = "nb_evenements", nullable = false)
    private Integer nbEvenements = 0;
}