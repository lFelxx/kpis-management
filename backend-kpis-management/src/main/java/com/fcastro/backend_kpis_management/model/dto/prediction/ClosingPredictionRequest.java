package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ClosingPredictionRequest(
        @JsonProperty("adviser_id")      long adviserId,
        @JsonProperty("adviser_name")    String adviserName,
        @JsonProperty("current_year")    int currentYear,
        @JsonProperty("current_month")   int currentMonth,
        @JsonProperty("current_day")     int currentDay,
        @JsonProperty("days_in_month")   int daysInMonth,
        @JsonProperty("current_sales")   double currentSales,
        @JsonProperty("full_month_goal") double fullMonthGoal,
        @JsonProperty("daily_sales")     List<DailySaleDto> dailySales,
        @JsonProperty("historical_months") List<HistoricalMonthDto> historicalMonths,
        @JsonProperty("daily_budget")    List<DailySaleDto> dailyBudget
) {}
