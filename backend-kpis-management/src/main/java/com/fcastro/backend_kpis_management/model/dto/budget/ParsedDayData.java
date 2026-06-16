package com.fcastro.backend_kpis_management.model.dto.budget;

import java.time.LocalDate;

public record ParsedDayData(
        LocalDate date,
        double weightPercentage,
        int adviserCount
) {}
