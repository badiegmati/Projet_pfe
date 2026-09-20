package tn.alphatechnology.adas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.alphatechnology.adas.entity.GestionnaireFlotte;
import java.util.List;

/**
 * Repository GestionnaireFlotte — sans colonne actif
 */
public interface GestionnaireFlotteRepository
        extends JpaRepository<GestionnaireFlotte, String> {

    /**
     * MODIFICATION : findByActifTrue() supprimé
     * Retourne tous les gestionnaires
     */
    List<GestionnaireFlotte> findAll();
}