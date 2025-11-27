package com.fcastro.backend_kpis_management.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fcastro.backend_kpis_management.model.entities.StoreMetrics;

public interface StoreMetricsRepository extends JpaRepository<StoreMetrics, Long> {
    
    Optional<StoreMetrics> findByYearAndMonth(int year, int month);
    
    boolean existsByYearAndMonth(int year, int month);

}

