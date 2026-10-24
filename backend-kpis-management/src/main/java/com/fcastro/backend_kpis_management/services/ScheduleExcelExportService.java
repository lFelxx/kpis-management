package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.entities.ScheduleSlot;
import com.fcastro.backend_kpis_management.model.entities.WeeklySchedule;
import com.fcastro.backend_kpis_management.model.enums.TeamRole;
import com.fcastro.backend_kpis_management.repositories.WeeklyScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFPicture;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.openxmlformats.schemas.drawingml.x2006.main.CTRelativeRect;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Replica exactamente el "Formato 1" del horario semanal en Excel.
 * Estructura basada en: FORMATO HORARIO SEMANAL LA ESTACION dic.xlsx
 */
@Service
@RequiredArgsConstructor
public class ScheduleExcelExportService {

    private static final String[] MONTH_NAMES_ES = {
        "", "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
        "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    };

    private static final String[] DAY_LETTERS = { "L", "M", "M", "J", "V", "S", "D" };

    private static final Map<TeamRole, String> ROLE_LABELS = Map.of(
        TeamRole.ADMIN,     "ADMINISTRADOR/A",
        TeamRole.CO_ADMIN,  "CO-ADMINISTRADOR/A",
        TeamRole.ADVISER,   "ASESOR/A COMERCIAL",
        TeamRole.AUXILIARY, "AUX OPERATIVO"
    );

    private final WeeklyScheduleRepository scheduleRepo;

    @Transactional(readOnly = true)
    public byte[] buildFormat1(Long scheduleId) {
        WeeklySchedule schedule = scheduleRepo.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Horario no encontrado: " + scheduleId));
        try {
            return build(schedule);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error generando el archivo Excel");
        }
    }

    // ─── Builder ─────────────────────────────────────────────────────────────────

    private byte[] build(WeeklySchedule schedule) throws IOException {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("HORARIO");

            // Match original: landscape, 68% scale, tight margins
            PrintSetup ps = sheet.getPrintSetup();
            ps.setLandscape(true);
            ps.setScale((short) 68);
            sheet.setMargin(Sheet.LeftMargin,   0.25);
            sheet.setMargin(Sheet.RightMargin,  0.25);
            sheet.setMargin(Sheet.TopMargin,    0.75);
            sheet.setMargin(Sheet.BottomMargin, 0.75);
            sheet.setMargin(Sheet.HeaderMargin, 0.3);
            sheet.setMargin(Sheet.FooterMargin, 0.3);

            applyColumnWidths(sheet);

            Styles s = new Styles(wb);

            writeTitle(sheet, s);
            addLogos(wb, sheet);
            writeStoreName(sheet, s);
            writeWeekRange(sheet, s, schedule);
            writeHeaders(sheet, s, schedule);
            writeEmployeeRows(sheet, s, schedule);
            writeSignatureBlock(sheet, s);

            wb.write(out);
            return out.toByteArray();
        }
    }

    // ─── Column widths (units = 1/256 of a character width) ──────────────────────

    private void applyColumnWidths(Sheet sheet) {
        // A=37, B=23, C-I=12.71, J=20, K=26.43
        sheet.setColumnWidth(0, (int)(37.0 * 256));
        sheet.setColumnWidth(1, (int)(23.0 * 256));
        for (int c = 2; c <= 8; c++) sheet.setColumnWidth(c, (int)(12.71 * 256));
        sheet.setColumnWidth(9,  (int)(20.0 * 256));
        sheet.setColumnWidth(10, (int)(26.43 * 256));
    }

    // ─── Row 1: Título ────────────────────────────────────────────────────────────

