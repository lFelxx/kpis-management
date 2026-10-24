package com.fcastro.backend_kpis_management.controllers;

import com.fcastro.backend_kpis_management.model.dto.schedule.GenerationRuleRequest;
import com.fcastro.backend_kpis_management.model.dto.schedule.GenerationRuleResponse;
import com.fcastro.backend_kpis_management.model.entities.GenerationRule;
import com.fcastro.backend_kpis_management.model.entities.ShiftTemplate;
import com.fcastro.backend_kpis_management.repositories.GenerationRuleRepository;
import com.fcastro.backend_kpis_management.repositories.ShiftTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/generation-rules")
@RequiredArgsConstructor
public class GenerationRuleController {

    private final GenerationRuleRepository ruleRepo;
    private final ShiftTemplateRepository templateRepo;

    @GetMapping
    public ResponseEntity<List<GenerationRuleResponse>> getAll() {
        return ResponseEntity.ok(
            ruleRepo.findAllByOrderBySortOrderAscIdAsc()
                    .stream().map(this::toResponse).toList()
        );
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<GenerationRuleResponse> create(@RequestBody GenerationRuleRequest req) {
        ShiftTemplate template = templateRepo.findById(req.getShiftTemplateId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Template no encontrado"));

        GenerationRule rule = new GenerationRule();
        rule.setShiftTemplate(template);
        rule.setAdvisersPerDay(req.getAdvisersPerDay() != null ? req.getAdvisersPerDay() : 1);
        rule.setAuxiliariesPerDay(req.getAuxiliariesPerDay() != null ? req.getAuxiliariesPerDay() : 0);
        rule.setSortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0);

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(ruleRepo.save(rule)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<GenerationRuleResponse> update(@PathVariable Long id,
                                                          @RequestBody GenerationRuleRequest req) {
        GenerationRule rule = ruleRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Regla no encontrada"));

        if (req.getShiftTemplateId() != null) {
            ShiftTemplate template = templateRepo.findById(req.getShiftTemplateId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Template no encontrado"));
            rule.setShiftTemplate(template);
        }
        if (req.getAdvisersPerDay() != null) rule.setAdvisersPerDay(req.getAdvisersPerDay());
        if (req.getAuxiliariesPerDay() != null) rule.setAuxiliariesPerDay(req.getAuxiliariesPerDay());
        if (req.getSortOrder() != null) rule.setSortOrder(req.getSortOrder());

        return ResponseEntity.ok(toResponse(ruleRepo.save(rule)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ruleRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private GenerationRuleResponse toResponse(GenerationRule r) {
        ShiftTemplate t = r.getShiftTemplate();
        return GenerationRuleResponse.builder()
                .id(r.getId())
                .shiftTemplateId(t.getId())
                .shiftTemplateName(t.getName())
                .shiftTemplateColor(t.getColor())
                .startTime(t.getStartTime())
                .endTime(t.getEndTime())
                .advisersPerDay(r.getAdvisersPerDay())
                .auxiliariesPerDay(r.getAuxiliariesPerDay())
                .sortOrder(r.getSortOrder())
                .build();
    }
}
