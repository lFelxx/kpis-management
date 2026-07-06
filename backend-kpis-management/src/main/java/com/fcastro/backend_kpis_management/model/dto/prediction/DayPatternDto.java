package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DayPatternDto(
        @JsonProperty("day_of_week")        String dayOfWeek,
        @JsonProperty("avg_sales")          double avgSales,
        @JsonProperty("relative_strength")  double relativeStrength,
        @JsonProperty("sample_count")       int sampleCount
) {}
