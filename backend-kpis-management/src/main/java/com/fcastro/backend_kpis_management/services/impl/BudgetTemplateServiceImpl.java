package com.fcastro.backend_kpis_management.services.impl;

import com.fcastro.backend_kpis_management.exceptions.ResourceNotFoundException;
import com.fcastro.backend_kpis_management.model.dto.budget.BudgetTemplateResponse;
import com.fcastro.backend_kpis_management.model.dto.budget.DailyDistributionResponse;
import com.fcastro.backend_kpis_management.model.dto.budget.ParsedBudgetTemplate;
import com.fcastro.backend_kpis_management.model.dto.budget.ParsedDayData;
import com.fcastro.backend_kpis_management.model.entities.BudgetTemplate;
import com.fcastro.backend_kpis_management.model.entities.DailyBudgetDistribution;
import com.fcastro.backend_kpis_management.repositories.BudgetTemplateRepository;
import com.fcastro.backend_kpis_management.repositories.DailyBudgetDistributionRepository;
import com.fcastro.backend_kpis_management.services.BudgetTemplateService;
import com.fcastro.backend_kpis_management.services.GoalService;
import com.fcastro.backend_kpis_management.util.BudgetExcelParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetTemplateServiceImpl implements BudgetTemplateService {

    private final BudgetTemplateRepository budgetTemplateRepository;
    private final DailyBudgetDistributionRepository dailyDistributionRepository;
    private final BudgetExcelParser excelParser;
    private final GoalService goalService;

    @Override
    @Transactional
    public BudgetTemplateResponse upload(InputStream excelFile, int year, int month) {
        log.info("Procesando Excel de presupuesto para {}/{}", month, year);

        ParsedBudgetTemplate parsed = excelParser.parse(excelFile, year, month);

        BudgetTemplate template = findOrCreateTemplate(year, month, parsed.totalBudget());
        replaceDistributions(template, parsed);

        BudgetTemplate saved = budgetTemplateRepository.save(template);
        log.info("Presupuesto {}/{} guardado con {} días", month, year, saved.getDailyDistributions().size());

        distributeGoalsToAdvisers(saved, year, month);
        return toResponse(saved);
    }

    @Override
    public BudgetTemplateResponse getByYearAndMonth(int year, int month) {
        BudgetTemplate template = findTemplateOrThrow(year, month);
        return toResponse(template);
    }

    @Override
    @Transactional
    public BudgetTemplateResponse updateAdviserCount(int year, int month, LocalDate date, int adviserCount) {
        log.info("Actualizando asesores del día {} a {}", date, adviserCount);

        BudgetTemplate template = findTemplateOrThrow(year, month);

        DailyBudgetDistribution day = dailyDistributionRepository
                .findByBudgetTemplateIdAndDate(template.getId(), date)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe distribución para la fecha: " + date));

        day.setAdviserCount(adviserCount);
        day.setGoalPerAdviser(calculateGoalPerAdviser(day.getDailyAmount(), adviserCount));
        day.setManualOverride(true);
        dailyDistributionRepository.save(day);

        distributeGoalsToAdvisers(template, year, month);
        return toResponse(template);
    }

    @Override
    @Transactional
    public void resetManualOverride(int year, int month, LocalDate date) {
        log.info("Reseteando override manual del día {} para {}/{}", date, month, year);

        BudgetTemplate template = findTemplateOrThrow(year, month);

        DailyBudgetDistribution day = dailyDistributionRepository
                .findByBudgetTemplateIdAndDate(template.getId(), date)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe distribución para la fecha: " + date));

        day.setManualOverride(false);
        dailyDistributionRepository.save(day);

        distributeGoalsToAdvisers(template, year, month);
    }

    @Override
    public double calculatePafUpToDate(int year, int month, LocalDate cutoffDate) {
        BudgetTemplate template = findTemplateOrThrow(year, month);
        return dailyDistributionRepository
                .findByBudgetTemplateIdAndDateLessThanEqual(template.getId(), cutoffDate)
                .stream()
                .mapToDouble(DailyBudgetDistribution::getDailyAmount)
                .sum();
    }

    @Override
    public double calculateGoalUpToDate(int year, int month, LocalDate cutoffDate) {
        BudgetTemplate template = findTemplateOrThrow(year, month);
        return dailyDistributionRepository
                .findByBudgetTemplateIdAndDateLessThanEqual(template.getId(), cutoffDate)
                .stream()
                .mapToDouble(DailyBudgetDistribution::getGoalPerAdviser)
                .sum();
    }

    @Override
    public double calculateTotalMonthGoalPerAdviser(int year, int month) {
        BudgetTemplate template = findTemplateOrThrow(year, month);
        return template.getDailyDistributions().stream()
                .mapToDouble(DailyBudgetDistribution::getGoalPerAdviser)
                .sum();
    }

    // --- Lógica interna ---

    private BudgetTemplate findOrCreateTemplate(int year, int month, double totalBudget) {
        BudgetTemplate template = budgetTemplateRepository
                .findByYearAndMonth(year, month)
                .orElseGet(BudgetTemplate::new);

        template.setYear(year);
        template.setMonth(month);
        template.setTotalBudget(totalBudget);
        template.setUploadedAt(LocalDateTime.now());
        return template;
    }

    private void replaceDistributions(BudgetTemplate template, ParsedBudgetTemplate parsed) {
        List<DailyBudgetDistribution> existing = template.getDailyDistributions();

        for (ParsedDayData dayData : parsed.days()) {
            existing.stream()
                    .filter(d -> d.getDate().equals(dayData.date()))
                    .findFirst()
                    .ifPresentOrElse(
                            existing_ -> updateDistributionFromExcel(existing_, dayData, parsed.totalBudget()),
                            () -> existing.add(buildDistribution(template, dayData, parsed.totalBudget()))
                    );
        }
    }

    private void updateDistributionFromExcel(DailyBudgetDistribution distribution,
                                              ParsedDayData dayData,
                                              double totalBudget) {
        double dailyAmount = totalBudget * dayData.weightPercentage();
        distribution.setWeightPercentage(dayData.weightPercentage());
        distribution.setDailyAmount(dailyAmount);

        if (!distribution.isManualOverride()) {
            distribution.setAdviserCount(dayData.adviserCount());
        }
        // goalPerAdviser siempre se recalcula: el presupuesto puede cambiar aunque los asesores estén fijos
        distribution.setGoalPerAdviser(calculateGoalPerAdviser(dailyAmount, distribution.getAdviserCount()));
    }

    private DailyBudgetDistribution buildDistribution(BudgetTemplate template,
                                                       ParsedDayData dayData,
                                                       double totalBudget) {
        double dailyAmount = totalBudget * dayData.weightPercentage();

        DailyBudgetDistribution distribution = new DailyBudgetDistribution();
        distribution.setBudgetTemplate(template);
        distribution.setDate(dayData.date());
        distribution.setWeightPercentage(dayData.weightPercentage());
        distribution.setDailyAmount(dailyAmount);
        distribution.setAdviserCount(dayData.adviserCount());
        distribution.setGoalPerAdviser(calculateGoalPerAdviser(dailyAmount, dayData.adviserCount()));
        distribution.setManualOverride(false);
        return distribution;
    }

    private double calculateGoalPerAdviser(double dailyAmount, int adviserCount) {
        if (adviserCount <= 0) return 0;
        return dailyAmount / adviserCount;
    }

    /**
     * Suma todos los goalPerAdviser del mes y asigna esa meta mensual
     * a cada asesor activo via GoalService.
     */
    private void distributeGoalsToAdvisers(BudgetTemplate template, int year, int month) {
        double goalUpToYesterday = template.getDailyDistributions().stream()
                .filter(d -> !d.getDate().isAfter(LocalDate.now().minusDays(1)))
                .mapToDouble(DailyBudgetDistribution::getGoalPerAdviser)
                .sum();

        log.info("Distribuyendo meta acumulada hasta ayer ${} a asesores activos para {}/{}", goalUpToYesterday, month, year);
        goalService.updateGoalsForAllActiveAdvisers(goalUpToYesterday, year, month);
    }

    private BudgetTemplate findTemplateOrThrow(int year, int month) {
        return budgetTemplateRepository.findByYearAndMonth(year, month)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("No existe presupuesto para %d/%d", month, year)));
    }

    // --- Mapeo a respuesta ---

    private BudgetTemplateResponse toResponse(BudgetTemplate template) {
        List<DailyDistributionResponse> days = template.getDailyDistributions().stream()
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .map(this::toDailyResponse)
                .toList();

        double distributedBudget = days.stream()
                .mapToDouble(DailyDistributionResponse::dailyAmount)
                .sum();

        return new BudgetTemplateResponse(
                template.getId(),
                template.getYear(),
                template.getMonth(),
                template.getTotalBudget(),
                distributedBudget,
                template.getUploadedAt(),
                days
        );
    }

    private DailyDistributionResponse toDailyResponse(DailyBudgetDistribution d) {
        return new DailyDistributionResponse(
                d.getId(),
                d.getDate(),
                d.getWeightPercentage(),
                d.getDailyAmount(),
                d.getAdviserCount(),
                d.getGoalPerAdviser(),
                d.isManualOverride()
        );
    }
}
