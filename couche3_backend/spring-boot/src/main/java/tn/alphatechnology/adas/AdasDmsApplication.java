package tn.alphatechnology.adas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Point d'entrée principal — Alpha Technology ADAS/DMS PFE 2024-2025
 * @EnableScheduling : active le polling Supabase toutes les 5 secondes
 */
@SpringBootApplication
@EnableScheduling
public class AdasDmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(AdasDmsApplication.class, args);
    }
}