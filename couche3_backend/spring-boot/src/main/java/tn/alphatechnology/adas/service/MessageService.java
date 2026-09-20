package tn.alphatechnology.adas.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.alphatechnology.adas.dto.MessageDTO;
import tn.alphatechnology.adas.entity.Message;
import tn.alphatechnology.adas.repository.MessageRepository;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * MessageService — Messagerie GestionnaireFlotte ↔ Conducteur
 */
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepo;

    /**
     * Envoyer un message
     * dto.getDestinatairesId() ← champ destinatairesId dans MessageDTO
     */
    @Transactional
    public Message envoyerMessage(MessageDTO dto) {
        Message msg = Message.builder()
                .expediteurId(dto.getExpediteurId())
                .destinataireId(dto.getDestinatairesId())
                .contenu(dto.getContenu())
                .dateEnvoi(OffsetDateTime.now())
                .lu(false)
                .statut(Message.StatutMsgEnum.ENVOYE)
                .idMessageParent(dto.getIdMessageParent())
                .build();
        return messageRepo.save(msg);
    }

    /**
     * Conversation bidirectionnelle entre deux utilisateurs
     */
    public List<Message> getConversation(String id1, String id2) {
        return messageRepo.findConversation(id1, id2);
    }

    /**
     * Messages reçus par un destinataire
     */
    public List<Message> getMessagesRecus(String destinataireId) {
        return messageRepo
                .findByDestinataireIdOrderByDateEnvoiDesc(destinataireId);
    }

    /**
     * Marquer un message comme lu
     */
    @Transactional
    public void marquerLu(Long messageId) {
        messageRepo.findById(messageId).ifPresent(msg -> {
            msg.setLu(true);
            msg.setStatut(Message.StatutMsgEnum.LU);
            messageRepo.save(msg);
        });
    }
}