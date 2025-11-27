package com.fcastro.backend_kpis_management.services;

public interface GoalService {
    void updateGoal(Long adviserId, Double goalValue, int year, int month);

    void updateGoalsForAllActiveAdvisers(Double goalValue, int year, int month);
}
