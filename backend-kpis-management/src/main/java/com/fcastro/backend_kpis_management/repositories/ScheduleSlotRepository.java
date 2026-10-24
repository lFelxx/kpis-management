package com.fcastro.backend_kpis_management.repositories;

import com.fcastro.backend_kpis_management.model.entities.ScheduleSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleSlotRepository extends JpaRepository<ScheduleSlot, Long> {

    List<ScheduleSlot> findByScheduleId(Long scheduleId);
}
