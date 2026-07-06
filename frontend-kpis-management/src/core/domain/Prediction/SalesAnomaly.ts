export type AnomalyType = 'missing_data' | 'unusually_high' | 'unusually_low';

export interface Anomaly {
  date: string;
  amount: number;
  expectedAmount: number;
  deviationPct: number;
  anomalyType: AnomalyType;
}

export interface SalesAnomaly {
  adviserId: number;
  anomalies: Anomaly[];
  anomalyCount: number;
  baselineDailyAvg: number;
  baselineDailyStd: number;
  detectionMethod: string;
}
