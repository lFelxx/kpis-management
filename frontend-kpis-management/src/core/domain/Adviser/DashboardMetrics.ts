export interface BestAdviser {
  adviserId: number;
  adviserName: string;
  totalSales: number;
  totalGoal: number;
  goalAchievement: number;
  upt?: number;
}

/** Ventas lun→hoy vs misma franja semana anterior; variación % sobre la franja anterior. */
export interface AdviserPartialWeekGrowthRow {
  adviserId: number;
  currentPartialWeekSales: number;
  previousPartialWeekSales: number;
  growthPercentage: number;
}

export interface DashboardMetrics {
  totalSales: number;
  totalGoal: number;
  activeAdvisers: number;
  goalAchievement: number;
  averageSales: number;
  bestAdviser: BestAdviser;
  bestUptAdviser?: BestAdviser;
  worstAdviser?: BestAdviser;
  storeCurrentPartialWeekSales?: number;
  storePreviousPartialWeekSales?: number;
  storePartialWeekGrowthPercent?: number;
  adviserPartialWeekGrowth?: AdviserPartialWeekGrowthRow[];
}