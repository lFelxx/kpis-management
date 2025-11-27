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
  loading: boolean;
  error: string | null;
}

interface AdviserMetricsActions {
  setMetrics: (metrics: DashboardMetrics) => void;
  clearMetrics: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  calculateAdviserEarnings: (sales: number) => number;
  formatCurrency: (amount: number) => string;
  calculateProgressPercentage: (current: number, goal: number) => number;
  getProgressColor: (percentage: number) => string;
  calculateWeeklyGrowth: (currentWeek: number, previousWeek: number) => number;
  formatPercentage: (value: number, decimals?: number) => string;
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
      error: null
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
      error: null
    });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  calculateAdviserEarnings: (sales: number) => {
    const IVA_RATE = 0.19; // 19%
    const COMMISSION_RATE = 0.01; // 1%
    const salesWithoutIVA = sales / (1 + IVA_RATE);
    return salesWithoutIVA * COMMISSION_RATE;
  },

  formatCurrency: (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  calculateProgressPercentage: (current: number, goal: number) => {
    if (goal <= 0) return 0;
    return Math.min((current / goal) * 100, 100);
  },

  getProgressColor: (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  },

  calculateWeeklyGrowth: (currentWeek: number, previousWeek: number) => {
    if (previousWeek <= 0) return 0;
    return ((currentWeek - previousWeek) / previousWeek) * 100;
  },

  formatPercentage: (value: number, decimals: number = 1) => {
    return `${value.toFixed(decimals)}%`;
  }
})); 