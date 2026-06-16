import { create } from 'zustand';
import { DashboardMetrics, BestAdviser } from '../../../core/domain/Adviser/DashboardMetrics';

interface AdviserMetricsState {
  totalSales: number;
  totalGoal: number;
  activeAdvisers: number;
  goalAchievement: number;
  averageSales: number;
  bestAdviser: BestAdviser | null;
  bestUptAdviser: BestAdviser | null;
  worstAdviser: BestAdviser | null;
  loading: boolean;
  error: string | null;
}

interface AdviserMetricsActions {
  setMetrics: (metrics: DashboardMetrics) => void;
  clearMetrics: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type AdviserMetricsStore = AdviserMetricsState & AdviserMetricsActions;

export const useAdviserMetricsStore = create<AdviserMetricsStore>((set) => ({
  totalSales: 0,
  totalGoal: 0,
  activeAdvisers: 0,
  goalAchievement: 0,
  averageSales: 0,
  bestAdviser: null,
  bestUptAdviser: null,
  worstAdviser: null,
  loading: false,
  error: null,

  setMetrics: (metrics: DashboardMetrics) => {
    set({
      totalSales: metrics.totalSales,
      totalGoal: metrics.totalGoal,
      activeAdvisers: metrics.activeAdvisers,
      goalAchievement: metrics.goalAchievement,
      averageSales: metrics.averageSales,
      bestAdviser: metrics.bestAdviser,
      bestUptAdviser: metrics.bestUptAdviser || null,
      worstAdviser: metrics.worstAdviser || null,
      error: null,
    });
  },

  clearMetrics: () => {
    set({
      totalSales: 0,
      totalGoal: 0,
      activeAdvisers: 0,
      goalAchievement: 0,
      averageSales: 0,
      bestAdviser: null,
      bestUptAdviser: null,
      worstAdviser: null,
      error: null,
    });
  },

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),
}));
