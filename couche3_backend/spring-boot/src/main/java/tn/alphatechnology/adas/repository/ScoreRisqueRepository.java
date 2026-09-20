package tn.alphatechnology.adas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.alphatechnology.adas.entity.ScoreRisque;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ScoreRisqueRepository
        extends JpaRepository<ScoreRisque, Long> {

    /** Dernier score calculé pour un conducteur */
    Optional<ScoreRisque> findTopByConducteurIdOrderByTimestampDesc(
            String conducteurId);

    /** Historique sur une plage de dates */
    List<ScoreRisque> findByConducteurIdAndDateCalculBetweenOrderByDateCalculDesc(
            String conducteurId, LocalDate debut, LocalDate fin);
}