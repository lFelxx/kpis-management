export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface AdviserProjection {
  adviserId: number;
  adviserName: string;
  currentSales: number;
  projectedSales: number;
  projectedAchievementPct: number;
  riskLevel: RiskLevel;
}

export interface StoreClosingPrediction {
  projectedStoreSales: number;
  currentStoreSales: number;
  storeGoal: number;
  projectedAchievementPct: number;
  confidence: ConfidenceLevel;
  riskLevel: RiskLevel;
  advisersAtRisk: number;
  advisersOnTrack: number;
  adviserProjections: AdviserProjection[];
}
