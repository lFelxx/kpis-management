package com.fcastro.backend_kpis_management.controllers;

import com.fcastro.backend_kpis_management.model.dto.schedule.ShiftTemplateRequest;
import com.fcastro.backend_kpis_management.model.dto.schedule.ShiftTemplateResponse;
import com.fcastro.backend_kpis_management.services.ShiftTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shift-templates")
@RequiredArgsConstructor
public class ShiftTemplateController {

    private final ShiftTemplateService shiftTemplateService;

    @GetMapping
    public ResponseEntity<List<ShiftTemplateResponse>> getAll() {
        return ResponseEntity.ok(shiftTemplateService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ShiftTemplateResponse> create(@RequestBody ShiftTemplateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shiftTemplateService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ShiftTemplateResponse> update(@PathVariable Long id,
                                                        @RequestBody ShiftTemplateRequest request) {
        return ResponseEntity.ok(shiftTemplateService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        shiftTemplateService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
