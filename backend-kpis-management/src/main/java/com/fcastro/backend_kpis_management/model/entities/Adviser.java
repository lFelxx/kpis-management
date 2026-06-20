package com.fcastro.backend_kpis_management.model.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "advisers")
public class Adviser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String lastname;

    @Column
    private Boolean active;

    @Column(name = "upt")
    private Double upt;

    @OneToMany(mappedBy = "adviser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sale> sales;

    @OneToMany(mappedBy = "adviser", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Goal> goals = new ArrayList<>();

    @OneToMany(mappedBy = "adviser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MonthlySummary> monthlySummaries = new ArrayList<>();

    @OneToMany(mappedBy = "adviser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WeeklySalesComparison> weeklySalesComparisons = new ArrayList<>();

    @OneToMany(mappedBy = "adviser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AdviserSalesReport> salesReports = new ArrayList<>();
}
