import { create } from 'zustand';
import type { TourDefinition } from '../../components/tour/tour.types';

interface TourStore {
  active: TourDefinition | null;
  /** true cuando ya se revisó si hay un recorrido de novedades pendiente (o la revisión falló). */
  releaseChecked: boolean;
  start: (tour: TourDefinition) => void;
  close: () => void;
  markReleaseChecked: () => void;
}

export const useTourStore = create<TourStore>((set) => ({
  active: null,
  releaseChecked: false,
  start: (tour) => set({ active: tour }),
  close:  () => set({ active: null }),
  markReleaseChecked: () => set({ releaseChecked: true }),
}));
