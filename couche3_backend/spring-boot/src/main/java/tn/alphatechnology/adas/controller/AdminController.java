package tn.alphatechnology.adas.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import tn.alphatechnology.adas.dto.*;
import tn.alphatechnology.adas.service.AdminService;

import java.util.HashMap;
import java.util.Map;

/**
 * AdminController — CRUD GestionnairesFlotte
 *
 * RÈGLES MÉTIER :
 *   - SEUL l'Administrateur peut créer/modifier/supprimer des Gestionnaires
 *   - Champs immuables (une fois créés) : id, nom_gestionnaire, mot_de_passe
 *   - Champs modifiables par Gestionnaire : email, telephone UNIQUEMENT
 *   - Pas de création publique (pas de /register)
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * GET /api/admin/gestionnaires
     * Liste tous les gestionnaires actifs
     * Accès : ADMINISTRATEUR uniquement
     */
    @GetMapping("/gestionnaires")
    public ResponseEntity<?> getAllGestionnaires() {
        try {
            return ResponseEntity.ok(adminService.getAllGestionnaires());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * GET /api/admin/gestionnaires/{id}
     * Détail d'un gestionnaire
     */
    @GetMapping("/gestionnaires/{id}")
    public ResponseEntity<?> getGestionnaire(@PathVariable String id) {
        try {
            return ResponseEntity.ok(adminService.getGestionnaire(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/admin/gestionnaires
     * Créer un nouveau gestionnaire
     * Body : { "id":"G2", "nomGestionnaire":"...", "motDePasse":"..." }
     *
     * RÈGLE : SEUL l'Admin peut créer des gestionnaires
     * Les autres gestionnaires (G2,G3...) OBLIGATOIREMENT créés ici
     */
    /**
 * POST /api/admin/gestionnaires
 * CORRECTION : BindingResult → HTTP 400 garanti sur validation échouée
 */
@PostMapping("/gestionnaires")
public ResponseEntity<?> creerGestionnaire(
        @Valid @RequestBody CreateGestionnaireDTO dto,
        BindingResult bindingResult,
        Authentication auth) {

    if (bindingResult.hasErrors()) {
        Map<String, String> erreurs = new HashMap<>();
        bindingResult.getFieldErrors().forEach(err ->
            erreurs.put(err.getField(), err.getDefaultMessage())
        );
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                    "erreur",  "Donnees invalides",
                    "details", erreurs
                ));
    }

    try {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(adminService.creerGestionnaire(dto, auth.getName()));
    } catch (Exception e) {
        return ResponseEntity
                .badRequest()
                .body(Map.of("erreur", e.getMessage()));
    }
}

    /**
     * PUT /api/admin/gestionnaires/{id}
     * Modifier email et telephone UNIQUEMENT
     * id, nom_gestionnaire, mot_de_passe → IGNORÉS (immuables)
     */
    @PutMapping("/gestionnaires/{id}")
    public ResponseEntity<?> modifierGestionnaire(
            @PathVariable String id,
            @RequestBody UpdateGestionnaireDTO dto) {
        try {
            return ResponseEntity.ok(
                    adminService.modifierGestionnaire(id, dto));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * DELETE /api/admin/gestionnaires/{id}
     * Désactivation logique (soft delete — actif=false)
     */
    @DeleteMapping("/gestionnaires/{id}")
    public ResponseEntity<?> supprimerGestionnaire(@PathVariable String id) {
        try {
            adminService.supprimerGestionnaire(id);
            return ResponseEntity.ok(
                    Map.of("message", "Gestionnaire desactive : " + id,
                           "id", id));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * GET /api/admin/profil
     * Profil de l'administrateur connecté
     */
    @GetMapping("/profil")
    public ResponseEntity<?> getProfil(Authentication auth) {
        return ResponseEntity.ok(Map.of(
                "id",   auth.getName(),
                "role", "ADMINISTRATEUR",
                "nom",  "Administrateur Système"
        ));
    }
}