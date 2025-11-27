package com.fcastro.backend_kpis_management.services;

import java.time.LocalDate;

import com.fcastro.backend_kpis_management.model.entities.Adviser;

public interface MonthlySummaryService {
    void addSaleToMonthlySummary(Adviser adviser, LocalDate saleDate, Double amount);

    void updateTotalSalesByAdviser(Long id, int year, int month, Double totalSales);
    
    void updateGoalIfExists(Long adviserId, Double goalValue, int year, int month);

}
