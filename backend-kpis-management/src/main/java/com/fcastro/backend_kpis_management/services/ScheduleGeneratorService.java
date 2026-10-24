package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.dto.schedule.WeeklyScheduleResponse;

public interface ScheduleGeneratorService {

    /**
     * Genera automáticamente los turnos para el horario dado.
     * Respeta:
     *   - Día de descanso fijo de cada persona (Adviser.restDay).
     *   - Admin: presente al menos un turno cada día.
     *   - Co-Admin: siempre en turno contrario al Admin.
     *   - Asesores/Auxiliares: rotación equitativa apertura/cierre.
     */
    WeeklyScheduleResponse generate(Long scheduleId);
}
