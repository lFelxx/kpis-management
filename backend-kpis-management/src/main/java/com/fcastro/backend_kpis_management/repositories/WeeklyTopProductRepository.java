package com.fcastro.backend_kpis_management.repositories;

import com.fcastro.backend_kpis_management.model.entities.WeeklyTopProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WeeklyTopProductRepository extends JpaRepository<WeeklyTopProduct, Long> {

    Optional<WeeklyTopProduct> findByYearAndWeekNumber(int year, int weekNumber);

    @Query("""
        SELECT w FROM WeeklyTopProduct w
        WHERE w.year = :year AND w.weekNumber = (
            SELECT MAX(w2.weekNumber) FROM WeeklyTopProduct w2
            WHERE w2.year = :year AND w2.weekNumber IN :weekNumbers
        )
    """)
    Optional<WeeklyTopProduct> findLatestForWeeks(@Param("year") int year,
                                                   @Param("weekNumbers") java.util.List<Integer> weekNumbers);
}
