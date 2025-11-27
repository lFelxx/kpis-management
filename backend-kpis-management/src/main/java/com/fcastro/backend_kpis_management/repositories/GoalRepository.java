package com.fcastro.backend_kpis_management.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fcastro.backend_kpis_management.model.entities.Goal;

public interface GoalRepository extends JpaRepository<Goal, Long>{
    Optional<Goal> findByAdviserIdAndYearAndMonth(Long Adviser, int year, int month);
    
}
