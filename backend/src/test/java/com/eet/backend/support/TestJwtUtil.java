package com.eet.erasmusexpensetracker.support;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

/**
 * Genera JWTs para tests que pasan por JwtAuthFilter real.
 * -> subject = email (lo que extractUsername() devolverá)
 * -> claims extra: incluye userId (para frontend) y cualquier otro que quieras.
 */
public final class TestJwtUtil {

    private TestJwtUtil() {}

    public static String generateForEmail(
            String emailSubject,
            String userIdClaim,
            String secret,
            long ttlMillis
    ) {
        return generateForEmail(emailSubject, userIdClaim, secret, ttlMillis, Map.of());
    }

    public static String generateForEmail(
            String emailSubject,
            String userIdClaim,
            String secret,
            long ttlMillis,
            Map<String, Object> extraClaims
    ) {
        Instant now = Instant.now();
        Key key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        // Construimos claims base y fusionamos los extra
        var builder = Jwts.builder()
                .setSubject(emailSubject)                 // MUY IMPORTANTE: subject = email
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusMillis(ttlMillis)))
                .claim("userId", userIdClaim)             // el frontend lo parsea
                .claim("email", emailSubject);            // redundante pero útil

        if (extraClaims != null && !extraClaims.isEmpty()) {
            builder.addClaims(extraClaims);
        }

        return builder.signWith(key, SignatureAlgorithm.HS256).compact();
    }

    public static String bearer(String token) {
        return "Bearer " + token;
    }
}
