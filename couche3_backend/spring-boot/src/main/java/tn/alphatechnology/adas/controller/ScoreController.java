package tn.alphatechnology.adas.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.alphatechnology.adas.service.ScoreService;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;

    /** GET /api/scores/{conducteurId}/actuel */
    @GetMapping("/{conducteurId}/actuel")
    public ResponseEntity<?> getActuel(@PathVariable String conducteurId) {
        return scoreService.getScoreActuel(conducteurId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/scores/{conducteurId}/historique */
    @GetMapping("/{conducteurId}/historique")
    public ResponseEntity<?> getHistorique(@PathVariable String conducteurId) {
        return ResponseEntity.ok(
                scoreService.getHistorique7Jours(conducteurId));
    }
}