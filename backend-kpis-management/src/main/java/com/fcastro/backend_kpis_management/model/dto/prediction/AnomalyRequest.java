package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AnomalyRequest(
        @JsonProperty("adviser_id")        long adviserId,
        @JsonProperty("daily_sales")       List<DailySaleDto> dailySales,
        @JsonProperty("historical_months") List<HistoricalMonthDto> historicalMonths
) {}
