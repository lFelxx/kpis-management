package com.fcastro.backend_kpis_management.model.dto.schedule;

import java.time.LocalTime;

public record ScheduleSlotResponse(
        Long id,
        Long adviserId,
        String adviserName,
        String teamRole,
        Integer dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        Boolean isRestDay,
        Integer netMinutes,
        String notes,
        Long shiftTemplateId
) {}
