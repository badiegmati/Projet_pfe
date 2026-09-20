package tn.alphatechnology.adas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import tn.alphatechnology.adas.security.JWTFilter;

import java.util.Arrays;
import java.util.List;

/**
 * Configuration de sécurité Spring Security
 * JWT stateless — CORS ouvert sur localhost tous ports
 * Alpha Technology — PFE 2024-2025
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JWTFilter jwtFilter;

    public SecurityConfig(JWTFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    // ── CORS Configuration ─────────────────────────────────────────────────
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ Origines autorisées — localhost tous ports
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "http://127.0.0.1:*"
        ));

        // ✅ Méthodes HTTP autorisées
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE",
            "PATCH", "OPTIONS", "HEAD"
        ));

        // ✅ Headers autorisés
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));

        // ✅ Headers exposés au client
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"
        ));

        // ✅ Credentials autorisés
        configuration.setAllowCredentials(true);

        // ✅ Cache preflight 1 heure
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // ✅ Appliquer sur TOUS les endpoints
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // ── Filtre de sécurité ─────────────────────────────────────────────────
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ✅ CORS en premier — utilise notre bean corsConfigurationSource
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ✅ Désactiver CSRF (API REST stateless)
            .csrf(csrf -> csrf.disable())

            // ✅ Session stateless — JWT uniquement
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // ✅ Règles d'accès
            .authorizeHttpRequests(auth -> auth

                // ── Endpoints publics ──────────────────────────────────
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/conducteurs/*/existe").permitAll()

                // ── Admin ──────────────────────────────────────────────
                .requestMatchers("/api/admin/**")
                    .hasRole("ADMINISTRATEUR")

                // ── Gestionnaire ───────────────────────────────────────
                .requestMatchers("/api/gestionnaire/**")
                    .hasAnyRole("GESTIONNAIRE", "ADMINISTRATEUR")

                // ── Conducteur ─────────────────────────────────────────
                .requestMatchers("/api/conducteur/**")
                    .hasAnyRole("CONDUCTEUR", "GESTIONNAIRE", "ADMINISTRATEUR")

                // ── Notifications ──────────────────────────────────────
                .requestMatchers("/api/notifications/**")
                    .hasAnyRole("CONDUCTEUR", "GESTIONNAIRE", "ADMINISTRATEUR")

                // ── Messages ───────────────────────────────────────────
                .requestMatchers("/api/messages/**")
                    .hasAnyRole("CONDUCTEUR", "GESTIONNAIRE", "ADMINISTRATEUR")

                // ── Scores ─────────────────────────────────────────────
                .requestMatchers("/api/scores/**")
                    .hasAnyRole("CONDUCTEUR", "GESTIONNAIRE", "ADMINISTRATEUR")

                // ── Tout le reste requiert authentification ────────────
                .anyRequest().authenticated()
            )

            // ✅ Filtre JWT avant UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ── BCrypt ─────────────────────────────────────────────────────────────
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    // ── AuthenticationManager ──────────────────────────────────────────────
    @Bean
    public AuthenticationManager authenticationManager(
        AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }
}