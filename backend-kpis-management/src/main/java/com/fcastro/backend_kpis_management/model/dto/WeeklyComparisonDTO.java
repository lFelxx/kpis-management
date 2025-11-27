package com.fcastro.backend_kpis_management.model.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WeeklyComparisonDTO {
    private Long adviserId;
    private String adviserName;
    private Integer weekNumber;
    private Integer year;
    private Integer month;
    private Double currentWeekSales;
    private Double previousWeekSales;
    private Double growthPercentage;
}
