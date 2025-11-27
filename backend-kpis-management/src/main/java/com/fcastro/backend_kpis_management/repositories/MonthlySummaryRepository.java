package com.fcastro.backend_kpis_management.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fcastro.backend_kpis_management.model.entities.MonthlySummary;

public interface MonthlySummaryRepository extends JpaRepository<MonthlySummary, Long> {
    Optional<MonthlySummary> findByAdviserIdAndYearAndMonth(Long adviserId, int year, int month);

    List<MonthlySummary> findByYearAndMonth(int year, int month); 
}
