package tn.alphatechnology.adas.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.alphatechnology.adas.dto.*;
import tn.alphatechnology.adas.entity.*;
import tn.alphatechnology.adas.repository.*;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * GestionnaireService — adapté sans colonnes actif/en_ligne
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GestionnaireService {

    private final ConducteurRepository         conducteurRepo;
    private final VehiculeRepository           vehiculeRepo;
    private final GestionnaireFlotteRepository gestRepo;
    private final PasswordEncoder              passwordEncoder;

    public GestionnaireFlotte getProfil(String gestionnaireId) {
        return gestRepo.findById(gestionnaireId)
                .orElseThrow(() -> new RuntimeException(
                        "Gestionnaire introuvable : " + gestionnaireId));
    }

    @Transactional
    public GestionnaireFlotte modifierProfil(String gestionnaireId,
                                              UpdateGestionnaireDTO dto) {
        GestionnaireFlotte gest = getProfil(gestionnaireId);
        boolean modifie = false;
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            gest.setEmail(dto.getEmail());
            modifie = true;
        }
        if (dto.getTelephone() != null && !dto.getTelephone().isBlank()) {
            gest.setTelephone(dto.getTelephone());
            modifie = true;
        }
        if (modifie) gest.setDateModification(OffsetDateTime.now());
        return gestRepo.save(gest);
    }

public List<Conducteur> getMesConducteurs(String gestionnaireId) {
    List<Conducteur> conducteurs = conducteurRepo
            .findByCreeParGestionnaire(gestionnaireId);
    // Masquer mot de passe
    conducteurs.forEach(c -> c.setMotDePasse(null));
    return conducteurs;
}

