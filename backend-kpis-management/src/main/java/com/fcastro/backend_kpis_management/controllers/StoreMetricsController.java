package com.fcastro.backend_kpis_management.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fcastro.backend_kpis_management.model.dto.store.StoreMetricsRequest;
import com.fcastro.backend_kpis_management.model.dto.store.StoreMetricsResponse;
import com.fcastro.backend_kpis_management.services.StoreMetricsService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/store-metrics")
@RequiredArgsConstructor
public class StoreMetricsController {

    private final StoreMetricsService storeMetricsService;

    @PostMapping
    public ResponseEntity<StoreMetricsResponse> createStoreMetrics(
            @Valid @RequestBody StoreMetricsRequest request) {
        log.info("Creando métricas de tienda para {}/{}", request.getMonth(), request.getYear());
        StoreMetricsResponse response = storeMetricsService.createOrUpdateStoreMetrics(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<StoreMetricsResponse> updateStoreMetrics(
            @Valid @RequestBody StoreMetricsRequest request) {
        log.info("Actualizando métricas de tienda para {}/{}", request.getMonth(), request.getYear());
        StoreMetricsResponse response = storeMetricsService.createOrUpdateStoreMetrics(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<StoreMetricsResponse> getStoreMetrics(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        log.info("Obteniendo métricas de tienda para {}/{}", month, year);
        StoreMetricsResponse response = storeMetricsService.getStoreMetrics(year, month);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/recalculate")
    public ResponseEntity<Void> recalculatePercentages(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        log.info("Recalculando porcentajes de métricas de tienda para {}/{}", month, year);
        storeMetricsService.calculateAndUpdatePercentages(year, month);
        return ResponseEntity.ok().build();
    }
}

