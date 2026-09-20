package tn.alphatechnology.adas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.alphatechnology.adas.entity.Evenement;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Repository Evenement — VERSION CORRIGÉE
 * MODIFICATION : suppression avgVitessePourConducteur
 * (vitesseKmh absent de l'entité Evenement simplifiée)
 */
public interface EvenementRepository
        extends JpaRepository<Evenement, Long> {

    /** Anti-doublon via supabase_id */
    boolean existsBySupabaseId(Long supabaseId);

    /** Événements d'un conducteur triés par date décroissante */
    List<Evenement> findByConducteurIdOrderByDateHeureDesc(
            String conducteurId);

    /** Événements depuis une date donnée */
    List<Evenement> findByConducteurIdAndDateHeureAfter(
            String conducteurId, OffsetDateTime depuis);

    /** Comptage par type — pour calcul score */
    @Query("""
        SELECT e.typeEvenement, COUNT(e)
        FROM Evenement e
        WHERE e.conducteurId = :id
        AND e.dateHeure >= :depuis
        GROUP BY e.typeEvenement
    """)
    List<Object[]> countByTypeForConducteur(
            @Param("id") String conducteurId,
            @Param("depuis") OffsetDateTime depuis);

    // avgVitessePourConducteur SUPPRIMÉ
    // vitesseKmh absent de la table evenements dans dms-adas2
}