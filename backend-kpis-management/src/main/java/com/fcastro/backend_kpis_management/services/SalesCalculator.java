package com.fcastro.backend_kpis_management.services;

import java.time.LocalDate;

import com.fcastro.backend_kpis_management.model.entities.Adviser;

public interface SalesCalculator {
    Double calculateWeeklySales(Adviser adviser, LocalDate date);
}
