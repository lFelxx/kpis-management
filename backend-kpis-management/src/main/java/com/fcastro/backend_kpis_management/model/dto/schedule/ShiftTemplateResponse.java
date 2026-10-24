package com.fcastro.backend_kpis_management.model.dto.schedule;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShiftTemplateResponse {
    private Long id;
    private String name;
    private String startTime;
    private String endTime;
    private String color;
    private Boolean isRest;
    private Boolean hasLunch;
    private Integer sortOrder;
}
