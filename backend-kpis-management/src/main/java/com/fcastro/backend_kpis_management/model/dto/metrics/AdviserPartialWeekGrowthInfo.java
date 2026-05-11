package com.fcastro.backend_kpis_management.model.dto.metrics;

/**
 * Ventas acumuladas lun→hoy de la semana ISO en curso vs la misma franja de la semana anterior,
 * y variación porcentual respecto a la franja anterior.
 */
public record AdviserPartialWeekGrowthInfo(
        Long adviserId,
        Double currentPartialWeekSales,
        Double previousPartialWeekSales,
        Double growthPercentage
) {
}
