package com.fcastro.backend_kpis_management.model.dto.metrics;

import java.util.List;

public record DashboardMetricsResponse(
    Double totalSales,
    Double totalGoal,
    Integer activeAdvisers,
    Double goalAchievement,
    Double averageSales,
    BestAdviserInfo bestAdviser,
    BestAdviserInfo bestUptAdviser,
    BestAdviserInfo worstAdviser,
    Double storeCurrentPartialWeekSales,
    Double storePreviousPartialWeekSales,
    Double storePartialWeekGrowthPercent,
    List<AdviserPartialWeekGrowthInfo> adviserPartialWeekGrowth
) {
}
