package com.fcastro.backend_kpis_management.model.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Entity
@Data
@Table(name = "store_metrics", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"year", "month"})
})
public class StoreMetrics {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private int month;

    @Column(name = "paf", nullable = false)
    private Double paf; // Presupuesto hasta la fecha (se digita manualmente)

    @Column(name = "percentage_paf")
    private Double percentagePaf; // Porcentaje hasta la fecha: (venta acumulada / meta total) * 100

    @Column(name = "percentage_pr")
    private Double percentagePr; // Porcentaje real: (venta total / P.A.F) * 100

}

