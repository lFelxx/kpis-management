package com.fcastro.backend_kpis_management.controllers;

import com.fcastro.backend_kpis_management.model.dto.schedule.*;
import com.fcastro.backend_kpis_management.services.ScheduleExcelExportService;
import com.fcastro.backend_kpis_management.services.ScheduleGeneratorService;
import com.fcastro.backend_kpis_management.services.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final ScheduleGeneratorService scheduleGeneratorService;
    private final ScheduleExcelExportService scheduleExcelExportService;

    @GetMapping
    public ResponseEntity<List<WeeklyScheduleSummary>> getAll() {
        return ResponseEntity.ok(scheduleService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeeklyScheduleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<WeeklyScheduleResponse> create(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.create(weekStart));
    }

    @PutMapping("/slots/{slotId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<WeeklyScheduleResponse> updateSlot(
            @PathVariable Long slotId,
            @RequestBody ScheduleSlotUpdateRequest request) {
        return ResponseEntity.ok(scheduleService.updateSlot(slotId, request));
    }

    @PostMapping("/{id}/generate")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<WeeklyScheduleResponse> generate(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleGeneratorService.generate(id));
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<WeeklyScheduleResponse> publish(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.publish(id));
    }

    @PutMapping("/{id}/unpublish")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<WeeklyScheduleResponse> unpublish(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.unpublish(id));
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> export(@PathVariable Long id) {
        byte[] bytes = scheduleExcelExportService.buildFormat1(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(
                ContentDisposition.attachment().filename("FORMATO HORARIO SEMANAL LA ESTACION.xlsx").build());
        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    @DeleteMapping("/{id}/slots")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<WeeklyScheduleResponse> clearSlots(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.clearSlots(id));
    }

    @GetMapping("/config")
    public ResponseEntity<ScheduleConfigResponse> getConfig() {
        return ResponseEntity.ok(scheduleService.getConfig());
    }

    @PutMapping("/config")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ScheduleConfigResponse> saveConfig(@RequestBody ScheduleConfigRequest request) {
        return ResponseEntity.ok(scheduleService.saveConfig(request));
    }
}
