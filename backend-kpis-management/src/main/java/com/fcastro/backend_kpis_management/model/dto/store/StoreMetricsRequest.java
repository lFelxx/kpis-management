package com.fcastro.backend_kpis_management.model.dto.store;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class StoreMetricsRequest {
    
    @NotNull(message = "El año es requerido")
    @Positive(message = "El año debe ser positivo")
    private Integer year;

    @NotNull(message = "El mes es requerido")
    @Positive(message = "El mes debe ser positivo")
    private Integer month;

    @NotNull(message = "El P.A.F (Presupuesto hasta la fecha) es requerido")
    @Positive(message = "El P.A.F debe ser positivo")
    private Double paf; // Presupuesto hasta la fecha (se digita manualmente)

}

