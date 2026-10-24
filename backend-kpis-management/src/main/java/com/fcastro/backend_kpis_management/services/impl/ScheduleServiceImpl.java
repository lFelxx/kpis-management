package com.fcastro.backend_kpis_management.services.impl;

import com.fcastro.backend_kpis_management.model.dto.schedule.*;
import com.fcastro.backend_kpis_management.model.entities.ScheduleConfig;
import com.fcastro.backend_kpis_management.model.entities.ScheduleSlot;
import com.fcastro.backend_kpis_management.model.entities.WeeklySchedule;
import com.fcastro.backend_kpis_management.model.enums.TeamRole;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.repositories.ScheduleConfigRepository;
import com.fcastro.backend_kpis_management.repositories.ScheduleSlotRepository;
import com.fcastro.backend_kpis_management.repositories.ShiftTemplateRepository;
import com.fcastro.backend_kpis_management.repositories.WeeklyScheduleRepository;
import com.fcastro.backend_kpis_management.services.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final WeeklyScheduleRepository scheduleRepo;
    private final ScheduleSlotRepository slotRepo;
    private final ScheduleConfigRepository configRepo;
    private final AdviserRepository adviserRepo;
    private final ShiftTemplateRepository shiftTemplateRepo;

    @Override
    @Transactional
    public WeeklyScheduleResponse create(LocalDate weekStart) {
        LocalDate monday = weekStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        if (scheduleRepo.existsByWeekStart(monday)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un horario para la semana del " + monday);
        }

        WeeklySchedule schedule = new WeeklySchedule();
        schedule.setWeekStart(monday);
        schedule.setWeekEnd(monday.plusDays(6));

        // Create empty slots for every active adviser × 7 days
        var advisers = adviserRepo.findAllActiveAdvisers();
        List<ScheduleSlot> slots = new ArrayList<>();
        for (var adviser : advisers) {
            for (int day = 1; day <= 7; day++) {
                ScheduleSlot slot = new ScheduleSlot();
                slot.setSchedule(schedule);
                slot.setAdviser(adviser);
                slot.setDayOfWeek(day);
                slot.setIsRestDay(false);
                slots.add(slot);
            }
        }
        schedule.setSlots(slots);
        WeeklySchedule saved = scheduleRepo.save(schedule);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public WeeklyScheduleResponse getById(Long id) {
        WeeklySchedule schedule = findOrThrow(id);
        if (!"PUBLISHED".equals(schedule.getStatus())) {
            syncMissingMembers(schedule);
        }
        return toResponse(schedule);
    }

    private void syncMissingMembers(WeeklySchedule schedule) {
        var activeAdvisers = adviserRepo.findAllActiveAdvisers();
        var existingAdviserIds = schedule.getSlots().stream()
                .map(s -> s.getAdviser().getId())
                .collect(java.util.stream.Collectors.toSet());

        List<ScheduleSlot> newSlots = new ArrayList<>();
        for (var adviser : activeAdvisers) {
            if (!existingAdviserIds.contains(adviser.getId())) {
                for (int day = 1; day <= 7; day++) {
                    ScheduleSlot slot = new ScheduleSlot();
                    slot.setSchedule(schedule);
                    slot.setAdviser(adviser);
                    slot.setDayOfWeek(day);
                    slot.setIsRestDay(false);
                    newSlots.add(slot);
                }
            }
        }
        if (!newSlots.isEmpty()) {
            slotRepo.saveAll(newSlots);
            schedule.getSlots().addAll(newSlots);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<WeeklyScheduleSummary> getAll() {
        return scheduleRepo.findAllOrderByWeekStartDesc().stream()
                .map(s -> new WeeklyScheduleSummary(s.getId(), s.getWeekStart(), s.getWeekEnd(), s.getStatus()))
                .toList();
    }

    @Override
    @Transactional
    public WeeklyScheduleResponse updateSlot(Long slotId, ScheduleSlotUpdateRequest request) {
        ScheduleSlot slot = slotRepo.findById(slotId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slot no encontrado: " + slotId));

        if ("PUBLISHED".equals(slot.getSchedule().getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede editar un horario publicado");
        }

        LocalTime newStart = request.startTime() != null ? request.startTime() : slot.getStartTime();
        LocalTime newEnd   = request.endTime()   != null ? request.endTime()   : slot.getEndTime();

        if (newStart != null && newEnd != null && !Boolean.TRUE.equals(request.isRestDay())
                && !newEnd.isAfter(newStart)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La hora de salida debe ser posterior a la de entrada");
        }

        slot.setStartTime(request.startTime());
        slot.setEndTime(request.endTime());
        if (request.isRestDay() != null) slot.setIsRestDay(request.isRestDay());
        if (request.notes()     != null) slot.setNotes(request.notes());
        slot.setShiftTemplateId(request.shiftTemplateId());

        // Sincronizar día de descanso fijo del asesor
        if (Boolean.TRUE.equals(request.isRestDay())) {
            slot.getAdviser().setRestDay(slot.getDayOfWeek());
            adviserRepo.save(slot.getAdviser());
        } else if (Boolean.FALSE.equals(request.isRestDay())) {
            Integer currentFixed = slot.getAdviser().getRestDay();
            if (currentFixed != null && currentFixed == slot.getDayOfWeek()) {
                slot.getAdviser().setRestDay(null);
                adviserRepo.save(slot.getAdviser());
            }
        }

        slotRepo.save(slot);
        return toResponse(slot.getSchedule());
    }

    @Override
    @Transactional
    public WeeklyScheduleResponse publish(Long id) {
        WeeklySchedule schedule = findOrThrow(id);
        schedule.setStatus("PUBLISHED");
        return toResponse(scheduleRepo.save(schedule));
    }

    @Override
    @Transactional
    public WeeklyScheduleResponse unpublish(Long id) {
        WeeklySchedule schedule = findOrThrow(id);
        if (!"PUBLISHED".equals(schedule.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El horario no está publicado");
        }
        schedule.setStatus("DRAFT");
        return toResponse(scheduleRepo.save(schedule));
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleConfigResponse getConfig() {
        ScheduleConfig config = configRepo.findFirstBy()
                .orElseGet(this::defaultConfig);
        return toConfigResponse(config);
    }

    @Override
    @Transactional
    public ScheduleConfigResponse saveConfig(ScheduleConfigRequest request) {
        ScheduleConfig config = configRepo.findFirstBy().orElseGet(ScheduleConfig::new);

        if (request.storeOpenTime() != null) config.setStoreOpenTime(request.storeOpenTime());
        if (request.storeCloseTime() != null) config.setStoreCloseTime(request.storeCloseTime());
        if (request.openingShiftEnd() != null) config.setOpeningShiftEnd(request.openingShiftEnd());
        if (request.closingShiftStart() != null) config.setClosingShiftStart(request.closingShiftStart());
        if (request.lunchMinutes() != null) config.setLunchMinutes(request.lunchMinutes());
        if (request.minOpeningsPerAdviser() != null) config.setMinOpeningsPerAdviser(request.minOpeningsPerAdviser());
        if (request.advisersPerShift() != null) config.setAdvisersPerShift(request.advisersPerShift());
        if (request.defaultOpeningEnd() != null) config.setDefaultOpeningEnd(request.defaultOpeningEnd());
        if (request.defaultClosingStart() != null) config.setDefaultClosingStart(request.defaultClosingStart());

        return toConfigResponse(configRepo.save(config));
    }

    @Override
    @Transactional
    public WeeklyScheduleResponse clearSlots(Long id) {
        WeeklySchedule schedule = findOrThrow(id);
        if ("PUBLISHED".equals(schedule.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede limpiar un horario publicado");
        }
        for (ScheduleSlot slot : schedule.getSlots()) {
            slot.setStartTime(null);
            slot.setEndTime(null);
            slot.setIsRestDay(false);
            slot.setNotes(null);
            slot.setShiftTemplateId(null);
        }
        slotRepo.saveAll(schedule.getSlots());
        return toResponse(schedule);
    }

    // --- mapping ---

    private WeeklyScheduleResponse toResponse(WeeklySchedule schedule) {
        List<ScheduleSlotResponse> slotResponses = schedule.getSlots().stream()
                .map(this::toSlotResponse)
                .toList();
        List<WeeklyAdviserSummary> summaries = buildAdviserSummaries(schedule, slotResponses);
        List<String> warnings = buildWarnings(schedule);
        return new WeeklyScheduleResponse(
                schedule.getId(),
                schedule.getWeekStart(),
                schedule.getWeekEnd(),
                schedule.getStatus(),
                slotResponses,
                summaries,
                warnings
        );
    }

    private List<WeeklyAdviserSummary> buildAdviserSummaries(WeeklySchedule schedule,
                                                              List<ScheduleSlotResponse> slotResponses) {
        // Group net minutes by adviserId
        record AdviserKey(Long id, String name, String role) {}

        java.util.Map<Long, int[]> minutesMap = new java.util.LinkedHashMap<>();
        java.util.Map<Long, int[]> daysMap    = new java.util.LinkedHashMap<>();
        java.util.Map<Long, String[]> metaMap = new java.util.LinkedHashMap<>();

        for (ScheduleSlotResponse s : slotResponses) {
            minutesMap.computeIfAbsent(s.adviserId(), k -> new int[]{0})[0] += s.netMinutes();
            if (!Boolean.TRUE.equals(s.isRestDay()) && s.startTime() != null) {
                daysMap.computeIfAbsent(s.adviserId(), k -> new int[]{0})[0]++;
            }
            metaMap.putIfAbsent(s.adviserId(), new String[]{s.adviserName(), s.teamRole()});
        }

        // Recover restDay from slots (it's on the Adviser entity)
        java.util.Map<Long, Integer> restDayMap = schedule.getSlots().stream()
                .filter(s -> s.getAdviser().getRestDay() != null)
                .collect(java.util.stream.Collectors.toMap(
                        s -> s.getAdviser().getId(),
                        s -> s.getAdviser().getRestDay(),
                        (a, b) -> a));

        return minutesMap.entrySet().stream().map(e -> {
            Long aid = e.getKey();
            String[] meta = metaMap.getOrDefault(aid, new String[]{"", ""});
            int days = daysMap.getOrDefault(aid, new int[]{0})[0];
            return new WeeklyAdviserSummary(aid, meta[0], meta[1],
                    restDayMap.get(aid), e.getValue()[0], days);
        }).toList();
    }

    private ScheduleSlotResponse toSlotResponse(ScheduleSlot slot) {
        int netMinutes = 0;
        if (!Boolean.TRUE.equals(slot.getIsRestDay())
                && slot.getStartTime() != null && slot.getEndTime() != null) {
            int gross = (int) java.time.Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes();
            boolean hasLunch = slot.getShiftTemplateId() != null &&
                shiftTemplateRepo.findById(slot.getShiftTemplateId())
                    .map(t -> Boolean.TRUE.equals(t.getHasLunch()))
                    .orElse(false);
            int lunch = hasLunch ? resolvedLunchMinutes(slot.getStartTime(), slot.getEndTime()) : 0;
            netMinutes = Math.max(0, gross - lunch);
        }

        String adviserName = slot.getAdviser().getName() + " " + slot.getAdviser().getLastname();
        return new ScheduleSlotResponse(
                slot.getId(),
                slot.getAdviser().getId(),
                adviserName,
                slot.getAdviser().getTeamRole().name(),
                slot.getDayOfWeek(),
                slot.getStartTime(),
                slot.getEndTime(),
                slot.getIsRestDay(),
                netMinutes,
                slot.getNotes(),
                slot.getShiftTemplateId()
        );
    }

    /** Descontamos almuerzo solo si el turno cruza la ventana de almuerzo (12:00-14:00). */
    private int resolvedLunchMinutes(LocalTime start, LocalTime end) {
        LocalTime lunchStart = LocalTime.of(12, 0);
        LocalTime lunchEnd = LocalTime.of(14, 0);
        if (start.isBefore(lunchEnd) && end.isAfter(lunchStart)) {
            return configRepo.findFirstBy()
                    .map(ScheduleConfig::getLunchMinutes)
                    .orElse(60);
        }
        return 0;
    }

    /**
     * Genera advertencias de negocio:
     * 1. Admin no está en al menos un turno cada día.
     * 2. Co-admin en el mismo turno que admin (debería estar al contrario).
     * 3. Asesor/Auxiliar con menos aperturas que el mínimo configurado.
     */
    private List<String> buildWarnings(WeeklySchedule schedule) {
        List<String> warnings = new ArrayList<>();
        ScheduleConfig cfg = configRepo.findFirstBy().orElseGet(this::defaultConfig);

        for (int day = 1; day <= 7; day++) {
            final int d = day;

            // Slots con horas reales (para validar conflictos de apertura/cierre)
            List<ScheduleSlot> workingSlots = schedule.getSlots().stream()
                    .filter(s -> s.getDayOfWeek() == d
                            && !Boolean.TRUE.equals(s.getIsRestDay())
                            && s.getStartTime() != null)
                    .toList();

            // Admin está asignado si tiene descanso, startTime, o al menos un template asignado
            boolean adminPresent = schedule.getSlots().stream()
                    .anyMatch(s -> s.getDayOfWeek() == d
                            && s.getAdviser().getTeamRole() == TeamRole.ADMIN
                            && (Boolean.TRUE.equals(s.getIsRestDay())
                                    || s.getStartTime() != null
                                    || s.getShiftTemplateId() != null));

            if (!adminPresent) {
                warnings.add("Día " + d + ": El/la administrador/a no tiene turno asignado.");
            }

            // Conflicto de turno solo aplica cuando ambos tienen horas reales
            workingSlots.stream()
                    .filter(s -> s.getAdviser().getTeamRole() == TeamRole.ADMIN)
                    .forEach(adminSlot -> {
                        boolean adminIsOpening = adminSlot.getStartTime().compareTo(cfg.getOpeningShiftEnd()) <= 0;
                        workingSlots.stream()
                                .filter(s -> s.getAdviser().getTeamRole() == TeamRole.CO_ADMIN)
                                .forEach(coSlot -> {
                                    boolean coIsOpening = coSlot.getStartTime().compareTo(cfg.getOpeningShiftEnd()) <= 0;
                                    if (adminIsOpening == coIsOpening) {
                                        warnings.add("Día " + d + ": Admin y Co-Admin están en el mismo turno ("
                                                + (adminIsOpening ? "apertura" : "cierre") + ").");
                                    }
                                });
                    });
        }

        checkOpeningQuota(schedule, cfg, warnings);
        return warnings;
    }

    /** Warns for each ADVISER/AUXILIARY who has fewer opening shifts than the configured minimum. */
    private void checkOpeningQuota(WeeklySchedule schedule, ScheduleConfig cfg, List<String> warnings) {
        int minOpenings = cfg.getMinOpeningsPerAdviser();
        if (minOpenings <= 0) return;

        LocalTime openingCutoff = cfg.getOpeningShiftEnd();

        schedule.getSlots().stream()
                .filter(s -> s.getAdviser().getTeamRole() == TeamRole.ADVISER
                          || s.getAdviser().getTeamRole() == TeamRole.AUXILIARY)
                .collect(java.util.stream.Collectors.groupingBy(s -> s.getAdviser().getId()))
                .forEach((adviserId, adviserSlots) -> {
                    long openingCount = adviserSlots.stream()
                            .filter(s -> !Boolean.TRUE.equals(s.getIsRestDay())
                                      && s.getStartTime() != null
                                      && !s.getStartTime().isAfter(openingCutoff))
                            .count();
                    if (openingCount < minOpenings) {
                        String name = adviserSlots.get(0).getAdviser().getName()
                                    + " " + adviserSlots.get(0).getAdviser().getLastname();
                        warnings.add(name + ": " + openingCount + " apertura(s) asignada(s)"
                                   + " (mínimo " + minOpenings + ").");
                    }
                });
    }

    private ScheduleConfig defaultConfig() {
        return new ScheduleConfig();
    }

    private ScheduleConfigResponse toConfigResponse(ScheduleConfig c) {
        return new ScheduleConfigResponse(
                c.getId(), c.getStoreOpenTime(), c.getStoreCloseTime(),
                c.getOpeningShiftEnd(), c.getClosingShiftStart(),
                c.getLunchMinutes(), c.getMinOpeningsPerAdviser(), c.getAdvisersPerShift(),
                c.getDefaultOpeningEnd(), c.getDefaultClosingStart()
        );
    }

    private WeeklySchedule findOrThrow(Long id) {
        return scheduleRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Horario no encontrado: " + id));
    }
}
