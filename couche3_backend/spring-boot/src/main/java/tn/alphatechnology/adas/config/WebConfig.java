package tn.alphatechnology.adas.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebMvcConfigurer — CORS au niveau MVC
 * Triple protection CORS : SecurityConfig + CorsConfig + WebConfig
 * Alpha Technology — PFE 2024-2025
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            // ✅ Tous les ports localhost
            .allowedOriginPatterns(
                "http://localhost:*",
                "http://127.0.0.1:*"
            )
            // ✅ Toutes les méthodes
            .allowedMethods(
                "GET", "POST", "PUT", "DELETE",
                "PATCH", "OPTIONS", "HEAD"
            )
            // ✅ Tous les headers
            .allowedHeaders("*")
            // ✅ Credentials
            .allowCredentials(true)
            // ✅ Cache preflight 1 heure
            .maxAge(3600);
    }
}