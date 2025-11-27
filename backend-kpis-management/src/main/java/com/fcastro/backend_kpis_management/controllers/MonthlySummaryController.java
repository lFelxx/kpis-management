package com.fcastro.backend_kpis_management.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fcastro.backend_kpis_management.model.dto.MonthlySummaryDTO;
import com.fcastro.backend_kpis_management.services.MonthlySummaryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/api/monthly-summary")
@RequiredArgsConstructor
@Slf4j
public class MonthlySummaryController {
    
    private final MonthlySummaryService monthlySummaryService;

    @PutMapping("by-adviser/{adviserId}")
    public ResponseEntity<?> updateTotalSalesByAdviser(@PathVariable("adviserId") Long adviserId, @RequestBody MonthlySummaryDTO request) {
        log.info("Llamando a updateTotalSales con id={} y totalSales={}", adviserId, request.getTotalSales());
        monthlySummaryService.updateTotalSalesByAdviser(adviserId, request.getYear(), request.getMonth() ,request.getTotalSales());
        return ResponseEntity.ok().build();
    }
}
