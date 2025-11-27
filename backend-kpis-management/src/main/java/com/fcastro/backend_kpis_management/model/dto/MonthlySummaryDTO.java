package com.fcastro.backend_kpis_management.model.dto;

import lombok.Data;

@Data
public class MonthlySummaryDTO {
    private Long id;
    private int year;
    private int month;
    private Double goal;
    private Double totalSales;
}
