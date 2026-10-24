package com.fcastro.backend_kpis_management.repositories;

import com.fcastro.backend_kpis_management.model.entities.ScheduleConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ScheduleConfigRepository extends JpaRepository<ScheduleConfig, Long> {

    Optional<ScheduleConfig> findFirstBy();
}
