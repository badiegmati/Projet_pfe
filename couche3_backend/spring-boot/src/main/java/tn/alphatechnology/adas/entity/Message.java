package tn.alphatechnology.adas.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "expediteur_id", nullable = false, length = 20)
    private String expediteurId;

    @Column(name = "destinataire_id", nullable = false, length = 20)
    private String destinataireId;

    @Column(name = "contenu", nullable = false, columnDefinition = "TEXT")
    private String contenu;

    @Builder.Default
    @Column(name = "date_envoi", nullable = false)
    private OffsetDateTime dateEnvoi = OffsetDateTime.now();

    @Builder.Default
    @Column(name = "lu", nullable = false)
    private Boolean lu = false;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 10)
    private StatutMsgEnum statut = StatutMsgEnum.ENVOYE;

    @Column(name = "id_message_parent")
    private Long idMessageParent;

    public enum StatutMsgEnum { ENVOYE, LU, REPONDU }
}