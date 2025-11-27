package com.fcastro.backend_kpis_management.mapper;

import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.fcastro.backend_kpis_management.model.dto.user.UserRequest;
import com.fcastro.backend_kpis_management.model.dto.user.UserResponse;
import com.fcastro.backend_kpis_management.model.entities.Role;
import com.fcastro.backend_kpis_management.model.entities.User;

@Component
public class UserMapper {
    
    public static User toEntity(UserRequest dto, PasswordEncoder encoder){
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(encoder.encode(dto.getPassword()));
        user.setActive(true);
        return user;
    }

    public static UserResponse toResponse(User user){
        UserResponse dto = new UserResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setActive(user.getActive());

        dto.setRoles(
            user.getRoles().stream()
            .map(Role::getName)
            .map(Enum::name)
            .collect(Collectors.toSet())
        );

        return dto;
    }

}
