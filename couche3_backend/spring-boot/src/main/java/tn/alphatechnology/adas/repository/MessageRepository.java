package tn.alphatechnology.adas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.alphatechnology.adas.entity.Message;
import java.util.List;

/**
 * MessageRepository
 * Entité Message : champ destinataireId (sans 's')
 * Méthodes dérivées : findByDestinatairesId... ← Spring Data lit le champ Java
 */
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Conversation bidirectionnelle A ↔ B
     */
    @Query("""
        SELECT m FROM Message m
        WHERE (m.expediteurId = :id1 AND m.destinataireId = :id2)
           OR (m.expediteurId = :id2 AND m.destinataireId = :id1)
        ORDER BY m.dateEnvoi ASC
    """)
    List<Message> findConversation(
            @Param("id1") String id1,
            @Param("id2") String id2);

    /**
     * Messages reçus — dérivé du champ Java destinataireId
     * Spring Data : findBy + DestinataireId + OrderBy + DateEnvoi + Desc
     */
    List<Message> findByDestinataireIdOrderByDateEnvoiDesc(
            String destinataireId);

    /**
     * Messages non lus pour un destinataire
     */
    List<Message> findByDestinataireIdAndLuFalse(String destinataireId);
}