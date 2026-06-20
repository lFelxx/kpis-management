package com.fcastro.backend_kpis_management.services.impl;

import com.fcastro.backend_kpis_management.exceptions.ResourceNotFoundException;
import com.fcastro.backend_kpis_management.model.dto.budget.BudgetTemplateResponse;
import com.fcastro.backend_kpis_management.model.dto.budget.DailyDistributionResponse;
import com.fcastro.backend_kpis_management.model.dto.budget.ParsedBudgetTemplate;
import com.fcastro.backend_kpis_management.model.dto.budget.ParsedDayData;
import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.AdviserDailyExclusion;
import com.fcastro.backend_kpis_management.model.entities.BudgetTemplate;
import com.fcastro.backend_kpis_management.model.entities.DailyBudgetDistribution;
import com.fcastro.backend_kpis_management.repositories.AdviserDailyExclusionRepository;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.repositories.BudgetTemplateRepository;
import com.fcastro.backend_kpis_management.repositories.DailyBudgetDistributionRepository;
import com.fcastro.backend_kpis_management.services.BudgetTemplateService;
import com.fcastro.backend_kpis_management.services.GoalService;
import com.fcastro.backend_kpis_management.util.BudgetExcelParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetTemplateServiceImpl implements BudgetTemplateService {

    private final BudgetTemplateRepository budgetTemplateRepository;
    private final DailyBudgetDistributionRepository dailyDistributionRepository;
    private final AdviserDailyExclusionRepository exclusionRepository;
    private final AdviserRepository adviserRepository;
    private final BudgetExcelParser excelParser;
    private final GoalService goalService;

    @Override
    @Transactional
    public BudgetTemplateResponse upload(InputStream excelFile, int year, int month) {
        ParsedBudgetTemplate parsed = excelParser.parse(excelFile, year, month);
        BudgetTemplate template = findOrCreateTemplate(year, month, parsed.totalBudget());
        replaceDistributions(template, parsed);
        BudgetTemplate saved = budgetTemplateRepository.save(template);
        distributeGoalsToAdvisers(saved, year, month);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetTemplateResponse getByYearAndMonth(int year, int month) {
        return toResponse(findTemplateOrThrow(year, month));
    }

    @Override
    @Transactional
    public BudgetTemplateResponse updateAdviserCount(int year, int month, LocalDate date, int adviserCount) {
        BudgetTemplate template = findTemplateOrThrow(year, month);

        DailyBudgetDistribution day = dailyDistributionRepository
                .findByBudgetTemplateIdAndDate(template.getId(), date)
                .orElseThrow(() -> new ResourceNotFoundException("No existe distribución para la fecha: " + date));

        day.setAdviserCount(adviserCount);
        day.setGoalPerAdviser(calculateGoalPerAdviser(day.getDailyAmount(), adviserCount));
        day.setManualOverride(true);
        dailyDistributionRepository.save(day);

        distributeGoalsToAdvisers(template, year, month);
        return toResponse(template);
    }

    @Override
    @Transactional
    public void resetManualOverride(int year, int month, LocalDate date) {
        BudgetTemplate template = findTemplateOrThrow(year, month);

        DailyBudgetDistribution day = dailyDistributionRepository
                .findByBudgetTemplateIdAndDate(template.getId(), date)
                .orElseThrow(() -> new ResourceNotFoundException("No existe distribución para la fecha: " + date));

        day.setManualOverride(false);
        dailyDistributionRepository.save(day);

        distributeGoalsToAdvisers(template, year, month);
    }

    @Override
    @Transactional
    public BudgetTemplateResponse toggleAdviserExclusion(int year, int month, LocalDate date, Long adviserId) {
        BudgetTemplate template = findTemplateOrThrow(year, month);

        Adviser adviser = adviserRepository.findById(adviserId)
                .orElseThrow(() -> new ResourceNotFoundException("Asesor no encontrado con ID: " + adviserId));

        DailyBudgetDistribution day = dailyDistributionRepository
                .findByBudgetTemplateIdAndDate(template.getId(), date)
                .orElseThrow(() -> new ResourceNotFoundException("No existe distribución para la fecha: " + date));

        Optional<AdviserDailyExclusion> existing = exclusionRepository.findByAdviserIdAndDate(adviserId, date);
        if (existing.isPresent()) {
            exclusionRepository.delete(existing.get());
            day.setAdviserCount(day.getAdviserCount() + 1);
        } else {
            AdviserDailyExclusion exclusion = new AdviserDailyExclusion();
            exclusion.setAdviser(adviser);
            exclusion.setDate(date);
            exclusionRepository.save(exclusion);
            day.setAdviserCount(Math.max(0, day.getAdviserCount() - 1));
        }

        day.setGoalPerAdviser(calculateGoalPerAdviser(day.getDailyAmount(), day.getAdviserCount()));
        dailyDistributionRepository.save(day);

        distributeGoalsToAdvisers(template, year, month);
        return toResponse(template);
    }

    @Override
    public double calculatePafUpToDate(int year, int month, LocalDate cutoffDate) {
        BudgetTemplate template = findTemplateOrThrow(year, month);
        return dailyDistributionRepository
                .findByBudgetTemplateIdAndDateLessThanEqual(template.getId(), cutoffDate)
                .stream()
                .mapToDouble(DailyBudgetDistribution::getDailyAmount)
                .sum();
    }

    @Override
    public double calculateGoalUpToDate(int year, int month, LocalDate cutoffDate) {
        BudgetTemplate template = findTemplateOrThrow(year, month);
        return dailyDistributionRepository
                .findByBudgetTemplateIdAndDateLessThanEqual(template.getId(), cutoffDate)
                .stream()
                .mapToDouble(DailyBudgetDistribution::getGoalPerAdviser)
                .sum();
    }

    /**
     * 3 queries totales sin importar cuántos asesores haya:
     * 1) template, 2) distribuciones hasta cutoff, 3) exclusiones del mes
     */
    @Override
    public Map<Long, Double> calculateGoalsUpToDatePerAdviser(int year, int month,
                                                               LocalDate cutoffDate,
                                                               List<Long> adviserIds) {
        BudgetTemplate template = findTemplateOrThrow(year, month);
        LocalDate startOfMonth = LocalDate.of(year, month, 1);

        List<DailyBudgetDistribution> distributions = dailyDistributionRepository
                .findByBudgetTemplateIdAndDateLessThanEqual(template.getId(), cutoffDate);

        // adviserId → fechas excluidas (cargado en una sola query)
        Map<Long, Set<LocalDate>> exclusionsByAdviser = exclusionRepository
                .findAllByDateBetween(startOfMonth, cutoffDate)
                .stream()
                .collect(Collectors.groupingBy(
                        e -> e.getAdviser().getId(),
                        Collectors.mapping(AdviserDailyExclusion::getDate, Collectors.toSet())
                ));

        return adviserIds.stream().collect(Collectors.toMap(
                id -> id,
                id -> {
                    Set<LocalDate> excluded = exclusionsByAdviser.getOrDefault(id, Set.of());
                    return distributions.stream()
                            .filter(d -> !excluded.contains(d.getDate()))
                            .mapToDouble(DailyBudgetDistribution::getGoalPerAdviser)
                            .sum();
                }
        ));
    }

    @Override
    public Map<Long, Double> calculateFullMonthGoalsPerAdviser(int year, int month, List<Long> adviserIds) {
        BudgetTemplate template = findTemplateOrThrow(year, month);
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth   = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());

        List<DailyBudgetDistribution> allDays = template.getDailyDistributions();

        Map<Long, Set<LocalDate>> exclusionsByAdviser = exclusionRepository
                .findAllByDateBetween(startOfMonth, endOfMonth)
                .stream()
                .collect(Collectors.groupingBy(
                        e -> e.getAdviser().getId(),
                        Collectors.mapping(AdviserDailyExclusion::getDate, Collectors.toSet())
                ));

        return adviserIds.stream().collect(Collectors.toMap(
                id -> id,
                id -> {
                    Set<LocalDate> excluded = exclusionsByAdviser.getOrDefault(id, Set.of());
                    return allDays.stream()
                            .filter(d -> !excluded.contains(d.getDate()))
                            .mapToDouble(DailyBudgetDistribution::getGoalPerAdviser)
                            .sum();
                }
        ));
    }

    // --- Lógica interna ---

    private BudgetTemplate findOrCreateTemplate(int year, int month, double totalBudget) {
        BudgetTemplate template = budgetTemplateRepository
                .findByYearAndMonth(year, month)
                .orElseGet(BudgetTemplate::new);
        template.setYear(year);
        template.setMonth(month);
        template.setTotalBudget(totalBudget);
        template.setUploadedAt(LocalDateTime.now());
        return template;
    }

    private void replaceDistributions(BudgetTemplate template, ParsedBudgetTemplate parsed) {
        List<DailyBudgetDistribution> existing = template.getDailyDistributions();
        for (ParsedDayData dayData : parsed.days()) {
            existing.stream()
                    .filter(d -> d.getDate().equals(dayData.date()))
                    .findFirst()
                    .ifPresentOrElse(
                            d -> updateDistributionFromExcel(d, dayData, parsed.totalBudget()),
                            () -> existing.add(buildDistribution(template, dayData, parsed.totalBudget()))
                    );
        }
    }

    private void updateDistributionFromExcel(DailyBudgetDistribution d, ParsedDayData dayData, double totalBudget) {
        double dailyAmount = totalBudget * dayData.weightPercentage();
        d.setWeightPercentage(dayData.weightPercentage());
        d.setDailyAmount(dailyAmount);
        if (!d.isManualOverride()) d.setAdviserCount(dayData.adviserCount());
        d.setGoalPerAdviser(calculateGoalPerAdviser(dailyAmount, d.getAdviserCount()));
    }

    private DailyBudgetDistribution buildDistribution(BudgetTemplate template, ParsedDayData dayData, double totalBudget) {
        double dailyAmount = totalBudget * dayData.weightPercentage();
        DailyBudgetDistribution d = new DailyBudgetDistribution();
        d.setBudgetTemplate(template);
        d.setDate(dayData.date());
        d.setWeightPercentage(dayData.weightPercentage());
        d.setDailyAmount(dailyAmount);
        d.setAdviserCount(dayData.adviserCount());
        d.setGoalPerAdviser(calculateGoalPerAdviser(dailyAmount, dayData.adviserCount()));
        d.setManualOverride(false);
        return d;
    }

    private double calculateGoalPerAdviser(double dailyAmount, int adviserCount) {
        return adviserCount <= 0 ? 0 : dailyAmount / adviserCount;
    }

    private void distributeGoalsToAdvisers(BudgetTemplate template, int year, int month) {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDate firstDay  = LocalDate.of(year, month, 1);

        List<Adviser> activeAdvisers = adviserRepository.findAllActiveAdvisers();
        List<Long> adviserIds = activeAdvisers.stream().map(Adviser::getId).toList();

        // Una sola query para todas las exclusiones del mes
        Map<Long, Set<LocalDate>> exclusionsByAdviser = exclusionRepository
                .findAllByDateBetween(firstDay, yesterday)
                .stream()
                .collect(Collectors.groupingBy(
                        e -> e.getAdviser().getId(),
                        Collectors.mapping(AdviserDailyExclusion::getDate, Collectors.toSet())
                ));

        List<DailyBudgetDistribution> daysUpToYesterday = template.getDailyDistributions().stream()
                .filter(d -> !d.getDate().isAfter(yesterday))
                .toList();

        for (Long adviserId : adviserIds) {
            Set<LocalDate> excluded = exclusionsByAdviser.getOrDefault(adviserId, Set.of());
            double goal = daysUpToYesterday.stream()
                    .filter(d -> !excluded.contains(d.getDate()))
                    .mapToDouble(DailyBudgetDistribution::getGoalPerAdviser)
                    .sum();
            goalService.updateGoal(adviserId, goal, year, month);
        }
    }

    private BudgetTemplate findTemplateOrThrow(int year, int month) {
        return budgetTemplateRepository.findByYearAndMonth(year, month)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("No existe presupuesto para %d/%d", month, year)));
    }

    // --- Mapeo a respuesta ---

    private BudgetTemplateResponse toResponse(BudgetTemplate template) {
        LocalDate startOfMonth = LocalDate.of(template.getYear(), template.getMonth(), 1);
        LocalDate endOfMonth   = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());

        // Una query para todas las exclusiones del mes
        Map<LocalDate, List<Long>> exclusionIdsByDate = exclusionRepository
                .findAllByDateBetween(startOfMonth, endOfMonth)
                .stream()
                .collect(Collectors.groupingBy(
                        AdviserDailyExclusion::getDate,
                        Collectors.mapping(e -> e.getAdviser().getId(), Collectors.toList())
                ));

        List<DailyDistributionResponse> days = template.getDailyDistributions().stream()
                .sorted(Comparator.comparing(DailyBudgetDistribution::getDate))
                .map(d -> toDailyResponse(d, exclusionIdsByDate.getOrDefault(d.getDate(), List.of())))
                .toList();

        double distributedBudget = days.stream().mapToDouble(DailyDistributionResponse::dailyAmount).sum();

        return new BudgetTemplateResponse(
                template.getId(), template.getYear(), template.getMonth(),
                template.getTotalBudget(), distributedBudget, template.getUploadedAt(), days);
    }

    private DailyDistributionResponse toDailyResponse(DailyBudgetDistribution d, List<Long> excludedIds) {
        return new DailyDistributionResponse(
                d.getId(), d.getDate(), d.getWeightPercentage(), d.getDailyAmount(),
                d.getAdviserCount(), d.getGoalPerAdviser(), d.isManualOverride(), excludedIds);
    }
}
