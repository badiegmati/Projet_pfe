package tn.alphatechnology.adas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * CorsFilter bean — intercepte AVANT Spring Security
 * Garantit que les requêtes OPTIONS preflight reçoivent 200
 * Alpha Technology — PFE 2024-2025
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ Origines — localhost tous ports
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "http://127.0.0.1:*"
        ));

        // ✅ Méthodes
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE",
            "PATCH", "OPTIONS", "HEAD"
        ));

        // ✅ Headers
        config.setAllowedHeaders(List.of("*"));

        // ✅ Credentials
        config.setAllowCredentials(true);

        // ✅ Cache preflight
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}