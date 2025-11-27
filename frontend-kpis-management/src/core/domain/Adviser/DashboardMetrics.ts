export interface BestAdviser {
  adviserId: number;
  adviserName: string;
  totalSales: number;
  totalGoal: number;
  goalAchievement: number;
  upt?: number;
}

export interface DashboardMetrics {
  totalSales: number;
  totalGoal: number;
  activeAdvisers: number;
  goalAchievement: number;
  averageSales: number;
  bestAdviser: BestAdviser;
  bestUptAdviser?: BestAdviser;
}