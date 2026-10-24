package com.fcastro.backend_kpis_management.model.dto.schedule;

import lombok.Data;

@Data
public class ShiftTemplateRequest {
    private String name;
    private String startTime;
    private String endTime;
    private String color;
    private Boolean isRest;
    private Boolean hasLunch;
    private Integer sortOrder;
}
