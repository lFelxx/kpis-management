package com.fcastro.backend_kpis_management.services.impl;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.MonthlySummary;
import com.fcastro.backend_kpis_management.repositories.GoalRepository;
import com.fcastro.backend_kpis_management.repositories.MonthlySummaryRepository;
import com.fcastro.backend_kpis_management.services.MonthlySummaryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MonthlySummaryServiceImpl implements MonthlySummaryService {
    
    private final MonthlySummaryRepository monthlySummaryRepository;
    private final GoalRepository goalRepository;

    @Override
    public void addSaleToMonthlySummary(Adviser adviser, LocalDate saleDate, Double amount) {
        log.info("Procesando venta mensual para asesor {}", adviser.getName());
        
        int year = saleDate.getYear();
        int month = saleDate.getMonthValue();
        
        MonthlySummary summary = monthlySummaryRepository
            .findByAdviserIdAndYearAndMonth(adviser.getId(), year, month)
            .orElseGet(() ->{
                log.info("Creando nuevo resumen mensual para asesor {} en {}/{}", adviser.getName(), month, year);

                MonthlySummary newSummary = new MonthlySummary();
                newSummary.setAdviser(adviser);
                newSummary.setYear(year);
                newSummary.setMonth(month);
                newSummary.setTotalSales(0.0);
                newSummary.setGoal(0.0);

                // Copiamos la meta desde la entidad Goal
                goalRepository.findByAdviserIdAndYearAndMonth(adviser.getId(), year, month)
                    .ifPresentOrElse(
                        goal -> {
                            newSummary.setGoal(goal.getGoalValue());
                            log.info("Meta asignada para asesor {}: {} en {}/{}", 
                                adviser.getName(), goal.getGoalValue(), month, year);
                        },
                        () -> log.warn("No se encontró meta para asesor {} en {}/{}", 
                            adviser.getName(), month, year)
                    );
                
                return newSummary;
            });

        // Verificar y actualizar la meta si está en 0.0
        if (summary.getGoal() == 0.0) {
            goalRepository.findByAdviserIdAndYearAndMonth(adviser.getId(), year, month)
                .ifPresent(goal -> {
                    summary.setGoal(goal.getGoalValue());
                    log.info("Meta actualizada para asesor {}: {} en {}/{}", 
                        adviser.getName(), goal.getGoalValue(), month, year);
                });
        }
        
        summary.setTotalSales(summary.getTotalSales() + amount);
        monthlySummaryRepository.save(summary);
        
        log.info("Venta procesada - Asesor: {}, Total: {}, Meta: {}", 
            adviser.getName(), summary.getTotalSales(), summary.getGoal());
    }

    @Override
    public void updateTotalSalesByAdviser(Long id,int year, int month, Double totalSales) {
        log.info("Iniciando actualizacion de las ventas para el id {} con un totalSales de: {}", id, totalSales);
        MonthlySummary summary =  monthlySummaryRepository
            .findByAdviserIdAndYearAndMonth(id, year, month)
            .orElseThrow(() -> new RuntimeException("Resumen mensual no encontrado"));
        
            summary.setTotalSales(totalSales);
            monthlySummaryRepository.save(summary);
        
    }

    @Override
    public void updateGoalIfExists(Long adviserId, Double goalValue, int year, int month) {
        log.info("Sincronizando meta en MonthlySummary para asesor ID {} en {}/{}", adviserId, month, year);
        
        monthlySummaryRepository.findByAdviserIdAndYearAndMonth(adviserId, year, month)
            .ifPresentOrElse(
                summary -> {
                    Double currentGoal = summary.getGoal();
                    
                    // Solo actualizar si la meta actual es 0.0 o es diferente a la nueva
                    if (currentGoal == 0.0 || !currentGoal.equals(goalValue)) {
                        summary.setGoal(goalValue);
                        monthlySummaryRepository.save(summary);
                        log.info("Meta sincronizada - Asesor ID {}: {} -> {} en {}/{}", 
                            adviserId, currentGoal, goalValue, month, year);
                    } else {
                        log.info("Meta ya está sincronizada para asesor ID {} en {}/{}: {}", 
                            adviserId, month, year, goalValue);
                    }
                },
                () -> log.info("No existe MonthlySummary para asesor ID {} en {}/{} - no se requiere sincronización", 
                    adviserId, month, year)
            );
    }
}
