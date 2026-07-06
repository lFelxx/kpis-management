import { ConfidenceLevel, RiskLevel } from './StoreClosingPrediction';

export interface DailySaleByDay {
  day: number;
  amount: number;
}

export interface AdviserPrediction {
  adviserId: number;
  projectedSales: number;
  projectedAchievementPct: number;
  confidence: ConfidenceLevel;
  riskLevel: RiskLevel;
  daysRemaining: number;
  daysInMonth: number;
  currentSales: number;
  fullMonthGoal: number;
  historicalDailyRate: number;
  dailySalesByDay: DailySaleByDay[];
  methodUsed: string;
}
