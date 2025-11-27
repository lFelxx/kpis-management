package com.fcastro.backend_kpis_management.model.dto.adviser;

import lombok.Data;

@Data
public class AdviserRequest {
    private String name;

    private String lastName;

    private Boolean active;

    private Double goalValue;

    private Double upt; // Unidades Promedio por Transacción
}