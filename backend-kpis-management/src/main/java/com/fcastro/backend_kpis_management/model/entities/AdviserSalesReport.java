package com.fcastro.backend_kpis_management.model.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "adviser_sales_report",
    uniqueConstraints = @UniqueConstraint(columnNames = {"adviser_id", "year", "month"}))
public class AdviserSalesReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adviser_id", nullable = false)
    private Adviser adviser;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private int month;

    @Column(name = "invoice_count", nullable = false)
    private int invoiceCount;

    @Column(name = "units_sold", nullable = false)
    private int unitsSold;

    @Column(name = "upt", nullable = false)
    private Double upt;

    @Column(name = "gross_sales", nullable = false)
    private Double grossSales;

    @Column(name = "net_sales", nullable = false)
    private Double netSales;
}
