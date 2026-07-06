package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AnomalyDto(
        @JsonProperty("date")             String date,
        @JsonProperty("amount")           double amount,
        @JsonProperty("expected_amount")  double expectedAmount,
        @JsonProperty("deviation_pct")    double deviationPct,
        @JsonProperty("anomaly_type")     String anomalyType
) {}
