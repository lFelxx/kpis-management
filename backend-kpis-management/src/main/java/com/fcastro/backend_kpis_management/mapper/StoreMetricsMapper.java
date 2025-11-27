package com.fcastro.backend_kpis_management.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.fcastro.backend_kpis_management.model.dto.store.StoreMetricsRequest;
import com.fcastro.backend_kpis_management.model.dto.store.StoreMetricsResponse;
import com.fcastro.backend_kpis_management.model.entities.StoreMetrics;

@Mapper(componentModel = "spring")
public interface StoreMetricsMapper {
    
    StoreMetricsResponse toResponse(StoreMetrics storeMetrics);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "percentagePaf", ignore = true)
    @Mapping(target = "percentagePr", ignore = true)
    StoreMetrics toEntity(StoreMetricsRequest request);
    
}

