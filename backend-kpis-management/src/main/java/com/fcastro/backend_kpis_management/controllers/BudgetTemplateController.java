package com.fcastro.backend_kpis_management.controllers;

import com.fcastro.backend_kpis_management.model.dto.budget.BudgetTemplateResponse;
import com.fcastro.backend_kpis_management.model.dto.budget.UpdateAdviserCountRequest;
import com.fcastro.backend_kpis_management.services.BudgetTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/budget-template")
@RequiredArgsConstructor
public class BudgetTemplateController {

    private final BudgetTemplateService budgetTemplateService;

    @PostMapping("/upload")
    public ResponseEntity<BudgetTemplateResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam int year,
            @RequestParam int month) throws IOException {

        BudgetTemplateResponse response = budgetTemplateService.upload(file.getInputStream(), year, month);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{year}/{month}")
    public ResponseEntity<BudgetTemplateResponse> getByYearAndMonth(
            @PathVariable int year,
            @PathVariable int month) {

        return ResponseEntity.ok(budgetTemplateService.getByYearAndMonth(year, month));
    }

    @PutMapping("/{year}/{month}/day/{date}/advisers")
    public ResponseEntity<BudgetTemplateResponse> updateAdviserCount(
            @PathVariable int year,
            @PathVariable int month,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody UpdateAdviserCountRequest request) {

        return ResponseEntity.ok(
                budgetTemplateService.updateAdviserCount(year, month, date, request.getAdviserCount())
        );
    }

    @PutMapping("/{year}/{month}/day/{date}/reset-override")
    public ResponseEntity<Void> resetManualOverride(
            @PathVariable int year,
            @PathVariable int month,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        budgetTemplateService.resetManualOverride(year, month, date);
        return ResponseEntity.noContent().build();
    }
}
