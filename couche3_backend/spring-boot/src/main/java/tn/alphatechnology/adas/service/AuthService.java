package tn.alphatechnology.adas.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.alphatechnology.adas.dto.LoginDTO;
import tn.alphatechnology.adas.dto.LoginResponseDTO;
import tn.alphatechnology.adas.entity.*;
import tn.alphatechnology.adas.repository.*;
import tn.alphatechnology.adas.security.JWTService;

/**
 * AuthService — adapté sans colonnes actif/en_ligne
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdministrateurRepository     adminRepo;
    private final GestionnaireFlotteRepository gestRepo;
    private final ConducteurRepository         conducteurRepo;
    private final JWTService                   jwtService;
    private final PasswordEncoder              passwordEncoder;

    public LoginResponseDTO login(LoginDTO dto) {
        String id  = dto.getId() == null
                ? "" : dto.getId().trim().toUpperCase();
        String mdp = dto.getMotDePasse();

        // ── Administrateur ───────────────────────────────────────
        var adminOpt = adminRepo.findById(id);
        if (adminOpt.isPresent()) {
            Administrateur admin = adminOpt.get();
            // actif vérifié depuis la table
            if (!Boolean.TRUE.equals(admin.getActif())) {
                throw new RuntimeException("Compte administrateur desactive");
            }
            if (passwordEncoder.matches(mdp, admin.getMotDePasse())) {
                String token = jwtService.generateToken(
                        id, "ADMINISTRATEUR", "Administrateur");
                log.info("[AUTH] Connexion Admin : {}", id);
                return LoginResponseDTO.builder()
                    .token(token).id(id)
                    .role("ADMINISTRATEUR").nom("Administrateur")
                    .prenom("")
                    .telephone("")
                    .nomVehicule("")
                    .build();
            }
            throw new RuntimeException("Mot de passe incorrect");
        }

        // ── GestionnaireFlotte ───────────────────────────────────
        var gestOpt = gestRepo.findById(id);
        if (gestOpt.isPresent()) {
            GestionnaireFlotte gest = gestOpt.get();
            // Pas de actif dans gestionnaires_flotte dms-adas2
            if (passwordEncoder.matches(mdp, gest.getMotDePasse())) {
                String token = jwtService.generateToken(
                        id, "GESTIONNAIRE", gest.getNomGestionnaire());
                log.info("[AUTH] Connexion Gestionnaire : {}", id);
                return LoginResponseDTO.builder()
                    .token(token).id(id)
                    .role("GESTIONNAIRE").nom(gest.getNomGestionnaire())
                    .prenom("")
                    .telephone("")
                    .nomVehicule("")
                    .build();
            }
            throw new RuntimeException("Mot de passe incorrect");
        }

        // ── Conducteur ───────────────────────────────────────────
        var condOpt = conducteurRepo.findById(id);
        if (condOpt.isPresent()) {
            Conducteur cond = condOpt.get();
            // Pas de actif dans conducteurs dms-adas2
            if (passwordEncoder.matches(mdp, cond.getMotDePasse())) {
                String token = jwtService.generateToken(
                    id, "CONDUCTEUR", cond.getPrenom() + " " + cond.getNom());
                log.info("[AUTH] Connexion Conducteur : {}", id);
                return LoginResponseDTO.builder()
                    .token(token).id(id)
                    .role("CONDUCTEUR")
                    .nom(cond.getNom())
                    .prenom(cond.getPrenom())
                    .telephone(cond.getTelephone())
                    .nomVehicule(cond.getNomVehicule())
                    .build();
            }
            throw new RuntimeException("Mot de passe incorrect");
        }

        throw new RuntimeException("Identifiant introuvable : " + id);
    }
}