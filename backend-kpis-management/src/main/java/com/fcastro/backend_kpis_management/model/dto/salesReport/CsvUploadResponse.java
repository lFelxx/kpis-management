package com.fcastro.backend_kpis_management.model.dto.salesReport;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CsvUploadResponse {
    private int processedCount;
    private List<String> unmatchedVendors;
}
