package tn.alphatechnology.adas.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.alphatechnology.adas.dto.*;
import tn.alphatechnology.adas.entity.GestionnaireFlotte;
import tn.alphatechnology.adas.repository.GestionnaireFlotteRepository;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * AdminService — adapté sans colonne actif
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final GestionnaireFlotteRepository gestRepo;
    private final PasswordEncoder              passwordEncoder;

    public List<GestionnaireFlotte> getAllGestionnaires() {
    List<GestionnaireFlotte> gests = gestRepo.findAll();
    gests.forEach(g -> g.setMotDePasse(null));
    return gests;
}

public GestionnaireFlotte getGestionnaire(String id) {
    GestionnaireFlotte gest = gestRepo.findById(id)
            .orElseThrow(() -> new RuntimeException(
                    "Gestionnaire introuvable : " + id));
    gest.setMotDePasse(null);
    return gest;
}

    @Transactional
    public GestionnaireFlotte creerGestionnaire(CreateGestionnaireDTO dto,
                                                 String adminId) {
        if (!dto.getId().matches("^G[0-9]+$")) {
            throw new RuntimeException(
                    "Format ID invalide. Attendu: G + chiffres. Ex: G1, G2");
        }
        if (gestRepo.existsById(dto.getId())) {
            throw new RuntimeException(
                    "ID deja utilise : " + dto.getId());
        }

        GestionnaireFlotte gest = GestionnaireFlotte.builder()
                .id(dto.getId())
                .nomGestionnaire(dto.getNomGestionnaire())
                .motDePasse(passwordEncoder.encode(dto.getMotDePasse()))
                .email(dto.getEmail() != null ? dto.getEmail() : "")
                .telephone(dto.getTelephone() != null
                        ? dto.getTelephone() : "")
                // actif supprimé
                .creeParAdmin(adminId)
                .dateCreation(OffsetDateTime.now())
                .dateModification(OffsetDateTime.now())
                .build();

        GestionnaireFlotte saved = gestRepo.save(gest);
        log.info("[ADMIN] Gestionnaire cree : {} par {}", dto.getId(), adminId);
        return saved;
    }

    @Transactional
    public GestionnaireFlotte modifierGestionnaire(String id,
                                                    UpdateGestionnaireDTO dto) {
        GestionnaireFlotte gest = gestRepo.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Gestionnaire introuvable : " + id));

        boolean modifie = false;
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            gest.setEmail(dto.getEmail());
            modifie = true;
        }
        if (dto.getTelephone() != null && !dto.getTelephone().isBlank()) {
            gest.setTelephone(dto.getTelephone());
            modifie = true;
        }
        if (modifie) {
            gest.setDateModification(OffsetDateTime.now());
        }
        return gestRepo.save(gest);
    }

    @Transactional
    public void supprimerGestionnaire(String id) {
        // MODIFICATION : DELETE physique (pas de soft delete sans actif)
        if (!gestRepo.existsById(id)) {
            throw new RuntimeException("Gestionnaire introuvable : " + id);
        }
        if ("G1".equals(id)) {
            throw new RuntimeException(
                    "Impossible de supprimer G1 (compte de test)");
        }
        gestRepo.deleteById(id);
        log.info("[ADMIN] Gestionnaire supprime : {}", id);
    }
}