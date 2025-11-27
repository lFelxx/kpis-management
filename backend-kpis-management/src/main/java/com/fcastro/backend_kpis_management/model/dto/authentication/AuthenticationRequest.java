package com.fcastro.backend_kpis_management.model.dto.authentication;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthenticationRequest {
    @NotBlank(message = "El 'username' es un campo obligatorio")
    private String username;

    @NotBlank(message = "El 'password' es un campo obligatorio")
    private String password;
}
