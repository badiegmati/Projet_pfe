package tn.alphatechnology.adas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.alphatechnology.adas.entity.Administrateur;

public interface AdministrateurRepository
        extends JpaRepository<Administrateur, String> {
}