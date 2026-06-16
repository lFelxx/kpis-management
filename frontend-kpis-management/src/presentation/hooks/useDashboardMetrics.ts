import { useCallback } from 'react';
import { useAdvisersStore } from '../stores/advisers/advisers.store';

export const useDashboardMetrics = () => {
    const {
        metrics: backendMetrics,
        loading,
        error,
        fetchDashboardMetrics,
    } = useAdvisersStore();

    const fetchMetrics = useCallback(() => {
        const now = new Date();
        return fetchDashboardMetrics(now.getFullYear(), now.getMonth() + 1);
    }, [fetchDashboardMetrics]);

    return {
        totalSales:                    backendMetrics?.totalSales        ?? 0,
        totalGoal:                     backendMetrics?.totalGoal         ?? 0,
        activeAdvisers:                backendMetrics?.activeAdvisers    ?? 0,
        goalAchievement:               backendMetrics?.goalAchievement   ?? 0,
        averageSales:                  backendMetrics?.averageSales      ?? 0,
        bestAdviser:                   backendMetrics?.bestAdviser       ?? null,
        bestUptAdviser:                backendMetrics?.bestUptAdviser    ?? null,
        worstAdviser:                  backendMetrics?.worstAdviser      ?? null,
        storePartialWeekGrowthPercent: backendMetrics?.storePartialWeekGrowthPercent,
        adviserPartialWeekGrowth:      backendMetrics?.adviserPartialWeekGrowth,
        loading,
        error,
        fetchMetrics,
        fetchMetricsForDate: fetchDashboardMetrics,
    };
};
