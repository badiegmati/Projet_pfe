package tn.alphatechnology.adas.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.Date;
import java.util.Map;

/**
 * Service JWT — génération et validation des tokens
 * Payload : { id, role, nom }
 */
@Service
public class JWTService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    /** Génère un token JWT pour un utilisateur */
    public String generateToken(String id, String role, String nom) {
        Key key = Keys.hmacShaKeyFor(secret.getBytes());
        return Jwts.builder()
                .setSubject(id)
                .addClaims(Map.of("role", role, "nom", nom))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** Extrait toutes les claims d'un token */
    public Claims extractAllClaims(String token) {
        Key key = Keys.hmacShaKeyFor(secret.getBytes());
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /** Extrait l'ID utilisateur (subject) */
    public String extractId(String token) {
        return extractAllClaims(token).getSubject();
    }

    /** Extrait le rôle */
    public String extractRole(String token) {
        return (String) extractAllClaims(token).get("role");
    }

    /** Valide le token */
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (JwtException e) {
            return false;
        }
    }
}