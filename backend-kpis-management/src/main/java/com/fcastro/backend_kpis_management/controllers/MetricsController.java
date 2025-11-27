package com.fcastro.backend_kpis_management.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fcastro.backend_kpis_management.model.dto.metrics.AdviserMetricsResponse;
import com.fcastro.backend_kpis_management.model.dto.metrics.DashboardMetricsResponse;
import com.fcastro.backend_kpis_management.services.MetricsService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricsController {

    private final MetricsService metricsService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardMetricsResponse> getDashboardMetrics(
        @RequestParam int year, 
        @RequestParam int month) {
        return ResponseEntity.ok(metricsService.getDashboardMetrics(year, month));
    }
    
    @GetMapping("/adviser/{adviserId}")
    public ResponseEntity<AdviserMetricsResponse> getAdviserMetrics(
        @PathVariable Long adviserId,
        @RequestParam int year, 
        @RequestParam int month) {
        return ResponseEntity.ok(metricsService.getAdviserMetrics(adviserId, year, month));
    }
}
