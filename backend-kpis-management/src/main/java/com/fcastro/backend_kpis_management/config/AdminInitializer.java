package com.fcastro.backend_kpis_management.config;

import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.fcastro.backend_kpis_management.model.entities.Role;
import com.fcastro.backend_kpis_management.model.entities.User;
import com.fcastro.backend_kpis_management.model.enums.ERole;
import com.fcastro.backend_kpis_management.repositories.RoleRepository;
import com.fcastro.backend_kpis_management.repositories.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class AdminInitializer {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Bean
    CommandLineRunner createAdminUser() {
        return args -> {

            if (userRepository.existsByUsername(adminUsername)) {
                log.info("✔ Usuario ADMIN ya existe");
                return;
            }

            // Crear rol ADMIN si no existe
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName(ERole.ROLE_ADMIN);
                        return roleRepository.save(role);
                    });

            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setActive(true);
            admin.setRoles(Set.of(adminRole));

            userRepository.save(admin);

            log.info("🔥 Usuario ADMIN creado correctamente");
        };
    }
}
