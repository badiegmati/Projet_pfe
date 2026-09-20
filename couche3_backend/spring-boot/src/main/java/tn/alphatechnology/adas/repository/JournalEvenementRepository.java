package tn.alphatechnology.adas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.alphatechnology.adas.entity.JournalEvenement;
import java.time.LocalDate;
import java.util.Optional;

public interface JournalEvenementRepository
        extends JpaRepository<JournalEvenement, Long> {

    Optional<JournalEvenement> findByConducteurIdAndDateJournee(
            String conducteurId, LocalDate date);
}