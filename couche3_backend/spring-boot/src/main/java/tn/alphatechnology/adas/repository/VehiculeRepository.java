package tn.alphatechnology.adas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.alphatechnology.adas.entity.Vehicule;
import java.util.List;

/**
 * Repository Vehicule — sans colonne actif
 */
public interface VehiculeRepository
        extends JpaRepository<Vehicule, Long> {

    /**
     * MODIFICATION : findByCreeParGestionnaireAndActifTrue() → sans actif
     */
    List<Vehicule> findByCreeParGestionnaire(String gestionnaireId);
}