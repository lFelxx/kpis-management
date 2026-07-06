package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record PatternResponse(
        @JsonProperty("adviser_id")          long adviserId,
        @JsonProperty("best_day_of_week")    String bestDayOfWeek,
        @JsonProperty("worst_day_of_week")   String worstDayOfWeek,
        @JsonProperty("best_week_of_month")  int bestWeekOfMonth,
        @JsonProperty("overall_daily_avg")   double overallDailyAvg,
        @JsonProperty("daily_pattern")       List<DayPatternDto> dailyPattern,
        @JsonProperty("weekly_pattern")      List<WeekPatternDto> weeklyPattern,
        @JsonProperty("data_months_used")    int dataMonthsUsed,
        @JsonProperty("is_reliable")         boolean isReliable
) {}
