package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.dto.salesReport.AdviserSalesReportResponse;
import com.fcastro.backend_kpis_management.model.dto.salesReport.CsvUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AdviserSalesReportService {
    CsvUploadResponse processCsvReport(MultipartFile file);
    List<AdviserSalesReportResponse> getByYearAndMonth(int year, int month);
}
