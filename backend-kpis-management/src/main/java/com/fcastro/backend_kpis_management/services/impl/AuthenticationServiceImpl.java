package com.fcastro.backend_kpis_management.services.impl;

import java.util.Set;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fcastro.backend_kpis_management.mapper.UserMapper;
import com.fcastro.backend_kpis_management.model.dto.authentication.AuthenticationRequest;
import com.fcastro.backend_kpis_management.model.dto.authentication.AuthenticationResponse;
import com.fcastro.backend_kpis_management.model.dto.user.UserRequest;
import com.fcastro.backend_kpis_management.model.dto.user.UserResponse;
import com.fcastro.backend_kpis_management.model.entities.Role;
import com.fcastro.backend_kpis_management.model.entities.User;
import com.fcastro.backend_kpis_management.model.enums.ERole;
import com.fcastro.backend_kpis_management.repositories.RoleRepository;
import com.fcastro.backend_kpis_management.repositories.UserRepository;
import com.fcastro.backend_kpis_management.services.AuthenticationService;
import com.fcastro.backend_kpis_management.util.JwtUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    
    private final AuthenticationManager authenticationManager;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;


    @Override
    public UserResponse register(UserRequest userRequest) {
        if (userRepository.existsByUsername(userRequest.getUsername())) {
            throw new RuntimeException("El nombre de usuario ya está en uso.");
        }

        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new RuntimeException("El email ya está registrado.");
        }

        // Obtener los roles USER y ADMIN desde la base de datos
        Role roleUser= roleRepository.findByName(ERole.ROLE_USER)
        .orElseThrow(() -> new RuntimeException("Rol USER no encontrado"));

        Role roleAdmin = roleRepository.findByName(ERole.ROLE_ADMIN)
        .orElseThrow(() -> new RuntimeException("Rol ADMIN no encontrado"));

        // Convertir DTO a entidad
        User user = UserMapper.toEntity(userRequest, passwordEncoder);
        user.setRoles(Set.of(roleUser, roleAdmin));
        user.setActive(true);

        // Guardar el usuario
        User savedUser = userRepository.save(user);

        // Convertir la entidad guardada a UserResponse
        return UserMapper.toResponse(savedUser);
    }

    @Override
    public AuthenticationResponse login(AuthenticationRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );

        var userDetails = (UserDetailsImpl) auth.getPrincipal();
        String jwt = jwtUtils.genereteToken(userDetails);

        return new AuthenticationResponse(jwt, userDetails.getUsername(), userDetails.getEmail());
    }
}
