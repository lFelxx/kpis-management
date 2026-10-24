package com.fcastro.backend_kpis_management.model.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;

@Data
@Entity
@Table(name = "schedule_slot",
       uniqueConstraints = @UniqueConstraint(columnNames = {"schedule_id", "adviser_id", "day_of_week"}))
public class ScheduleSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "schedule_id", nullable = false)
    private WeeklySchedule schedule;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "adviser_id", nullable = false)
    private Adviser adviser;

    /** 1 = lunes … 7 = domingo (ISO) */
    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "is_rest_day", nullable = false)
    private Boolean isRestDay = false;

    @Column(length = 255)
    private String notes;

    /** FK al ShiftTemplate usado — null si el slot es vacío o personalizado */
    @Column(name = "shift_template_id")
    private Long shiftTemplateId;
}
