package tn.alphatechnology.adas.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.alphatechnology.adas.entity.Notification;
import tn.alphatechnology.adas.repository.NotificationRepository;

import java.util.List;
import java.util.Map;

/**
 * Service Notification
 * CORRECTION : getNonLuesCount() — ne pas parser conducteurId en Long
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notifRepo;

    public List<Notification> getNotifications(String conducteurId) {
        return notifRepo
                .findByConducteurIdOrderByDateEnvoiDesc(conducteurId);
    }

    /**
     * CORRECTION : conducteurId est un String (ex: "C10")
     * Ne pas faire Long.parseLong() — retourner directement
     */
    public Map<String, Object> getNonLuesCount(String conducteurId) {
        long count = notifRepo
                .countByConducteurIdAndLueFalse(conducteurId);
        return Map.of(
                "nonLues",      count,
                "conducteurId", conducteurId
        );
    }

    @Transactional
    public Notification marquerLue(Long id) {
        Notification notif = notifRepo.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Notification non trouvée : " + id));
        notif.setLue(true);
        return notifRepo.save(notif);
    }
}