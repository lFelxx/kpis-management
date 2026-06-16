package com.fcastro.backend_kpis_management.services.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.Goal;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.repositories.GoalRepository;
import com.fcastro.backend_kpis_management.services.GoalService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;
    private final AdviserRepository adviserRepository;

    @Override
    @Transactional
    public void updateGoal(Long adviserId, Double goalValue, int year, int month) {
        Adviser adviser = adviserRepository.findById(adviserId)
                .orElseThrow(() -> new RuntimeException("Asesor no encontrado con ID: " + adviserId));

        Goal goal = goalRepository.findByAdviserIdAndYearAndMonth(adviserId, year, month)
                .orElseGet(() -> {
                    Goal newGoal = new Goal();
                    newGoal.setAdviser(adviser);
                    newGoal.setYear(year);
                    newGoal.setMonth(month);
                    return newGoal;
                });

        goal.setGoalValue(goalValue);
        goalRepository.save(goal);
    }

    @Override
    @Transactional
    public void updateGoalsForAllActiveAdvisers(Double goalValue, int year, int month) {
        if (goalValue == null) throw new IllegalArgumentException("El valor de la meta no puede ser null");

        List<Adviser> activeAdvisers = adviserRepository.findAllActiveAdvisers();
        for (Adviser adviser : activeAdvisers) {
            updateGoal(adviser.getId(), goalValue, year, month);
        }
    }
}
