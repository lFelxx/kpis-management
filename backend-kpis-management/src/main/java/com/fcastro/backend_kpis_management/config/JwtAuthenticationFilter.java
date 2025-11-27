package com.fcastro.backend_kpis_management.config;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fcastro.backend_kpis_management.services.impl.UserDetailsServiceImpl;
import com.fcastro.backend_kpis_management.util.JwtUtils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        var authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.info("La petición no tiene token");
            filterChain.doFilter(request, response);
            return;
        }

        var token = authHeader.substring(7);
        var username = jwtUtils.extractUsername(token);

        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (username != null && authentication == null) {
            log.info("Cargando usuario al contexto: {}", username);

            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                if (jwtUtils.validateToken(token, userDetails)) {
                    var authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, 
                        null, 
                        userDetails.getAuthorities()
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.info("Usuario autenticado correctamente: {}", username);
                } else {
                    log.warn("Token inválido para usuario: {}", username);
                }
            } catch (Exception e) {
                log.error("Error al cargar usuario: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
