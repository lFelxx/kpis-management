package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AdviserInputDto(
        @JsonProperty("adviser_id")        long adviserId,
        @JsonProperty("adviser_name")      String adviserName,
        @JsonProperty("current_sales")     double currentSales,
        @JsonProperty("full_month_goal")   double fullMonthGoal,
        @JsonProperty("historical_months") List<HistoricalMonthDto> historicalMonths
) {}
