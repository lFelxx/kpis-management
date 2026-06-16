import { useCallback } from 'react';
import { useAdvisersStore } from '../stores/advisers/advisers.store';
import { useReportingDateStore } from '../stores/ui/reportingDate.store';

export const useDashboardMetrics = () => {
    const {
        metrics: backendMetrics,
        loading,
        error,
        fetchDashboardMetrics,
    } = useAdvisersStore();

    const cutoffDate = useReportingDateStore((s) => s.cutoffDate);

    const fetchMetrics = useCallback(() => {
        const date = new Date(cutoffDate + 'T00:00:00');
        return fetchDashboardMetrics(date.getFullYear(), date.getMonth() + 1, cutoffDate);
    }, [fetchDashboardMetrics, cutoffDate]);

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
    };
};
