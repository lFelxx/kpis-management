import { useEffect } from 'react';
import { usePredictionStore } from '../stores/prediction/prediction.store';

export function useAdviserInsights(adviserId: number, year: number, month: number) {
  const {
    adviserDetail,
    selectedAdviserId,
    fetchAdviserRisk,
    fetchAdviserClosing,
    fetchAdviserPatterns,
    fetchAdviserAnomalies,
  } = usePredictionStore();

  const isSelected = adviserId === selectedAdviserId;

  useEffect(() => {
    if (!isSelected) return;
    fetchAdviserRisk(adviserId, year, month);
    fetchAdviserClosing(adviserId, year, month);
    fetchAdviserPatterns(adviserId);
    fetchAdviserAnomalies(adviserId, year, month);
  }, [isSelected, adviserId, year, month]);

  return adviserDetail;
}
