package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DailySaleDto(
        String date,
        double amount,
        @JsonProperty("budget_weight") double budgetWeight
) {}
