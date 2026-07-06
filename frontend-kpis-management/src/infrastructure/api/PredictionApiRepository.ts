import {
  StoreClosingPrediction,
  AdviserProjection,
} from '../../core/domain/Prediction/StoreClosingPrediction';
import { RiskDetection } from '../../core/domain/Prediction/RiskDetection';
import { AdviserPrediction } from '../../core/domain/Prediction/AdviserPrediction';
import { SalesPattern, DayPattern, WeekPattern } from '../../core/domain/Prediction/SalesPattern';
import { SalesAnomaly, Anomaly } from '../../core/domain/Prediction/SalesAnomaly';
import { PredictionRepository } from '../../core/interfaces/repositories/PredictionRepository';
import { request } from './apiClient';

// ── Store Closing ──────────────────────────────────────────────────────────────

interface RawAdviserProjection {
  adviser_id:               number;
  adviser_name:             string;
  current_sales:            number;
  projected_sales:          number;
  projected_achievement_pct: number;
  risk_level:               string;
}

interface RawStoreClosingResponse {
  projected_store_sales:     number;
  current_store_sales:       number;
  store_goal:                number;
  projected_achievement_pct: number;
  confidence:                string;
  risk_level:                string;
  advisers_at_risk:          number;
  advisers_on_track:         number;
  adviser_projections:       RawAdviserProjection[];
}

function toAdviserProjection(raw: RawAdviserProjection): AdviserProjection {
  return {
    adviserId:               raw.adviser_id,
    adviserName:             raw.adviser_name,
    currentSales:            raw.current_sales,
    projectedSales:          raw.projected_sales,
    projectedAchievementPct: raw.projected_achievement_pct,
    riskLevel:               raw.risk_level as AdviserProjection['riskLevel'],
  };
}

function toStoreClosingPrediction(raw: RawStoreClosingResponse): StoreClosingPrediction {
  return {
    projectedStoreSales:     raw.projected_store_sales,
    currentStoreSales:       raw.current_store_sales,
    storeGoal:               raw.store_goal,
    projectedAchievementPct: raw.projected_achievement_pct,
    confidence:              raw.confidence as StoreClosingPrediction['confidence'],
    riskLevel:               raw.risk_level as StoreClosingPrediction['riskLevel'],
    advisersAtRisk:          raw.advisers_at_risk,
    advisersOnTrack:         raw.advisers_on_track,
    adviserProjections:      raw.adviser_projections.map(toAdviserProjection),
  };
}

// ── Risk Detection ─────────────────────────────────────────────────────────────

interface RawRiskDetection {
  adviser_id:               number;
  adviser_name:             string;
  risk_score:               number;
  predicted_achievement_pct: number;
  alert_level:              string;
  pace_ratio:               number;
  days_to_act:              number;
  reason:                   string;
}

function toRiskDetection(raw: RawRiskDetection): RiskDetection {
  return {
    adviserId:              raw.adviser_id,
    adviserName:            raw.adviser_name,
    riskScore:              raw.risk_score,
    predictedAchievementPct: raw.predicted_achievement_pct,
    alertLevel:             raw.alert_level as RiskDetection['alertLevel'],
    paceRatio:              raw.pace_ratio,
    daysToAct:              raw.days_to_act,
    reason:                 raw.reason,
  };
}

// ── Adviser Closing ────────────────────────────────────────────────────────────

interface RawDailySaleByDay {
  day:    number;
  amount: number;
}

interface RawAdviserPrediction {
  adviser_id:               number;
  projected_sales:          number;
  projected_achievement_pct: number;
  confidence:               string;
  risk_level:               string;
  days_remaining:           number;
  days_in_month:            number;
  current_sales:            number;
  full_month_goal:          number;
  historical_daily_rate:    number;
  daily_sales_by_day:       RawDailySaleByDay[];
  method_used:              string;
}

function toAdviserPrediction(raw: RawAdviserPrediction): AdviserPrediction {
  return {
    adviserId:               raw.adviser_id,
    projectedSales:          raw.projected_sales,
    projectedAchievementPct: raw.projected_achievement_pct,
    confidence:              raw.confidence as AdviserPrediction['confidence'],
    riskLevel:               raw.risk_level as AdviserPrediction['riskLevel'],
    daysRemaining:           raw.days_remaining,
    daysInMonth:             raw.days_in_month,
    currentSales:            raw.current_sales,
    fullMonthGoal:           raw.full_month_goal,
    historicalDailyRate:     raw.historical_daily_rate,
    dailySalesByDay:         raw.daily_sales_by_day ?? [],
    methodUsed:              raw.method_used,
  };
}

// ── Sales Pattern ──────────────────────────────────────────────────────────────

interface RawDayPattern {
  day_of_week:       string;
  relative_strength: number;
  avg_sales:         number;
  sample_count:      number;
}

interface RawWeekPattern {
  week_of_month:     number;
  relative_strength: number;
  avg_sales:         number;
  sample_count:      number;
}

