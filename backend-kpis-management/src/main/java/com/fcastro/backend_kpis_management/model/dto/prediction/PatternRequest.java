package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record PatternRequest(
        @JsonProperty("adviser_id")        long adviserId,
        @JsonProperty("historical_months") List<HistoricalMonthDto> historicalMonths
) {}
