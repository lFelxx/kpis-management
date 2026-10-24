package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AdviserInsightRequest(
        @JsonProperty("adviser_id") long adviserId,
        @JsonProperty("adviser_name") String adviserName,
        @JsonProperty("year") int year,
        @JsonProperty("month") int month,
        @JsonProperty("current_day") int currentDay,
        @JsonProperty("days_in_month") int daysInMonth,
        @JsonProperty("current_sales") double currentSales,
        @JsonProperty("full_month_goal") double fullMonthGoal,
        @JsonProperty("projected_sales") double projectedSales,
        @JsonProperty("projected_achievement_pct") double projectedAchievementPct,
        @JsonProperty("confidence") String confidence,
        @JsonProperty("risk_level") String riskLevel,
        @JsonProperty("days_remaining") int daysRemaining,
        @JsonProperty("historical_daily_rate") double historicalDailyRate,
        @JsonProperty("trend_monthly_pct") double trendMonthlyPct,
        @JsonProperty("trend_direction") String trendDirection,
        @JsonProperty("risk_score") double riskScore,
        @JsonProperty("alert_level") String alertLevel,
        @JsonProperty("pace_ratio") double paceRatio,
        @JsonProperty("days_to_act") int daysToAct,
        @JsonProperty("risk_reason") String riskReason,
        @JsonProperty("best_day_of_week") String bestDayOfWeek,
        @JsonProperty("worst_day_of_week") String worstDayOfWeek,
        @JsonProperty("best_week_of_month") Integer bestWeekOfMonth,
        @JsonProperty("anomaly_count") int anomalyCount
) {}
