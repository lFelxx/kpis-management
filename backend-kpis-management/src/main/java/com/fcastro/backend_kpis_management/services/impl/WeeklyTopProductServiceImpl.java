package com.fcastro.backend_kpis_management.services.impl;

import com.fcastro.backend_kpis_management.model.entities.WeeklyTopProduct;
import com.fcastro.backend_kpis_management.repositories.WeeklyTopProductRepository;
import com.fcastro.backend_kpis_management.services.WeeklyTopProductService;
import com.fcastro.backend_kpis_management.util.SalesCsvParser.CsvRow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class WeeklyTopProductServiceImpl implements WeeklyTopProductService {

    private final WeeklyTopProductRepository repository;

    @Override
    public void storeCurrentWeekTop(List<CsvRow> rows) {
        WeekFields iso = WeekFields.ISO;
        LocalDate today = LocalDate.now();
        int currentYear = today.get(iso.weekBasedYear());
        int currentWeek = today.get(iso.weekOfWeekBasedYear());

        rows.stream()
                .filter(r -> r.qty() > 0
                        && r.saleDate().get(iso.weekBasedYear()) == currentYear
                        && r.saleDate().get(iso.weekOfWeekBasedYear()) == currentWeek)
                .collect(Collectors.groupingBy(CsvRow::sku, Collectors.summingInt(CsvRow::qty)))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .ifPresent(top -> upsert(currentYear, currentWeek, top.getKey(), top.getValue()));
    }

    @Override
    public Optional<WeeklyTopProduct> getLatestForMonth(int year, int month) {
        return repository.findLatestForWeeks(year, weekNumbersForMonth(year, month));
    }

    private void upsert(int year, int weekNumber, String sku, int qty) {
        WeeklyTopProduct entity = repository.findByYearAndWeekNumber(year, weekNumber)
                .orElseGet(() -> {
                    WeeklyTopProduct w = new WeeklyTopProduct();
                    w.setYear(year);
                    w.setWeekNumber(weekNumber);
                    return w;
                });
        entity.setSku(sku);
        entity.setQty(qty);
        repository.save(entity);
    }

    private List<Integer> weekNumbersForMonth(int year, int month) {
        WeekFields iso = WeekFields.ISO;
        LocalDate first = LocalDate.of(year, month, 1);
        LocalDate last  = first.withDayOfMonth(first.lengthOfMonth());
        return Stream.iterate(first, d -> !d.isAfter(last), d -> d.plusWeeks(1))
                .map(d -> d.get(iso.weekOfWeekBasedYear()))
                .distinct()
                .collect(Collectors.toList());
    }
}
