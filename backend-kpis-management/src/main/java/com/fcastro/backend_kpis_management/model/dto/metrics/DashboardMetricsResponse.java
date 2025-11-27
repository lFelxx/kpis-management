package com.fcastro.backend_kpis_management.model.dto.metrics;

public record DashboardMetricsResponse(
    Double totalSales,
    Double totalGoal,
    Integer activeAdvisers,
    Double goalAchievement,
    Double averageSales,
    BestAdviserInfo bestAdviser,
    BestAdviserInfo bestUptAdviser
) {
}
