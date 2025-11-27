package com.fcastro.backend_kpis_management.services.impl;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fcastro.backend_kpis_management.exceptions.BusinessException;
import com.fcastro.backend_kpis_management.exceptions.ResourceNotFoundException;
import com.fcastro.backend_kpis_management.model.dto.WeeklyComparisonDTO;
import com.fcastro.backend_kpis_management.model.entities.Adviser;
import com.fcastro.backend_kpis_management.model.entities.Sale;
import com.fcastro.backend_kpis_management.repositories.AdviserRepository;
import com.fcastro.backend_kpis_management.repositories.SaleRepository;
import com.fcastro.backend_kpis_management.services.WeeklyComparisonService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeeklyComparisonServiceImpl implements WeeklyComparisonService {

    private final AdviserRepository adviserRepository;
    private final SaleRepository saleRepository;
    
    @Override
    public List<WeeklyComparisonDTO> generateWeeklyComparisons() {
        log.info("Generando comparaciones semanales para todos los asesores activos");
        
        LocalDate now = LocalDate.now();
        LocalDate currentWeekStart = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate currentWeekEnd = currentWeekStart.plusDays(6);
        
        log.info("Rango de fecha calculado para semana actual - Inicio: {} (Lunes), Fin: {} (Domingo), Fecha actual: {}", 
                currentWeekStart, currentWeekEnd, now);
        
        List<Adviser> activeAdvisers = adviserRepository.findAllActiveAdvisers();
        log.info("Encontrados {} asesores activos", activeAdvisers.size());
        
        List<WeeklyComparisonDTO> comparisons = activeAdvisers.stream()
                .map(adviser -> calculateWeeklyComparison(adviser, currentWeekStart, currentWeekEnd))
                .toList();
        
        log.info("Generadas {} comparaciones semanales", comparisons.size());
        return comparisons;
    }

    @Override
    public WeeklyComparisonDTO generateAdviserWeeklyComparison(Long adviserId) {
        log.info("Generando comparación semanal para asesor {}", adviserId);
        
        Adviser adviser = findAdviserOrThrow(adviserId);
        LocalDate now = LocalDate.now();
        LocalDate currentWeekStart = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate currentWeekEnd = currentWeekStart.plusDays(6);
        
        log.info("Rango de fecha calculado para semana actual del asesor {} - Inicio: {} (Lunes), Fin: {} (Domingo), Fecha actual: {}", 
                adviserId, currentWeekStart, currentWeekEnd, now);
        
        WeeklyComparisonDTO comparison = calculateWeeklyComparison(adviser, currentWeekStart, currentWeekEnd);
        log.info("Comparación generada para asesor {} - Semana actual: {}, Semana anterior: {}, Crecimiento: {}%", 
                adviserId, comparison.getCurrentWeekSales(), comparison.getPreviousWeekSales(), comparison.getGrowthPercentage());
        
        return comparison;
    }

    @Override
    @Deprecated
    public void processAdviserComparison(Adviser adviser, LocalDate date) {
        log.info("Método processAdviserComparison() deprecado - Las comparaciones se calculan en tiempo real");
        // Este método ya no hace nada, las comparaciones se calculan on-demand
    }

    @Override
    public List<WeeklyComparisonDTO> getAdviserComparisons(Long adviserId, Integer year, Integer month) {
        log.info("Calculando comparaciones para asesor {} en {}/{}", adviserId, month, year);
        
        validateInputs(year, month);
        Adviser adviser = findAdviserOrThrow(adviserId);
        
        List<WeeklyComparisonDTO> comparisons = new ArrayList<>();
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);
        
        // Iterar por cada semana del mes
        LocalDate currentWeekStart = startOfMonth.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        
        log.info("Calculando semanas del mes {}/{} - Inicio de mes: {}, Fin de mes: {}, Primera semana: {}", 
                month, year, startOfMonth, endOfMonth, currentWeekStart);
        
        while (currentWeekStart.isBefore(endOfMonth) || currentWeekStart.isEqual(endOfMonth)) {
            LocalDate currentWeekEnd = currentWeekStart.plusDays(6);
            
            // Solo procesar semanas que intersectan con el mes solicitado
            if (currentWeekEnd.isBefore(startOfMonth)) {
                log.debug("Saltando semana que no intersecta con el mes: {} a {}", currentWeekStart, currentWeekEnd);
                currentWeekStart = currentWeekStart.plusWeeks(1);
                continue;
            }
            
            if (currentWeekStart.isAfter(endOfMonth)) {
                break;
            }
            
            log.debug("Procesando semana: {} a {} (Lunes a Domingo)", currentWeekStart, currentWeekEnd);
            WeeklyComparisonDTO comparison = calculateWeeklyComparison(adviser, currentWeekStart, currentWeekEnd);
            comparisons.add(comparison);
            
            currentWeekStart = currentWeekStart.plusWeeks(1);
        }
        
        log.info("Calculadas {} comparaciones para asesor {}", comparisons.size(), adviserId);
        return comparisons;
    }

    @Override
    public WeeklyComparisonDTO updateCurrentWeekSales(Long adviserId, Double currentWeekSales) {
        log.info("Actualizando ventas de semana actual para asesor {} - Valor objetivo: {}", adviserId, currentWeekSales);
        
        Adviser adviser = findAdviserOrThrow(adviserId);
        LocalDate now = LocalDate.now();
        LocalDate weekStart = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);
        
        log.info("Rango de fecha calculado para semana actual del asesor {} - Inicio: {} (Lunes), Fin: {} (Domingo), Fecha actual: {}", 
                adviserId, weekStart, weekEnd, now);
        
        // Si se proporciona un valor para actualizar
        if (currentWeekSales != null && currentWeekSales > 0) {
            log.debug("Buscando ventas en rango {} a {} para asesor {}", weekStart, weekEnd, adviserId);
            List<Sale> existingSales = saleRepository.findByAdviserAndSaleDateBetween(adviser, weekStart, weekEnd);
            
            if (!existingSales.isEmpty()) {
                // Actualizar la última venta del rango
                Sale lastSale = existingSales.get(existingSales.size() - 1);
                Double currentTotal = existingSales.stream()
                        .mapToDouble(Sale::getAmount)
                        .sum();
                
                Double difference = currentWeekSales - currentTotal;
                
                if (Math.abs(difference) > 0.01) { // Tolerancia para errores de punto flotante
                    log.info("Actualizando última venta del rango - Total actual: {}, Valor objetivo: {}, Diferencia: {}, ID venta: {}", 
                            currentTotal, currentWeekSales, difference, lastSale.getId());
                    
                    // Actualizar el monto de la última venta sumando la diferencia
                    lastSale.setAmount(lastSale.getAmount() + difference);
                    saleRepository.save(lastSale);
                    
                    log.info("Venta ID {} actualizada - Nuevo monto: {}", lastSale.getId(), lastSale.getAmount());
                } else {
                    log.info("No se requiere ajuste - Las ventas actuales ya coinciden con el valor objetivo");
                }
            } else {
                // No hay ventas en el rango, crear una nueva venta de ajuste
                log.info("No existen ventas en el rango - Creando nueva venta de ajuste con monto: {}", currentWeekSales);
                
                Sale adjustmentSale = new Sale();
                adjustmentSale.setAdviser(adviser);
                adjustmentSale.setSaleDate(now);
                adjustmentSale.setAmount(currentWeekSales);
                saleRepository.save(adjustmentSale);
                
                log.info("Venta de ajuste creada exitosamente - Monto: {}", currentWeekSales);
            }
        }
        
        // Retornar la comparación actualizada
        return calculateWeeklyComparison(adviser, weekStart, weekEnd);
    }

    @Override
    public WeeklyComparisonDTO updatePreviousWeekSales(Long adviserId, Double previousWeekSales) {
        log.info("Actualizando ventas de semana anterior para asesor {} - Valor objetivo: {}", adviserId, previousWeekSales);
        
        Adviser adviser = findAdviserOrThrow(adviserId);
        LocalDate now = LocalDate.now();
        LocalDate previousWeekStart = now.minusWeeks(1).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate previousWeekEnd = previousWeekStart.plusDays(6);
        
        log.info("Rango de fecha calculado para semana anterior del asesor {} - Inicio: {} (Lunes), Fin: {} (Domingo), Fecha actual: {}", 
                adviserId, previousWeekStart, previousWeekEnd, now);
        
        // Si se proporciona un valor para actualizar
        if (previousWeekSales != null && previousWeekSales > 0) {
            log.debug("Buscando ventas en rango {} a {} para asesor {}", previousWeekStart, previousWeekEnd, adviserId);
            List<Sale> existingSales = saleRepository.findByAdviserAndSaleDateBetween(adviser, previousWeekStart, previousWeekEnd);
            
            if (!existingSales.isEmpty()) {
                // Actualizar la última venta del rango
                Sale lastSale = existingSales.get(existingSales.size() - 1);
                Double currentTotal = existingSales.stream()
                        .mapToDouble(Sale::getAmount)
                        .sum();
                
                Double difference = previousWeekSales - currentTotal;
                
                if (Math.abs(difference) > 0.01) { // Tolerancia para errores de punto flotante
                    log.info("Actualizando última venta del rango - Total actual: {}, Valor objetivo: {}, Diferencia: {}, ID venta: {}", 
                            currentTotal, previousWeekSales, difference, lastSale.getId());
                    
                    // Actualizar el monto de la última venta sumando la diferencia
                    lastSale.setAmount(lastSale.getAmount() + difference);
                    saleRepository.save(lastSale);
                    
                    log.info("Venta ID {} actualizada - Nuevo monto: {}", lastSale.getId(), lastSale.getAmount());
                } else {
                    log.info("No se requiere ajuste - Las ventas actuales ya coinciden con el valor objetivo");
                }
            } else {
                // No hay ventas en el rango, crear una nueva venta de ajuste
                log.info("No existen ventas en el rango - Creando nueva venta de ajuste con monto: {}", previousWeekSales);
                
                Sale adjustmentSale = new Sale();
                adjustmentSale.setAdviser(adviser);
                adjustmentSale.setSaleDate(previousWeekEnd);
                adjustmentSale.setAmount(previousWeekSales);
                saleRepository.save(adjustmentSale);
                
                log.info("Venta de ajuste creada exitosamente - Monto: {}", previousWeekSales);
            }
        }
        
        // Retornar la comparación actualizada
        return calculateWeeklyComparison(adviser, previousWeekStart, previousWeekEnd);
    }

    // ===== MÉTODOS AUXILIARES =====

    /**
     * Calcula la comparación semanal para un asesor en un rango de fechas específico
     */
    private WeeklyComparisonDTO calculateWeeklyComparison(Adviser adviser, LocalDate weekStart, LocalDate weekEnd) {
        log.debug("Calculando comparación para asesor {} - Semana actual: {} (Lunes) a {} (Domingo)", 
                adviser.getId(), weekStart, weekEnd);
        
        // Calcular ventas de la semana actual
        Double currentWeekSales = calculateSalesInRange(adviser.getId(), weekStart, weekEnd);
        
        // Calcular ventas de la semana anterior
        LocalDate previousWeekStart = weekStart.minusWeeks(1);
        LocalDate previousWeekEnd = weekEnd.minusWeeks(1);
        log.debug("Calculando ventas de semana anterior para asesor {} - Rango: {} (Lunes) a {} (Domingo)", 
                adviser.getId(), previousWeekStart, previousWeekEnd);
        Double previousWeekSales = calculateSalesInRange(adviser.getId(), previousWeekStart, previousWeekEnd);
        
        // Calcular porcentaje de crecimiento
        Double growthPercentage = calculateGrowthPercentage(previousWeekSales, currentWeekSales);
        
        // Obtener número de semana
        Integer weekNumber = weekStart.get(WeekFields.ISO.weekOfWeekBasedYear());
        Integer year = weekStart.getYear();
        Integer month = weekStart.getMonthValue();
        
        return WeeklyComparisonDTO.builder()
                .adviserId(adviser.getId())
                .adviserName(adviser.getName() + " " + adviser.getLastname())
                .weekNumber(weekNumber)
                .year(year)
                .month(month)
                .currentWeekSales(currentWeekSales)
                .previousWeekSales(previousWeekSales)
                .growthPercentage(growthPercentage)
                .build();
    }

    /**
     * Calcula el total de ventas en un rango de fechas
     */
    private Double calculateSalesInRange(Long adviserId, LocalDate startDate, LocalDate endDate) {
        Adviser adviser = adviserRepository.findById(adviserId)
                .orElseThrow(() -> new ResourceNotFoundException("Asesor no encontrado: " + adviserId));
        
        log.debug("Buscando ventas para asesor {} en rango de fechas: {} a {} (inclusive)", adviserId, startDate, endDate);
        List<Sale> sales = saleRepository.findByAdviserAndSaleDateBetween(adviser, startDate, endDate);
        log.debug("Encontradas {} ventas para asesor {} en rango {} a {}", sales.size(), adviserId, startDate, endDate);
        
        Double total = sales.stream()
                .mapToDouble(sale -> sale.getAmount())
                .sum();
        
        log.debug("Total de ventas calculado para asesor {} en rango {} a {}: {}", adviserId, startDate, endDate, total);
        return total;
    }

    /**
     * Calcula el porcentaje de crecimiento entre dos valores
     */
    private Double calculateGrowthPercentage(Double previous, Double current) {
        if (current == null) current = 0.0;
        if (previous == null) previous = 0.0;
        
        if (previous == 0.0) {
            return current > 0.0 ? 100.0 : 0.0;
        }
        
        return ((current - previous) / previous) * 100;
    }

    /**
     * Valida los parámetros de entrada
     */
    private void validateInputs(Integer year, Integer month) {
        if (year == null || month == null) {
            throw new BusinessException("El año y mes son requeridos");
        }
        if (month < 1 || month > 12) {
            throw new BusinessException("El mes debe estar entre 1 y 12");
        }
    }

    /**
     * Busca un asesor o lanza excepción
     */
    private Adviser findAdviserOrThrow(Long adviserId) {
        return adviserRepository.findById(adviserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Asesor no encontrado: %d", adviserId)
                ));
    }
}
