package com.fcastro.backend_kpis_management.repositories;

import com.fcastro.backend_kpis_management.model.entities.BudgetTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BudgetTemplateRepository extends JpaRepository<BudgetTemplate, Long> {
    Optional<BudgetTemplate> findByYearAndMonth(int year, int month);
    boolean existsByYearAndMonth(int year, int month);
}
