package com.fcastro.backend_kpis_management.repositories;

import com.fcastro.backend_kpis_management.model.entities.WeeklySalesComparison;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WeeklySalesComparisonRepository extends JpaRepository<WeeklySalesComparison, Long> {
    Optional<WeeklySalesComparison> findByAdviserIdAndYearAndWeekNumber(Long adviserId, int year, int weekNumber);
    Optional<WeeklySalesComparison> findTopByAdviserIdAndYearAndMonthOrderByWeekNumberDesc(Long adviserId, int year, int month);
}
