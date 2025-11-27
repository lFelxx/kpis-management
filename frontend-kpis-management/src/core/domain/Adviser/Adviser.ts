export interface MonthlySummary {
  id: number;
  month: number;
  year: number;
  totalSales: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Adviser {
  id: string;
  name: string;
  lastName: string;
  sales: number;
  goalValue: number;
  currentMonthSales?: number;
  active: boolean;
  monthlySummaries?: MonthlySummary[];
  upt?: string;
} 