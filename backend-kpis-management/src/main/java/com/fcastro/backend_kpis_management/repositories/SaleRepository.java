package com.fcastro.backend_kpis_management.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.Sale;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByAdviserAndSaleDateBetween(Adviser adviser, LocalDate startDate, LocalDate endDate);
}
