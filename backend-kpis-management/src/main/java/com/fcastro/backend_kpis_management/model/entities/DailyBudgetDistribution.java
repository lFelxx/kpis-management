package com.fcastro.backend_kpis_management.model.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "daily_budget_distribution", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"budget_template_id", "date"})
})
public class DailyBudgetDistribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "budget_template_id", nullable = false)
    private BudgetTemplate budgetTemplate;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Double weightPercentage;

    @Column(nullable = false)
    private Double dailyAmount;

    @Column(nullable = false)
    private int adviserCount;

    @Column(nullable = false)
    private Double goalPerAdviser;

    /**
     * Protege cambios manuales de asesores hechos desde la UI.
     * Si true, una nueva carga de Excel no sobreescribe adviserCount ni goalPerAdviser.
     */
    @Column(nullable = false)
    private boolean manualOverride = false;
}
