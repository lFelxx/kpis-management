package com.fcastro.backend_kpis_management.model.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "generation_rules")
public class GenerationRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shift_template_id", nullable = false)
    private ShiftTemplate shiftTemplate;

    /** Cuántos ADVISER reciben este turno por día */
    @Column(name = "advisers_per_day", nullable = false)
    private Integer advisersPerDay = 1;

    /** Cuántos AUXILIARY reciben este turno por día */
    @Column(name = "auxiliaries_per_day", nullable = false)
    private Integer auxiliariesPerDay = 0;

    /** Orden de asignación (menor = se asigna primero) */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
}
