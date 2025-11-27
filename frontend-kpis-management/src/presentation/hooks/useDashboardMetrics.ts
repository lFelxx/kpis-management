import { useEffect } from 'react';
import { useAdvisersStore } from '../stores/advisers/advisers.store';
import { useAdviserMetricsStore } from '../stores/advisers/adviserMetrics.store';

export const useDashboardMetrics = () => {
  const { 
    metrics: backendMetrics, 
    loading: backendLoading, 
    error: backendError,
    fetchDashboardMetrics 
  } = useAdvisersStore();

  const { 
    totalSales, 
    totalGoal, 
    activeAdvisers, 
    goalAchievement, 
    averageSales, 
    bestAdviser,
    bestUptAdviser,
    loading: metricsLoading,
    error: metricsError,
    setMetrics, 
    setLoading, 
    setError,
    formatCurrency,
    calculateAdviserEarnings,
    calculateProgressPercentage,
    getProgressColor,
    calculateWeeklyGrowth,
    formatPercentage
  } = useAdviserMetricsStore();

  // Sincronizar métricas del backend con el store de métricas
  useEffect(() => {
    if (backendMetrics) {
      setMetrics(backendMetrics);
    }
  }, [backendMetrics]); // Removido setMetrics de las dependencias

  // Sincronizar estados de loading y error
  useEffect(() => {
    setLoading(backendLoading);
  }, [backendLoading]); // Removido setLoading de las dependencias

  useEffect(() => {
    setError(backendError);
  }, [backendError]); // Removido setError de las dependencias

  // Función helper para obtener fecha actual
  const getCurrentDate = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1 // getMonth() devuelve 0-11, necesitamos 1-12
    };
  };

  // Función wrapper que automáticamente usa la fecha actual
  const fetchCurrentMetrics = async () => {
    const { year, month } = getCurrentDate();
    return fetchDashboardMetrics(year, month);
  };

  return {
    // Métricas calculadas
    totalSales,
    totalGoal,
    activeAdvisers,
    goalAchievement,
    averageSales,
    bestAdviser,
    bestUptAdviser,
    
    // Estados
    loading: backendLoading || metricsLoading,
    error: backendError || metricsError,
    
    // Acciones
    fetchMetrics: fetchCurrentMetrics, // Usa fecha actual automáticamente
    fetchMetricsForDate: fetchDashboardMetrics, // Para casos específicos
    
    // Utilidades
    formatCurrency,
    calculateAdviserEarnings,
    calculateProgressPercentage,
    getProgressColor,
    calculateWeeklyGrowth,
    formatPercentage,
    getCurrentDate,
    
    // Métricas del backend (para comparación o debug)
    backendMetrics
  };
};
