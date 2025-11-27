package com.fcastro.backend_kpis_management.model.dto.metrics;

public record BestAdviserInfo(
    Long adviserId,
    String adviserName,
    Double totalSales,
    Double totalGoal,
    Double goalAchievement,
    Double upt
) {}
