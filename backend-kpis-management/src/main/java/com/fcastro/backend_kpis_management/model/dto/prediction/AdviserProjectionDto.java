package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AdviserProjectionDto(
        @JsonProperty("adviser_id")               long adviserId,
        @JsonProperty("adviser_name")             String adviserName,
        @JsonProperty("current_sales")            double currentSales,
        @JsonProperty("projected_sales")          double projectedSales,
        @JsonProperty("projected_achievement_pct") double projectedAchievementPct,
        @JsonProperty("risk_level")               String riskLevel
) {}
