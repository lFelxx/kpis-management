package com.fcastro.backend_kpis_management.model.dto.salesReport;

import java.util.List;

public record SalesReportPageResponse(
        List<AdviserSalesReportResponse> advisers,
        SalesReportSummaryResponse summary
) {}
