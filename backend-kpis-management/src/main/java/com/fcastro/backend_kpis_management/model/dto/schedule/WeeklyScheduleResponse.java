package com.fcastro.backend_kpis_management.model.dto.schedule;

import java.time.LocalDate;
import java.util.List;

public record WeeklyScheduleResponse(
        Long id,
        LocalDate weekStart,
        LocalDate weekEnd,
        String status,
        List<ScheduleSlotResponse> slots,
        List<WeeklyAdviserSummary> adviserSummaries,
        List<String> warnings
) {}
