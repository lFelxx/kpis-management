package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AdviserInsightResponse(
        @JsonProperty("adviser_id") long adviserId,
        @JsonProperty("insight_text") String insightText,
        @JsonProperty("model_used") String modelUsed
) {}
