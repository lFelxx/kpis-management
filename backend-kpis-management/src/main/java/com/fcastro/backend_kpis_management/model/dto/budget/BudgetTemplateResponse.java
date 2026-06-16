package com.fcastro.backend_kpis_management.model.dto.budget;

import java.time.LocalDateTime;
import java.util.List;

public record BudgetTemplateResponse(
        Long id,
        int year,
        int month,
        double totalBudget,
        double distributedBudget,
        LocalDateTime uploadedAt,
        List<DailyDistributionResponse> days
) {}
