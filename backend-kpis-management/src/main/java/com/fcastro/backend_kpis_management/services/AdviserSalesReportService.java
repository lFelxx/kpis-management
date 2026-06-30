package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.dto.salesReport.CsvUploadResponse;
import com.fcastro.backend_kpis_management.model.dto.salesReport.SalesReportPageResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AdviserSalesReportService {
    CsvUploadResponse processCsvReport(MultipartFile file);
    SalesReportPageResponse getByYearAndMonth(int year, int month);
}
