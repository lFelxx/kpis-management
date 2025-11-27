package com.fcastro.backend_kpis_management.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class WeeklyComparisonUpdateDTO {
    @NotNull(message = "El monto de ventas es requerido")
    @Positive(message = "El monto de ventas debe ser positivo")
    private Double currentWeekSales;
} 