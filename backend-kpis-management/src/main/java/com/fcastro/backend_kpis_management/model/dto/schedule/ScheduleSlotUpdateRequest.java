package com.fcastro.backend_kpis_management.model.dto.schedule;

import java.time.LocalTime;

public record ScheduleSlotUpdateRequest(
        LocalTime startTime,
        LocalTime endTime,
        Boolean isRestDay,
        String notes,
        Long shiftTemplateId
) {}
