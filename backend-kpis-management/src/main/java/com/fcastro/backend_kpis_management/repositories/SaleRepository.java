package com.fcastro.backend_kpis_management.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.Sale;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByAdviserAndSaleDateBetween(Adviser adviser, LocalDate startDate, LocalDate endDate);

    @Modifying
    @Query("DELETE FROM Sale s WHERE s.adviser = :adviser AND s.saleDate BETWEEN :start AND :end")
    void deleteByAdviserAndSaleDateBetween(@Param("adviser") Adviser adviser,
                                           @Param("start") LocalDate start,
                                           @Param("end") LocalDate end);
}
