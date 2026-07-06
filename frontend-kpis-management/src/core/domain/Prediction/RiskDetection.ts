export type AlertLevel = 'safe' | 'watch' | 'warning' | 'critical';

export interface RiskDetection {
  adviserId: number;
  adviserName: string;
  riskScore: number;
  predictedAchievementPct: number;
  alertLevel: AlertLevel;
  paceRatio: number;
  daysToAct: number;
  reason: string;
}
