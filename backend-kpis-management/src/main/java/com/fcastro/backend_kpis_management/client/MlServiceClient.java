package com.fcastro.backend_kpis_management.client;

import com.fcastro.backend_kpis_management.model.dto.prediction.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class MlServiceClient {

    private final WebClient webClient;

    public MlServiceClient(@Value("${ml.service.url}") String mlServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(mlServiceUrl)
                .build();
    }

    public ClosingPredictionResponse predictClosing(ClosingPredictionRequest request) {
        return post("/predict/closing", request, ClosingPredictionResponse.class);
    }

    public RiskDetectionResponse detectRisk(RiskDetectionRequest request) {
        return post("/predict/risk", request, RiskDetectionResponse.class);
    }

    public StoreClosingResponse predictStoreClosing(StoreClosingRequest request) {
        return post("/predict/store-closing", request, StoreClosingResponse.class);
    }

    public PatternResponse analyzePatterns(PatternRequest request) {
        return post("/analyze/patterns", request, PatternResponse.class);
    }

    public AnomalyResponse detectAnomalies(AnomalyRequest request) {
        return post("/analyze/anomalies", request, AnomalyResponse.class);
    }

    private <T> T post(String uri, Object body, Class<T> responseType) {
        return webClient.post()
                .uri(uri)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(responseType)
                .block();
    }
}
