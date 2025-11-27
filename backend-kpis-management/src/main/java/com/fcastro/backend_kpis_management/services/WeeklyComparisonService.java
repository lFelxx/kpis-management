package com.fcastro.backend_kpis_management.services;

import java.time.LocalDate;
import java.util.List;

import com.fcastro.backend_kpis_management.model.dto.WeeklyComparisonDTO;
import com.fcastro.backend_kpis_management.model.entities.Adviser;

public interface WeeklyComparisonService {

    /**
     * Genera comparaciones semanales para todos los asesores activos
     * Compara semana actual vs semana anterior
     * @return Lista de comparaciones para todos los asesores activos
     */
    List<WeeklyComparisonDTO> generateWeeklyComparisons();

    /**
     * Genera comparación semanal para un asesor específico
     * Compara semana actual vs semana anterior
     * @param adviserId ID del asesor
     * @return Comparación semanal del asesor
     */
    WeeklyComparisonDTO generateAdviserWeeklyComparison(Long adviserId);

    /**
     * Obtiene las comparaciones semanales de un asesor para un mes específico
     * Calcula en tiempo real desde las ventas
     */
    List<WeeklyComparisonDTO> getAdviserComparisons(Long adviserId, Integer year, Integer month);

    /**
     * Obtiene la comparación de la semana actual para un asesor
     * Calcula en tiempo real
     */
    WeeklyComparisonDTO updateCurrentWeekSales(Long adviserId, Double currentWeekSales);

    /**
     * Obtiene la comparación de la semana anterior para un asesor
     * Calcula en tiempo real
     */
    WeeklyComparisonDTO updatePreviousWeekSales(Long adviserId, Double previousWeekSales);

    /**
     * @deprecated Ya no es necesario con cálculo en tiempo real
     */
    @Deprecated
    void processAdviserComparison(Adviser adviser, LocalDate date);

}