interface RawSalesPattern {
  adviser_id:          number;
  best_day_of_week:    string;
  worst_day_of_week:   string;
  best_week_of_month:  number;
  overall_daily_avg:   number;
  daily_pattern:       RawDayPattern[];
  weekly_pattern:      RawWeekPattern[];
  data_months_used:    number;
  is_reliable:         boolean;
}

function toDayPattern(raw: RawDayPattern): DayPattern {
  return {
    dayName:          raw.day_of_week,
    relativeStrength: raw.relative_strength,
    avgSales:         raw.avg_sales,
    sampleCount:      raw.sample_count,
  };
}

function toWeekPattern(raw: RawWeekPattern): WeekPattern {
  return {
    weekOfMonth:      raw.week_of_month,
    relativeStrength: raw.relative_strength,
    avgSales:         raw.avg_sales,
    sampleCount:      raw.sample_count,
  };
}

function toSalesPattern(raw: RawSalesPattern): SalesPattern {
  return {
    adviserId:        raw.adviser_id,
    bestDayOfWeek:    raw.best_day_of_week,
    worstDayOfWeek:   raw.worst_day_of_week,
    bestWeekOfMonth:  raw.best_week_of_month,
    overallDailyAvg:  raw.overall_daily_avg,
    dailyPattern:     raw.daily_pattern.map(toDayPattern),
    weeklyPattern:    raw.weekly_pattern.map(toWeekPattern),
    dataMonthsUsed:   raw.data_months_used,
    isReliable:       raw.is_reliable,
  };
}

// ── Sales Anomaly ──────────────────────────────────────────────────────────────

interface RawAnomaly {
  date:           string;
  amount:         number;
  expected_amount: number;
  deviation_pct:  number;
  anomaly_type:   string;
}

interface RawSalesAnomaly {
  adviser_id:          number;
  anomalies:           RawAnomaly[];
  anomaly_count:       number;
  baseline_daily_avg:  number;
  baseline_daily_std:  number;
  detection_method:    string;
}

function toAnomaly(raw: RawAnomaly): Anomaly {
  return {
    date:           raw.date,
    amount:         raw.amount,
    expectedAmount: raw.expected_amount,
    deviationPct:   raw.deviation_pct,
    anomalyType:    raw.anomaly_type as Anomaly['anomalyType'],
  };
}

function toSalesAnomaly(raw: RawSalesAnomaly): SalesAnomaly {
  return {
    adviserId:         raw.adviser_id,
    anomalies:         raw.anomalies.map(toAnomaly),
    anomalyCount:      raw.anomaly_count,
    baselineDailyAvg:  raw.baseline_daily_avg,
    baselineDailyStd:  raw.baseline_daily_std,
    detectionMethod:   raw.detection_method,
  };
}

// ── Repository ─────────────────────────────────────────────────────────────────

export class PredictionApiRepository implements PredictionRepository {
  constructor(private readonly baseUrl: string) {}

  async getStoreClosing(year: number, month: number): Promise<StoreClosingPrediction> {
    const response = await request(
      `${this.baseUrl}/predictions/store-closing?year=${year}&month=${month}`
    );
    if (!response.ok) throw new Error('Error al obtener la proyección de cierre de tienda');
    const raw: RawStoreClosingResponse = await response.json();
    return toStoreClosingPrediction(raw);
  }

  async getAdviserRisk(adviserId: number, year: number, month: number): Promise<RiskDetection> {
    const response = await request(
      `${this.baseUrl}/predictions/risk/${adviserId}?year=${year}&month=${month}`
    );
    if (!response.ok) throw new Error('Error al obtener el riesgo del asesor');
    const raw: RawRiskDetection = await response.json();
    return toRiskDetection(raw);
  }

  async getAdviserClosing(adviserId: number, year: number, month: number): Promise<AdviserPrediction> {
    const response = await request(
      `${this.baseUrl}/predictions/closing/${adviserId}?year=${year}&month=${month}`
    );
    if (!response.ok) throw new Error('Error al obtener la proyección del asesor');
    const raw: RawAdviserPrediction = await response.json();
    return toAdviserPrediction(raw);
  }

  async getAdviserPatterns(adviserId: number): Promise<SalesPattern> {
    const response = await request(
      `${this.baseUrl}/predictions/patterns/${adviserId}`
    );
    if (!response.ok) throw new Error('Error al obtener los patrones del asesor');
    const raw: RawSalesPattern = await response.json();
    return toSalesPattern(raw);
  }

  async getAdviserAnomalies(adviserId: number, year: number, month: number): Promise<SalesAnomaly> {
    const response = await request(
      `${this.baseUrl}/predictions/anomalies/${adviserId}?year=${year}&month=${month}`
    );
    if (!response.ok) throw new Error('Error al obtener las anomalías del asesor');
    const raw: RawSalesAnomaly = await response.json();
    return toSalesAnomaly(raw);
  }
}
