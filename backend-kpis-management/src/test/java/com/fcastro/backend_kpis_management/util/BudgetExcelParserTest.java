package com.fcastro.backend_kpis_management.util;

import com.fcastro.backend_kpis_management.model.dto.budget.ParsedBudgetTemplate;
import com.fcastro.backend_kpis_management.model.dto.budget.ParsedDayData;
import org.junit.jupiter.api.Test;

import java.io.InputStream;

import static org.assertj.core.api.Assertions.assertThat;

class BudgetExcelParserTest {

    private final BudgetExcelParser parser = new BudgetExcelParser();

    @Test
    void parseMayo2026_debeExtraerPresupuestoTotal() throws Exception {
        ParsedBudgetTemplate result = parseTestFile(2026, 5);

        System.out.println("=== Presupuesto total: " + result.totalBudget() + " ===");
        assertThat(result.totalBudget()).isEqualTo(345_100_000.0);
    }

    @Test
    void parseMayo2026_debeTener31Dias() throws Exception {
        ParsedBudgetTemplate result = parseTestFile(2026, 5);

        result.days().forEach(day ->
                System.out.printf("  %s | peso: %.2f%% | asesores: %d%n",
                        day.date(), day.weightPercentage() * 100, day.adviserCount())
        );

        assertThat(result.days()).hasSize(31);
    }

    @Test
    void parseMayo2026_primerDiaDebeSerViernes1deMayo() throws Exception {
        ParsedBudgetTemplate result = parseTestFile(2026, 5);

        ParsedDayData primerDia = result.days().get(0);
        System.out.println("Primer día: " + primerDia.date() + " (" + primerDia.date().getDayOfWeek() + ")");

        assertThat(primerDia.date().toString()).isEqualTo("2026-05-01");
        assertThat(primerDia.date().getDayOfWeek().name()).isEqualTo("FRIDAY");
    }

    @Test
    void parseMayo2026_sumaDePorcentajesDebeSerCercana100() throws Exception {
        ParsedBudgetTemplate result = parseTestFile(2026, 5);

        double totalWeight = result.days().stream()
                .mapToDouble(ParsedDayData::weightPercentage)
                .sum();

        System.out.printf("Suma total de pesos: %.4f (%.2f%%)%n", totalWeight, totalWeight * 100);
        // El Excel puede asignar peso a días fuera del mes (ej: semana 1 incluye días de abril).
        // La suma para días del mes objetivo será menor a 1.0 en esos casos.
        assertThat(totalWeight).isBetween(0.90, 1.01);
    }

    @Test
    void parseMayo2026_ninguDiaTieneAsesoresMenoresACero() throws Exception {
        ParsedBudgetTemplate result = parseTestFile(2026, 5);

        result.days().stream()
                .filter(d -> d.adviserCount() < 0)
                .forEach(d -> System.out.println("ADVERTENCIA asesores negativos: " + d));

        assertThat(result.days())
                .allSatisfy(day -> assertThat(day.adviserCount()).isGreaterThanOrEqualTo(0));
    }

    @Test
    void parseMayo2026_imprimirTablaCompleta() throws Exception {
        ParsedBudgetTemplate result = parseTestFile(2026, 5);

        System.out.println("\n=== DISTRIBUCIÓN MAYO 2026 ===");
        System.out.printf("Presupuesto total: $%,.0f%n%n", result.totalBudget());
        System.out.println("Fecha        Día          Peso%      Asesores   Meta diaria");
        System.out.println("----------------------------------------------------------------");

        result.days().forEach(day -> {
            double dailyAmount = result.totalBudget() * day.weightPercentage();
            double goalPerAdviser = day.adviserCount() > 0 ? dailyAmount / day.adviserCount() : 0;
            System.out.println(
                    String.format("%-12s %-12s %5.2f%%     asesores: %-4d  meta: $%,14.0f  (x asesor: $%,.0f)",
                            day.date(),
                            day.date().getDayOfWeek(),
                            day.weightPercentage() * 100,
                            day.adviserCount(),
                            dailyAmount,
                            goalPerAdviser)
            );
        });
    }

    @Test
    void diagnostico_imprimirMatrizCrudaDelExcel() throws Exception {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("budget_mayo_2026.xlsx");
             org.apache.poi.ss.usermodel.Workbook wb = org.apache.poi.ss.usermodel.WorkbookFactory.create(is)) {

            org.apache.poi.ss.usermodel.Sheet sheet = wb.getSheetAt(0);
            System.out.println("\n=== FILAS CRUDAS DEL EXCEL (primeras 45) ===");
            for (int r = 0; r <= 44; r++) {
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(r);
                if (row == null) { System.out.println("Fila " + r + ": [null]"); continue; }
                StringBuilder sb = new StringBuilder("Fila " + r + ": [");
                for (int c = 0; c <= 10; c++) {
                    org.apache.poi.ss.usermodel.Cell cell = row.getCell(c);
                    if (cell == null) sb.append("null");
                    else if (cell.getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC)
                        sb.append(cell.getNumericCellValue());
                    else if (cell.getCellType() == org.apache.poi.ss.usermodel.CellType.STRING)
                        sb.append('"').append(cell.getStringCellValue()).append('"');
                    else sb.append(cell.getCellType());
                    if (c < 10) sb.append(", ");
                }
                System.out.println(sb.append("]"));
            }
        }
    }

    private ParsedBudgetTemplate parseTestFile(int year, int month) throws Exception {
        try (InputStream is = getClass().getClassLoader()
                .getResourceAsStream("budget_mayo_2026.xlsx")) {
            assertThat(is).isNotNull();
            return parser.parse(is, year, month);
        }
    }
}
