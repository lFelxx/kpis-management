package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.dto.budget.BudgetTemplateResponse;

import java.io.InputStream;
import java.time.LocalDate;

public interface BudgetTemplateService {

    BudgetTemplateResponse upload(InputStream excelFile, int year, int month);

    BudgetTemplateResponse getByYearAndMonth(int year, int month);

    BudgetTemplateResponse updateAdviserCount(int year, int month, LocalDate date, int adviserCount);

    void resetManualOverride(int year, int month, LocalDate date);

    double calculatePafUpToToday(int year, int month);

    double calculateGoalUpToToday(int year, int month);

    double calculateTotalMonthGoalPerAdviser(int year, int month);
}
