package com.fcastro.backend_kpis_management.model.dto.budget;

import java.time.LocalDate;
import java.util.List;

public record DailyDistributionResponse(
        Long id,
        LocalDate date,
        double weightPercentage,
        double dailyAmount,
        int adviserCount,
        double goalPerAdviser,
        boolean manualOverride,
        List<Long> excludedAdviserIds
) {}
