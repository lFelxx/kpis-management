package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.dto.schedule.*;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleService {

    WeeklyScheduleResponse create(LocalDate weekStart);

    WeeklyScheduleResponse getById(Long id);

    List<WeeklyScheduleSummary> getAll();

    WeeklyScheduleResponse updateSlot(Long slotId, ScheduleSlotUpdateRequest request);

    WeeklyScheduleResponse publish(Long id);

    WeeklyScheduleResponse unpublish(Long id);

    ScheduleConfigResponse getConfig();

    ScheduleConfigResponse saveConfig(ScheduleConfigRequest request);

    WeeklyScheduleResponse clearSlots(Long id);
}
