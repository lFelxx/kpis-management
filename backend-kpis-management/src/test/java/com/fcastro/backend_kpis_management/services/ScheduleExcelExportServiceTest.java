package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.ScheduleSlot;
import com.fcastro.backend_kpis_management.model.entities.WeeklySchedule;
import com.fcastro.backend_kpis_management.model.enums.TeamRole;
import com.fcastro.backend_kpis_management.repositories.WeeklyScheduleRepository;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFClientAnchor;
import org.apache.poi.xssf.usermodel.XSSFDrawing;
import org.apache.poi.xssf.usermodel.XSSFPicture;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.openxmlformats.schemas.drawingml.x2006.main.CTRelativeRect;
import org.openxmlformats.schemas.drawingml.x2006.spreadsheetDrawing.STEditAs;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleExcelExportServiceTest {

    @Mock private WeeklyScheduleRepository scheduleRepo;
    @InjectMocks private ScheduleExcelExportService service;

    private XSSFSheet sheet;

    @BeforeEach
    void setUp() throws Exception {
        WeeklySchedule schedule = new WeeklySchedule();
        schedule.setId(1L);
        schedule.setWeekStart(LocalDate.of(2026, 10, 19));
        schedule.setWeekEnd(LocalDate.of(2026, 10, 25));
        schedule.setSlots(List.of(slot(1, 1, "Ana", "Ruiz"), slot(2, 1, "Ana", "Ruiz")));

        when(scheduleRepo.findById(1L)).thenReturn(Optional.of(schedule));

        byte[] bytes = service.buildFormat1(1L);
        sheet = new XSSFWorkbook(new ByteArrayInputStream(bytes)).getSheetAt(0);
    }

    @Test
    void export_incluyeLosDosLogos() {
        List<XSSFPicture> pictures = pictures();
        assertThat(pictures).hasSize(2);
    }

    @Test
    void export_logoAmcVaArribaAIzquierda_conLaPosicionYRecorteDeLaReferencia() {
        XSSFPicture amc = pictures().get(0);

        assertAnchor(amc, 0, 158_752, 0, 111_126, 0, 1_743_075, 1, 28_576);
        assertCrop(amc, 0, 8_415, 8_784, 14_473);
        assertThat(amc.getPictureData().getMimeType()).isEqualTo("image/png");
    }

    @Test
    void export_logoPumaVaArribaADerecha_conLaPosicionYRecorteDeLaReferencia() {
        XSSFPicture puma = pictures().get(1);

        assertAnchor(puma, 10, 536_574, 0, 57_150, 10, 1_352_769, 1, 1);
        assertCrop(puma, 17_072, 8_573, 11_628, 8_571);
        assertThat(puma.getPictureData().getMimeType()).isEqualTo("image/jpeg");
    }

    @Test
    void export_logosSeAnclanComoEnLaReferencia_editAsOneCell() {
        // POI no relee editAs al abrir el archivo, así que se verifica en el XML del dibujo
        assertThat(sheet.getDrawingPatriarch().getCTDrawing().getTwoCellAnchorList())
                .hasSize(2)
                .allSatisfy(anchor -> assertThat(anchor.getEditAs()).isEqualTo(STEditAs.ONE_CELL));
    }

    @Test
    void tiendaYSemana_arrancanConLaSangriaDelOriginal_alineadasALaIzquierda() {
        for (int row : new int[] {1, 2}) {
            XSSFCellStyle style = cell(row, 0).getCellStyle();
            assertThat(style.getAlignment()).isEqualTo(HorizontalAlignment.LEFT);
            assertThat(style.getIndention()).isEqualTo((short) 27);
        }
    }

    @Test
    void lineaOscuraDerecha_conectaElTituloConObservaciones() {
        // filas 1-5 (título, tienda, semana y las dos de cabecera): sin huecos
        for (int row = 0; row <= 4; row++) {
            assertThat(cell(row, 10).getCellStyle().getBorderRight())
                    .as("borde derecho de la fila %d", row + 1).isEqualTo(BorderStyle.MEDIUM);
        }
    }

    @Test
    void lineaOscuraIzquierda_conectaElTituloConFuncionarios() {
        for (int row = 0; row <= 4; row++) {
            assertThat(cell(row, 0).getCellStyle().getBorderLeft())
                    .as("borde izquierdo de la fila %d", row + 1).isEqualTo(BorderStyle.MEDIUM);
        }
    }

    @Test
    void nombreYCargo_tienenLineaDivisoria_yElCargoLargoSeCentraYBajaDeLinea() {
        XSSFCellStyle name = cell(5, 0).getCellStyle();
        XSSFCellStyle cargo = cell(5, 1).getCellStyle();

        assertThat(name.getBorderRight()).isEqualTo(BorderStyle.THIN);
        assertThat(cargo.getBorderLeft()).isEqualTo(BorderStyle.THIN);
        assertThat(cargo.getBorderBottom()).isEqualTo(BorderStyle.THIN);
        assertThat(cargo.getAlignment()).isEqualTo(HorizontalAlignment.CENTER);
        assertThat(cargo.getWrapText()).isTrue();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private XSSFCell cell(int row, int col) {
        return sheet.getRow(row).getCell(col);
    }

    private List<XSSFPicture> pictures() {
        XSSFDrawing drawing = sheet.getDrawingPatriarch();
        return drawing.getShapes().stream()
                .filter(XSSFPicture.class::isInstance)
                .map(XSSFPicture.class::cast)
                .toList();
    }

    private void assertAnchor(XSSFPicture picture, int col1, int dx1, int row1, int dy1,
                              int col2, int dx2, int row2, int dy2) {
        XSSFClientAnchor a = picture.getClientAnchor();
        assertThat((int) a.getCol1()).isEqualTo(col1);
        assertThat(a.getDx1()).isEqualTo(dx1);
        assertThat(a.getRow1()).isEqualTo(row1);
        assertThat(a.getDy1()).isEqualTo(dy1);
        assertThat((int) a.getCol2()).isEqualTo(col2);
        assertThat(a.getDx2()).isEqualTo(dx2);
        assertThat(a.getRow2()).isEqualTo(row2);
        assertThat(a.getDy2()).isEqualTo(dy2);
    }

    private void assertCrop(XSSFPicture picture, int left, int top, int right, int bottom) {
        CTRelativeRect crop = picture.getCTPicture().getBlipFill().getSrcRect();
        assertThat(crop.getL()).isEqualTo(left);
        assertThat(crop.getT()).isEqualTo(top);
        assertThat(crop.getR()).isEqualTo(right);
        assertThat(crop.getB()).isEqualTo(bottom);
    }

    private ScheduleSlot slot(int dayOfWeek, long adviserId, String name, String lastname) {
        Adviser adviser = new Adviser();
        adviser.setId(adviserId);
        adviser.setName(name);
        adviser.setLastname(lastname);
        adviser.setTeamRole(TeamRole.ADVISER);

        ScheduleSlot slot = new ScheduleSlot();
        slot.setAdviser(adviser);
        slot.setDayOfWeek(dayOfWeek);
        slot.setStartTime(LocalTime.of(8, 0));
        slot.setEndTime(LocalTime.of(17, 0));
        slot.setIsRestDay(false);
        return slot;
    }
}
