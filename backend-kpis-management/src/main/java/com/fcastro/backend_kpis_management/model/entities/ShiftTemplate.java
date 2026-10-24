package com.fcastro.backend_kpis_management.model.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "shift_templates")
public class ShiftTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "start_time")
    private String startTime;

    @Column(name = "end_time")
    private String endTime;

    @Column(nullable = false)
    private String color;

    @Column(name = "is_rest", nullable = false)
    private Boolean isRest = false;

    @Column(name = "has_lunch", nullable = false)
    private Boolean hasLunch = false;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}
