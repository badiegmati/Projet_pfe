package tn.alphatechnology.adas.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import tn.alphatechnology.adas.repository.*;
import java.util.List;

/**
 * UserDetailsServiceImpl — Chargement utilisateur pour Spring Security
 * Cherche dans les 3 tables : administrateurs → gestionnaires → conducteurs
 * Utilisé par Spring Security pour valider les tokens JWT
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AdministrateurRepository     adminRepo;
    private final GestionnaireFlotteRepository gestRepo;   // ← NOM CORRECT
    private final ConducteurRepository         conducteurRepo;

    @Override
    public UserDetails loadUserByUsername(String id)
            throws UsernameNotFoundException {

        // ── Tentative Administrateur ────────────────────────────────
        var adminOpt = adminRepo.findById(id);
        if (adminOpt.isPresent()) {
            var admin = adminOpt.get();
            return new User(
                    admin.getId(),
                    admin.getMotDePasse(),
                    List.of(new SimpleGrantedAuthority("ROLE_ADMINISTRATEUR"))
            );
        }

        // ── Tentative GestionnaireFlotte ────────────────────────────
        var gestOpt = gestRepo.findById(id);
        if (gestOpt.isPresent()) {
            var gest = gestOpt.get();
            return new User(
                    gest.getId(),
                    gest.getMotDePasse(),
                    List.of(new SimpleGrantedAuthority("ROLE_GESTIONNAIRE"))
            );
        }

        // ── Tentative Conducteur ────────────────────────────────────
        var condOpt = conducteurRepo.findById(id);
        if (condOpt.isPresent()) {
            var cond = condOpt.get();
            return new User(
                    cond.getId(),
                    cond.getMotDePasse(),
                    List.of(new SimpleGrantedAuthority("ROLE_CONDUCTEUR"))
            );
        }

        throw new UsernameNotFoundException(
                "Utilisateur introuvable : " + id);
    }
}