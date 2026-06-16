package com.fcastro.backend_kpis_management.repositories;

import com.fcastro.backend_kpis_management.model.entities.AdviserSalesReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdviserSalesReportRepository extends JpaRepository<AdviserSalesReport, Long> {
    Optional<AdviserSalesReport> findByAdviserIdAndYearAndMonth(Long adviserId, int year, int month);
    List<AdviserSalesReport> findByYearAndMonth(int year, int month);
}
