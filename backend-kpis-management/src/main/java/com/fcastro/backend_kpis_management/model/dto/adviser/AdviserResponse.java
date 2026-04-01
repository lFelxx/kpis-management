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
    /** Comisión del mes actual según ventas del asesor y cumplimiento global de la tienda. */
    private Double commission;
    /** Tasa efectiva sobre ventas del asesor en % (ej. 1,2). Igual para todos los asesores del mismo mes (regla de tienda). */
    private Double commissionRatePercent;
    private Double upt;
    private List<MonthlySummaryDTO> monthlySummaries;
}
