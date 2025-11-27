package com.fcastro.backend_kpis_management.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fcastro.backend_kpis_management.model.dto.WeeklyComparisonDTO;
import com.fcastro.backend_kpis_management.model.dto.WeeklyComparisonUpdateDTO;
import com.fcastro.backend_kpis_management.services.WeeklyComparisonService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/weekly-comparisons")
@RequiredArgsConstructor
public class WeeklyComparisonController {

    private final WeeklyComparisonService weeklyComparisonService;

    @GetMapping("/adviser/{adviserId}")
    public ResponseEntity<List<WeeklyComparisonDTO>> getAdviserComparisons(
            @PathVariable Long adviserId,
            @RequestParam Integer year,
            @RequestParam Integer month) {
        log.info("Consultando comparaciones para asesor {} en año {} mes {}", adviserId, year, month);
        return ResponseEntity.ok(weeklyComparisonService.getAdviserComparisons(adviserId, year, month));
    }

    @PostMapping("/generate")
    public ResponseEntity<List<WeeklyComparisonDTO>> generateWeeklyComparisons() {
        log.info("Generando comparaciones semanales para todos los asesores activos");
        List<WeeklyComparisonDTO> comparisons = weeklyComparisonService.generateWeeklyComparisons();
        log.info("Comparaciones generadas exitosamente: {} asesores", comparisons.size());
        return ResponseEntity.ok(comparisons);
    }

    @PostMapping("/generate/adviser/{adviserId}")
    public ResponseEntity<WeeklyComparisonDTO> generateAdviserWeeklyComparison(@PathVariable Long adviserId) {
        log.info("Generando comparación semanal para asesor {}", adviserId);
        WeeklyComparisonDTO comparison = weeklyComparisonService.generateAdviserWeeklyComparison(adviserId);
        log.info("Comparación generada exitosamente para asesor {}", adviserId);
        return ResponseEntity.ok(comparison);
    }

    @GetMapping("/adviser/{adviserId}/current-week")
    public ResponseEntity<WeeklyComparisonDTO> getCurrentWeekComparison(@PathVariable Long adviserId) {
        log.info("Obteniendo comparación de la semana actual para asesor {}", adviserId);
        return ResponseEntity.ok(weeklyComparisonService.updateCurrentWeekSales(adviserId, null));
    }

    @GetMapping("/adviser/{adviserId}/previous-week")
    public ResponseEntity<WeeklyComparisonDTO> getPreviousWeekComparison(@PathVariable Long adviserId) {
        log.info("Obteniendo comparación de la semana anterior para asesor {}", adviserId);
        return ResponseEntity.ok(weeklyComparisonService.updatePreviousWeekSales(adviserId, null));
    }

    @PutMapping("/adviser/{adviserId}/current-week")
    @Deprecated
    public ResponseEntity<WeeklyComparisonDTO> updateCurrentWeekSales(
            @PathVariable Long adviserId,
            @Valid @RequestBody WeeklyComparisonUpdateDTO updateDTO) {
        log.info("Actualizando ventas de semana actual para asesor {} - Valor: {}", adviserId, updateDTO.getCurrentWeekSales());
        return ResponseEntity.ok(weeklyComparisonService.updateCurrentWeekSales(adviserId, updateDTO.getCurrentWeekSales()));
    }

    @PutMapping("/adviser/{adviserId}/previous-week")
    @Deprecated
    public ResponseEntity<WeeklyComparisonDTO> updatePreviousWeekSales(
            @PathVariable Long adviserId,
            @Valid @RequestBody WeeklyComparisonUpdateDTO updateDTO) {
        log.info("Actualizando ventas de semana anterior para asesor {} - Valor: {}", adviserId, updateDTO.getCurrentWeekSales());
        return ResponseEntity.ok(weeklyComparisonService.updatePreviousWeekSales(adviserId, updateDTO.getCurrentWeekSales()));
    }
}
