package com.fcastro.backend_kpis_management.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fcastro.backend_kpis_management.model.dto.sale.SaleRequest;
import com.fcastro.backend_kpis_management.model.dto.sale.WeekSale;
import com.fcastro.backend_kpis_management.services.SaleService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {
    private final SaleService saleService;

    @PostMapping("/add")
    public ResponseEntity<WeekSale> addSale(@RequestBody SaleRequest request) {
        return ResponseEntity.ok(saleService.processSale(request));
    }
}
