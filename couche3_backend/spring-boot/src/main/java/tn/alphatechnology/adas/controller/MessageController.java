package tn.alphatechnology.adas.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import tn.alphatechnology.adas.dto.MessageDTO;
import tn.alphatechnology.adas.service.MessageService;
import java.util.Map;

/**
 * MessageController — Messagerie GestionnaireFlotte ↔ Conducteur
 */
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    /**
     * POST /api/messages
     * Body : { "expediteurId":"G1",
     *          "destinatairesId":"C10",
     *          "contenu":"Votre risque est critique !" }
     */
    @PostMapping
    public ResponseEntity<?> envoyer(
            @Valid @RequestBody MessageDTO dto) {
        try {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(messageService.envoyerMessage(dto));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * GET /api/messages/{conducteurId}?avec={autreId}
     */
    @GetMapping("/{conducteurId}")
    public ResponseEntity<?> getConversation(
            @PathVariable String conducteurId,
            @RequestParam(required = false) String avec) {

        if (avec == null || avec.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("erreur",
                            "Paramètre 'avec' requis. Ex: ?avec=G1"));
        }
        return ResponseEntity.ok(
                messageService.getConversation(conducteurId, avec));
    }

    /**
     * GET /api/messages/{conducteurId}/recus
     */
    @GetMapping("/{conducteurId}/recus")
    public ResponseEntity<?> getMessagesRecus(
            @PathVariable String conducteurId) {
        return ResponseEntity.ok(
                messageService.getMessagesRecus(conducteurId));
    }

    /**
     * PUT /api/messages/{id}/lu
     */
    @PutMapping("/{id}/lu")
    public ResponseEntity<Void> marquerLu(@PathVariable Long id) {
        messageService.marquerLu(id);
        return ResponseEntity.ok().build();
    }
}