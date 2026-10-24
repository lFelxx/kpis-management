package com.fcastro.backend_kpis_management.model.entities;

import com.fcastro.backend_kpis_management.model.enums.TeamRole;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "team_role", nullable = false)
    private TeamRole teamRole = TeamRole.ADVISER;

    /** Día de descanso fijo: 1=lunes … 7=domingo (ISO). Null = sin día fijo asignado. */
    @Column(name = "rest_day")
    private Integer restDay;

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
