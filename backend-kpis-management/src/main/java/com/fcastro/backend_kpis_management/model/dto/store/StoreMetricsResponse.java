package com.fcastro.backend_kpis_management.model.dto.store;

import lombok.Data;

@Data
public class StoreMetricsResponse {
    
    private Long id;
    private Integer year;
    private Integer month;
    private Double paf; 
    private Double percentagePaf; 
    private Double percentagePr; 

}

