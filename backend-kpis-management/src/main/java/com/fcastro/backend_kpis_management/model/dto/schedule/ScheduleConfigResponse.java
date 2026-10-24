package com.fcastro.backend_kpis_management.model.dto.schedule;

import java.time.LocalTime;

public record ScheduleConfigResponse(
        Long id,
        LocalTime storeOpenTime,
        LocalTime storeCloseTime,
        LocalTime openingShiftEnd,
        LocalTime closingShiftStart,
        Integer lunchMinutes,
        Integer minOpeningsPerAdviser,
        Integer advisersPerShift,
        LocalTime defaultOpeningEnd,
        LocalTime defaultClosingStart
) {}
