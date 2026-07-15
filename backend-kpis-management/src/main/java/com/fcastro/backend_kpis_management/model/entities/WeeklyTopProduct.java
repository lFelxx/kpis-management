package com.fcastro.backend_kpis_management.model.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "weekly_top_product",
    uniqueConstraints = @UniqueConstraint(columnNames = {"year", "week_number"}))
public class WeeklyTopProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int year;

    @Column(name = "week_number", nullable = false)
    private int weekNumber;

    @Column(nullable = false)
    private String sku;

    @Column(nullable = false)
    private int qty;
}
