package com.fcastro.backend_kpis_management.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fcastro.backend_kpis_management.model.dto.authentication.AuthenticationRequest;
import com.fcastro.backend_kpis_management.model.dto.authentication.AuthenticationResponse;
import com.fcastro.backend_kpis_management.model.dto.user.UserRequest;
import com.fcastro.backend_kpis_management.model.dto.user.UserResponse;
import com.fcastro.backend_kpis_management.services.AuthenticationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticateController {
    
    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@Valid @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(authenticationService.login(request));
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRequest request) { 
        return ResponseEntity.ok(authenticationService.register(request));
    }
    
    
}
