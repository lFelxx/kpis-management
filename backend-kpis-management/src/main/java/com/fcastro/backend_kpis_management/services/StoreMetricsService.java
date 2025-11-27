package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.dto.store.StoreMetricsRequest;
import com.fcastro.backend_kpis_management.model.dto.store.StoreMetricsResponse;

public interface StoreMetricsService {
    
    StoreMetricsResponse createOrUpdateStoreMetrics(StoreMetricsRequest request);
    
    StoreMetricsResponse getStoreMetrics(int year, int month);
    
    void calculateAndUpdatePercentages(int year, int month);

}

