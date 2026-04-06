package com.fcastro.backend_kpis_management.services.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fcastro.backend_kpis_management.model.dto.metrics.AdviserMetricsResponse;
import com.fcastro.backend_kpis_management.model.dto.metrics.BestAdviserInfo;
import com.fcastro.backend_kpis_management.model.dto.metrics.DashboardMetricsResponse;
import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.MonthlySummary;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.repositories.GoalRepository;
import com.fcastro.backend_kpis_management.repositories.MonthlySummaryRepository;
import com.fcastro.backend_kpis_management.services.CommissionService;
import com.fcastro.backend_kpis_management.services.MetricsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MetricsServiceImpl implements MetricsService {

    private final AdviserRepository adviserRepository;
    private final MonthlySummaryRepository monthlySummaryRepository;
    private final GoalRepository goalRepository;
    private final CommissionService commissionService;

    @Override
    public DashboardMetricsResponse getDashboardMetrics(int year, int month) {
        log.info("Calculando metricas del dashboard para: {}/{}", year, month);

        // 1. Obtener asesores activos
        List<Adviser> activeAdviser = adviserRepository.findAllActiveAdvisers();

        if (activeAdviser.isEmpty()) {
            return new DashboardMetricsResponse(0.0, 0.0, 0, 0.0, 0.0, null, null, null);
        }

        // 2. Obtener resumenes mensuales
        List<MonthlySummary> monthlySummaries = monthlySummaryRepository.findByYearAndMonth(year, month);

        // 3. Calcular totales
        Double totalSales = monthlySummaries.stream()
                .mapToDouble(MonthlySummary::getTotalSales)
                .sum();

        // Calcular meta total de TODOS los asesores activos desde la tabla Goal
        Double totalGoal = activeAdviser.stream()
                .mapToDouble(adviser -> {
                    return goalRepository
                            .findByAdviserIdAndYearAndMonth(adviser.getId(), year, month)
                            .map(goal -> goal.getGoalValue())
                            .orElse(0.0); // Meta por defecto si no existe Goal
                })
                .sum();

        // 4. Cumplimiento tienda (misma fórmula y redondeo que comisiones)
        Double goalAchievement = totalGoal > 0
                ? commissionService.computeStoreGoalAchievementPercent(year, month)
                : 0.0;
        Double averageSales = totalSales / activeAdviser.size();

        // 5. Filtrar resúmenes solo de asesores activos para los cálculos de mejor/peor
        List<MonthlySummary> activeAdviserSummaries = monthlySummaries.stream()
                .filter(summary -> summary.getAdviser() != null && Boolean.TRUE.equals(summary.getAdviser().getActive()))
                .toList();

        // 6. Obtener mejor asesor por logro de meta
        BestAdviserInfo bestAdviser = getBestAdviser(activeAdviserSummaries);

        // 7. Obtener mejor asesor por UPT (null si nadie tiene UPT > 0)
        BestAdviserInfo bestUptAdviser = getBestAdviserByUpt(activeAdviserSummaries);
        if (bestUptAdviser != null && (bestUptAdviser.upt() == null || bestUptAdviser.upt() <= 0.0)) {
            bestUptAdviser = null;
        }

        // 8. Obtener peor asesor por porcentaje de cumplimiento
        BestAdviserInfo worstAdviser = getWorstAdviserByGoalAchievement(activeAdviserSummaries);

        return new DashboardMetricsResponse(
                totalSales,
                totalGoal,
                activeAdviser.size(),
                goalAchievement,
                averageSales,
                bestAdviser,
                bestUptAdviser,
                worstAdviser);
    }

    @Override
    public AdviserMetricsResponse getAdviserMetrics(Long adviserId, int year, int month) {
        log.info("Obteniendo métricas para asesor {} en {}/{}", adviserId, month, year);

        // Obtener resumen mensual
        MonthlySummary monthlySummary = monthlySummaryRepository
                .findByAdviserIdAndYearAndMonth(adviserId, year, month)
                .orElseThrow(() -> new RuntimeException("Resumen mensual no encontrado"));

        // Obtener asesor
        Adviser adviser = adviserRepository.findById(adviserId)
                .orElseThrow(() -> new RuntimeException("Asesor no encontrado"));

        // Calcular metricas
        Double goalAchievementPercentage = calculateGoalAchievementPercentage(
                monthlySummary.getTotalSales(), monthlySummary.getGoal());

        return new AdviserMetricsResponse(
                adviserId,
                adviser.getName(),
                monthlySummary.getTotalSales(),
                monthlySummary.getGoal(),
                goalAchievementPercentage);
    }

    // Metodos auxiliares
    private BestAdviserInfo getBestAdviser(List<MonthlySummary> monthlySummaries) {
        return monthlySummaries.stream()
            .map(summary -> {
                Double achievement = calculateGoalAchievementPercentage(summary.getTotalSales(), summary.getGoal());
                Double upt = summary.getAdviser().getUpt() != null ? summary.getAdviser().getUpt() : 0.0;
                return new BestAdviserInfo(
                    summary.getAdviser().getId(),
                    summary.getAdviser().getName(),
                    summary.getTotalSales(),
                    summary.getGoal(),
                    achievement,
                    upt
                );
            })
            .max((a, b) -> {
                // Comparar primero por logro de meta (goalAchievement)
                int achievementComparison = Double.compare(a.goalAchievement(), b.goalAchievement());
                
                // Si tienen el mismo logro de meta (o muy cercano), comparar por UPT
                if (Math.abs(a.goalAchievement() - b.goalAchievement()) < 0.01) {
                    log.debug("Asesores con logro similar: {} ({}%) vs {} ({}%) - Desempatando por UPT: {} vs {}", 
                            a.adviserName(), a.goalAchievement(), 
                            b.adviserName(), b.goalAchievement(),
                            a.upt(), b.upt());
                    return Double.compare(a.upt(), b.upt());
                }
                
                return achievementComparison;
            })
            .orElse(null);
    }

    private BestAdviserInfo getBestAdviserByUpt(List<MonthlySummary> monthlySummaries) {
        return monthlySummaries.stream()
            .map(summary -> {
                Double achievement = calculateGoalAchievementPercentage(summary.getTotalSales(), summary.getGoal());
                Double upt = summary.getAdviser().getUpt() != null ? summary.getAdviser().getUpt() : 0.0;
                return new BestAdviserInfo(
                    summary.getAdviser().getId(),
                    summary.getAdviser().getName(),
                    summary.getTotalSales(),
                    summary.getGoal(),
                    achievement,
                    upt
                );
            })
            .max((a, b) -> {
                // Comparar por UPT
                int uptComparison = Double.compare(a.upt(), b.upt());
                
                if (uptComparison == 0) {
                    // Si tienen el mismo UPT, desempatar por logro de meta
                    return Double.compare(a.goalAchievement(), b.goalAchievement());
                }
                
                return uptComparison;
            })
            .orElse(null);
    }

    /** Peor asesor del mes por porcentaje de cumplimiento (menor goalAchievement). */
    private BestAdviserInfo getWorstAdviserByGoalAchievement(List<MonthlySummary> monthlySummaries) {
        return monthlySummaries.stream()
            .map(summary -> {
                Double achievement = calculateGoalAchievementPercentage(summary.getTotalSales(), summary.getGoal());
                Double upt = summary.getAdviser().getUpt() != null ? summary.getAdviser().getUpt() : 0.0;
                return new BestAdviserInfo(
                    summary.getAdviser().getId(),
                    summary.getAdviser().getName(),
                    summary.getTotalSales(),
                    summary.getGoal(),
                    achievement,
                    upt
                );
            })
            .min((a, b) -> {
                int achievementComparison = Double.compare(a.goalAchievement(), b.goalAchievement());

                if (achievementComparison == 0) {
                    // Si tienen el mismo porcentaje de cumplimiento, considerar peor
                    // al que tiene menor UPT y, en último caso, menor venta.
                    int uptComparison = Double.compare(a.upt(), b.upt());
                    if (uptComparison != 0) {
                        return uptComparison;
                    }
                    return Double.compare(a.totalSales(), b.totalSales());
                }

                return achievementComparison;
            })
            .orElse(null);
    }

    private Double calculateGoalAchievementPercentage(Double totalSales, Double goal) {
        if (goal == null || goal <= 0) {
            return 0.0;
        }
        return totalSales != null ? (totalSales / goal) * 100 : 0.0;
    }
}
