package com.fcastro.backend_kpis_management.services.impl;

import com.fcastro.backend_kpis_management.client.MlServiceClient;
import com.fcastro.backend_kpis_management.exceptions.ResourceNotFoundException;
import com.fcastro.backend_kpis_management.model.dto.budget.DailyDistributionResponse;
import com.fcastro.backend_kpis_management.model.dto.prediction.*;
import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.MonthlySummary;
import com.fcastro.backend_kpis_management.model.entities.Sale;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.repositories.MonthlySummaryRepository;
import com.fcastro.backend_kpis_management.repositories.SaleRepository;
import com.fcastro.backend_kpis_management.services.BudgetTemplateService;
import com.fcastro.backend_kpis_management.services.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PredictionServiceImpl implements PredictionService {

    private final AdviserRepository adviserRepository;
    private final MonthlySummaryRepository monthlySummaryRepository;
    private final SaleRepository saleRepository;
    private final BudgetTemplateService budgetTemplateService;
    private final MlServiceClient mlServiceClient;

    // ── Predicción de cierre por asesor ──────────────────────────────────────

    @Override
    public ClosingPredictionResponse predictClosingForAdviser(Long adviserId, int year, int month) {
        Adviser adviser = findAdviserOrThrow(adviserId);
        LocalDate today = LocalDate.now();
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());
        LocalDate cutoff = isFutureOrCurrentMonth(today, year, month) ? today : lastDay;

        List<DailySaleDto> currentSales = buildCurrentDailySales(adviser, firstDay, cutoff);
        List<HistoricalMonthDto> history = buildHistoricalMonths(adviser, year, month);
        double goal = resolveFullMonthGoal(adviserId, year, month);
        List<DailySaleDto> dailyBudget = buildDailyBudget(adviserId, year, month);

        return mlServiceClient.predictClosing(new ClosingPredictionRequest(
                adviserId,
                fullName(adviser),
                year, month,
                cutoff.getDayOfMonth(),
                lastDay.getDayOfMonth(),
                sumSales(currentSales),
                goal,
                currentSales,
                history,
                dailyBudget
        ));
    }

    // ── Detección de riesgo por asesor ────────────────────────────────────────

    @Override
    public RiskDetectionResponse detectRiskForAdviser(Long adviserId, int year, int month) {
        Adviser adviser = findAdviserOrThrow(adviserId);
        LocalDate today = LocalDate.now();
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());
        LocalDate cutoff = isFutureOrCurrentMonth(today, year, month) ? today : lastDay;

        List<DailySaleDto> currentSales = buildCurrentDailySales(adviser, firstDay, cutoff);
        List<HistoricalMonthDto> history = buildHistoricalMonths(adviser, year, month);
        double goal = resolveFullMonthGoal(adviserId, year, month);
        List<DailySaleDto> dailyBudget = buildDailyBudget(adviserId, year, month);

        return mlServiceClient.detectRisk(new RiskDetectionRequest(
                adviserId,
                fullName(adviser),
                cutoff.getDayOfMonth(),
                lastDay.getDayOfMonth(),
                sumSales(currentSales),
                goal,
                history,
                dailyBudget
        ));
    }

    // ── Proyección de cierre de tienda ────────────────────────────────────────

    @Override
    public StoreClosingResponse predictStoreClosing(int year, int month) {
        LocalDate today = LocalDate.now();
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());
        LocalDate cutoff = isFutureOrCurrentMonth(today, year, month) ? today : lastDay;

        List<Adviser> activeAdvisers = adviserRepository.findAllActiveAdvisers();
        List<Long> adviserIds = activeAdvisers.stream().map(Adviser::getId).toList();

        Map<Long, Double> goals = resolveFullMonthGoalsForAll(adviserIds, year, month);
        double storeGoal = goals.values().stream().mapToDouble(Double::doubleValue).sum();

        List<AdviserInputDto> adviserInputs = activeAdvisers.stream()
                .map(adviser -> buildAdviserInput(adviser, year, month, firstDay, cutoff, goals))
                .toList();

        return mlServiceClient.predictStoreClosing(new StoreClosingRequest(
                year, month,
                cutoff.getDayOfMonth(),
                lastDay.getDayOfMonth(),
                storeGoal,
                adviserInputs
        ));
    }

    // ── Patrones de ventas por asesor ─────────────────────────────────────────

    @Override
    public PatternResponse analyzePatternsForAdviser(Long adviserId) {
        Adviser adviser = findAdviserOrThrow(adviserId);
        List<HistoricalMonthDto> history = buildHistoricalMonths(adviser, LocalDate.now().getYear(), LocalDate.now().getMonthValue());

        return mlServiceClient.analyzePatterns(new PatternRequest(adviserId, history));
    }

    // ── Detección de anomalías por asesor ─────────────────────────────────────

    @Override
    public AnomalyResponse detectAnomaliesForAdviser(Long adviserId, int year, int month) {
        Adviser adviser = findAdviserOrThrow(adviserId);
        LocalDate today = LocalDate.now();
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());
        LocalDate cutoff = isFutureOrCurrentMonth(today, year, month) ? today : lastDay;

        List<DailySaleDto> currentSales = buildCurrentDailySales(adviser, firstDay, cutoff);
        List<HistoricalMonthDto> history = buildHistoricalMonths(adviser, year, month);

        return mlServiceClient.detectAnomalies(new AnomalyRequest(adviserId, currentSales, history));
    }

    // ── Construcción de datos ─────────────────────────────────────────────────

    private AdviserInputDto buildAdviserInput(Adviser adviser, int year, int month,
                                               LocalDate firstDay, LocalDate today,
                                               Map<Long, Double> goals) {
        List<DailySaleDto> currentSales = buildCurrentDailySales(adviser, firstDay, today);
        List<HistoricalMonthDto> history = buildHistoricalMonths(adviser, year, month);
        double goal = goals.getOrDefault(adviser.getId(), 0.0);
        List<DailySaleDto> dailyBudget = buildDailyBudget(adviser.getId(), year, month);

        return new AdviserInputDto(
                adviser.getId(),
                fullName(adviser),
                sumSales(currentSales),
                goal,
                history,
                dailyBudget
        );
    }

    private List<DailySaleDto> buildDailyBudget(Long adviserId, int year, int month) {
        try {
            return budgetTemplateService.getByYearAndMonth(year, month)
                    .days().stream()
                    .filter(d -> !d.excludedAdviserIds().contains(adviserId))
                    .map(d -> new DailySaleDto(d.date().toString(), d.goalPerAdviser(), d.weightPercentage()))
                    .toList();
        } catch (ResourceNotFoundException e) {
            return List.of();
        }
    }

    private List<DailySaleDto> buildCurrentDailySales(Adviser adviser, LocalDate from, LocalDate to) {
        return saleRepository.findByAdviserAndSaleDateBetween(adviser, from, to).stream()
                .map(this::toDailySaleDto)
                .toList();
    }

    private List<HistoricalMonthDto> buildHistoricalMonths(Adviser adviser, int currentYear, int currentMonth) {
        return monthlySummaryRepository
                .findByAdviserIdAndYearOrderByMonthAsc(adviser.getId(), currentYear)
                .stream()
                .filter(s -> !isCurrentMonth(s, currentYear, currentMonth))
                .map(this::toHistoricalMonthDto)
                .toList();
    }

    private double resolveFullMonthGoal(Long adviserId, int year, int month) {
        try {
            return budgetTemplateService
                    .calculateFullMonthGoalsPerAdviser(year, month, List.of(adviserId))
                    .getOrDefault(adviserId, 0.0);
        } catch (Exception e) {
            return monthlySummaryRepository
                    .findByAdviserIdAndYearAndMonth(adviserId, year, month)
                    .map(MonthlySummary::getGoal)
                    .orElse(0.0);
        }
    }

    private Map<Long, Double> resolveFullMonthGoalsForAll(List<Long> adviserIds, int year, int month) {
        try {
            return budgetTemplateService.calculateFullMonthGoalsPerAdviser(year, month, adviserIds);
        } catch (Exception e) {
            return Map.of();
        }
    }

    // ── Mapeos ────────────────────────────────────────────────────────────────

    private DailySaleDto toDailySaleDto(Sale sale) {
        return new DailySaleDto(sale.getSaleDate().toString(), sale.getAmount(), 0.0);
    }

    private HistoricalMonthDto toHistoricalMonthDto(MonthlySummary summary) {
        LocalDate from = LocalDate.of(summary.getYear(), summary.getMonth(), 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());

        List<DailySaleDto> dailySales = saleRepository
                .findByAdviserAndSaleDateBetween(summary.getAdviser(), from, to).stream()
                .map(this::toDailySaleDto)
                .toList();

        return new HistoricalMonthDto(
                summary.getYear(), summary.getMonth(),
                summary.getTotalSales(), summary.getGoal(),
                dailySales
        );
    }

    // ── Utilidades ────────────────────────────────────────────────────────────

    private Adviser findAdviserOrThrow(Long adviserId) {
        return adviserRepository.findById(adviserId)
                .orElseThrow(() -> new ResourceNotFoundException("Asesor no encontrado con ID: " + adviserId));
    }

    private String fullName(Adviser adviser) {
        return adviser.getName() + " " + adviser.getLastname();
    }

    private double sumSales(List<DailySaleDto> sales) {
        return sales.stream().mapToDouble(DailySaleDto::amount).sum();
    }

    private boolean isCurrentMonth(MonthlySummary summary, int year, int month) {
        return summary.getYear() == year && summary.getMonth() == month;
    }

    private boolean isFutureOrCurrentMonth(LocalDate today, int year, int month) {
        return today.getYear() < year
                || (today.getYear() == year && today.getMonthValue() <= month);
    }
}
