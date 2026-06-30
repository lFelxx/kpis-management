package com.fcastro.backend_kpis_management.services.impl;

import com.fcastro.backend_kpis_management.model.dto.salesReport.AdviserSalesReportResponse;
import com.fcastro.backend_kpis_management.model.dto.salesReport.CsvUploadResponse;
import com.fcastro.backend_kpis_management.model.dto.salesReport.SalesReportPageResponse;
import com.fcastro.backend_kpis_management.model.dto.salesReport.SalesReportSummaryResponse;
import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.AdviserSalesReport;
import com.fcastro.backend_kpis_management.model.entities.WeeklySalesComparison;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.repositories.AdviserSalesReportRepository;
import com.fcastro.backend_kpis_management.repositories.WeeklySalesComparisonRepository;
import com.fcastro.backend_kpis_management.services.AdviserSalesReportService;
import com.fcastro.backend_kpis_management.services.MonthlySummaryService;
import com.fcastro.backend_kpis_management.util.SalesCsvParser;
import com.fcastro.backend_kpis_management.util.SalesCsvParser.CsvRow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdviserSalesReportServiceImpl implements AdviserSalesReportService {

    private final SalesCsvParser csvParser;
    private final AdviserSalesReportRepository salesReportRepository;
    private final WeeklySalesComparisonRepository weeklyComparisonRepository;
    private final AdviserRepository adviserRepository;
    private final MonthlySummaryService monthlySummaryService;

    @Override
    @Transactional
    public CsvUploadResponse processCsvReport(MultipartFile file) {
        List<CsvRow> rows = parseFile(file);
        Map<String, Adviser> advisersByNormalizedName = buildAdviserLookupMap();

        List<String> unmatchedVendors = processMonthlyReports(rows, advisersByNormalizedName);
        processWeeklyComparisons(rows, advisersByNormalizedName);

        return CsvUploadResponse.builder()
                .processedCount(groupByVendorAndPeriod(rows).size() - unmatchedVendors.size())
                .unmatchedVendors(unmatchedVendors)
                .build();
    }

    @Override
    public SalesReportPageResponse getByYearAndMonth(int year, int month) {
        List<AdviserSalesReportResponse> advisers = salesReportRepository.findByYearAndMonth(year, month).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return new SalesReportPageResponse(advisers, computeSummary(advisers));
    }

    // ─── Procesamiento mensual ────────────────────────────────────────────────

    private List<String> processMonthlyReports(List<CsvRow> rows, Map<String, Adviser> advisersByNormalizedName) {
        Map<GroupKey, List<CsvRow>> rowsByGroup = groupByVendorAndPeriod(rows);
        List<String> unmatchedVendors = new ArrayList<>();

        for (Map.Entry<GroupKey, List<CsvRow>> entry : rowsByGroup.entrySet()) {
            GroupKey key = entry.getKey();
            Optional<Adviser> adviserOpt = resolveAdviser(key.vendorName(), advisersByNormalizedName);

            if (adviserOpt.isEmpty()) {
                unmatchedVendors.add(key.vendorName());
                continue;
            }

            upsertMonthlyReport(adviserOpt.get(), key.year(), key.month(), entry.getValue());
        }

        return unmatchedVendors;
    }

    private void upsertMonthlyReport(Adviser adviser, int year, int month, List<CsvRow> rows) {
        int invoiceCount  = (int) rows.stream().map(CsvRow::invoiceNumber).distinct().count();
        int unitsSold     = rows.stream().mapToInt(CsvRow::qty).sum();
        double grossSales = Math.floor(rows.stream().mapToDouble(CsvRow::grossAmount).sum());
        double netSales   = Math.floor(rows.stream().mapToDouble(CsvRow::netAmount).sum());
        double upt        = (double) unitsSold / invoiceCount;

        AdviserSalesReport report = salesReportRepository
                .findByAdviserIdAndYearAndMonth(adviser.getId(), year, month)
                .orElseGet(() -> newMonthlyReport(adviser, year, month));

        report.setInvoiceCount(invoiceCount);
        report.setUnitsSold(unitsSold);
        report.setUpt(upt);
        report.setGrossSales(grossSales);
        report.setNetSales(netSales);

        salesReportRepository.save(report);
        monthlySummaryService.updateTotalSalesByAdviser(adviser.getId(), year, month, netSales);
    }

    private AdviserSalesReport newMonthlyReport(Adviser adviser, int year, int month) {
        AdviserSalesReport report = new AdviserSalesReport();
        report.setAdviser(adviser);
        report.setYear(year);
        report.setMonth(month);
        return report;
    }

    // ─── Procesamiento semanal WoW ────────────────────────────────────────────

    private void processWeeklyComparisons(List<CsvRow> rows, Map<String, Adviser> advisersByNormalizedName) {
        rows.stream()
                .collect(Collectors.groupingBy(CsvRow::vendor))
                .forEach((vendor, vendorRows) ->
                        resolveAdviser(vendor, advisersByNormalizedName)
                                .ifPresent(adviser -> upsertWeeklyComparisons(adviser, vendorRows)));
    }

    private void upsertWeeklyComparisons(Adviser adviser, List<CsvRow> rows) {
        WeekFields iso = WeekFields.ISO;

        Map<WeekKey, List<CsvRow>> rowsByWeek = rows.stream()
                .collect(Collectors.groupingBy(r -> new WeekKey(
                        r.saleDate().get(iso.weekBasedYear()),
                        r.saleDate().get(iso.weekOfWeekBasedYear())
                )));

        List<WeekKey> sortedWeeks = rowsByWeek.keySet().stream()
                .sorted(Comparator.comparing(WeekKey::isoYear).thenComparing(WeekKey::weekNumber))
                .toList();

        for (int i = 0; i < sortedWeeks.size(); i++) {
            WeekKey key = sortedWeeks.get(i);
            List<CsvRow> weekRows = rowsByWeek.get(key);

            double currentSales  = Math.floor(weekRows.stream().mapToDouble(CsvRow::netAmount).sum());
            double previousSales = i > 0
                    ? Math.floor(rowsByWeek.get(sortedWeeks.get(i - 1)).stream().mapToDouble(CsvRow::netAmount).sum())
                    : 0.0;

            WeeklySalesComparison wsc = weeklyComparisonRepository
                    .findByAdviserIdAndYearAndWeekNumber(adviser.getId(), key.isoYear(), key.weekNumber())
                    .orElseGet(() -> newWeeklyComparison(adviser, key.isoYear(), key.weekNumber()));

            wsc.setMonth(weekRows.get(0).saleDate().getMonthValue());
            wsc.setCurrentWeekSales(currentSales);
            wsc.setPreviousWeekSales(previousSales);
            wsc.setGrowthPercentage(computeGrowthPercent(previousSales, currentSales));
            weeklyComparisonRepository.save(wsc);
        }
    }

    private WeeklySalesComparison newWeeklyComparison(Adviser adviser, int year, int weekNumber) {
        WeeklySalesComparison wsc = new WeeklySalesComparison();
        wsc.setAdviser(adviser);
        wsc.setYear(year);
        wsc.setWeekNumber(weekNumber);
        return wsc;
    }

    private double computeGrowthPercent(double previous, double current) {
        if (previous == 0.0) return current > 0.0 ? 100.0 : 0.0;
        return ((current - previous) / previous) * 100.0;
    }

    // ─── Matching de asesores ─────────────────────────────────────────────────

    private Map<String, Adviser> buildAdviserLookupMap() {
        return adviserRepository.findAll().stream()
                .collect(Collectors.toMap(
                        adviser -> normalize(adviser.getName() + " " + adviser.getLastname()),
                        adviser -> adviser,
                        (a, b) -> a
                ));
    }

    private Map<GroupKey, List<CsvRow>> groupByVendorAndPeriod(List<CsvRow> rows) {
        return rows.stream().collect(Collectors.groupingBy(row ->
                new GroupKey(row.vendor(), row.saleDate().getYear(), row.saleDate().getMonthValue())
        ));
    }

    private Optional<Adviser> resolveAdviser(String vendorName, Map<String, Adviser> advisersByNormalizedName) {
        String normalizedVendor = normalize(vendorName);
        Adviser exact = advisersByNormalizedName.get(normalizedVendor);
        if (exact != null) return Optional.of(exact);

        Set<String> vendorWords = Set.of(normalizedVendor.split("\\s+"));
        return advisersByNormalizedName.entrySet().stream()
                .filter(e -> vendorWords.containsAll(Set.of(e.getKey().split("\\s+"))))
                .map(Map.Entry::getValue)
                .findFirst();
    }

    // ─── Mapping a respuesta ──────────────────────────────────────────────────

    private AdviserSalesReportResponse toResponse(AdviserSalesReport report) {
        Optional<WeeklySalesComparison> latestWow = weeklyComparisonRepository
                .findTopByAdviserIdAndYearAndMonthOrderByWeekNumberDesc(
                        report.getAdviser().getId(), report.getYear(), report.getMonth());

        int invoiceCount  = report.getInvoiceCount();
        int unitsSold     = report.getUnitsSold();
        double grossSales = report.getGrossSales() != null ? report.getGrossSales() : 0.0;

        return AdviserSalesReportResponse.builder()
                .adviserId(report.getAdviser().getId())
                .adviserName(report.getAdviser().getName() + " " + report.getAdviser().getLastname())
                .year(report.getYear())
                .month(report.getMonth())
                .invoiceCount(invoiceCount)
                .unitsSold(unitsSold)
                .upt(report.getUpt())
                .grossSales(grossSales)
                .netSales(report.getNetSales())
                .atv(invoiceCount > 0 ? grossSales / invoiceCount : null)
                .avgUnitPrice(unitsSold > 0 ? grossSales / unitsSold : null)
                .wowCurrentWeekSales(latestWow.map(WeeklySalesComparison::getCurrentWeekSales).orElse(null))
                .wowPreviousWeekSales(latestWow.map(WeeklySalesComparison::getPreviousWeekSales).orElse(null))
                .wowGrowthPercentage(latestWow.map(WeeklySalesComparison::getGrowthPercentage).orElse(null))
                .build();
    }

    private SalesReportSummaryResponse computeSummary(List<AdviserSalesReportResponse> advisers) {
        if (advisers.isEmpty()) {
            return new SalesReportSummaryResponse(0, 0, 0.0, 0.0, 0.0, null, null, null, null, null, null, null, null, null, null, null, null);
        }

        int totalInvoices  = advisers.stream().mapToInt(AdviserSalesReportResponse::getInvoiceCount).sum();
        int totalUnits     = advisers.stream().mapToInt(AdviserSalesReportResponse::getUnitsSold).sum();
        double totalGross  = advisers.stream().mapToDouble(a -> a.getGrossSales() != null ? a.getGrossSales() : 0.0).sum();
        double generalUpt  = totalInvoices > 0 ? (double) totalUnits / totalInvoices : 0.0;
        double storeAtv    = totalInvoices > 0 ? totalGross / totalInvoices : 0.0;

        double storeWowCurrent  = advisers.stream().mapToDouble(a -> a.getWowCurrentWeekSales()  != null ? a.getWowCurrentWeekSales()  : 0.0).sum();
        double storeWowPrevious = advisers.stream().mapToDouble(a -> a.getWowPreviousWeekSales() != null ? a.getWowPreviousWeekSales() : 0.0).sum();
        Double storeWowGrowth   = storeWowPrevious == 0.0
                ? (storeWowCurrent > 0.0 ? 100.0 : null)
                : ((storeWowCurrent - storeWowPrevious) / storeWowPrevious) * 100.0;

        AdviserSalesReportResponse bestUpt = advisers.stream()
                .max(Comparator.comparingDouble(a -> a.getUpt() != null ? a.getUpt() : 0.0))
                .orElse(null);

        AdviserSalesReportResponse bestAvgPrice = advisers.stream()
                .filter(a -> a.getAvgUnitPrice() != null)
                .max(Comparator.comparingDouble(AdviserSalesReportResponse::getAvgUnitPrice))
                .orElse(null);

        AdviserSalesReportResponse bestAtv = advisers.stream()
                .filter(a -> a.getAtv() != null)
                .max(Comparator.comparingDouble(AdviserSalesReportResponse::getAtv))
                .orElse(null);

        return new SalesReportSummaryResponse(
                totalInvoices, totalUnits, totalGross, generalUpt, storeAtv,
                storeWowCurrent, storeWowPrevious, storeWowGrowth,
                bestUpt != null ? bestUpt.getAdviserId() : null,
                bestUpt != null ? bestUpt.getAdviserName() : null,
                bestUpt != null ? bestUpt.getUpt() : null,
                bestAvgPrice != null ? bestAvgPrice.getAdviserId() : null,
                bestAvgPrice != null ? bestAvgPrice.getAdviserName() : null,
                bestAvgPrice != null ? bestAvgPrice.getAvgUnitPrice() : null,
                bestAtv != null ? bestAtv.getAdviserId() : null,
                bestAtv != null ? bestAtv.getAdviserName() : null,
                bestAtv != null ? bestAtv.getAtv() : null
        );
    }

    // ─── Utilidades ──────────────────────────────────────────────────────────

    private List<CsvRow> parseFile(MultipartFile file) {
        try {
            return csvParser.parse(file.getInputStream());
        } catch (Exception e) {
            throw new IllegalArgumentException("No se pudo leer el archivo CSV: " + e.getMessage(), e);
        }
    }

    private String normalize(String value) {
        String decomposed = Normalizer.normalize(value, Normalizer.Form.NFD);
        return decomposed.replaceAll("[^\\p{ASCII}]", "").toUpperCase().trim();
    }

    private record GroupKey(String vendorName, int year, int month) {}
    private record WeekKey(int isoYear, int weekNumber) {}
}
