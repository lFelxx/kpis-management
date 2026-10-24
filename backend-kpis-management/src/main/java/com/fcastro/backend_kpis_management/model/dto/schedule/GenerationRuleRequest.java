package com.fcastro.backend_kpis_management.model.dto.schedule;

import lombok.Data;

@Data
public class GenerationRuleRequest {
    private Long shiftTemplateId;
    private Integer advisersPerDay;
    private Integer auxiliariesPerDay;
    private Integer sortOrder;
}
