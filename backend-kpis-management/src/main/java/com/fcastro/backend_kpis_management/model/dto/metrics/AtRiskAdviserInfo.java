package com.fcastro.backend_kpis_management.model.dto.metrics;

public record AtRiskAdviserInfo(
    Long   adviserId,
    String adviserName,
    Double currentSales,
    Double goal,
    Double projectedSales,
    Double projectedAchievement
) {}
