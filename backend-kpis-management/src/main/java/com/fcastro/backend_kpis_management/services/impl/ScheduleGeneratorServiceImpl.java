package com.fcastro.backend_kpis_management.services.impl;

import com.fcastro.backend_kpis_management.model.dto.schedule.WeeklyScheduleResponse;
import com.fcastro.backend_kpis_management.model.entities.GenerationRule;
import com.fcastro.backend_kpis_management.model.entities.ScheduleConfig;
import com.fcastro.backend_kpis_management.model.entities.ScheduleSlot;
import com.fcastro.backend_kpis_management.model.entities.ShiftTemplate;
import com.fcastro.backend_kpis_management.model.entities.WeeklySchedule;
import com.fcastro.backend_kpis_management.model.enums.TeamRole;
import com.fcastro.backend_kpis_management.repositories.GenerationRuleRepository;
import com.fcastro.backend_kpis_management.repositories.ScheduleConfigRepository;
import com.fcastro.backend_kpis_management.repositories.ScheduleSlotRepository;
import com.fcastro.backend_kpis_management.repositories.ShiftTemplateRepository;
import com.fcastro.backend_kpis_management.repositories.WeeklyScheduleRepository;
import com.fcastro.backend_kpis_management.services.ScheduleGeneratorService;
import com.fcastro.backend_kpis_management.services.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * CSP-based schedule generator with opening-deficit ordering and random tie-breaking.
 *
 * Hard constraints (never violated):
 *   1. ADMIN and CO_ADMIN slots are not touched.
 *   2. A slot whose day matches the adviser's fixed rest day becomes libre.
 *
 * Soft constraint (best-effort, emits a warning in the schedule if unmet):
 *   3. Every ADVISER / AUXILIARY gets ≥ minOpeningsPerAdviser opening shifts per week.
 *      "Opening" = template whose startTime ≤ ScheduleConfig.openingShiftEnd.
 *
 * Pool model: ADVISER and AUXILIARY are treated as one combined staff pool.
 * Rule capacity per day = advisersPerDay + auxiliariesPerDay (total slots available
 * for that template, regardless of role).
 *
 * Variety between runs: the pool is shuffled before the stable deficit-sort.
 * Equal-deficit ties resolve randomly, so successive auto-generates produce
 * different distributions while still honouring the opening constraint.
 */
@Service
@RequiredArgsConstructor
public class ScheduleGeneratorServiceImpl implements ScheduleGeneratorService {

    private final WeeklyScheduleRepository scheduleRepo;
    private final ScheduleSlotRepository slotRepo;
    private final GenerationRuleRepository ruleRepo;
    private final ShiftTemplateRepository templateRepo;
    private final ScheduleConfigRepository configRepo;
    private final ScheduleService scheduleService;

