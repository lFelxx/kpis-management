package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.dto.budget.BudgetTemplateResponse;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface BudgetTemplateService {

    BudgetTemplateResponse upload(InputStream excelFile, int year, int month);

    BudgetTemplateResponse getByYearAndMonth(int year, int month);

    BudgetTemplateResponse updateAdviserCount(int year, int month, LocalDate date, int adviserCount);

    void resetManualOverride(int year, int month, LocalDate date);

    double calculatePafUpToDate(int year, int month, LocalDate cutoffDate);

    double calculateGoalUpToDate(int year, int month, LocalDate cutoffDate);

    Map<Long, Double> calculateGoalsUpToDatePerAdviser(int year, int month, LocalDate cutoffDate, List<Long> adviserIds);

    Map<Long, Double> calculateFullMonthGoalsPerAdviser(int year, int month, List<Long> adviserIds);

    BudgetTemplateResponse toggleAdviserExclusion(int year, int month, LocalDate date, Long adviserId);
}
