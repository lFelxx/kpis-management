package com.fcastro.backend_kpis_management.repositories;

import com.fcastro.backend_kpis_management.model.entities.DailyBudgetDistribution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyBudgetDistributionRepository extends JpaRepository<DailyBudgetDistribution, Long> {
    List<DailyBudgetDistribution> findByBudgetTemplateIdOrderByDateAsc(Long budgetTemplateId);
    Optional<DailyBudgetDistribution> findByBudgetTemplateIdAndDate(Long budgetTemplateId, LocalDate date);
    List<DailyBudgetDistribution> findByBudgetTemplateIdAndDateLessThanEqual(Long budgetTemplateId, LocalDate date);
}
