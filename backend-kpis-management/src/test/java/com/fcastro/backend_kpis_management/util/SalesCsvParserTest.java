package com.fcastro.backend_kpis_management.util;

import com.fcastro.backend_kpis_management.util.SalesCsvParser.CsvRow;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class SalesCsvParserTest {

    private final SalesCsvParser parser = new SalesCsvParser();

    @Test
    void parse_debeRetornarTodasLasFilas() {
        List<CsvRow> rows = parseTestFile();
        assertThat(rows).hasSize(5);
    }

    @Test
    void parse_debeExtraerVendedorCorrectamente() {
        List<CsvRow> rows = parseTestFile();
        assertThat(rows.get(0).vendor()).isEqualTo("JUAN PEREZ GARCIA");
        assertThat(rows.get(3).vendor()).isEqualTo("MARIA LOPEZ TORRES");
    }

    @Test
    void parse_debeExtraerFechaCorrectamente() {
        List<CsvRow> rows = parseTestFile();
        assertThat(rows.get(0).saleDate().toString()).isEqualTo("2026-06-01");
    }

    @Test
    void parse_debeExtraerNumeroFacturaCorrectamente() {
        List<CsvRow> rows = parseTestFile();
        assertThat(rows.get(0).invoiceNumber()).isEqualTo("FAC001");
        assertThat(rows.get(1).invoiceNumber()).isEqualTo("FAC001");
        assertThat(rows.get(2).invoiceNumber()).isEqualTo("FAC002");
    }

    @Test
    void parse_metricas_JuanJunio_dosFacturasSetsUnidadesUPT3() {
        List<CsvRow> rows = juanJunioRows();

        long invoiceCount = rows.stream().map(CsvRow::invoiceNumber).distinct().count();
        int unitsSold     = rows.stream().mapToInt(CsvRow::qty).sum();
        double grossSales = rows.stream().mapToDouble(CsvRow::grossAmount).sum();
        double netSales   = rows.stream().mapToDouble(CsvRow::netAmount).sum();
        double upt        = (double) unitsSold / invoiceCount;

        assertThat(invoiceCount).isEqualTo(2);
        assertThat(unitsSold).isEqualTo(6);
        assertThat(upt).isEqualTo(3.0);
        assertThat(grossSales).isEqualTo(535.50);
        assertThat(netSales).isEqualTo(450.00);
    }

    @Test
    void parse_metricas_MariaJunio_unaFacturaUnaUnidad() {
        List<CsvRow> rows = parseTestFile().stream()
                .filter(r -> r.vendor().equals("MARIA LOPEZ TORRES"))
                .toList();

        long invoiceCount = rows.stream().map(CsvRow::invoiceNumber).distinct().count();
        int unitsSold     = rows.stream().mapToInt(CsvRow::qty).sum();
        double grossSales = rows.stream().mapToDouble(CsvRow::grossAmount).sum();
        double netSales   = rows.stream().mapToDouble(CsvRow::netAmount).sum();

        assertThat(invoiceCount).isEqualTo(1);
        assertThat(unitsSold).isEqualTo(1);
        assertThat(grossSales).isEqualTo(238.00);
        assertThat(netSales).isEqualTo(200.00);
    }

    @Test
    void parse_debeSepararFilasPorMes() {
        Map<Integer, List<CsvRow>> byMonth = parseTestFile().stream()
                .filter(r -> r.vendor().equals("JUAN PEREZ GARCIA"))
                .collect(Collectors.groupingBy(r -> r.saleDate().getMonthValue()));

        assertThat(byMonth).containsKeys(6, 7);
        assertThat(byMonth.get(6)).hasSize(3);
        assertThat(byMonth.get(7)).hasSize(1);
    }

    @Test
    void parse_JuanJulio_dosUnidadesUnaFactura() {
        List<CsvRow> rows = parseTestFile().stream()
                .filter(r -> r.vendor().equals("JUAN PEREZ GARCIA") && r.saleDate().getMonthValue() == 7)
                .toList();

        long invoiceCount = rows.stream().map(CsvRow::invoiceNumber).distinct().count();
        int unitsSold     = rows.stream().mapToInt(CsvRow::qty).sum();
        double upt        = (double) unitsSold / invoiceCount;

        assertThat(invoiceCount).isEqualTo(1);
        assertThat(unitsSold).isEqualTo(2);
        assertThat(upt).isEqualTo(2.0);
    }

    @Test
    void wordSubsetMatch_nombresParciales_debenCoincidir() {
        // Simula el matching: palabras del asesor en BD ⊆ palabras del CSV
        assertWordSubset("VALENTINA VALERO",          "VALENTINA VALERO GALVIS");
        assertWordSubset("NEIRY CANO",                "NEIRY JOMARA CANO VALENCIA");
        assertWordSubset("DANIEL CASTILLO",           "DANIEL FELIPE GARCIA CASTILLO");
        assertWordSubset("DARWIN LOPEZ",              "DARWIN STIVEN LOPEZ SUAREZ");
    }

    private void assertWordSubset(String dbName, String csvName) {
        Set<String> csvWords = Set.of(csvName.split("\\s+"));
        Set<String> dbWords  = Set.of(dbName.split("\\s+"));
        assertThat(csvWords.containsAll(dbWords))
                .as("'%s' debería matchear con '%s'", dbName, csvName)
                .isTrue();
    }

    @Test
    void imprimirTablaCompleta() {
        List<CsvRow> rows = parseTestFile();
        Map<String, Map<Integer, List<CsvRow>>> grouped = rows.stream()
                .collect(Collectors.groupingBy(CsvRow::vendor,
                        Collectors.groupingBy(r -> r.saleDate().getMonthValue())));

        System.out.println("\n=== REPORTE CSV TEST ===");
        System.out.printf("%-30s %-6s %-10s %-8s %-6s %-14s %-14s%n",
                "Vendedor", "Mes", "Facturas", "Unidades", "UPT", "Ventas Brutas", "Ventas Netas");
        System.out.println("-".repeat(100));

        grouped.forEach((vendor, byMonth) -> byMonth.forEach((month, rowList) -> {
            long invoices   = rowList.stream().map(CsvRow::invoiceNumber).distinct().count();
            int units       = rowList.stream().mapToInt(CsvRow::qty).sum();
            double gross    = rowList.stream().mapToDouble(CsvRow::grossAmount).sum();
            double net      = rowList.stream().mapToDouble(CsvRow::netAmount).sum();
            double upt      = (double) units / invoices;
            System.out.printf("%-30s %-6d %-10d %-8d %-6.2f %-14.2f %-14.2f%n",
                    vendor, month, invoices, units, upt, gross, net);
        }));
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    private List<CsvRow> juanJunioRows() {
        return parseTestFile().stream()
                .filter(r -> r.vendor().equals("JUAN PEREZ GARCIA") && r.saleDate().getMonthValue() == 6)
                .toList();
    }

    private List<CsvRow> parseTestFile() {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("sales_report_test.csv")) {
            assertThat(is).withFailMessage("Archivo de prueba no encontrado: sales_report_test.csv").isNotNull();
            return parser.parse(is);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
