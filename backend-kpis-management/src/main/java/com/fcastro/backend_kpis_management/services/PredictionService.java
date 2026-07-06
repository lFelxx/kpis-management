package com.fcastro.backend_kpis_management.services;

import com.fcastro.backend_kpis_management.model.dto.prediction.*;

public interface PredictionService {
    ClosingPredictionResponse predictClosingForAdviser(Long adviserId, int year, int month);
    RiskDetectionResponse detectRiskForAdviser(Long adviserId, int year, int month);
    StoreClosingResponse predictStoreClosing(int year, int month);
    PatternResponse analyzePatternsForAdviser(Long adviserId);
    AnomalyResponse detectAnomaliesForAdviser(Long adviserId, int year, int month);
}
