package com.fcastro.backend_kpis_management.repositories;

import com.fcastro.backend_kpis_management.model.entities.AdviserDailyExclusion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface AdviserDailyExclusionRepository extends JpaRepository<AdviserDailyExclusion, Long> {

    Optional<AdviserDailyExclusion> findByAdviserIdAndDate(Long adviserId, LocalDate date);

    @EntityGraph(attributePaths = "adviser")
    List<AdviserDailyExclusion> findAllByDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT e.date FROM AdviserDailyExclusion e WHERE e.adviser.id = :adviserId AND e.date BETWEEN :start AND :end")
    Set<LocalDate> findExcludedDatesByAdviserIdAndDateBetween(
            @Param("adviserId") Long adviserId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);
}
