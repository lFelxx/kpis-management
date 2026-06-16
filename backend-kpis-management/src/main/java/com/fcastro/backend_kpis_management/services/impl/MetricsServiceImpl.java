package com.fcastro.backend_kpis_management.services.impl;

import com.fcastro.backend_kpis_management.model.dto.metrics.AdviserMetricsResponse;
import com.fcastro.backend_kpis_management.model.dto.metrics.AdviserPartialWeekGrowthInfo;
import com.fcastro.backend_kpis_management.model.dto.metrics.AtRiskAdviserInfo;
import com.fcastro.backend_kpis_management.model.dto.metrics.BestAdviserInfo;
import com.fcastro.backend_kpis_management.model.dto.metrics.DashboardMetricsResponse;
import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.AdviserSalesReport;
import com.fcastro.backend_kpis_management.model.entities.MonthlySummary;
import com.fcastro.backend_kpis_management.model.entities.Sale;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.repositories.AdviserSalesReportRepository;
import com.fcastro.backend_kpis_management.repositories.BudgetTemplateRepository;
import com.fcastro.backend_kpis_management.repositories.GoalRepository;
import com.fcastro.backend_kpis_management.repositories.MonthlySummaryRepository;
import com.fcastro.backend_kpis_management.repositories.SaleRepository;
import com.fcastro.backend_kpis_management.services.BudgetTemplateService;
import com.fcastro.backend_kpis_management.services.CommissionService;
import com.fcastro.backend_kpis_management.services.MetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MetricsServiceImpl implements MetricsService {

    private final AdviserRepository adviserRepository;
    private final AdviserSalesReportRepository adviserSalesReportRepository;
    private final MonthlySummaryRepository monthlySummaryRepository;
    private final GoalRepository goalRepository;
    private final CommissionService commissionService;
    private final SaleRepository saleRepository;
    private final BudgetTemplateRepository budgetTemplateRepository;
    private final BudgetTemplateService budgetTemplateService;

    @Override
    public DashboardMetricsResponse getDashboardMetrics(int year, int month) {
        List<Adviser> activeAdvisers = adviserRepository.findAllActiveAdvisers();

        if (activeAdvisers.isEmpty()) {
            return new DashboardMetricsResponse(
                    0.0, 0.0, 0, 0.0, 0.0, null, null, null,
                    0.0, 0.0, 0.0, List.of());
        }

        List<MonthlySummary> monthlySummaries = monthlySummaryRepository.findByYearAndMonth(year, month);
        Map<Long, Double> uptByAdviserId = buildUptMap(year, month);

        Double totalSales = monthlySummaries.stream().mapToDouble(MonthlySummary::getTotalSales).sum();
        double goalPerAdviser = resolveGoalPerAdviser(year, month);
        Double totalGoal = goalPerAdviser * activeAdvisers.size();
        Double goalAchievement = totalGoal > 0
                ? commissionService.computeStoreGoalAchievementPercent(year, month)
                : 0.0;
        Double averageSales = totalSales / activeAdvisers.size();

        List<MonthlySummary> activeAdviserSummaries = monthlySummaries.stream()
                .filter(s -> s.getAdviser() != null && Boolean.TRUE.equals(s.getAdviser().getActive()))
                .toList();

        BestAdviserInfo bestAdviser  = findBestByGoalAchievement(activeAdviserSummaries, uptByAdviserId, goalPerAdviser);
        BestAdviserInfo bestUptAdviser = findBestByUpt(activeAdviserSummaries, uptByAdviserId, goalPerAdviser);
        BestAdviserInfo worstAdviser = findWorstByGoalAchievement(activeAdviserSummaries, uptByAdviserId, goalPerAdviser);

        PartialWeekTotals partialWeek = computePartialWeekComparisons(activeAdvisers);

        return new DashboardMetricsResponse(
                totalSales, totalGoal, activeAdvisers.size(),
                goalAchievement, averageSales,
                bestAdviser, bestUptAdviser, worstAdviser,
                partialWeek.storeCurrent(), partialWeek.storePrevious(),
                partialWeek.storeGrowthPercent(), partialWeek.adviserRows());
    }

    @Override
    public AdviserMetricsResponse getAdviserMetrics(Long adviserId, int year, int month) {
        MonthlySummary monthlySummary = monthlySummaryRepository
                .findByAdviserIdAndYearAndMonth(adviserId, year, month)
                .orElseThrow(() -> new RuntimeException("Resumen mensual no encontrado"));

        Adviser adviser = adviserRepository.findById(adviserId)
                .orElseThrow(() -> new RuntimeException("Asesor no encontrado"));

        double resolvedGoal = resolveGoalPerAdviser(year, month);

        Double goalAchievement = calculateGoalAchievement(monthlySummary.getTotalSales(), resolvedGoal);

        return new AdviserMetricsResponse(adviserId, adviser.getName(), monthlySummary.getTotalSales(),
                resolvedGoal, goalAchievement);
    }

    // ─── Asesores en riesgo ──────────────────────────────────────────────────

    @Override
    public List<AtRiskAdviserInfo> getAtRiskAdvisers() {
        LocalDate today   = LocalDate.now();
        int year          = today.getYear();
        int month         = today.getMonthValue();
        int daysElapsed   = today.getDayOfMonth();
        int daysInMonth   = today.lengthOfMonth();
        double monthGoal  = resolveFullMonthGoalPerAdviser(year, month);

        if (daysElapsed == 0 || monthGoal <= 0) return List.of();

        return monthlySummaryRepository.findByYearAndMonth(year, month).stream()
                .filter(s -> s.getAdviser() != null && Boolean.TRUE.equals(s.getAdviser().getActive()))
                .map(s -> toAtRiskInfo(s, daysElapsed, daysInMonth, monthGoal))
                .filter(a -> a.projectedAchievement() < 80.0)
                .sorted((a, b) -> Double.compare(a.projectedAchievement(), b.projectedAchievement()))
                .toList();
    }

    private AtRiskAdviserInfo toAtRiskInfo(MonthlySummary s, int daysElapsed, int daysInMonth, double monthGoal) {
        double currentSales   = s.getTotalSales() != null ? s.getTotalSales() : 0.0;
        double projectedSales = (currentSales / daysElapsed) * daysInMonth;
        double projectedPct   = (projectedSales / monthGoal) * 100.0;
        return new AtRiskAdviserInfo(
                s.getAdviser().getId(),
                s.getAdviser().getName() + " " + s.getAdviser().getLastname(),
                currentSales,
                monthGoal,
                projectedSales,
                projectedPct
        );
    }

    private double resolveFullMonthGoalPerAdviser(int year, int month) {
        if (budgetTemplateRepository.existsByYearAndMonth(year, month)) {
            return budgetTemplateService.calculateTotalMonthGoalPerAdviser(year, month);
        }
        return adviserRepository.findAllActiveAdvisers().stream()
                .mapToDouble(adviser -> goalRepository
                        .findByAdviserIdAndYearAndMonth(adviser.getId(), year, month)
                        .map(g -> g.getGoalValue())
                        .orElse(0.0))
                .average()
                .orElse(0.0);
    }

    // ─── Ranking de asesores ─────────────────────────────────────────────────

    private BestAdviserInfo findBestByGoalAchievement(List<MonthlySummary> summaries, Map<Long, Double> uptByAdviserId, double goalPerAdviser) {
        return summaries.stream()
                .map(s -> toAdviserInfo(s, uptByAdviserId, goalPerAdviser))
                .max((a, b) -> {
                    int cmp = Double.compare(a.goalAchievement(), b.goalAchievement());
                    if (Math.abs(a.goalAchievement() - b.goalAchievement()) < 0.01) {
                        return Double.compare(a.upt(), b.upt());
                    }
                    return cmp;
                })
                .orElse(null);
    }

    private BestAdviserInfo findBestByUpt(List<MonthlySummary> summaries, Map<Long, Double> uptByAdviserId, double goalPerAdviser) {
        return summaries.stream()
                .map(s -> toAdviserInfo(s, uptByAdviserId, goalPerAdviser))
                .filter(info -> info.upt() > 0.0)
                .max((a, b) -> {
                    int cmp = Double.compare(a.upt(), b.upt());
                    return cmp != 0 ? cmp : Double.compare(a.goalAchievement(), b.goalAchievement());
                })
                .orElse(null);
    }

    private BestAdviserInfo findWorstByGoalAchievement(List<MonthlySummary> summaries, Map<Long, Double> uptByAdviserId, double goalPerAdviser) {
        return summaries.stream()
                .map(s -> toAdviserInfo(s, uptByAdviserId, goalPerAdviser))
                .min((a, b) -> {
                    int cmp = Double.compare(a.goalAchievement(), b.goalAchievement());
                    if (cmp != 0) return cmp;
                    int uptCmp = Double.compare(a.upt(), b.upt());
                    return uptCmp != 0 ? uptCmp : Double.compare(a.totalSales(), b.totalSales());
                })
                .orElse(null);
    }

    private BestAdviserInfo toAdviserInfo(MonthlySummary summary, Map<Long, Double> uptByAdviserId, double goalPerAdviser) {
        Long adviserId = summary.getAdviser().getId();
        Double manualUpt = summary.getAdviser().getUpt();
        Double upt = uptByAdviserId.getOrDefault(adviserId, manualUpt != null ? manualUpt : 0.0);
        double goal = goalPerAdviser;
        Double achievement = calculateGoalAchievement(summary.getTotalSales(), goal);
        return new BestAdviserInfo(
                adviserId,
                summary.getAdviser().getName(),
                summary.getTotalSales(),
                goal,
                achievement,
                upt);
    }

    // ─── UPT desde CSV ───────────────────────────────────────────────────────

    private Map<Long, Double> buildUptMap(int year, int month) {
        return adviserSalesReportRepository.findByYearAndMonth(year, month).stream()
                .collect(Collectors.toMap(
                        r -> r.getAdviser().getId(),
                        AdviserSalesReport::getUpt,
                        (a, b) -> a));
    }

    // ─── Crecimiento parcial de semana (desde Sale) ──────────────────────────

    private PartialWeekTotals computePartialWeekComparisons(List<Adviser> activeAdvisers) {
        LocalDate today      = LocalDate.now();
        LocalDate weekStart  = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate prevStart  = weekStart.minusWeeks(1);
        LocalDate prevEnd    = today.minusWeeks(1);

        double storeCurrent  = 0.0;
        double storePrevious = 0.0;
        List<AdviserPartialWeekGrowthInfo> rows = new ArrayList<>();

        for (Adviser adviser : activeAdvisers) {
            double cur  = sumSalesInRange(adviser, weekStart, today);
            double prev = sumSalesInRange(adviser, prevStart, prevEnd);
            storeCurrent  += cur;
            storePrevious += prev;
            rows.add(new AdviserPartialWeekGrowthInfo(adviser.getId(), cur, prev, growthPercent(prev, cur)));
        }

        return new PartialWeekTotals(storeCurrent, storePrevious, growthPercent(storePrevious, storeCurrent), List.copyOf(rows));
    }

    private double sumSalesInRange(Adviser adviser, LocalDate from, LocalDate to) {
        List<Sale> sales = saleRepository.findByAdviserAndSaleDateBetween(adviser, from, to);
        return sales.stream().mapToDouble(s -> s.getAmount() != null ? s.getAmount() : 0.0).sum();
    }

    // ─── Utilidades ──────────────────────────────────────────────────────────

    private double resolveGoalPerAdviser(int year, int month) {
        if (budgetTemplateRepository.existsByYearAndMonth(year, month)) {
            return budgetTemplateService.calculateGoalUpToToday(year, month);
        }
        return adviserRepository.findAllActiveAdvisers().stream()
                .mapToDouble(adviser -> goalRepository
                        .findByAdviserIdAndYearAndMonth(adviser.getId(), year, month)
                        .map(g -> g.getGoalValue())
                        .orElse(0.0))
                .average()
                .orElse(0.0);
    }

    private Double calculateGoalAchievement(Double totalSales, Double goal) {
        if (goal == null || goal <= 0) return 0.0;
        return totalSales != null ? (totalSales / goal) * 100 : 0.0;
    }

    private static double growthPercent(double previous, double current) {
        if (previous == 0.0) return current > 0.0 ? 100.0 : 0.0;
        return ((current - previous) / previous) * 100.0;
    }

    private record PartialWeekTotals(
            double storeCurrent,
            double storePrevious,
            double storeGrowthPercent,
            List<AdviserPartialWeekGrowthInfo> adviserRows) {}
}
