package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.entities.WeeklyTopProduct;
import com.fcastro.backend_kpis_management.util.SalesCsvParser.CsvRow;

import java.util.List;
import java.util.Optional;

public interface WeeklyTopProductService {
    void storeCurrentWeekTop(List<CsvRow> rows);
    Optional<WeeklyTopProduct> getLatestForMonth(int year, int month);
}
