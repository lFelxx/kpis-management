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

    @Override
    public DashboardMetricsResponse getDashboardMetrics(int year, int month) {
        log.info("Calculando metricas del dashboard para: {}/{}", year, month);

        // 1. Obtener asesores activos
        List<Adviser> activeAdviser = adviserRepository.findAllActiveAdvisers();

        if (activeAdviser.isEmpty()) {
            return new DashboardMetricsResponse(0.0, 0.0, 0, 0.0, 0.0, null, null);
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

        // 4. Calcular metricas
        Double goalAchievement = totalSales > 0 ? (totalSales / totalGoal) * 100 : 0.0;
        Double averageSales = totalSales / activeAdviser.size();

        // 5. Obtener mejor asesor por logro de meta
        BestAdviserInfo bestAdviser = getBestAdviser(monthlySummaries);

        // 6. Obtener mejor asesor por UPT
        BestAdviserInfo bestUptAdviser = getBestAdviserByUpt(monthlySummaries);

        return new DashboardMetricsResponse(
                totalSales,
                totalGoal,
                activeAdviser.size(),
                goalAchievement,
                averageSales,
                bestAdviser,
                bestUptAdviser);
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

    private Double calculateGoalAchievementPercentage(Double totalSales, Double goal) {
        return totalSales > 0 ? (totalSales / goal) * 100 : 0.0;
    }
}
