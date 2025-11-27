package com.fcastro.backend_kpis_management.services;

import java.util.List;

import com.fcastro.backend_kpis_management.model.dto.adviser.AdviserRequest;
import com.fcastro.backend_kpis_management.model.dto.adviser.AdviserResponse;
import com.fcastro.backend_kpis_management.model.dto.sale.SaleRequest;
import com.fcastro.backend_kpis_management.model.dto.sale.WeekSale;

public interface AdviserService {
    List<AdviserResponse> getAdvisers();

    AdviserResponse getOne(Long id);

    AdviserResponse create(AdviserRequest adviser);

    AdviserResponse update(Long id, AdviserRequest adviser);

    void delete(Long id);

    WeekSale addSale(SaleRequest request);

    AdviserResponse getAdviserById(Long id);

}