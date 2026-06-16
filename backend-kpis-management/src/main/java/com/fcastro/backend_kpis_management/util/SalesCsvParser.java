package com.fcastro.backend_kpis_management.util;

import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class SalesCsvParser {

    private static final DateTimeFormatter DATE_FORMATTER  = DateTimeFormatter.BASIC_ISO_DATE;
    private static final String            EXCLUDED_VENDOR = "EMPLEADO ACQUA";

    private static final int COL_INVOICE_NUMBER = 0;
    private static final int COL_DATE           = 2;
    private static final int COL_QTY            = 10;
    private static final int COL_NET_AMOUNT     = 11;
    private static final int COL_GROSS_AMOUNT   = 15;
    private static final int COL_VENDOR         = 16;

    public record CsvRow(
            String invoiceNumber,
            LocalDate saleDate,
            int qty,
            double netAmount,
            double grossAmount,
            String vendor
    ) {}

    public List<CsvRow> parse(InputStream csvFile) {
        List<CsvRow> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(csvFile, StandardCharsets.UTF_8))) {
            reader.readLine(); // skip header
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] cols = line.split(";", -1);
                if (cols.length <= COL_VENDOR) continue;
                CsvRow row = parseRow(cols);
                if (row != null && !EXCLUDED_VENDOR.equalsIgnoreCase(row.vendor())) rows.add(row);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Error al procesar el archivo CSV: " + e.getMessage(), e);
        }
        return rows;
    }

    private CsvRow parseRow(String[] cols) {
        try {
            String invoiceNumber = cols[COL_INVOICE_NUMBER].trim();
            LocalDate saleDate   = LocalDate.parse(cols[COL_DATE].trim(), DATE_FORMATTER);
            int qty              = Integer.parseInt(cols[COL_QTY].trim());
            double netAmount     = Double.parseDouble(cols[COL_NET_AMOUNT].trim());
            double grossAmount   = Double.parseDouble(cols[COL_GROSS_AMOUNT].trim());
            String vendor        = cols[COL_VENDOR].trim();
            return new CsvRow(invoiceNumber, saleDate, qty, netAmount, grossAmount, vendor);
        } catch (Exception e) {
            return null;
        }
    }
}
