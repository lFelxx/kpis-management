package com.fcastro.backend_kpis_management.repositories;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fcastro.backend_kpis_management.model.entities.Adviser;



public interface AdviserRepository extends JpaRepository<Adviser, Long> {
    @Query("SELECT a FROM Adviser a LEFT JOIN FETCH a.goals WHERE a.id = :id")
    Optional<Adviser> findByIdWithGoals(@Param("id") Long id);

    @Query("SELECT a FROM Adviser a LEFT JOIN FETCH a.monthlySummaries WHERE a.id = :id")
    Optional<Adviser> findByIdWithMonthlySummaries(@Param("id") Long id);

    @Query("SELECT a FROM Adviser a WHERE a.active = true")
    List<Adviser> findAllActiveAdvisers();
}
