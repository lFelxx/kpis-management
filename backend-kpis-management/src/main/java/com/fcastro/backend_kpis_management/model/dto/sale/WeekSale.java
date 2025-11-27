package com.fcastro.backend_kpis_management.model.dto.sale;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WeekSale {
    private int week;
    private Double total;
}
