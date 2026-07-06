package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record StoreClosingResponse(
        @JsonProperty("projected_store_sales")     double projectedStoreSales,
        @JsonProperty("current_store_sales")       double currentStoreSales,
        @JsonProperty("store_goal")                double storeGoal,
        @JsonProperty("projected_achievement_pct") double projectedAchievementPct,
        @JsonProperty("confidence")                String confidence,
        @JsonProperty("risk_level")                String riskLevel,
        @JsonProperty("advisers_at_risk")          int advisersAtRisk,
        @JsonProperty("advisers_on_track")         int advisersOnTrack,
        @JsonProperty("adviser_projections")       List<AdviserProjectionDto> adviserProjections
) {}
