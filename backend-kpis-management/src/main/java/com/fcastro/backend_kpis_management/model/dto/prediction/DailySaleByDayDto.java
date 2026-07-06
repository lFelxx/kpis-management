package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DailySaleByDayDto(
        @JsonProperty("day")    int day,
        @JsonProperty("amount") double amount
) {}
