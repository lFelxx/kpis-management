export interface DailyDistribution {
  id: number;
  date: string;
  weightPercentage: number;
  dailyAmount: number;
  adviserCount: number;
  goalPerAdviser: number;
  manualOverride: boolean;
}

export interface BudgetTemplate {
  id: number;
  year: number;
  month: number;
  totalBudget: number;
  distributedBudget: number;
  uploadedAt: string;
  days: DailyDistribution[];
}
