import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../infrastructure/api/apiClient';
import { config } from '../../config/environment';

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

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiClient.request(`${config.apiUrl}/metrics/at-risk`, {}, { requireAuth: true });
      const data = await res.json();
      setAtRisk(Array.isArray(data) ? data : []);
    } catch {
      setAtRisk([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { atRisk, loading, refresh: fetch_ };
}
