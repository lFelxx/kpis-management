package com.fcastro.backend_kpis_management.services;

import java.util.List;

import com.fcastro.backend_kpis_management.model.entities.Adviser;

/**
 * Comisión del asesor según ventas del mes y cumplimiento global de la tienda (mismo mes).
 */
public interface CommissionService {

    /**
     * % cumplimiento de la tienda: ventas totales / meta total de asesores activos (mismo año/mes).
     */
    double computeStoreGoalAchievementPercent(int year, int month);

    /**
     * Tasa efectiva aplicada sobre las ventas del asesor (porcentaje, ej. 1,2 para 1,2%).
     * Misma regla que la comisión: &lt;80% tienda → 0; 80–100% → hasta 1,2% proporcional; ≥100% → 1,2%.
     */
    double computeEffectiveCommissionRatePercent(double storeAchievementPercent);

    /**
     * Comisión en dinero para un monto de ventas del asesor y el % de cumplimiento de la tienda.
     * Reglas: &lt;80% tienda → 0; 80–100% → 1,2% proporcional al % tienda; ≥100% → 1,2% fijo sobre ventas.
     */
    double computeCommission(double adviserSales, double storeAchievementPercent);

    /**
     * Comisión por cada mes del año (índice 0 = enero) para el asesor indicado.
     */
    List<Double> computeMonthlyCommissionsForAdviser(Adviser adviser, int year);
}
