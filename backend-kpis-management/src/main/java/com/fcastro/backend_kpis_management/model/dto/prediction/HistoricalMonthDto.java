package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record HistoricalMonthDto(
        int year,
        int month,
        @JsonProperty("total_sales") double totalSales,
        double goal,
        @JsonProperty("daily_sales") List<DailySaleDto> dailySales
) {}
