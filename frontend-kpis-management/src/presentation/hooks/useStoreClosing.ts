import { useEffect } from 'react';
import { usePredictionStore } from '../stores/prediction/prediction.store';

export function useStoreClosing(year: number, month: number) {
  const { storeClosing, loading, error, fetchStoreClosing } = usePredictionStore();

  useEffect(() => {
    fetchStoreClosing(year, month);
  }, [year, month, fetchStoreClosing]);

  return { storeClosing, loading, error };
}
