package com.fcastro.backend_kpis_management.services.impl;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

import com.fcastro.backend_kpis_management.exceptions.AdviserNotFoundException;
import com.fcastro.backend_kpis_management.mapper.AdviserMapper;
import com.fcastro.backend_kpis_management.model.dto.adviser.AdviserRequest;
import com.fcastro.backend_kpis_management.model.dto.adviser.AdviserResponse;
import com.fcastro.backend_kpis_management.model.dto.sale.SaleRequest;
import com.fcastro.backend_kpis_management.model.dto.sale.WeekSale;
import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.Goal;
import com.fcastro.backend_kpis_management.model.entities.Sale;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.repositories.BudgetTemplateRepository;
import com.fcastro.backend_kpis_management.repositories.GoalRepository;
import com.fcastro.backend_kpis_management.repositories.MonthlySummaryRepository;
import com.fcastro.backend_kpis_management.repositories.SaleRepository;
import com.fcastro.backend_kpis_management.services.AdviserService;
import com.fcastro.backend_kpis_management.services.BudgetTemplateService;
import com.fcastro.backend_kpis_management.services.CommissionService;
import com.fcastro.backend_kpis_management.services.SalesCalculator;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RequiredArgsConstructor
@Service
@Transactional
public class AdviserServiceImpl implements AdviserService {

    private static final String ADVISER_NOT_FOUND = "Asesor no encontrado";
    private static final Logger log = LoggerFactory.getLogger(AdviserServiceImpl.class);

    private final SaleRepository saleRepository;
    private final AdviserRepository adviserRepository;
    private final SalesCalculator salesCalculator;
    private final GoalRepository goalRepository;
    private final BudgetTemplateRepository budgetTemplateRepository;
    private final BudgetTemplateService budgetTemplateService;
    private final EntityManager entityManager;
    private final AdviserMapper adviserMapper;
    private final CommissionService commissionService;
    private final MonthlySummaryRepository monthlySummaryRepository;

    @Override
    public List<AdviserResponse> getAdvisers(LocalDate cutoffDate) {
        log.info("Obteniendo lista de asesores");
        List<Adviser> advisers = adviserRepository.findAll();
        List<AdviserResponse> responses = adviserMapper.toResponseList(advisers);
        enrichGoal(responses, cutoffDate);
        enrichSales(responses, cutoffDate);
        enrichCommission(responses, cutoffDate);
        return responses;
    }

    @Override
    public AdviserResponse getAdviserById(Long id) {
        Adviser adviser = adviserRepository.findByIdWithMonthlySummaries(id)
            .orElseThrow(() -> new AdviserNotFoundException(ADVISER_NOT_FOUND));
        AdviserResponse response = adviserMapper.tResponse(adviser);
        LocalDate yesterday = LocalDate.now().minusDays(1);
        enrichGoal(response, yesterday);
        enrichCommission(response, yesterday);
        return response;
    }

    @Override
    public List<Double> getMonthlyCommissions(Long adviserId, int year) {
        Adviser adviser = adviserRepository.findByIdWithMonthlySummaries(adviserId)
                .orElseThrow(() -> new AdviserNotFoundException(ADVISER_NOT_FOUND));
        return commissionService.computeMonthlyCommissionsForAdviser(adviser, year);
    }

    @Override
    public AdviserResponse create(AdviserRequest adviser) {
        log.info("Creando nuevo asesor: {} {}", adviser.getName(), adviser.getLastName());
        Adviser newAdviser = adviserRepository.save(adviserMapper.toEntity(adviser));
        createGoalIfPresent(adviser, newAdviser);
        return buildEnrichedResponse(newAdviser.getId());
    }

    @Override
    public AdviserResponse update(Long id, AdviserRequest adviser) {
        log.info("Actualizando asesor con ID: {}", id);
        Adviser entity = adviserRepository.findById(id)
            .orElseThrow(() -> new AdviserNotFoundException(ADVISER_NOT_FOUND));

        entity.setName(adviser.getName());
        entity.setLastname(adviser.getLastName());
        entity.setActive(adviser.getActive());
        entity.setUpt(adviser.getUpt());

        AdviserResponse response = adviserMapper.tResponse(adviserRepository.save(entity));
        LocalDate yesterday = LocalDate.now().minusDays(1);
        enrichGoal(response, yesterday);
        enrichCommission(response, yesterday);
        return response;
    }

