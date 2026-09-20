package tn.alphatechnology.adas.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.alphatechnology.adas.dto.UpdateConducteurDTO;
import tn.alphatechnology.adas.service.*;
import java.util.Map;

/**
 * ConducteurController — Actions du conducteur sur son compte
 *
 * RÈGLES MÉTIER :
 *   - Conducteur voit UNIQUEMENT ses propres données
 *   - Champs modifiables : email, telephone, mot_de_passe
 *   - Champs IMMUABLES   : id, nom, prenom, nom_vehicule
 *   - Endpoint /existe public (utilisé par main.py)
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ConducteurController {

    private final ConducteurService conducteurService;
    private final ScoreService      scoreService;

    /**
     * GET /api/conducteurs/{id}/existe
     * ENDPOINT PUBLIC — pas de JWT requis
     * Utilisé par main.py au démarrage pour valider conducteur_id
     */
    @GetMapping("/conducteurs/{id}/existe")
    public ResponseEntity<Map<String, Boolean>> existe(
            @PathVariable String id) {
        boolean existe = conducteurService.conducteurExiste(id);
        return ResponseEntity.ok(Map.of("existe", existe));
    }

    /**
     * GET /api/conducteur/{id}/profil
     * Profil complet du conducteur
     * Affiche les champs verrouillés et modifiables
     */
    @GetMapping("/conducteur/{id}/profil")
    public ResponseEntity<?> getProfil(
            @PathVariable String id,
            Authentication auth) {
        try {
            // Vérification : conducteur ne voit QUE son profil
            verifierAccesPropre(id, auth);
            return ResponseEntity.ok(conducteurService.getProfil(id));
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("erreur", se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT /api/conducteur/{id}/profil
     * Modifier email, telephone, mot_de_passe UNIQUEMENT
     * id, nom, prenom, nom_vehicule → IGNORÉS même si envoyés
     */
    @PutMapping("/conducteur/{id}/profil")
    public ResponseEntity<?> modifierProfil(
            @PathVariable String id,
            @RequestBody UpdateConducteurDTO dto,
            Authentication auth) {
        try {
            verifierAccesPropre(id, auth);
            return ResponseEntity.ok(
                    conducteurService.modifierProfil(id, dto));
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("erreur", se.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * GET /api/conducteur/{id}/score
     * Score de risque actuel
     */
    @GetMapping("/conducteur/{id}/score")
    public ResponseEntity<?> getScore(@PathVariable String id) {
        return scoreService.getScoreActuel(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/conducteur/{id}/score/historique
     * Historique des scores (7 derniers jours)
     */
    @GetMapping("/conducteur/{id}/score/historique")
    public ResponseEntity<?> getHistoriqueScore(@PathVariable String id) {
        return ResponseEntity.ok(scoreService.getHistorique7Jours(id));
    }

    /**
     * GET /api/conducteur/{id}/evenements
     * Liste des événements DMS/ADAS du conducteur
     */
    @GetMapping("/conducteur/{id}/evenements")
    public ResponseEntity<?> getEvenements(@PathVariable String id) {
        return ResponseEntity.ok(conducteurService.getEvenements(id));
    }

    /**
     * GET /api/conducteur/{id}/historique
     * HistoriqueNotifications — événements reçus automatiquement
     * Mis à jour via flux PC → Supabase → Spring Boot → React
     */
    @GetMapping("/conducteur/{id}/historique")
    public ResponseEntity<?> getHistorique(@PathVariable String id) {
        return ResponseEntity.ok(conducteurService.getNotifications(id));
    }

    /**
     * GET /api/conducteur/{id}/tableau-bord
     * Statistiques DMS + ADAS du jour
     */
    @GetMapping("/conducteur/{id}/tableau-bord")
    public ResponseEntity<?> getTableauBord(@PathVariable String id) {
        try {
            return ResponseEntity.ok(
                    conducteurService.getTableauBord(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * Vérification : le conducteur accède uniquement à ses propres données
     * Les gestionnaires et admins peuvent accéder à tout
     */
    private void verifierAccesPropre(String id, Authentication auth) {
        if (auth == null) return;
        String role = auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("");

        // Conducteur ne peut accéder qu'à ses propres données
        if ("ROLE_CONDUCTEUR".equals(role)
                && !id.equals(auth.getName())) {
            throw new SecurityException(
                    "Acces refuse : vous ne pouvez acceder qu'a vos propres donnees");
        }
    }
}