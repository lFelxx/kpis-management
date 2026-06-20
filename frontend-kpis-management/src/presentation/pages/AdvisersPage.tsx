import React, { useMemo, useEffect } from 'react';
import { useAdvisersStore } from '../stores/advisers/advisers.store';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useReportingDateStore } from '../stores/ui/reportingDate.store';
import FeaturedAdvisersSection from '../components/adviser/sections/FeaturedAdvisersSection';
import AdvisersPerformanceChart from '../components/adviser/sections/AdvisersPerformanceChart';
import AdvisersListSection from '../components/adviser/sections/AdvisersListSection';
import { AdviserTableSkeleton } from '../components/skeletons/SkeletonLoader';

export const AdvisersPage: React.FC = () => {
  const { advisers, loading: advisersLoading, error: advisersError, fetchAdvisers } = useAdvisersStore();
  const {
    bestAdviser,
    worstAdviser,
    loading: metricsLoading,
    error: metricsError,
    fetchMetrics
  } = useDashboardMetrics();

  const cutoffDate = useReportingDateStore((s) => s.cutoffDate);

  useEffect(() => {
    fetchAdvisers(cutoffDate);
    fetchMetrics();
  }, [fetchAdvisers, fetchMetrics, cutoffDate]);

  const sortedAdvisers = useMemo(() => {
    return [...advisers].sort((a, b) => b.sales - a.sales);
  }, [advisers]);

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

  const worstAdviserAsAdviser = worstAdviser ? {
    id: worstAdviser.adviserId.toString(),
    name: worstAdviser.adviserName.split(' ')[0] || worstAdviser.adviserName,
    lastName: worstAdviser.adviserName.split(' ').slice(1).join(' ') || '',
    sales: worstAdviser.totalSales,
    goalValue: worstAdviser.totalGoal,
    active: true,
    currentMonthSales: worstAdviser.totalSales,
    monthlySummaries: [],
    upt: worstAdviser.upt?.toString() || ''
  } : null;

  const loading = advisersLoading || metricsLoading;
  const error = advisersError || metricsError;

  if (error) {
    return (
      <div className="p-8 bg-destructive/10 rounded-lg border border-destructive/30">
        <h3 className="text-destructive font-semibold mb-2">Error</h3>
        <p className="text-destructive/80">{error}</p>
        <button
          onClick={() => {
            fetchAdvisers(cutoffDate);
            fetchMetrics();
          }}
          className="mt-4 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-background min-h-screen space-y-8">
        {/* Skeleton de cards destacados — 2 tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-[1.4rem] p-6"
              style={{ background: 'var(--s-card)', border: '1px solid var(--b-line)', height: 160 }}
            />
          ))}
        </div>
        {/* Skeleton del gráfico de barras */}
        <div
          className="animate-pulse rounded-[1.4rem]"
          style={{ background: 'var(--s-card)', border: '1px solid var(--b-line)', height: 480 }}
        />
        {/* Skeleton de la tabla de asesores */}
        <AdviserTableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen space-y-8">
      <FeaturedAdvisersSection bestAdviser={bestAdviserAsAdviser} worstAdviser={worstAdviserAsAdviser} />
      <AdvisersPerformanceChart advisers={sortedAdvisers} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AdvisersListSection advisers={sortedAdvisers} />
      </div>
    </div>
  );
};
