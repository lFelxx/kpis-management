import React, { useMemo, useEffect } from 'react';
import { useAdvisersStore } from '../stores/advisers/advisers.store';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import FeaturedAdvisersSection from './adviser/sections/FeaturedAdvisersSection';
import AdvisersPerformanceChart from './adviser/sections/AdvisersPerformanceChart';
import AdvisersListSection from './adviser/sections/AdvisersListSection';

export const AdviserList: React.FC = () => {
  const { advisers, loading: advisersLoading, error: advisersError, fetchAdvisers } = useAdvisersStore();
  const { 
    bestAdviser, 
    loading: metricsLoading, 
    error: metricsError, 
    fetchMetrics 
  } = useDashboardMetrics();

  useEffect(() => {
    fetchAdvisers();
    fetchMetrics(); // Obtener métricas del backend
  }, [fetchAdvisers]); // Removido fetchMetrics de las dependencias

  const sortedAdvisers = useMemo(() => {
    return [...advisers].sort((a, b) => b.sales - a.sales);
  }, [advisers]);

  // Usar el worstAdviser calculado localmente (no viene del backend)
  const worstAdviser = sortedAdvisers.length > 0 ? sortedAdvisers[sortedAdvisers.length - 1] : null;

  // Convertir BestAdviser a Adviser para compatibilidad con FeaturedAdvisersSection
  const bestAdviserAsAdviser = bestAdviser ? {
    id: bestAdviser.adviserId.toString(),
    name: bestAdviser.adviserName.split(' ')[0] || bestAdviser.adviserName,
    lastName: bestAdviser.adviserName.split(' ').slice(1).join(' ') || '',
    sales: bestAdviser.totalSales,
    goalValue: bestAdviser.totalGoal,
    active: true,
    currentMonthSales: bestAdviser.totalSales,
    monthlySummaries: [],
    upt: bestAdviser.upt?.toString() || ''
  } : null;

  // Estados combinados
  const loading = advisersLoading || metricsLoading;
  const error = advisersError || metricsError;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => {
            fetchAdvisers();
            fetchMetrics();
          }}
          className="mt-4 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen space-y-8">
      <FeaturedAdvisersSection bestAdviser={bestAdviserAsAdviser} worstAdviser={worstAdviser}/>
      <AdvisersPerformanceChart advisers={sortedAdvisers}/>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AdvisersListSection advisers={sortedAdvisers}/>
      </div>
    </div>
  );
};