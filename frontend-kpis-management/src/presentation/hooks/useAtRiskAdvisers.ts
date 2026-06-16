import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../infrastructure/api/apiClient';
import { config } from '../../config/environment';
import { useReportingDateStore } from '../stores/ui/reportingDate.store';

export interface AtRiskAdviser {
  adviserId:             number;
  adviserName:           string;
  currentSales:          number;
  goal:                  number;
  projectedSales:        number;
  projectedAchievement:  number;
}

export function useAtRiskAdvisers() {
  const [atRisk, setAtRisk]   = useState<AtRiskAdviser[]>([]);
  const [loading, setLoading] = useState(true);

  const cutoffDate = useReportingDateStore((s) => s.cutoffDate);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiClient.request(
        `${config.apiUrl}/metrics/at-risk?cutoffDate=${cutoffDate}`,
        {},
        { requireAuth: true }
      );
      const data = await res.json();
      setAtRisk(Array.isArray(data) ? data : []);
    } catch {
      setAtRisk([]);
    } finally {
      setLoading(false);
    }
  }, [cutoffDate]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { atRisk, loading, refresh: fetch_ };
}
