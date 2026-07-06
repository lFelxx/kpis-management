package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AnomalyResponse(
        @JsonProperty("adviser_id")          long adviserId,
        @JsonProperty("anomalies")           List<AnomalyDto> anomalies,
        @JsonProperty("anomaly_count")       int anomalyCount,
        @JsonProperty("baseline_daily_avg")  double baselineDailyAvg,
        @JsonProperty("baseline_daily_std")  double baselineDailyStd,
        @JsonProperty("detection_method")    String detectionMethod
) {}
