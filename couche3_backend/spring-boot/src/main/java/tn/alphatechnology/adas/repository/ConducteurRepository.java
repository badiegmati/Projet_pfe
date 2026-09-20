package tn.alphatechnology.adas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.alphatechnology.adas.entity.Conducteur;
import java.util.List;

/**
 * Repository Conducteur — adapté sans colonnes actif/en_ligne
 */
@Repository
public interface ConducteurRepository
        extends JpaRepository<Conducteur, String> {

    /**
     * Vérification existence conducteur
     * MODIFICATION : plus de actif — juste existsById
     * Utilisé par main.py via GET /api/conducteurs/{id}/existe
     * Utilisé par SupabasePollerService avant INSERT événement
     */
    default boolean existsByIdAndActifTrue(String id) {
        return existsById(id);
    }

    /**
     * Conducteurs d'un gestionnaire — isolation stricte
     */
    List<Conducteur> findByCreeParGestionnaire(
            String creeParGestionnaire);

    /**
     * Tous les conducteurs d'un gestionnaire (pour vérification)
     */
    @Query("""
        SELECT c FROM Conducteur c
        WHERE c.creeParGestionnaire = :gestionnaireId
        ORDER BY c.dateCreation DESC
    """)
    List<Conducteur> findAllByCreeParGestionnaire(
            @Param("gestionnaireId") String gestionnaireId);
}