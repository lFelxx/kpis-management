package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.entities.Adviser;

import java.util.Comparator;

/**
 * Orden de los integrantes en el horario y en su exportación: primero el que el usuario arrastró
 * ({@code scheduleOrder}); quien aún no tiene orden va al final, por cargo y luego por id.
 */
public final class AdviserScheduleOrder {

    public static final Comparator<Adviser> COMPARATOR = Comparator
            .comparing(Adviser::getScheduleOrder, Comparator.nullsLast(Comparator.naturalOrder()))
            .thenComparing(a -> a.getTeamRole().ordinal())
            .thenComparing(Adviser::getId);

    private AdviserScheduleOrder() {}
}
