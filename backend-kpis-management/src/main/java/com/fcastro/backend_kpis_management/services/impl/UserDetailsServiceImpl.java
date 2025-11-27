package com.fcastro.backend_kpis_management.services.impl;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.fcastro.backend_kpis_management.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = userRepository
            .findByUsername(username)
            .orElseThrow(() ->
            new UsernameNotFoundException("No existe un usuario con el nombre: " + username)
        );

        return UserDetailsImpl.build(user);
    }
}
