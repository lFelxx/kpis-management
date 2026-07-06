package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ClosingPredictionResponse(
        @JsonProperty("adviser_id")               long adviserId,
        @JsonProperty("projected_sales")          double projectedSales,
        @JsonProperty("projected_achievement_pct") double projectedAchievementPct,
        @JsonProperty("confidence")               String confidence,
        @JsonProperty("risk_level")               String riskLevel,
        @JsonProperty("days_remaining")           int daysRemaining,
        @JsonProperty("days_in_month")            int daysInMonth,
        @JsonProperty("current_sales")            double currentSales,
        @JsonProperty("full_month_goal")          double fullMonthGoal,
        @JsonProperty("historical_daily_rate")    double historicalDailyRate,
        @JsonProperty("daily_sales_by_day")       List<DailySaleByDayDto> dailySalesByDay,
        @JsonProperty("method_used")              String methodUsed
) {}
