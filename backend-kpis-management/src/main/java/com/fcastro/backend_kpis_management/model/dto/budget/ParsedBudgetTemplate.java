package com.fcastro.backend_kpis_management.model.dto.budget;

import java.util.List;

public record ParsedBudgetTemplate(
        double totalBudget,
        List<ParsedDayData> days
) {}
