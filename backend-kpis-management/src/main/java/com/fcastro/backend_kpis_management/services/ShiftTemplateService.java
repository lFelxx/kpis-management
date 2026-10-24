package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.dto.schedule.ShiftTemplateRequest;
import com.fcastro.backend_kpis_management.model.dto.schedule.ShiftTemplateResponse;

import java.util.List;

public interface ShiftTemplateService {
    List<ShiftTemplateResponse> getAll();
    ShiftTemplateResponse create(ShiftTemplateRequest request);
    ShiftTemplateResponse update(Long id, ShiftTemplateRequest request);
    void delete(Long id);
}
