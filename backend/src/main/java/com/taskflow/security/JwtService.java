package com.taskflow.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-hours}")
    private long expirationHours;

    public String generateToken(UUID userId, String email) {
        Instant now = Instant.now();
        Instant expiry = now.plus(expirationHours, ChronoUnit.HOURS);

        return Jwts.builder()
                .subject(email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claims(Map.of("user_id", userId.toString(), "email", email))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public AuthenticatedUser toUser(String token) {
        Claims claims = parse(token);
        return new AuthenticatedUser(UUID.fromString(claims.get("user_id", String.class)), claims.get("email", String.class));
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
