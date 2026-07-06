package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RiskDetectionResponse(
        @JsonProperty("adviser_id")               long adviserId,
        @JsonProperty("adviser_name")             String adviserName,
        @JsonProperty("risk_score")               double riskScore,
        @JsonProperty("predicted_achievement_pct") double predictedAchievementPct,
        @JsonProperty("alert_level")              String alertLevel,
        @JsonProperty("pace_ratio")               double paceRatio,
        @JsonProperty("days_to_act")              int daysToAct,
        @JsonProperty("reason")                   String reason
) {}
