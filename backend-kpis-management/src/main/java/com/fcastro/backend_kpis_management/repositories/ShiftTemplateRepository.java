package com.fcastro.backend_kpis_management.repositories;

import com.fcastro.backend_kpis_management.model.entities.ShiftTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShiftTemplateRepository extends JpaRepository<ShiftTemplate, Long> {
    List<ShiftTemplate> findByActiveTrueOrderBySortOrderAscIdAsc();
}