public Conducteur getConducteur(String conducteurId, String gestionnaireId) {
    Conducteur cond = conducteurRepo.findById(conducteurId)
            .orElseThrow(() -> new RuntimeException(
                    "Conducteur introuvable : " + conducteurId));
    verifierAppartenance(cond, gestionnaireId);
    cond.setMotDePasse(null);
    return cond;
}

    @Transactional
    public Conducteur creerConducteur(CreateConducteurDTO dto,
                                       String gestionnaireId) {
        if (!dto.getId().matches("^C[0-9]+$")) {
            throw new RuntimeException(
                    "Format ID invalide. Ex: C10, C15, C26");
        }
        if (conducteurRepo.existsById(dto.getId())) {
            throw new RuntimeException(
                    "ID conducteur deja utilise : " + dto.getId());
        }
        if (dto.getMotDePasse() == null
                || dto.getMotDePasse().length() < 8) {
            throw new RuntimeException(
                    "Mot de passe trop court (minimum 8 caracteres)");
        }

        Conducteur cond = Conducteur.builder()
                .id(dto.getId())
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .age(dto.getAge())
                .telephone(dto.getTelephone() != null
                        ? dto.getTelephone() : "")
                .email(dto.getEmail() != null
                        ? dto.getEmail() : "")
                .nomVehicule(dto.getNomVehicule())
                .motDePasse(passwordEncoder.encode(dto.getMotDePasse()))
                .scoreJournalier(java.math.BigDecimal.ZERO)
                // enLigne, actif supprimés
                .creeParGestionnaire(gestionnaireId)
                .dateCreation(OffsetDateTime.now())
                .dateModification(OffsetDateTime.now())
                .build();

        Conducteur saved = conducteurRepo.save(cond);
        log.info("[GEST] Conducteur cree : {} par {}", dto.getId(), gestionnaireId);
        return saved;
    }

    @Transactional
    public Conducteur modifierConducteur(String conducteurId,
                                          UpdateConducteurDTO dto,
                                          String gestionnaireId) {
        Conducteur cond = conducteurRepo.findById(conducteurId)
                .orElseThrow(() -> new RuntimeException(
                        "Conducteur introuvable : " + conducteurId));
        verifierAppartenance(cond, gestionnaireId);

        boolean modifie = false;
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            cond.setEmail(dto.getEmail());
            modifie = true;
        }
        if (dto.getTelephone() != null && !dto.getTelephone().isBlank()) {
            cond.setTelephone(dto.getTelephone());
            modifie = true;
        }
        if (modifie) cond.setDateModification(OffsetDateTime.now());
        return conducteurRepo.save(cond);
    }

    @Transactional
    public void supprimerConducteur(String conducteurId,
                                     String gestionnaireId) {
        Conducteur cond = conducteurRepo.findById(conducteurId)
                .orElseThrow(() -> new RuntimeException(
                        "Conducteur introuvable : " + conducteurId));
        verifierAppartenance(cond, gestionnaireId);
        // MODIFICATION : DELETE physique (sans actif)
        conducteurRepo.deleteById(conducteurId);
        log.info("[GEST] Conducteur supprime : {}", conducteurId);
    }

    public List<Vehicule> getMesVehicules(String gestionnaireId) {
        // MODIFICATION : sans actif
        return vehiculeRepo.findByCreeParGestionnaire(gestionnaireId);
    }

    @Transactional
    public Vehicule creerVehicule(Vehicule vehicule, String gestionnaireId) {
        vehicule.setCreeParGestionnaire(gestionnaireId);
        // actif supprimé
        vehicule.setDateCreation(OffsetDateTime.now());
        return vehiculeRepo.save(vehicule);
    }

    @Transactional
    public Vehicule modifierVehicule(Long vehiculeId, Vehicule data,
                                      String gestionnaireId) {
        Vehicule v = vehiculeRepo.findById(vehiculeId)
                .orElseThrow(() -> new RuntimeException(
                        "Vehicule introuvable : " + vehiculeId));
        if (!gestionnaireId.equals(v.getCreeParGestionnaire())) {
            throw new RuntimeException("Acces refuse");
        }
        if (data.getNomVehicule()    != null) v.setNomVehicule(data.getNomVehicule());
        if (data.getImmatriculation()!= null) v.setImmatriculation(data.getImmatriculation());
        if (data.getMarque()         != null) v.setMarque(data.getMarque());
        if (data.getModele()         != null) v.setModele(data.getModele());
        if (data.getAnnee()          != null) v.setAnnee(data.getAnnee());
        return vehiculeRepo.save(v);
    }

    @Transactional
    public void supprimerVehicule(Long vehiculeId, String gestionnaireId) {
        Vehicule v = vehiculeRepo.findById(vehiculeId)
                .orElseThrow(() -> new RuntimeException(
                        "Vehicule introuvable : " + vehiculeId));
        if (!gestionnaireId.equals(v.getCreeParGestionnaire())) {
            throw new RuntimeException("Acces refuse");
        }
        vehiculeRepo.deleteById(vehiculeId);
    }

    @Transactional
    public Vehicule assignerVehicule(Long vehiculeId, String conducteurId,
                                      String gestionnaireId) {
        Vehicule v = vehiculeRepo.findById(vehiculeId)
                .orElseThrow(() -> new RuntimeException(
                        "Vehicule introuvable : " + vehiculeId));
        if (!gestionnaireId.equals(v.getCreeParGestionnaire())) {
            throw new RuntimeException("Acces refuse");
        }
        Conducteur cond = conducteurRepo.findById(conducteurId)
                .orElseThrow(() -> new RuntimeException(
                        "Conducteur introuvable : " + conducteurId));
        verifierAppartenance(cond, gestionnaireId);
        v.setConducteurId(conducteurId);
        return vehiculeRepo.save(v);
    }

    private void verifierAppartenance(Conducteur cond, String gestionnaireId) {
        if (!gestionnaireId.equals(cond.getCreeParGestionnaire())) {
            throw new RuntimeException(
                    "Acces refuse : conducteur " + cond.getId()
                  + " n'appartient pas au gestionnaire " + gestionnaireId);
        }
    }
}