package com.fcastro.backend_kpis_management.model.dto.schedule;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GenerationRuleResponse {
    private Long id;
    private Long shiftTemplateId;
    private String shiftTemplateName;
    private String shiftTemplateColor;
    private String startTime;
    private String endTime;
    private Integer advisersPerDay;
    private Integer auxiliariesPerDay;
    private Integer sortOrder;
}
