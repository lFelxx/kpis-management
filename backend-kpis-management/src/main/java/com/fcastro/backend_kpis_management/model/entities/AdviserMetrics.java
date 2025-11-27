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
import lombok.Data;

@Entity
@Data
@Table(name = "adviser_metrics")
public class AdviserMetrics {
    
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

    @Column(name = "total_sales", nullable = false)
    private Double totalSales;

    @Column(name = "total_goal", nullable = false)
    private Double totalGoal;

    @Column(name = "goal_achievement", nullable = false)
    private Double goalAchievement;

    @Column(name = "average_sales", nullable = false)
    private Double averageSales;

    @Column(name = "best_adviser", nullable = false)
    private String bestAdviser;

}