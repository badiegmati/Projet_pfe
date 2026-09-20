package tn.alphatechnology.adas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.alphatechnology.adas.entity.Notification;

import java.util.List;

/**
 * Repository Notification
 */
@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    /** Toutes les notifications d'un conducteur (récentes en premier) */
    List<Notification> findByConducteurIdOrderByDateEnvoiDesc(
            String conducteurId);

    /** Notifications non lues */
    long countByConducteurIdAndLueFalse(String conducteurId);

    List<Notification> findByConducteurIdAndLueFalseOrderByDateEnvoiDesc(
            String conducteurId);
}