package com.fcastro.backend_kpis_management.model.dto.prediction;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record StoreClosingRequest(
        @JsonProperty("current_year")    int currentYear,
        @JsonProperty("current_month")   int currentMonth,
        @JsonProperty("current_day")     int currentDay,
        @JsonProperty("days_in_month")   int daysInMonth,
        @JsonProperty("store_goal")      double storeGoal,
        @JsonProperty("advisers")        List<AdviserInputDto> advisers
) {}
