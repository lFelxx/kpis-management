package com.fcastro.backend_kpis_management.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fcastro.backend_kpis_management.model.entities.WeeklySalesComparison;

@Repository
public interface WeeklyComparisonRepository extends JpaRepository<WeeklySalesComparison, Long> {
    @Query("SELECT w FROM WeeklySalesComparison w " +
           "WHERE w.adviser.id = :adviserId " +
           "AND w.year = :year " +
           "AND w.month = :month " +
           "ORDER BY w.weekNumber ASC")
    List<WeeklySalesComparison> findByAdviserAndMonth(
        @Param("adviserId") Long adviserId,
        @Param("year") Integer year,
        @Param("month") Integer month
    );

    @Query("SELECT DISTINCT w.year FROM WeeklySalesComparison w " +
           "WHERE w.adviser.id = :adviserId " +
           "ORDER BY w.year DESC")
    List<Integer> findAvailableYears(@Param("adviserId") Long adviserId);

    @Query("SELECT DISTINCT w.month FROM WeeklySalesComparison w " +
           "WHERE w.adviser.id = :adviserId " +
           "AND w.year = :year " +
           "ORDER BY w.month ASC")
    List<Integer> findAvailableMonths(
        @Param("adviserId") Long adviserId,
        @Param("year") Integer year
    );

    Optional<WeeklySalesComparison> findFirstByAdviserIdAndWeekNumberAndYearAndMonthOrderByIdDesc(
        Long adviserId, Integer weekNumber, Integer year, Integer month
    );

    @Query("SELECT w FROM WeeklySalesComparison w " +
           "WHERE w.adviser.id = :adviserId " +
           "AND w.weekNumber = :weekNumber " +
           "AND w.year = :year " +
           "AND w.month = :month")
    List<WeeklySalesComparison> findAllByAdviserAndWeekNumberAndYearAndMonth(
        @Param("adviserId") Long adviserId,
        @Param("weekNumber") Integer weekNumber,
        @Param("year") Integer year,
        @Param("month") Integer month
    );
}
