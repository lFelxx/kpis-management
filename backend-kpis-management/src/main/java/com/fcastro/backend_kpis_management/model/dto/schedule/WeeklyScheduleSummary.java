package com.fcastro.backend_kpis_management.model.dto.schedule;

import java.time.LocalDate;

public record WeeklyScheduleSummary(
        Long id,
        LocalDate weekStart,
        LocalDate weekEnd,
        String status
) {}
