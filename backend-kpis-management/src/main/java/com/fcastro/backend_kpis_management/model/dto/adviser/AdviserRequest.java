package com.fcastro.backend_kpis_management.model.dto.adviser;

import com.fcastro.backend_kpis_management.model.enums.TeamRole;
import lombok.Data;

@Data
public class AdviserRequest {
    private String name;
    private String lastName;
    private Boolean active;
    private Double goalValue;
    private Double upt;
    private TeamRole teamRole = TeamRole.ADVISER;
    /** 1=lunes … 7=domingo (ISO). Null = sin día fijo. */
    private Integer restDay;
}