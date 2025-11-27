package com.fcastro.backend_kpis_management.model.entities;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

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
    private List<Goal> goals =  new ArrayList<>();

    @OneToMany(mappedBy = "adviser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MonthlySummary> monthlySummaries = new ArrayList<>();

    @OneToMany(mappedBy = "adviser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WeeklySalesComparison> weeklySalesComparisons = new ArrayList<>();




}
