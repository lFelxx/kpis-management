package com.fcastro.backend_kpis_management.controllers;

import com.fcastro.backend_kpis_management.model.dto.prediction.*;
import com.fcastro.backend_kpis_management.services.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    @GetMapping("/closing/{adviserId}")
    public ResponseEntity<ClosingPredictionResponse> predictClosing(
            @PathVariable Long adviserId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(predictionService.predictClosingForAdviser(adviserId, year, month));
    }

    @GetMapping("/risk/{adviserId}")
    public ResponseEntity<RiskDetectionResponse> detectRisk(
            @PathVariable Long adviserId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(predictionService.detectRiskForAdviser(adviserId, year, month));
    }

    @GetMapping("/store-closing")
    public ResponseEntity<StoreClosingResponse> predictStoreClosing(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(predictionService.predictStoreClosing(year, month));
    }

    @GetMapping("/patterns/{adviserId}")
    public ResponseEntity<PatternResponse> analyzePatterns(
            @PathVariable Long adviserId) {
        return ResponseEntity.ok(predictionService.analyzePatternsForAdviser(adviserId));
    }

    @GetMapping("/anomalies/{adviserId}")
    public ResponseEntity<AnomalyResponse> detectAnomalies(
            @PathVariable Long adviserId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(predictionService.detectAnomaliesForAdviser(adviserId, year, month));
    }
}
