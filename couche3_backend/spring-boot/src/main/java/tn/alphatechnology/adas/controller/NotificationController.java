package tn.alphatechnology.adas.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.alphatechnology.adas.service.ConducteurService;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final ConducteurService conducteurService;

    /** GET /api/notifications/{conducteurId} */
    @GetMapping("/{conducteurId}")
    public ResponseEntity<?> getAll(@PathVariable String conducteurId) {
        return ResponseEntity.ok(
                conducteurService.getNotifications(conducteurId));
    }

    /** GET /api/notifications/{conducteurId}/non-lues — count pour badge */
    @GetMapping("/{conducteurId}/non-lues")
    public ResponseEntity<Map<String, Long>> countNonLues(
            @PathVariable String conducteurId) {
        long count = conducteurService
                .countNotificationsNonLues(conducteurId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /** PUT /api/notifications/{id}/lu */
    @PutMapping("/{id}/lu")
    public ResponseEntity<Void> marquerLue(@PathVariable Long id) {
        conducteurService.marquerNotificationLue(id);
        return ResponseEntity.ok().build();
    }
}