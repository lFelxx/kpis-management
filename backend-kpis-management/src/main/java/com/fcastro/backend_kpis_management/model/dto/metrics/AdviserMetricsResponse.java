package com.fcastro.backend_kpis_management.model.dto.metrics;

public record AdviserMetricsResponse(
    Long adviserId,
    String adviserName,
    Double totalSales,
    Double totalGoal,
    Double goalAchievement
) {}
