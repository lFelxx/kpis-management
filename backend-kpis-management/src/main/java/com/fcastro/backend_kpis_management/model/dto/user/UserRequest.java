package com.fcastro.backend_kpis_management.model.dto.user;

import java.util.Set;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRequest {
    @NotBlank(message = "El 'usernam'e es requerido")
    @Size(min = 3, max = 20, message = "El username debe contener entre 3 y 20 caracteres")
    private String username;

    @NotBlank(message = "El 'correo' es requerido")
    @Email(message = "El correo debe ser valido")
    private String email;

    @NotBlank(message = "El 'password' es requerido" )
    @Size(min = 6, max = 40, message = "El password debe contener entre 6 y 40 caracteres")
    private String password;
    
    private Set<String> roles;
}
