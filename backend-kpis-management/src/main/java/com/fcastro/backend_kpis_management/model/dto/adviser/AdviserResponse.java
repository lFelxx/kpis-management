package com.fcastro.backend_kpis_management.model.dto.adviser;



import java.util.List;

import com.fcastro.backend_kpis_management.model.dto.MonthlySummaryDTO;

import lombok.Data;

@Data
public class AdviserResponse {
    private Long id;
    private String name;
    private String lastName;
    private Boolean active;
    private Double sales;
    private Double goalValue;
    private Double currentMonthSales;
    private Double upt;
    private List<MonthlySummaryDTO> monthlySummaries;
}
