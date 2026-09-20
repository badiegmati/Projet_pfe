package tn.alphatechnology.adas.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import tn.alphatechnology.adas.dto.*;
import tn.alphatechnology.adas.entity.Vehicule;
import tn.alphatechnology.adas.service.GestionnaireService;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * GestionnaireController — CRUD Conducteurs + Véhicules
 *
 * RÈGLES MÉTIER :
 *   - Gestionnaire voit UNIQUEMENT ses propres conducteurs
 *   - Format ID conducteur : C + chiffres (ex: C15, C26)
 *   - Champs immuables conducteur : id, nom, prenom, nom_vehicule
 *   - Champs modifiables conducteur : email, telephone, mot_de_passe
 *   - Validation @Valid retourne 400 (pas 403)
 */
@RestController
@RequestMapping("/api/gestionnaire")
@RequiredArgsConstructor
public class GestionnaireController {

    private final GestionnaireService gestionnaireService;

    // ══════════════════════════════════════════════════════════
    // CONDUCTEURS
    // ══════════════════════════════════════════════════════════

    /**
     * GET /api/gestionnaire/conducteurs
     * SES conducteurs uniquement — isolation stricte
     */
    @GetMapping("/conducteurs")
    public ResponseEntity<?> getMesConducteurs(Authentication auth) {
        try {
            return ResponseEntity.ok(
                    gestionnaireService.getMesConducteurs(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * GET /api/gestionnaire/conducteurs/{id}
     */
    @GetMapping("/conducteurs/{id}")
    public ResponseEntity<?> getConducteur(
            @PathVariable String id,
            Authentication auth) {
        try {
            return ResponseEntity.ok(
                    gestionnaireService.getConducteur(id, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * POST /api/gestionnaire/conducteurs
     * CORRECTION : BindingResult capture les erreurs @Valid → HTTP 400
     *
     * Sans BindingResult → Spring lève MethodArgumentNotValidException
     * → peut être intercepté comme 403 dans certains contextes
     * Avec BindingResult → on contrôle explicitement le retour 400
     */
    @PostMapping("/conducteurs")
    public ResponseEntity<?> creerConducteur(
            @Valid @RequestBody CreateConducteurDTO dto,
            BindingResult bindingResult,
            Authentication auth) {

        // Vérification erreurs de validation @Pattern, @NotBlank, etc.
        if (bindingResult.hasErrors()) {
            Map<String, String> erreurs = new HashMap<>();
            bindingResult.getFieldErrors().forEach(err ->
                erreurs.put(err.getField(), err.getDefaultMessage())
            );
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "erreur",  "Données invalides",
                        "details", erreurs
                    ));
        }

        try {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(gestionnaireService.creerConducteur(
                            dto, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * PUT /api/gestionnaire/conducteurs/{id}
     * Modifier email, telephone UNIQUEMENT
     */
    @PutMapping("/conducteurs/{id}")
    public ResponseEntity<?> modifierConducteur(
            @PathVariable String id,
            @RequestBody UpdateConducteurDTO dto,
            Authentication auth) {
        try {
            return ResponseEntity.ok(
                    gestionnaireService.modifierConducteur(
                            id, dto, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * DELETE /api/gestionnaire/conducteurs/{id}
     */
    @DeleteMapping("/conducteurs/{id}")
    public ResponseEntity<?> supprimerConducteur(
            @PathVariable String id,
            Authentication auth) {
        try {
            gestionnaireService.supprimerConducteur(id, auth.getName());
            return ResponseEntity.ok(
                    Map.of("message", "Conducteur desactive : " + id,
                           "id", id));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    // ══════════════════════════════════════════════════════════
    // VÉHICULES
    // ══════════════════════════════════════════════════════════

    @GetMapping("/vehicules")
    public ResponseEntity<?> getMesVehicules(Authentication auth) {
        try {
            return ResponseEntity.ok(
                    gestionnaireService.getMesVehicules(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    @PostMapping("/vehicules")
    public ResponseEntity<?> creerVehicule(
            @RequestBody Vehicule vehicule,
            Authentication auth) {
        try {
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(gestionnaireService.creerVehicule(
                            vehicule, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    @PutMapping("/vehicules/{id}")
    public ResponseEntity<?> modifierVehicule(
            @PathVariable Long id,
            @RequestBody Vehicule vehicule,
            Authentication auth) {
        try {
            return ResponseEntity.ok(
                    gestionnaireService.modifierVehicule(
                            id, vehicule, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    @DeleteMapping("/vehicules/{id}")
    public ResponseEntity<?> supprimerVehicule(
            @PathVariable Long id,
            Authentication auth) {
        try {
            gestionnaireService.supprimerVehicule(id, auth.getName());
            return ResponseEntity.ok(
                    Map.of("message", "Vehicule desactive : " + id));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    @PutMapping("/vehicules/{vehiculeId}/assigner/{conducteurId}")
    public ResponseEntity<?> assignerVehicule(
            @PathVariable Long   vehiculeId,
            @PathVariable String conducteurId,
            Authentication auth) {
        try {
            return ResponseEntity.ok(
                    gestionnaireService.assignerVehicule(
                            vehiculeId, conducteurId, auth.getName()));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    // ══════════════════════════════════════════════════════════
    // PROFIL GESTIONNAIRE
    // ══════════════════════════════════════════════════════════

    @GetMapping("/profil")
    public ResponseEntity<?> getProfil(Authentication auth) {
        try {
            return ResponseEntity.ok(
                    gestionnaireService.getProfil(auth.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    @PutMapping("/profil")
    public ResponseEntity<?> modifierProfil(
            @RequestBody UpdateGestionnaireDTO dto,
            Authentication auth) {
        try {
            return ResponseEntity.ok(
                    gestionnaireService.modifierProfil(
                            auth.getName(), dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }
}