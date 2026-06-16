package com.fcastro.backend_kpis_management.controllers;

import com.fcastro.backend_kpis_management.model.dto.salesReport.AdviserSalesReportResponse;
import com.fcastro.backend_kpis_management.model.dto.salesReport.CsvUploadResponse;
import com.fcastro.backend_kpis_management.services.AdviserSalesReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/adviser-sales-report")
@RequiredArgsConstructor
@Slf4j
public class AdviserSalesReportController {

    private final AdviserSalesReportService adviserSalesReportService;

    @PostMapping("/upload")
    public ResponseEntity<CsvUploadResponse> uploadCsvReport(@RequestParam("file") MultipartFile file) {
        log.info("Recibiendo reporte CSV: {}", file.getOriginalFilename());
        return ResponseEntity.ok(adviserSalesReportService.processCsvReport(file));
    }

    @GetMapping
    public ResponseEntity<List<AdviserSalesReportResponse>> getByPeriod(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(adviserSalesReportService.getByYearAndMonth(year, month));
    }
}