    @Override
    @Transactional
    public WeeklyScheduleResponse generate(Long scheduleId) {
        WeeklySchedule schedule = scheduleRepo.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Horario no encontrado: " + scheduleId));

        if ("PUBLISHED".equals(schedule.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede regenerar un horario publicado");
        }

        List<GenerationRule> rules = ruleRepo.findAllByOrderBySortOrderAscIdAsc();
        if (rules.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No hay reglas de generación configuradas. Configúralas en el panel de horario.");
        }

        ScheduleConfig config = configRepo.findFirstBy().orElseGet(ScheduleConfig::new);
        ShiftTemplate libreTemplate = findLibreTemplate();
        List<ScheduleSlot> slots = schedule.getSlots();

        // Single staff pool: all advisers + auxiliaries, ordered by ID for stability.
        List<Long> staffIds = poolIds(slots, Set.of(TeamRole.ADVISER, TeamRole.AUXILIARY));

        LocalTime openingCutoff = config.getOpeningShiftEnd();
        List<GenerationRule> openingRules    = partitionRules(rules, openingCutoff, true);
        List<GenerationRule> nonOpeningRules = partitionRules(rules, openingCutoff, false);

        int minOpenings = config.getMinOpeningsPerAdviser();
        Map<Long, Integer> openingDeficit = initDeficit(staffIds, minOpenings);

        for (int day = 1; day <= 7; day++) {
            List<Long> available = filterAvailable(slots, staffIds, day);

            markRestDays(slots, staffIds, available, day);
            assignDay(slots, available, openingRules, nonOpeningRules, openingDeficit, day, libreTemplate);
        }

        slotRepo.saveAll(slots);
        return scheduleService.getById(scheduleId);
    }

    /**
     * Assigns shifts for one day using constraint-guided ordering.
     *
     * Step 1 — shuffle for variety: randomises tie resolution so each call
     *   to generate() produces a different distribution.
     * Step 2 — stable-sort by deficit descending: advisers who still need
     *   openings bubble to the top, while equal-deficit advisers stay in
     *   the random order from step 1.
     * Step 3 — assign opening slots to the front of the sorted list.
     * Step 4 — assign non-opening slots to the remainder.
     * Step 5 — surplus advisers (more people than rule slots) → libre.
     */
    private void assignDay(
            List<ScheduleSlot> slots,
            List<Long> available,
            List<GenerationRule> openingRules,
            List<GenerationRule> nonOpeningRules,
            Map<Long, Integer> openingDeficit,
            int day,
            ShiftTemplate libreTemplate) {

        if (available.isEmpty()) return;

        // Shuffle first so equal-deficit ties resolve differently each run.
        List<Long> shuffled = new ArrayList<>(available);
        Collections.shuffle(shuffled);

        // Stable sort: highest deficit first; ties keep their shuffled order.
        shuffled.sort(Comparator.comparingInt(id -> -openingDeficit.getOrDefault(id, 0)));

        int cursor = 0;

        // Fill opening rule slots — high-deficit staff gets these.
        for (GenerationRule rule : openingRules) {
            int capacity = totalCapacity(rule);
            int toAssign = Math.min(capacity, shuffled.size() - cursor);
            for (int i = 0; i < toAssign; i++) {
                Long id = shuffled.get(cursor++);
                ScheduleSlot slot = findSlot(slots, id, day);
                if (slot != null) {
                    applyTemplate(slot, rule.getShiftTemplate());
                    openingDeficit.merge(id, -1, Integer::sum);
                }
            }
        }

        // Fill non-opening rule slots with remaining staff.
        for (GenerationRule rule : nonOpeningRules) {
            int capacity = totalCapacity(rule);
            int toAssign = Math.min(capacity, shuffled.size() - cursor);
            for (int i = 0; i < toAssign; i++) {
                ScheduleSlot slot = findSlot(slots, shuffled.get(cursor++), day);
                if (slot != null) applyTemplate(slot, rule.getShiftTemplate());
            }
        }

        // Surplus staff → libre (rules didn't have enough slots for everyone).
        while (cursor < shuffled.size()) {
            ScheduleSlot slot = findSlot(slots, shuffled.get(cursor++), day);
            if (slot == null) continue;
            if (libreTemplate != null) applyTemplate(slot, libreTemplate);
            else applyRestDay(slot);
        }
    }

    // ---- helpers ----

    private List<Long> poolIds(List<ScheduleSlot> slots, Set<TeamRole> roles) {
        return slots.stream()
                .filter(s -> s.getDayOfWeek() == 1 && roles.contains(s.getAdviser().getTeamRole()))
                .sorted(Comparator.comparing(s -> s.getAdviser().getId()))
                .map(s -> s.getAdviser().getId())
                .toList();
    }

    private Map<Long, Integer> initDeficit(List<Long> ids, int minOpenings) {
        Map<Long, Integer> deficit = new HashMap<>();
        ids.forEach(id -> deficit.put(id, minOpenings));
        return deficit;
    }

    private List<GenerationRule> partitionRules(List<GenerationRule> rules,
                                                LocalTime openingCutoff,
                                                boolean opening) {
        return rules.stream()
                .filter(r -> isOpeningTemplate(r.getShiftTemplate(), openingCutoff) == opening)
                .toList();
    }

    private boolean isOpeningTemplate(ShiftTemplate template, LocalTime cutoff) {
        if (Boolean.TRUE.equals(template.getIsRest()) || template.getStartTime() == null) return false;
        return !LocalTime.parse(template.getStartTime()).isAfter(cutoff);
    }

    /** Total staff capacity for a rule = advisers + auxiliaries (unified pool). */
    private int totalCapacity(GenerationRule rule) {
        int aux = rule.getAuxiliariesPerDay() != null ? rule.getAuxiliariesPerDay() : 0;
        return rule.getAdvisersPerDay() + aux;
    }

    private ShiftTemplate findLibreTemplate() {
        return templateRepo.findByActiveTrueOrderBySortOrderAscIdAsc().stream()
                .filter(t -> Boolean.TRUE.equals(t.getIsRest()))
                .findFirst().orElse(null);
    }

    private List<Long> filterAvailable(List<ScheduleSlot> slots, List<Long> pool, int day) {
        return pool.stream().filter(id -> {
            Integer restDay = slots.stream()
                    .filter(s -> s.getAdviser().getId().equals(id) && s.getDayOfWeek() == day)
                    .findFirst()
                    .map(s -> s.getAdviser().getRestDay())
                    .orElse(null);
            return restDay == null || restDay != day;
        }).toList();
    }

    private void markRestDays(List<ScheduleSlot> slots, List<Long> pool, List<Long> available, int day) {
        pool.stream().filter(id -> !available.contains(id)).forEach(id -> {
            ScheduleSlot slot = findSlot(slots, id, day);
            if (slot != null) applyRestDay(slot);
        });
    }

    private ScheduleSlot findSlot(List<ScheduleSlot> slots, Long adviserId, int day) {
        return slots.stream()
                .filter(s -> s.getAdviser().getId().equals(adviserId) && s.getDayOfWeek() == day)
                .findFirst().orElse(null);
    }

    private void applyTemplate(ScheduleSlot slot, ShiftTemplate t) {
        slot.setShiftTemplateId(t.getId());
        slot.setIsRestDay(Boolean.TRUE.equals(t.getIsRest()));
        if (Boolean.TRUE.equals(t.getIsRest()) || t.getStartTime() == null) {
            slot.setStartTime(null);
            slot.setEndTime(null);
        } else {
            slot.setStartTime(LocalTime.parse(t.getStartTime()));
            slot.setEndTime(t.getEndTime() != null ? LocalTime.parse(t.getEndTime()) : null);
        }
    }

    private void applyRestDay(ScheduleSlot slot) {
        slot.setIsRestDay(true);
        slot.setStartTime(null);
        slot.setEndTime(null);
        slot.setShiftTemplateId(null);
    }
}
