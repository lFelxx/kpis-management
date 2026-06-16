package com.fcastro.backend_kpis_management.services.impl;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcastro.backend_kpis_management.exceptions.BusinessException;
import com.fcastro.backend_kpis_management.exceptions.ResourceNotFoundException;
import com.fcastro.backend_kpis_management.mapper.StoreMetricsMapper;
import com.fcastro.backend_kpis_management.model.dto.store.StoreMetricsRequest;
import com.fcastro.backend_kpis_management.model.dto.store.StoreMetricsResponse;
import com.fcastro.backend_kpis_management.model.entities.StoreMetrics;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.repositories.BudgetTemplateRepository;
import com.fcastro.backend_kpis_management.repositories.GoalRepository;
import com.fcastro.backend_kpis_management.repositories.MonthlySummaryRepository;
import com.fcastro.backend_kpis_management.repositories.StoreMetricsRepository;
import com.fcastro.backend_kpis_management.services.BudgetTemplateService;
import com.fcastro.backend_kpis_management.services.StoreMetricsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class StoreMetricsServiceImpl implements StoreMetricsService {

    private final StoreMetricsRepository storeMetricsRepository;
    private final AdviserRepository adviserRepository;
    private final MonthlySummaryRepository monthlySummaryRepository;
    private final GoalRepository goalRepository;
    private final StoreMetricsMapper storeMetricsMapper;
    private final BudgetTemplateRepository budgetTemplateRepository;
    private final BudgetTemplateService budgetTemplateService;

    @Override
    @Transactional
    public StoreMetricsResponse createOrUpdateStoreMetrics(StoreMetricsRequest request) {
        log.info("Creando o actualizando métricas de tienda para {}/{}", request.getMonth(), request.getYear());
        
        validateYearAndMonth(request.getYear(), request.getMonth());
        
        StoreMetrics storeMetrics = storeMetricsRepository
                .findByYearAndMonth(request.getYear(), request.getMonth())
                .orElse(new StoreMetrics());
        
        storeMetrics.setYear(request.getYear());
        storeMetrics.setMonth(request.getMonth());
        storeMetrics.setPaf(request.getPaf());
        
        // Calcular porcentajes automáticamente
        calculatePercentages(storeMetrics);
        
        StoreMetrics saved = storeMetricsRepository.save(storeMetrics);
        log.info("Métricas de tienda guardadas exitosamente - ID: {}", saved.getId());
        
        return storeMetricsMapper.toResponse(saved);
    }

    @Override
    public StoreMetricsResponse getStoreMetrics(int year, int month) {
        log.info("Obteniendo métricas de tienda para {}/{}", month, year);
        
        StoreMetrics storeMetrics = storeMetricsRepository
                .findByYearAndMonth(year, month)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Métricas de tienda no encontradas para %d/%d", month, year)
                ));
        
        // Recalcular porcentajes antes de devolver (por si las ventas cambiaron)
        calculatePercentages(storeMetrics);
        storeMetricsRepository.save(storeMetrics);
        
        return storeMetricsMapper.toResponse(storeMetrics);
    }

    @Override
    @Transactional
    public void calculateAndUpdatePercentages(int year, int month) {
        log.info("Recalculando porcentajes de métricas de tienda para {}/{}", month, year);
        
        StoreMetrics storeMetrics = storeMetricsRepository
                .findByYearAndMonth(year, month)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Métricas de tienda no encontradas para %d/%d", month, year)
                ));
        
        calculatePercentages(storeMetrics);
        storeMetricsRepository.save(storeMetrics);
        
        log.info("Porcentajes recalculados exitosamente");
    }

    private void calculatePercentages(StoreMetrics storeMetrics) {
        int year = storeMetrics.getYear();
        int month = storeMetrics.getMonth();

        Double totalSales = calculateTotalSales(year, month);
        Double totalGoal = calculateTotalGoal(year, month);
        Double paf = resolvePaf(storeMetrics);

        storeMetrics.setPaf(paf);
        storeMetrics.setPercentagePaf(calculatePercentagePaf(totalSales, totalGoal));
        storeMetrics.setPercentagePr(calculatePercentagePr(totalSales, paf));

        log.debug("Métricas calculadas - Ventas: {}, Meta: {}, P.A.F: {}, % P.A.F: {}, % P.R: {}",
                totalSales, totalGoal, paf, storeMetrics.getPercentagePaf(), storeMetrics.getPercentagePr());
    }

    /**
     * Si existe un BudgetTemplate para el mes, calcula el paf sumando los dailyAmounts
     * hasta el día de hoy. Si no existe, usa el valor ingresado manualmente.
     */
    private Double resolvePaf(StoreMetrics storeMetrics) {
        int year = storeMetrics.getYear();
        int month = storeMetrics.getMonth();

        if (budgetTemplateRepository.existsByYearAndMonth(year, month)) {
            return budgetTemplateService.calculatePafUpToDate(year, month, LocalDate.now().minusDays(1));
        }
        return storeMetrics.getPaf();
    }

    /**
     * Reutiliza la lógica de MetricsServiceImpl para calcular ventas totales
     */
    private Double calculateTotalSales(int year, int month) {
        return monthlySummaryRepository.findByYearAndMonth(year, month).stream()
                .mapToDouble(ms -> ms.getTotalSales() != null ? ms.getTotalSales() : 0.0)
                .sum();
    }

    /**
     * Reutiliza la lógica de MetricsServiceImpl para calcular meta total
     */
    private Double calculateTotalGoal(int year, int month) {
        return adviserRepository.findAllActiveAdvisers().stream()
                .mapToDouble(adviser -> {
                    return goalRepository
                            .findByAdviserIdAndYearAndMonth(adviser.getId(), year, month)
                            .map(goal -> goal.getGoalValue() != null ? goal.getGoalValue() : 0.0)
                            .orElse(0.0);
                })
                .sum();
    }

    /**
     * Calcula el porcentaje hasta la fecha: (venta acumulada / meta total) * 100
     */
    private Double calculatePercentagePaf(Double totalSales, Double totalGoal) {
        if (totalGoal == null || totalGoal == 0.0) {
            return 0.0;
        }
        if (totalSales == null) {
            totalSales = 0.0;
        }
        return (totalSales / totalGoal) * 100;
    }

    /**
     * Calcula el porcentaje real: (venta total / P.A.F) * 100
     */
    private Double calculatePercentagePr(Double totalSales, Double paf) {
        if (paf == null || paf == 0.0) {
            return 0.0;
        }
        if (totalSales == null) {
            totalSales = 0.0;
        }
        return (totalSales / paf) * 100;
    }

    /**
     * Valida año y mes
     */
    private void validateYearAndMonth(Integer year, Integer month) {
        if (year == null || month == null) {
            throw new BusinessException("El año y mes son requeridos");
        }
        if (month < 1 || month > 12) {
            throw new BusinessException("El mes debe estar entre 1 y 12");
        }
        if (year < 2000 || year > 3000) {
            throw new BusinessException("El año debe ser válido");
        }
    }

}

