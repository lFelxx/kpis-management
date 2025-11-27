package com.fcastro.backend_kpis_management.model.dto.goal;

import lombok.Data;

@Data
public class GoalResponse {
    private Long adviserId;
    private int year;
    private int month;
    private Double goal;
}
