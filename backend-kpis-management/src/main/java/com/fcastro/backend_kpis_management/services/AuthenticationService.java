package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.dto.authentication.AuthenticationRequest;
import com.fcastro.backend_kpis_management.model.dto.authentication.AuthenticationResponse;
import com.fcastro.backend_kpis_management.model.dto.user.UserRequest;
import com.fcastro.backend_kpis_management.model.dto.user.UserResponse;

public interface AuthenticationService {

    UserResponse register(UserRequest user);

    AuthenticationResponse login(AuthenticationRequest request);
}
