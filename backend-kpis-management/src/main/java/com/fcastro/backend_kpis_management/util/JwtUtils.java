package com.fcastro.backend_kpis_management.util;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;


@Component
public class JwtUtils {
    
    @Value("${jwt.secret}")
    private String jwtSecret;


    @Value("${jwt.expirationMs}")
    private long jwtExpiration;


    public String genereteToken(UserDetails userDetails){
        var claims = new HashMap<String, Object>();

        // Se agrega informacion al token
        claims.put("roles", userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .toList());

        // Crea el token con los claims
        return createToken(claims, userDetails.getUsername());
    }

    // Extrae el nombre de usuario del token JWT.
    public String extractUsername(String token){
        return extractClaim(token, Claims::getSubject);
    }

    // Extrae la fecha de expiración del token JWT
    public Date extractExpiration(String token){
        return extractClaim(token, Claims::getExpiration);
    }

    // Verifica si el token JWT ha expirado.
    private Boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }

    // Valida un token JWT contra los detalles de un usuario
    public Boolean validateToken(String token, UserDetails userDetails){
        final var username = extractUsername(token);
        // Compara el nombre de usuario extraído con el del UserDetails y verifica si el token no ha expirado
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }


    //  Extrae un claim específico del token JWT usando una función extractora
    public <T> T extractClaim(String token, Function<Claims, T> claimResolver){
        final var claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    // Extrae todos los claims del token JWT
    private Claims extractAllClaims(String token){
        return Jwts.parser()
            .verifyWith(getSignInKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }



    // Obtiene la clave secreta para firmar y verificar tokens JWT.
    private SecretKey getSignInKey(){
        var keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }





    //Crea un token JWT con claims personalizados
    private String createToken(Map<String, Object> claims, String username){
        return Jwts.builder()
            .claims(claims)
            .subject(username)
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(getSignInKey())
            .compact();
    }
}
