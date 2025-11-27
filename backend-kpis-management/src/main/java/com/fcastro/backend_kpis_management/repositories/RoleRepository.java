package com.fcastro.backend_kpis_management.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fcastro.backend_kpis_management.model.entities.Role;
import com.fcastro.backend_kpis_management.model.enums.ERole;

public interface RoleRepository extends JpaRepository<Role, Long>{
    
    Optional<Role> findByName(ERole name);
}
