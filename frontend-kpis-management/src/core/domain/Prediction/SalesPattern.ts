export interface DayPattern {
  dayName: string;
  relativeStrength: number;
  avgSales: number;
  sampleCount: number;
}

export interface WeekPattern {
  weekOfMonth: number;
  relativeStrength: number;
  avgSales: number;
  sampleCount: number;
}

export interface SalesPattern {
  adviserId: number;
  bestDayOfWeek: string;
  worstDayOfWeek: string;
  bestWeekOfMonth: number;
  overallDailyAvg: number;
  dailyPattern: DayPattern[];
  weeklyPattern: WeekPattern[];
  dataMonthsUsed: number;
  isReliable: boolean;
}
