package com.fcastro.backend_kpis_management.services.impl;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;

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
import com.fcastro.backend_kpis_management.repositories.GoalRepository;
import com.fcastro.backend_kpis_management.repositories.SaleRepository;
import com.fcastro.backend_kpis_management.services.AdviserService;
import com.fcastro.backend_kpis_management.services.SalesCalculator;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RequiredArgsConstructor
@Service
@Transactional
public class AdviserServiceImpl implements AdviserService {

    private final SaleRepository saleRepository;
    private final AdviserRepository adviserRepository;
    private final SalesCalculator salesCalculator;
    private final GoalRepository goalRepository;
    private final EntityManager entityManager;
    private final AdviserMapper adviserMapper;
    private static final Logger log = LoggerFactory.getLogger(AdviserServiceImpl.class);

    @Override
    public List<AdviserResponse> getAdvisers() {
        log.info("Obteniendo lista de asesores");
        List<Adviser> advisers = adviserRepository.findAll();
        return adviserMapper.toResponseList(advisers);
    }

    @Override
    public AdviserResponse getOne(Long id) {
        log.info("Buscando asesor con ID: {}", id);
        Adviser adviser = adviserRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("No se encontró el asesor con ID: {}", id);
                    return new AdviserNotFoundException("No se puedo encontrar el asesor");
                });
        return adviserMapper.tResponse(adviser);
    }

    @Override
    public AdviserResponse getAdviserById(Long id) {
        Adviser adviser = adviserRepository.findByIdWithMonthlySummaries(id)
            .orElseThrow(() -> new AdviserNotFoundException("Asesor no encontrado"));
        
        return adviserMapper.tResponse(adviser);
    }

    @Override
    public AdviserResponse create(AdviserRequest adviser) {
        log.info("Creando nuevo asesor: {} {}, goalValue: {}", adviser.getName(), adviser.getLastName(), adviser.getGoalValue());
        var entity = adviserMapper.toEntity(adviser);
        var newAdviser = adviserRepository.save(entity);

        if (adviser.getGoalValue() != null && adviser.getGoalValue() > 0) {
            log.info("Entrando al if de goalValue");
            Goal goal = new Goal();
            goal.setGoalValue(adviser.getGoalValue());
            goal.setAdviser(newAdviser);
            goal.setYear(LocalDate.now().getYear());
            goal.setMonth(LocalDate.now().getMonthValue());
            goalRepository.saveAndFlush(goal);
            log.info("Goal save: {}, adviser_id: {}", goal.getId(), goal.getAdviser().getId());
        }

        // SIEMPRE recarga el asesor con goals
        entityManager.flush();
        entityManager.clear(); 
        Adviser adviserWithGoals = adviserRepository.findByIdWithGoals(newAdviser.getId())
            .orElse(newAdviser);
        System.out.println("Goals loaded: " + adviserWithGoals.getGoals().size());
        log.info("Asesor creado exitosamente con ID: {}", newAdviser.getId());
        return adviserMapper.tResponse(adviserWithGoals);
    }

    @Override
    public AdviserResponse update(Long id, AdviserRequest adviser) {
        log.info("Actualizando asesor con ID: {}", id);
        Adviser entity = adviserRepository.findById(id)
            .orElseThrow(() -> {
                log.error("No se encontró el asesor con ID: {} para actualizar", id);
                return new AdviserNotFoundException("No se encontro al asesor");
            });

        // Solo actualiza los campos simples
        entity.setName(adviser.getName());
        entity.setLastname(adviser.getLastName());
        entity.setActive(adviser.getActive());
        entity.setUpt(adviser.getUpt());

        // No toques las listas de ventas ni metas aquí

        Adviser updated = adviserRepository.save(entity);
        log.info("Asesor actualizado exitosamente con ID: {}", id);
        return adviserMapper.tResponse(updated);
    }

    @Override
    public void delete(Long id) {
        log.info("Eliminando asesor con ID: {}", id);
        adviserRepository.deleteById(id);
        log.info("Asesor eliminado exitosamente con ID: {}", id);
    }

    @Override
    public WeekSale addSale(SaleRequest request) {
        log.info("Agregando venta desde el servicio de AdviserService para el asesor ID: {} - Monto: {}", request.getAdviserId(), request.getAmount());

        Adviser adviser = adviserRepository.findById(request.getAdviserId())
                .orElseThrow(() -> {
                    log.error("No se encontró el asesor con ID: {} para agregar la venta", request.getAdviserId());
                    return new AdviserNotFoundException("No se encontró el asesor");
                });

        // Crear y guardar la venta individual
        Sale sale = new Sale();
        sale.setAdviser(adviser);
        sale.setAmount(request.getAmount());
        sale.setSaleDate(request.getSaleDate());
        saleRepository.save(sale);
        log.info("Venta individual guardada exitosamente");

        // Calcular total de la semana usando el SalesCalculator
        Double weekTotal = salesCalculator.calculateWeeklySales(adviser, request.getSaleDate());
        log.info("Total semanal calculado: {}", weekTotal);

        int weekNumber = request.getSaleDate().get(WeekFields.ISO.weekBasedYear());
        log.info("Venta procesada exitosamente - Semana: {}, Total: {}", weekNumber, weekTotal);
        return new WeekSale(weekNumber, weekTotal);
    }

}
