package com.fcastro.backend_kpis_management.model.dto.salesReport;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdviserSalesReportResponse {
    private Long adviserId;
    private String adviserName;
    private int year;
    private int month;
    private int invoiceCount;
    private int unitsSold;
    private Double upt;
    private Double grossSales;
    private Double netSales;
    private Double wowCurrentWeekSales;
    private Double wowPreviousWeekSales;
    private Double wowGrowthPercentage;
}
