package com.fcastro.backend_kpis_management.services.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.MonthlySummary;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.repositories.GoalRepository;
import com.fcastro.backend_kpis_management.repositories.MonthlySummaryRepository;
import com.fcastro.backend_kpis_management.services.CommissionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommissionServiceImpl implements CommissionService {

    /** Base 1,2% (negocio). */
    private static final BigDecimal BASE_PERCENT = new BigDecimal("1.2");
    private static final double STORE_THRESHOLD_PERCENT = 80.0;

    private static final RoundingMode RM = RoundingMode.HALF_UP;
    /** Decimales del % cumplimiento tienda (coherente con reportes). */
    private static final int STORE_ACHIEVEMENT_SCALE = 2;
    /** Decimales de la tasa efectiva mostrada (ej. 1,02%). */
    private static final int EFFECTIVE_RATE_PERCENT_SCALE = 2;
    /** Pesos COP: sin decimales. */
    private static final int MONEY_SCALE = 0;

    private final AdviserRepository adviserRepository;
    private final MonthlySummaryRepository monthlySummaryRepository;
    private final GoalRepository goalRepository;

    @Override
    public double computeStoreGoalAchievementPercent(int year, int month) {
        List<Adviser> active = adviserRepository.findAllActiveAdvisers();
        if (active.isEmpty()) {
            return 0.0;
        }
        List<MonthlySummary> summaries = monthlySummaryRepository.findByYearAndMonth(year, month);
        double totalSales = summaries.stream().mapToDouble(MonthlySummary::getTotalSales).sum();
        double totalGoal = active.stream()
                .mapToDouble(adviser -> goalRepository
                        .findByAdviserIdAndYearAndMonth(adviser.getId(), year, month)
                        .map(g -> g.getGoalValue())
                        .orElse(0.0))
                .sum();
        if (totalGoal <= 0) {
            return 0.0;
        }
        double raw = (totalSales / totalGoal) * 100.0;
        return round(raw, STORE_ACHIEVEMENT_SCALE);
    }

    @Override
    public double computeEffectiveCommissionRatePercent(double storeAchievementPercent) {
        double ach = round(storeAchievementPercent, STORE_ACHIEVEMENT_SCALE);
        if (ach < STORE_THRESHOLD_PERCENT) {
            return 0.0;
        }
        if (ach >= 100.0) {
            return BASE_PERCENT.doubleValue();
        }
        // tasa% = 1,2 × (% cumplimiento tienda) — ej. 85% ⇒ 1,2 × 0,85 = 1,02%
        BigDecimal tasa = BASE_PERCENT
                .multiply(BigDecimal.valueOf(ach))
                .divide(BigDecimal.valueOf(100), EFFECTIVE_RATE_PERCENT_SCALE, RM);
        return tasa.doubleValue();
    }

    @Override
    public double computeCommission(double adviserSales, double storeAchievementPercent) {
        if (adviserSales <= 0 || Double.isNaN(adviserSales)) {
            return 0.0;
        }
        double effectiveRatePercent = computeEffectiveCommissionRatePercent(storeAchievementPercent);
        if (effectiveRatePercent <= 0) {
            return 0.0;
        }
        BigDecimal ventas = BigDecimal.valueOf(adviserSales).setScale(2, RM);
        BigDecimal factor = BigDecimal.valueOf(effectiveRatePercent)
                .divide(BigDecimal.valueOf(100), 8, RM);
        return ventas.multiply(factor).setScale(MONEY_SCALE, RM).doubleValue();
    }

    private static double round(double value, int scale) {
        if (Double.isNaN(value) || Double.isInfinite(value)) {
            return 0.0;
        }
        return BigDecimal.valueOf(value).setScale(scale, RM).doubleValue();
    }

    @Override
    public List<Double> computeMonthlyCommissionsForAdviser(Adviser adviser, int year) {
        List<Double> out = new ArrayList<>(12);
        for (int month = 1; month <= 12; month++) {
            double storeAch = computeStoreGoalAchievementPercent(year, month);
            double sales = monthSales(adviser, year, month);
            out.add(computeCommission(sales, storeAch));
        }
        return out;
    }

    private static double monthSales(Adviser adviser, int year, int month) {
        if (adviser.getMonthlySummaries() == null) {
            return 0.0;
        }
        return adviser.getMonthlySummaries().stream()
                .filter(s -> s.getYear() == year && s.getMonth() == month)
                .mapToDouble(MonthlySummary::getTotalSales)
                .findFirst()
                .orElse(0.0);
    }
}
