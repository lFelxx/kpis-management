package com.fcastro.backend_kpis_management.util;

import com.fcastro.backend_kpis_management.model.dto.budget.ParsedBudgetTemplate;
import com.fcastro.backend_kpis_management.model.dto.budget.ParsedDayData;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Component
public class BudgetExcelParser {

    private static final int WEEKS = 6;
    private static final int DAYS_PER_WEEK = 7;

    public ParsedBudgetTemplate parse(InputStream excelFile, int year, int month) {
        try (Workbook workbook = WorkbookFactory.create(excelFile)) {
            Sheet sheet = workbook.getSheet("Hoja2");
            if (sheet == null) sheet = workbook.getSheetAt(1);
            double totalBudget = readTotalBudget(sheet);
            double[][] weightMatrix = readWeightMatrix(sheet);
            int[][] adviserMatrix = readAdviserMatrix(sheet);
            List<ParsedDayData> days = mapToDays(year, month, weightMatrix, adviserMatrix);
            return new ParsedBudgetTemplate(totalBudget, days);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error al procesar el archivo Excel: " + e.getMessage(), e);
        }
    }

    // --- Lectura de bloques ---

    private double readTotalBudget(Sheet sheet) {
        // El presupuesto total está en la fila 1 (índice 1), última celda con valor numérico
        Row headerRow = sheet.getRow(1);
        for (int col = headerRow.getLastCellNum() - 1; col >= 0; col--) {
            Cell cell = headerRow.getCell(col);
            if (cell != null && cell.getCellType() == CellType.NUMERIC) {
                return cell.getNumericCellValue();
            }
        }
        throw new IllegalArgumentException("No se encontró el presupuesto total en el Excel.");
    }

    private double[][] readWeightMatrix(Sheet sheet) {
        // Bloque 1: porcentajes en filas 2–7, datos en columnas 2–8 (col 0=vacío, col 1=label semana)
        double[][] matrix = new double[WEEKS][DAYS_PER_WEEK];
        for (int week = 0; week < WEEKS; week++) {
            Row row = sheet.getRow(week + 2);
            for (int day = 0; day < DAYS_PER_WEEK; day++) {
                matrix[week][day] = numericValueOrZero(row, day + 2);
            }
        }
        return matrix;
    }

    private int[][] readAdviserMatrix(Sheet sheet) {
        // Bloque 2: buscar "# ASESORES", saltar 2 filas (el header está una fila después del label)
        int adviserStartRow = findAdviserBlockStartRow(sheet);
        int[][] matrix = new int[WEEKS][DAYS_PER_WEEK];
        for (int week = 0; week < WEEKS; week++) {
            Row row = sheet.getRow(adviserStartRow + week);
            for (int day = 0; day < DAYS_PER_WEEK; day++) {
                matrix[week][day] = (int) numericValueOrZero(row, day + 3);
            }
        }
        return matrix;
    }

    private int findAdviserBlockStartRow(Sheet sheet) {
        for (Row row : sheet) {
            for (Cell cell : row) {
                if (cell.getCellType() == CellType.STRING
                        && cell.getStringCellValue().contains("# ASESORES")) {
                    // +1 = fila del header Lunes-Dom, +2 = primera fila de datos
                    return row.getRowNum() + 2;
                }
            }
        }
        throw new IllegalArgumentException("No se encontró el bloque '# ASESORES' en el Excel.");
    }

    // --- Mapeo Semana×Día → fechas reales ---

    private List<ParsedDayData> mapToDays(int year, int month,
                                           double[][] weightMatrix,
                                           int[][] adviserMatrix) {
        LocalDate firstDayOfMonth = LocalDate.of(year, month, 1);
        LocalDate weekOneMonday = firstDayOfMonth.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        List<ParsedDayData> days = new ArrayList<>();
        for (int week = 0; week < WEEKS; week++) {
            for (int day = 0; day < DAYS_PER_WEEK; day++) {
                LocalDate date = weekOneMonday.plusDays((long) week * DAYS_PER_WEEK + day);
                if (date.getMonthValue() != month || date.getYear() != year) {
                    continue;
                }
                double weight = weightMatrix[week][day];
                int advisers = adviserMatrix[week][day];
                days.add(new ParsedDayData(date, weight, advisers));
            }
        }
        return days;
    }

    // --- Utilidades ---

    private double numericValueOrZero(Row row, int colIndex) {
        if (row == null) return 0;
        Cell cell = row.getCell(colIndex);
        if (cell == null || cell.getCellType() != CellType.NUMERIC) return 0;
        return cell.getNumericCellValue();
    }
}
