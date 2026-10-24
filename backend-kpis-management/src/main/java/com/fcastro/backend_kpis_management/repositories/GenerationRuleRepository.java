package com.fcastro.backend_kpis_management.repositories;

import com.fcastro.backend_kpis_management.model.entities.GenerationRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GenerationRuleRepository extends JpaRepository<GenerationRule, Long> {
    List<GenerationRule> findAllByOrderBySortOrderAscIdAsc();
}
