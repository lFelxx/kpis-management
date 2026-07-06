package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.Sale;
import com.fcastro.backend_kpis_management.repositories.SaleRepository;
import com.fcastro.backend_kpis_management.services.impl.SalesCalculatorImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SalesCalculatorImplTest {

    @Mock  private SaleRepository     saleRepository;
    @InjectMocks private SalesCalculatorImpl service;

    private Adviser adviser;

    @BeforeEach
    void setUp() {
        adviser = new Adviser();
        adviser.setId(1L);
        adviser.setName("Fernanda Cadena");
    }

    @Test
    void calculateWeeklySales_sumsAllSalesInWeek() {
        // Wednesday 2026-06-03 — week is Mon 06-01 to Sun 06-07
        LocalDate wednesday = LocalDate.of(2026, 6, 3);
        when(saleRepository.findByAdviserAndSaleDateBetween(
                eq(adviser),
                eq(LocalDate.of(2026, 6, 1)),   // Monday
                eq(LocalDate.of(2026, 6, 7))))   // Sunday
                .thenReturn(List.of(sale(500_000), sale(300_000), sale(200_000)));

        double result = service.calculateWeeklySales(adviser, wednesday);

        assertThat(result).isEqualTo(1_000_000.0);
    }

    @Test
    void calculateWeeklySales_noSales_returnsZero() {
        LocalDate monday = LocalDate.of(2026, 6, 1);
        when(saleRepository.findByAdviserAndSaleDateBetween(any(), any(), any()))
                .thenReturn(List.of());

        double result = service.calculateWeeklySales(adviser, monday);

        assertThat(result).isEqualTo(0.0);
    }

    @Test
    void calculateWeeklySales_onMonday_usesCorrectWeekBounds() {
        // Monday should use itself as week start
        LocalDate monday = LocalDate.of(2026, 6, 8);
        when(saleRepository.findByAdviserAndSaleDateBetween(
                eq(adviser),
                eq(LocalDate.of(2026, 6, 8)),
                eq(LocalDate.of(2026, 6, 14))))
                .thenReturn(List.of(sale(750_000)));

        double result = service.calculateWeeklySales(adviser, monday);

        assertThat(result).isEqualTo(750_000.0);
    }

    @Test
    void calculateWeeklySales_onSunday_usesCorrectWeekBounds() {
        // Sunday should still belong to its week (Mon-Sun)
        LocalDate sunday = LocalDate.of(2026, 6, 7);
        when(saleRepository.findByAdviserAndSaleDateBetween(
                eq(adviser),
                eq(LocalDate.of(2026, 6, 1)),
                eq(LocalDate.of(2026, 6, 7))))
                .thenReturn(List.of(sale(400_000), sale(600_000)));

        double result = service.calculateWeeklySales(adviser, sunday);

        assertThat(result).isEqualTo(1_000_000.0);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Sale sale(double amount) {
        Sale s = new Sale();
        s.setAdviser(adviser);
        s.setAmount(amount);
        return s;
    }
}
