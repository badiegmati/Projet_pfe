package tn.alphatechnology.adas.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import tn.alphatechnology.adas.dto.*;
import tn.alphatechnology.adas.service.AuthService;
import java.util.Map;

/**
 * AuthController — Authentification des 3 rôles
 * POST /api/auth/login → JWT token
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login
     * Body  : { "id": "G1", "motDePasse": "Gest123456" }
     * Retour: { "token": "...", "id": "G1",
     *           "role": "GESTIONNAIRE", "nom": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginDTO dto) {
        try {
            LoginResponseDTO response = authService.login(dto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erreur", e.getMessage()));
        }
    }
}