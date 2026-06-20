package com.fcastro.backend_kpis_management.services.impl;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.MonthlySummary;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.repositories.MonthlySummaryRepository;
import com.fcastro.backend_kpis_management.services.MonthlySummaryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MonthlySummaryServiceImpl implements MonthlySummaryService {

    private final MonthlySummaryRepository monthlySummaryRepository;
    private final AdviserRepository adviserRepository;

    @Override
    public void addSaleToMonthlySummary(Adviser adviser, LocalDate saleDate, Double amount) {
        int year = saleDate.getYear();
        int month = saleDate.getMonthValue();

        MonthlySummary summary = monthlySummaryRepository
                .findByAdviserIdAndYearAndMonth(adviser.getId(), year, month)
                .orElseGet(() -> newSummary(adviser, year, month));

        summary.setTotalSales(summary.getTotalSales() + amount);
        monthlySummaryRepository.save(summary);
    }

    @Override
    public void updateTotalSalesByAdviser(Long id, int year, int month, Double totalSales) {
        Adviser adviser = adviserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asesor no encontrado con id: " + id));

        MonthlySummary summary = monthlySummaryRepository
                .findByAdviserIdAndYearAndMonth(id, year, month)
                .orElseGet(() -> newSummary(adviser, year, month));

        summary.setTotalSales(totalSales != null ? totalSales : 0.0);
        monthlySummaryRepository.save(summary);
    }

    private MonthlySummary newSummary(Adviser adviser, int year, int month) {
        MonthlySummary summary = new MonthlySummary();
        summary.setAdviser(adviser);
        summary.setYear(year);
        summary.setMonth(month);
        summary.setTotalSales(0.0);
        summary.setGoal(0.0);
        return summary;
    }
}
