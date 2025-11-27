package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.dto.metrics.AdviserMetricsResponse;
import com.fcastro.backend_kpis_management.model.dto.metrics.DashboardMetricsResponse;

public interface MetricsService {
    
    DashboardMetricsResponse getDashboardMetrics(int year, int month);

    AdviserMetricsResponse getAdviserMetrics(Long adviserId, int year, int month);
}
