package com.fcastro.backend_kpis_management.model.dto.sale;

import java.time.LocalDate;

import lombok.Data;

@Data
public class SaleResponse {
    private Long adviserId;
    private LocalDate saleDate;
    private Double amount;
}
