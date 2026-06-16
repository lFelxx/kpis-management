package com.fcastro.backend_kpis_management.model.dto.budget;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAdviserCountRequest {

    @NotNull
    @Min(0)
    private Integer adviserCount;
}
