package com.fcastro.backend_kpis_management.services.impl;

import com.fcastro.backend_kpis_management.model.dto.schedule.ShiftTemplateRequest;
import com.fcastro.backend_kpis_management.model.dto.schedule.ShiftTemplateResponse;
import com.fcastro.backend_kpis_management.model.entities.ShiftTemplate;
import com.fcastro.backend_kpis_management.repositories.ShiftTemplateRepository;
import com.fcastro.backend_kpis_management.services.ShiftTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShiftTemplateServiceImpl implements ShiftTemplateService {

    private final ShiftTemplateRepository repository;

    @Override
    public List<ShiftTemplateResponse> getAll() {
        return repository.findByActiveTrueOrderBySortOrderAscIdAsc()
                .stream().map(this::toResponse).toList();
    }

    @Override
    public ShiftTemplateResponse create(ShiftTemplateRequest req) {
        ShiftTemplate t = new ShiftTemplate();
        applyRequest(t, req);
        return toResponse(repository.save(t));
    }

    @Override
    public ShiftTemplateResponse update(Long id, ShiftTemplateRequest req) {
        ShiftTemplate t = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ShiftTemplate not found: " + id));
        applyRequest(t, req);
        return toResponse(repository.save(t));
    }

    @Override
    public void delete(Long id) {
        ShiftTemplate t = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ShiftTemplate not found: " + id));
        t.setActive(false);
        repository.save(t);
    }

    private void applyRequest(ShiftTemplate t, ShiftTemplateRequest req) {
        if (req.getName()      != null) t.setName(req.getName());
        if (req.getColor()     != null) t.setColor(req.getColor());
        if (req.getIsRest()    != null) t.setIsRest(req.getIsRest());
        if (req.getHasLunch()  != null) t.setHasLunch(req.getHasLunch());
        if (req.getSortOrder() != null) t.setSortOrder(req.getSortOrder());
        if (t.getColor()    == null) t.setColor("#6b7280");
        if (t.getIsRest()   == null) t.setIsRest(false);
        if (t.getHasLunch() == null) t.setHasLunch(false);

        boolean isRest = Boolean.TRUE.equals(t.getIsRest());
        if (!isRest) {
            if (req.getStartTime() != null) t.setStartTime(req.getStartTime());
            if (req.getEndTime()   != null) t.setEndTime(req.getEndTime());
            if (t.getStartTime() != null && t.getEndTime() != null
                    && t.getEndTime().compareTo(t.getStartTime()) <= 0) {
                throw new IllegalArgumentException(
                        "La hora de salida debe ser posterior a la de entrada");
            }
        } else {
            t.setStartTime(null);
            t.setEndTime(null);
        }
    }

    private ShiftTemplateResponse toResponse(ShiftTemplate t) {
        return ShiftTemplateResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .startTime(t.getStartTime())
                .endTime(t.getEndTime())
                .color(t.getColor())
                .isRest(t.getIsRest())
                .hasLunch(t.getHasLunch())
                .sortOrder(t.getSortOrder())
                .build();
    }
}
