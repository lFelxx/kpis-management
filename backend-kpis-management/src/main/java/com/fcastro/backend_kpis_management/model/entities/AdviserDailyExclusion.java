package com.fcastro.backend_kpis_management.model.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "adviser_daily_exclusion",
    uniqueConstraints = @UniqueConstraint(columnNames = {"adviser_id", "date"}))
public class AdviserDailyExclusion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adviser_id", nullable = false)
    private Adviser adviser;

    @Column(nullable = false)
    private LocalDate date;
}
