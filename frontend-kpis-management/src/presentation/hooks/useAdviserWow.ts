import { useState, useCallback } from 'react';
import { getSalesReportUseCase } from '../../core/instances/instances';

export interface AdviserWowData {
  currentWeekSales: number;
  previousWeekSales: number;
  growthPercentage: number;
  isPositive: boolean;
}

export function useAdviserWow(adviserId: string | number) {
  const [data, setData] = useState<AdviserWowData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const { advisers } = await getSalesReportUseCase.execute(now.getFullYear(), now.getMonth() + 1);
      const report = advisers.find(r => String(r.adviserId) === String(adviserId));

      if (!report || report.wowCurrentWeekSales == null) {
        setData(null);
        return;
      }

      const current = report.wowCurrentWeekSales;
      const previous = report.wowPreviousWeekSales ?? 0;
      const growth = report.wowGrowthPercentage ?? 0;

      setData({ currentWeekSales: current, previousWeekSales: previous, growthPercentage: growth, isPositive: growth >= 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar comparación semanal');
    } finally {
      setLoading(false);
    }
  }, [adviserId]);

  return { data, loading, error, fetch };
}
