package com.fcastro.backend_kpis_management.repositories;

import com.fcastro.backend_kpis_management.model.entities.AdviserSalesReport;
import com.fcastro.backend_kpis_management.model.enums.TeamRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AdviserSalesReportRepository extends JpaRepository<AdviserSalesReport, Long> {
    Optional<AdviserSalesReport> findByAdviserIdAndYearAndMonth(Long adviserId, int year, int month);

    @Query("SELECT r FROM AdviserSalesReport r WHERE r.year = :year AND r.month = :month AND r.adviser.teamRole NOT IN :excludedRoles")
    List<AdviserSalesReport> findByYearAndMonthExcludingRoles(@Param("year") int year, @Param("month") int month, @Param("excludedRoles") List<TeamRole> excludedRoles);
}
