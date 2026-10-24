package com.fcastro.backend_kpis_management.model.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;

@Data
@Entity
@Table(name = "schedule_config")
public class ScheduleConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_open_time", nullable = false)
    private LocalTime storeOpenTime = LocalTime.of(9, 50);

    @Column(name = "store_close_time", nullable = false)
    private LocalTime storeCloseTime = LocalTime.of(21, 10);

    /** Hora hasta la que cuenta como turno apertura */
    @Column(name = "opening_shift_end", nullable = false)
    private LocalTime openingShiftEnd = LocalTime.of(10, 30);

    /** Hora desde la que cuenta como turno cierre */
    @Column(name = "closing_shift_start", nullable = false)
    private LocalTime closingShiftStart = LocalTime.of(13, 0);

    @Column(name = "lunch_minutes", nullable = false)
    private Integer lunchMinutes = 60;

    @Column(name = "min_openings_per_adviser", nullable = false)
    private Integer minOpeningsPerAdviser = 2;

    @Column(name = "advisers_per_shift", nullable = false)
    private Integer advisersPerShift = 2;

    /** Hora a la que termina el turno apertura (para generación automática). */
    @Column(name = "default_opening_end", nullable = false)
    private LocalTime defaultOpeningEnd = LocalTime.of(17, 0);

    /** Hora a la que empieza el turno cierre (para generación automática). */
    @Column(name = "default_closing_start", nullable = false)
    private LocalTime defaultClosingStart = LocalTime.of(14, 0);
}
