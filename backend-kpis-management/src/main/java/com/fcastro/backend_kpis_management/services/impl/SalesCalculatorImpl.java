package com.fcastro.backend_kpis_management.services.impl;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

import org.springframework.stereotype.Service;

import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.Sale;
import com.fcastro.backend_kpis_management.repositories.SaleRepository;
import com.fcastro.backend_kpis_management.services.SalesCalculator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Service
@RequiredArgsConstructor
@Slf4j
public class SalesCalculatorImpl implements SalesCalculator {

    private final SaleRepository saleRepository;

    @Override
    public Double calculateWeeklySales(Adviser adviser, LocalDate date) {
        LocalDate weekStart =  date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);

        log.info("Calculando ventas para asesor {} entre {} y {}", adviser.getId(), weekStart, weekEnd);

        return saleRepository.findByAdviserAndSaleDateBetween(adviser, weekStart, weekEnd)
            .stream()
            .mapToDouble(Sale::getAmount)
            .sum();
    }
    
}
