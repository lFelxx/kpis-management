package com.fcastro.backend_kpis_management.services.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.Goal;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.repositories.GoalRepository;
import com.fcastro.backend_kpis_management.services.GoalService;
import com.fcastro.backend_kpis_management.services.MonthlySummaryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GoalServiceImpl implements GoalService{

    private final GoalRepository goalRepository;
    private final AdviserRepository adviserRepository;
    private final MonthlySummaryService monthlySummaryService;

    @Override
    @Transactional
    public void updateGoal(Long adviserId, Double goalValue, int year, int month) {
        // Buscar el asesor primero para validar que existe
        Adviser adviser = adviserRepository.findById(adviserId)
            .orElseThrow(() -> new RuntimeException("Asesor no encontrado con ID: " + adviserId));
        
        // Buscar la meta existente o crear una nueva si no existe
        Goal goal = goalRepository.findByAdviserIdAndYearAndMonth(adviserId, year, month)
            .orElseGet(() -> {
                // Crear una nueva meta si no existe
                Goal newGoal = new Goal();
                newGoal.setAdviser(adviser);
                newGoal.setYear(year);
                newGoal.setMonth(month);
                newGoal.setGoalValue(goalValue);
                return newGoal;
            });
        
        // Actualizar el valor de la meta (tanto para metas existentes como nuevas)
        goal.setGoalValue(goalValue);
        goalRepository.save(goal);
        
        // Sincronizar con MonthlySummary si existe
        syncGoalWithMonthlySummary(adviserId, goalValue, year, month);
    }

    @Override
    @Transactional
    public void updateGoalsForAllActiveAdvisers(Double goalValue, int year, int month) {
        // Validar que goalValue no sea null
        if (goalValue == null) {
            throw new IllegalArgumentException("El valor de la meta no puede ser null");
        }
        
        List<Adviser> activeAdvisers = adviserRepository.findAllActiveAdvisers();
        for (Adviser adviser : activeAdvisers) {
            updateGoal(adviser.getId(), goalValue, year, month);
        }
    }

    /**
     * Método privado para sincronizar la meta con MonthlySummary
     * Se ejecuta después de actualizar la meta en Goal
     */
    private void syncGoalWithMonthlySummary(Long adviserId, Double goalValue, int year, int month) {
        monthlySummaryService.updateGoalIfExists(adviserId, goalValue, year, month);
    }
}
