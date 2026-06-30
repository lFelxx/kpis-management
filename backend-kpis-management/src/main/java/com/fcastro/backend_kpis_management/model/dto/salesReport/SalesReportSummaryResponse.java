package com.fcastro.backend_kpis_management.model.dto.salesReport;

public record SalesReportSummaryResponse(
        int totalInvoices,
        int totalUnits,
        double totalGrossSales,
        double generalUpt,
        double storeAtv,
        Double storeWowCurrentWeekSales,
        Double storeWowPreviousWeekSales,
        Double storeWowGrowthPercentage,
        Long bestUptAdviserId,
        String bestUptAdviserName,
        Double bestUptValue,
        Long bestAvgPriceAdviserId,
        String bestAvgPriceAdviserName,
        Double bestAvgPriceValue,
        Long bestAtvAdviserId,
        String bestAtvAdviserName,
        Double bestAtvValue
) {}
