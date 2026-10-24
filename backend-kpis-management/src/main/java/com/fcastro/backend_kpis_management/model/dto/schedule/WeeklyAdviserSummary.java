package com.fcastro.backend_kpis_management.model.dto.schedule;

public record WeeklyAdviserSummary(
        Long adviserId,
        String adviserName,
        String teamRole,
        Integer restDay,
        int totalNetMinutes,
        int workedDays
) {}
