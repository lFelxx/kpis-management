package com.fcastro.backend_kpis_management.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcastro.backend_kpis_management.model.dto.sale.SaleRequest;
import com.fcastro.backend_kpis_management.model.dto.sale.WeekSale;
import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.services.AdviserService;
import com.fcastro.backend_kpis_management.services.MonthlySummaryService;
import com.fcastro.backend_kpis_management.services.SaleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SaleServiceImpl implements SaleService {

    private final AdviserService adviserService;
    private final MonthlySummaryService monthlySummaryService;
    private final AdviserRepository adviserRepository;

    @Override
    @Transactional
    public WeekSale processSale(SaleRequest request) {
        log.info("Procesando venta para el asesor {}", request.getAdviserId());
        
        // Procesar venta semanal
        WeekSale weeklySale = adviserService.addSale(request);
        
        // Procesar venta mensual
        Adviser adviser = adviserRepository.findById(request.getAdviserId())
            .orElseThrow(() -> new RuntimeException("Asesor no encontrado"));
            
        monthlySummaryService.addSaleToMonthlySummary(
            adviser,
            request.getSaleDate(),
            request.getAmount()
        );
        
        log.info("Venta procesada exitosamente desde el servicio 'SaleService' para el asesor {}", request.getAdviserId());
        return weeklySale;
    }
} 