    private void writeTitle(Sheet sheet, Styles s) {
        Row row = sheet.createRow(0);
        row.setHeightInPoints(57);
        Cell cell = row.createCell(0);
        cell.setCellValue("PROGRAMACIÓN HORARIO SEMANAL");
        cell.setCellStyle(s.title);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 10));
        applyBordersToMerge(sheet, s.title, 0, 0, 0, 10);
    }

    // ─── Logos: A.M.C arriba a la izquierda, Puma arriba a la derecha ─────────────

    /** Recorte en milésimas de porcentaje (srcRect de OOXML) de cada borde de la imagen original. */
    private record Crop(int left, int top, int right, int bottom) {}

    /** Imagen y su posición (en EMU dentro de las celdas) tal como está en FORMATO HORARIO SEMANAL LA ESTACION. */
    private record Logo(String resource, int pictureType,
                        int fromCol, int fromColOffset, int fromRow, int fromRowOffset,
                        int toCol, int toColOffset, int toRow, int toRowOffset,
                        Crop crop) {}

    private static final Logo AMC_LOGO = new Logo("schedule/amc-logo.png", Workbook.PICTURE_TYPE_PNG,
            0, 158_752, 0, 111_126,
            0, 1_743_075, 1, 28_576,
            new Crop(0, 8_415, 8_784, 14_473));

    private static final Logo PUMA_LOGO = new Logo("schedule/puma-logo.jpeg", Workbook.PICTURE_TYPE_JPEG,
            10, 536_574, 0, 57_150,
            10, 1_352_769, 1, 1,
            new Crop(17_072, 8_573, 11_628, 8_571));

    private void addLogos(Workbook wb, Sheet sheet) throws IOException {
        Drawing<?> drawing = sheet.createDrawingPatriarch();
        addLogo(wb, drawing, AMC_LOGO);
        addLogo(wb, drawing, PUMA_LOGO);
    }

    private void addLogo(Workbook wb, Drawing<?> drawing, Logo logo) throws IOException {
        byte[] image;
        try (InputStream in = new ClassPathResource(logo.resource()).getInputStream()) {
            image = in.readAllBytes();
        }

        ClientAnchor anchor = wb.getCreationHelper().createClientAnchor();
        anchor.setCol1(logo.fromCol());
        anchor.setDx1(logo.fromColOffset());
        anchor.setRow1(logo.fromRow());
        anchor.setDy1(logo.fromRowOffset());
        anchor.setCol2(logo.toCol());
        anchor.setDx2(logo.toColOffset());
        anchor.setRow2(logo.toRow());
        anchor.setDy2(logo.toRowOffset());
        anchor.setAnchorType(ClientAnchor.AnchorType.MOVE_DONT_RESIZE);

        Picture picture = drawing.createPicture(anchor, wb.addPicture(image, logo.pictureType()));

        CTRelativeRect crop = ((XSSFPicture) picture).getCTPicture().getBlipFill().addNewSrcRect();
        crop.setL(logo.crop().left());
        crop.setT(logo.crop().top());
        crop.setR(logo.crop().right());
        crop.setB(logo.crop().bottom());
    }

    // ─── Row 2: Nombre de la tienda ───────────────────────────────────────────────

    private void writeStoreName(Sheet sheet, Styles s) {
        Row row = sheet.createRow(1);
        row.setHeightInPoints(24.95f);
        Cell cell = row.createCell(0);
        cell.setCellValue("TIENDA : LA ESTACION");
        cell.setCellStyle(s.storeHeader);
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 10));
        applyBordersToMerge(sheet, s.storeHeader, 1, 1, 0, 10);
    }

    // ─── Row 3: Rango de semana ───────────────────────────────────────────────────

    private void writeWeekRange(Sheet sheet, Styles s, WeeklySchedule schedule) {
        Row row = sheet.createRow(2);
        row.setHeightInPoints(24.95f);
        Cell cell = row.createCell(0);
        cell.setCellValue(buildWeekRangeText(schedule));
        cell.setCellStyle(s.storeHeader);
        sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 10));
        applyBordersToMerge(sheet, s.storeHeader, 2, 2, 0, 10);
    }

    private String buildWeekRangeText(WeeklySchedule schedule) {
        var ws = schedule.getWeekStart();
        var we = schedule.getWeekEnd();
        String startMonth = MONTH_NAMES_ES[ws.getMonthValue()];
        String endMonth   = MONTH_NAMES_ES[we.getMonthValue()];
        String year = String.valueOf(we.getYear());
        if (ws.getMonthValue() == we.getMonthValue()) {
            return "SEMANA: " + ws.getDayOfMonth() + " AL " + we.getDayOfMonth()
                    + " DE " + startMonth + " " + year;
        }
        return "SEMANA: " + ws.getDayOfMonth() + " DE " + startMonth
                + " AL " + we.getDayOfMonth() + " DE " + endMonth + " " + year;
    }

    // ─── Rows 4-5: Cabeceras ──────────────────────────────────────────────────────

    private void writeHeaders(Sheet sheet, Styles s, WeeklySchedule schedule) {
        // Row 4 (index 3) – labels
        Row r4 = sheet.createRow(3);
        r4.setHeightInPoints(39.75f);
        Row r5 = sheet.createRow(4);
        r5.setHeightInPoints(25.5f);

        // A4:A5 merged – FUNCIONARIOS
        Cell a4 = r4.createCell(0);
        a4.setCellValue("FUNCIONARIOS");
        a4.setCellStyle(s.headerLeftEdge);
        sheet.addMergedRegion(new CellRangeAddress(3, 4, 0, 0));

        // B4:B5 merged – CARGO
        Cell b4 = r4.createCell(1);
        b4.setCellValue("CARGO");
        b4.setCellStyle(s.headerCenter);
        sheet.addMergedRegion(new CellRangeAddress(3, 4, 1, 1));

        // C-I: día letra + número de fecha
        var weekStart = schedule.getWeekStart();
        for (int i = 0; i < 7; i++) {
            Cell letter = r4.createCell(2 + i);
            letter.setCellValue(DAY_LETTERS[i]);
            letter.setCellStyle(s.headerCenter);

            Cell number = r5.createCell(2 + i);
            number.setCellValue(weekStart.plusDays(i).getDayOfMonth());
            number.setCellStyle(s.headerCenter);
        }

        // J4:J5 merged – FIRMA
        Cell j4 = r4.createCell(9);
        j4.setCellValue("FIRMA");
        j4.setCellStyle(s.headerCenter);
        sheet.addMergedRegion(new CellRangeAddress(3, 4, 9, 9));

        // K4:K5 merged – OBSERVACIONES
        Cell k4 = r4.createCell(10);
        k4.setCellValue("OBSERVACIONES");
        k4.setCellStyle(s.headerCenterSmall);
        sheet.addMergedRegion(new CellRangeAddress(3, 4, 10, 10));

        // Fill merged cells (POI requires every cell in merge to have a style)
        r5.createCell(0).setCellStyle(s.headerLeftEdge);
        r5.createCell(1).setCellStyle(s.headerCenter);
        r5.createCell(9).setCellStyle(s.headerCenter);
        r5.createCell(10).setCellStyle(s.headerCenterSmall);
    }

    // ─── Employee rows ────────────────────────────────────────────────────────────

    private void writeEmployeeRows(Sheet sheet, Styles s, WeeklySchedule schedule) {
        // Group slots by adviser, sorted: ADMIN first, CO_ADMIN, then ADVISER/AUXILIARY by id
        var slots = schedule.getSlots();

        List<Long> adviserOrder = slots.stream()
                .map(sl -> sl.getAdviser().getId())
                .distinct()
                .sorted(Comparator.comparing(id -> {
                    TeamRole role = slots.stream()
                            .filter(sl -> sl.getAdviser().getId().equals(id))
                            .findFirst().map(sl -> sl.getAdviser().getTeamRole())
                            .orElse(TeamRole.ADVISER);
                    return switch (role) {
                        case ADMIN -> 0;
                        case CO_ADMIN -> 1;
                        case ADVISER -> 2;
                        case AUXILIARY -> 3;
                    };
                }))
                .toList();

        int rowIdx = 5; // Excel row 6
        for (Long adviserId : adviserOrder) {
            var adviserSlots = slots.stream()
                    .filter(sl -> sl.getAdviser().getId().equals(adviserId))
                    .sorted(Comparator.comparingInt(ScheduleSlot::getDayOfWeek))
                    .toList();

            if (adviserSlots.isEmpty()) continue;

            var adviser = adviserSlots.get(0).getAdviser();
            String fullName = (adviser.getName() + " " + adviser.getLastname()).toUpperCase(Locale.ROOT);
            String cargoLabel = ROLE_LABELS.getOrDefault(adviser.getTeamRole(), "ASESOR/A COMERCIAL");

            Row row = sheet.createRow(rowIdx);
            row.setHeightInPoints(39.75f);

            // Col A – Nombre
            Cell nameCell = row.createCell(0);
            nameCell.setCellValue(fullName);
            nameCell.setCellStyle(s.nameCell);

            // Col B – Cargo
            Cell cargoCell = row.createCell(1);
            cargoCell.setCellValue(cargoLabel);
            cargoCell.setCellStyle(s.cargoCell);

            // Cols C-I – Turnos
            for (ScheduleSlot slot : adviserSlots) {
                int col = 1 + slot.getDayOfWeek(); // dayOfWeek 1-7 → col 2-8
                Cell dayCell = row.createCell(col);
                if (Boolean.TRUE.equals(slot.getIsRestDay())) {
                    dayCell.setCellValue("D");
                    dayCell.setCellStyle(s.restDayCell);
                } else if (slot.getStartTime() != null && slot.getEndTime() != null) {
                    dayCell.setCellValue(formatTimeRange(slot.getStartTime(), slot.getEndTime()));
                    dayCell.setCellStyle(s.shiftCell);
                } else {
                    dayCell.setCellValue("");
                    dayCell.setCellStyle(s.shiftCell);
                }
            }

            // Col J – Firma (vacía)
            row.createCell(9).setCellStyle(s.firmaCell);
            // Col K – Observaciones (vacía)
            row.createCell(10).setCellStyle(s.obsCell);

            rowIdx++;
        }
    }

    // ─── Signature block (rows 15-16) ────────────────────────────────────────────

    private void writeSignatureBlock(Sheet sheet, Styles s) {
        // Leave two blank rows after employees for spacing
        int baseRow = sheet.getLastRowNum() + 2;

        Row sigLine = sheet.createRow(baseRow);
        sigLine.setHeightInPoints(33);
        Cell leftSig = sigLine.createCell(0);
        leftSig.setCellValue("___________________________");
        leftSig.setCellStyle(s.sigStyle);

        // Merge I:J for right signature line
        Cell rightSig = sigLine.createCell(8);
        rightSig.setCellValue("_________________________");
        rightSig.setCellStyle(s.sigStyle);
        sheet.addMergedRegion(new CellRangeAddress(baseRow, baseRow, 8, 9));

        Row labelLine = sheet.createRow(baseRow + 1);
        Cell adminLabel = labelLine.createCell(0);
        adminLabel.setCellValue("ADMINISTRADOR");
        adminLabel.setCellStyle(s.sigStyle);

        Cell coordLabel = labelLine.createCell(8);
        coordLabel.setCellValue("COORDINADOR");
        coordLabel.setCellStyle(s.sigStyle);
        sheet.addMergedRegion(new CellRangeAddress(baseRow + 1, baseRow + 1, 8, 9));
    }

    // ─── Time formatting ──────────────────────────────────────────────────────────

    private String formatTimeRange(LocalTime start, LocalTime end) {
        return formatTime12h(start) + " - " + formatTime12h(end);
    }

    private String formatTime12h(LocalTime t) {
        int h = t.getHour();
        int m = t.getMinute();
        String ampm = h < 12 ? "AM" : "PM";
        int h12 = h % 12;
        if (h12 == 0) h12 = 12;
        return h12 + ":" + String.format("%02d", m) + " " + ampm;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────────

    /**
     * Applies the border style of a representative cell to all cells in a merged region.
     * POI requires each non-anchor cell in a merge to have borders set manually.
     */
    private void applyBordersToMerge(Sheet sheet, CellStyle cs, int r1, int r2, int c1, int c2) {
        for (int r = r1; r <= r2; r++) {
            Row row = sheet.getRow(r);
            if (row == null) row = sheet.createRow(r);
            for (int c = c1; c <= c2; c++) {
                Cell cell = row.getCell(c);
                if (cell == null) cell = row.createCell(c);
                cell.setCellStyle(cs);
            }
        }
    }

    // ─── Styles inner class ───────────────────────────────────────────────────────

    private static final class Styles {
        final CellStyle title;
        final CellStyle storeHeader;
        final CellStyle headerCenter;
        final CellStyle headerLeftEdge;
        final CellStyle headerCenterSmall;
        final CellStyle nameCell;
        final CellStyle cargoCell;
        final CellStyle shiftCell;
        final CellStyle restDayCell;
        final CellStyle firmaCell;
        final CellStyle obsCell;
        final CellStyle sigStyle;

        Styles(Workbook wb) {
            Font boldBig = font(wb, true, 18);
            Font bold12  = font(wb, true, 12);
            Font bold11  = font(wb, true, 11);
            Font bold10  = font(wb, true, 10);
            Font reg11   = font(wb, false, 11);

            title            = style(wb, boldBig, HorizontalAlignment.CENTER, true, true, true, true, BorderStyle.MEDIUM, BorderStyle.NONE, BorderStyle.MEDIUM, BorderStyle.MEDIUM);
            storeHeader      = style(wb, bold12,  HorizontalAlignment.LEFT,   false, false, true, true, BorderStyle.NONE,   BorderStyle.NONE, BorderStyle.MEDIUM, BorderStyle.MEDIUM);
            headerCenter     = style(wb, bold11,  HorizontalAlignment.CENTER, true, true, true, true,  BorderStyle.THIN,   BorderStyle.THIN,  BorderStyle.THIN, BorderStyle.THIN);
            headerLeftEdge   = style(wb, bold11,  HorizontalAlignment.CENTER, true, true, true, true,  BorderStyle.THIN,   BorderStyle.THIN,  BorderStyle.MEDIUM, BorderStyle.THIN);
            headerCenterSmall= style(wb, bold10,  HorizontalAlignment.CENTER, true, true, true, true,  BorderStyle.THIN,   BorderStyle.THIN,  BorderStyle.THIN, BorderStyle.MEDIUM);
            nameCell         = style(wb, bold11,  HorizontalAlignment.CENTER, false, true, true, true,  BorderStyle.NONE,   BorderStyle.THIN,  BorderStyle.MEDIUM, BorderStyle.THIN);
            cargoCell        = style(wb, bold11,  HorizontalAlignment.CENTER, false, true, true, false, BorderStyle.NONE,   BorderStyle.THIN,  BorderStyle.THIN, BorderStyle.NONE);
            shiftCell        = style(wb, reg11,   HorizontalAlignment.CENTER, true, true, true, true,   BorderStyle.THIN,  BorderStyle.THIN,  BorderStyle.THIN, BorderStyle.THIN);
            restDayCell      = style(wb, bold11,  HorizontalAlignment.CENTER, true, true, true, true,   BorderStyle.THIN,  BorderStyle.THIN,  BorderStyle.THIN, BorderStyle.THIN);
            firmaCell        = style(wb, reg11,   HorizontalAlignment.CENTER, true, true, true, true,   BorderStyle.THIN,  BorderStyle.THIN,  BorderStyle.THIN, BorderStyle.THIN);
            obsCell          = style(wb, reg11,   HorizontalAlignment.CENTER, true, true, true, true,   BorderStyle.THIN,  BorderStyle.THIN,  BorderStyle.THIN, BorderStyle.MEDIUM);
            sigStyle         = style(wb, bold11,  HorizontalAlignment.LEFT,   false, false, false, false, BorderStyle.NONE, BorderStyle.NONE, BorderStyle.NONE, BorderStyle.NONE);

            // Tienda y semana arrancan con sangría (sobre la columna CARGO), igual que el original
            storeHeader.setIndention((short) 27);

            // Un cargo largo baja de línea y sigue centrado en vez de cortarse
            cargoCell.setWrapText(true);

            // Wrap text for all data cells
            shiftCell.setWrapText(true);
            firmaCell.setWrapText(false);
        }

        private static Font font(Workbook wb, boolean bold, int size) {
            Font f = wb.createFont();
            f.setBold(bold);
            f.setFontName("Arial");
            f.setFontHeightInPoints((short) size);
            return f;
        }

        /**
         * top, bottom, left, right borders.
         */
        private static CellStyle style(Workbook wb, Font font, HorizontalAlignment ha,
                                        boolean top, boolean bottom, boolean left, boolean right,
                                        BorderStyle topStyle, BorderStyle bottomStyle,
                                        BorderStyle leftStyle, BorderStyle rightStyle) {
            CellStyle cs = wb.createCellStyle();
            cs.setFont(font);
            cs.setAlignment(ha);
            cs.setVerticalAlignment(VerticalAlignment.CENTER);
            if (top)    cs.setBorderTop(topStyle);
            if (bottom) cs.setBorderBottom(bottomStyle);
            if (left)   cs.setBorderLeft(leftStyle);
            if (right)  cs.setBorderRight(rightStyle);
            return cs;
        }
    }
}
