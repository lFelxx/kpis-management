package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.dto.sale.SaleRequest;
import com.fcastro.backend_kpis_management.model.dto.sale.WeekSale;

public interface SaleService {
    WeekSale processSale(SaleRequest request);
} 