    @Override
    public void delete(Long id) {
        log.info("Eliminando asesor con ID: {}", id);
        adviserRepository.deleteById(id);
    }

    @Override
    public WeekSale addSale(SaleRequest request) {
        log.info("Agregando venta para asesor ID: {} - Monto: {}", request.getAdviserId(), request.getAmount());

        Adviser adviser = adviserRepository.findById(request.getAdviserId())
                .orElseThrow(() -> new AdviserNotFoundException(ADVISER_NOT_FOUND));

        Sale sale = new Sale();
        sale.setAdviser(adviser);
        sale.setAmount(request.getAmount());
        sale.setSaleDate(request.getSaleDate());
        saleRepository.save(sale);

        Double weekTotal = salesCalculator.calculateWeeklySales(adviser, request.getSaleDate());
        int weekNumber = request.getSaleDate().get(WeekFields.ISO.weekBasedYear());
        return new WeekSale(weekNumber, weekTotal);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────────

    private void createGoalIfPresent(AdviserRequest request, Adviser adviser) {
        if (request.getGoalValue() == null || request.getGoalValue() <= 0) return;
        Goal goal = new Goal();
        goal.setGoalValue(request.getGoalValue());
        goal.setAdviser(adviser);
        goal.setYear(LocalDate.now().getYear());
        goal.setMonth(LocalDate.now().getMonthValue());
        goalRepository.saveAndFlush(goal);
    }

    private AdviserResponse buildEnrichedResponse(Long adviserId) {
        entityManager.flush();
        entityManager.clear();
        Adviser adviser = adviserRepository.findByIdWithGoals(adviserId)
            .orElseThrow(() -> new AdviserNotFoundException(ADVISER_NOT_FOUND));
        AdviserResponse response = adviserMapper.tResponse(adviser);
        LocalDate yesterday = LocalDate.now().minusDays(1);
        enrichGoal(response, yesterday);
        enrichCommission(response, yesterday);
        return response;
    }

    private void enrichSales(List<AdviserResponse> responses, LocalDate cutoffDate) {
        if (responses == null || responses.isEmpty()) return;
        int year  = cutoffDate.getYear();
        int month = cutoffDate.getMonthValue();
        Map<Long, Double> salesByAdviser = monthlySummaryRepository.findByYearAndMonth(year, month)
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        s -> s.getAdviser().getId(),
                        s -> s.getTotalSales() != null ? s.getTotalSales() : 0.0
                ));
        responses.forEach(r -> r.setCurrentMonthSales(salesByAdviser.getOrDefault(r.getId(), 0.0)));
    }

    private void enrichGoal(AdviserResponse response, LocalDate cutoffDate) {
        enrichGoal(List.of(response), cutoffDate);
    }

    private void enrichGoal(List<AdviserResponse> responses, LocalDate cutoffDate) {
        if (responses == null || responses.isEmpty()) return;
        int year  = cutoffDate.getYear();
        int month = cutoffDate.getMonthValue();
        if (!budgetTemplateRepository.existsByYearAndMonth(year, month)) return;
        List<Long> ids = responses.stream().map(AdviserResponse::getId).toList();
        Map<Long, Double> goalsUpToDate = budgetTemplateService
                .calculateGoalsUpToDatePerAdviser(year, month, cutoffDate, ids);
        Map<Long, Double> fullMonthGoals = budgetTemplateService
                .calculateFullMonthGoalsPerAdviser(year, month, ids);
        responses.forEach(r -> {
            r.setGoalValue(goalsUpToDate.getOrDefault(r.getId(), 0.0));
            r.setFullMonthGoal(fullMonthGoals.getOrDefault(r.getId(), 0.0));
        });
    }

    private void enrichCommission(AdviserResponse response, LocalDate cutoffDate) {
        enrichCommission(List.of(response), cutoffDate);
    }

    private void enrichCommission(List<AdviserResponse> responses, LocalDate cutoffDate) {
        if (responses == null || responses.isEmpty()) return;
        double ach  = commissionService.computeStoreGoalAchievementPercent(cutoffDate.getYear(), cutoffDate.getMonthValue(), cutoffDate);
        double rate = commissionService.computeEffectiveCommissionRatePercent(ach);
        for (AdviserResponse r : responses) {
            double sales = r.getCurrentMonthSales() != null ? r.getCurrentMonthSales() : 0.0;
            r.setCommission(commissionService.computeCommission(sales, ach));
            r.setCommissionRatePercent(rate);
        }
    }
}
