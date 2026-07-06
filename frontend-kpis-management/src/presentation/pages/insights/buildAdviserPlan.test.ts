import { describe, it, expect } from 'vitest';
import { buildAdviserPlan } from './buildAdviserPlan';
import type { AdviserPrediction } from '../../../core/domain/Prediction/AdviserPrediction';
import type { RiskDetection } from '../../../core/domain/Prediction/RiskDetection';
import type { SalesPattern } from '../../../core/domain/Prediction/SalesPattern';

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeClosing(overrides: Partial<AdviserPrediction> = {}): AdviserPrediction {
  return {
    adviserId:               1,
    projectedSales:          8_000_000,
    projectedAchievementPct: 80,
    confidence:              'high',
    riskLevel:               'medium',
    daysRemaining:           10,
    daysInMonth:             30,
    currentSales:            6_000_000,
    fullMonthGoal:           10_000_000,
    historicalDailyRate:     300_000,
    dailySalesByDay:         [],
    methodUsed:              'linear',
    ...overrides,
  };
}

function makeRisk(overrides: Partial<RiskDetection> = {}): RiskDetection {
  return {
    adviserId:               1,
    adviserName:             'Test Adviser',
    riskScore:               0.5,
    predictedAchievementPct: 80,
    alertLevel:              'watch',
    paceRatio:               1.2,
    daysToAct:               5,
    reason:                  'Test reason',
    ...overrides,
  };
}

function makePatterns(overrides: Partial<SalesPattern> = {}): SalesPattern {
  return {
    adviserId:       1,
    bestDayOfWeek:   'tuesday',
    worstDayOfWeek:  'monday',
    bestWeekOfMonth: 2,
    overallDailyAvg: 300_000,
    dailyPattern: [
      { dayName: 'monday',    relativeStrength: 0.60, avgSales: 180_000, sampleCount: 8 },
      { dayName: 'tuesday',   relativeStrength: 1.30, avgSales: 390_000, sampleCount: 8 },
      { dayName: 'wednesday', relativeStrength: 1.15, avgSales: 345_000, sampleCount: 8 },
      { dayName: 'thursday',  relativeStrength: 1.10, avgSales: 330_000, sampleCount: 8 },
      { dayName: 'friday',    relativeStrength: 0.85, avgSales: 255_000, sampleCount: 8 },
    ],
    weeklyPattern: [
      { weekOfMonth: 1, relativeStrength: 0.90, avgSales: 270_000, sampleCount: 8 },
      { weekOfMonth: 2, relativeStrength: 1.25, avgSales: 375_000, sampleCount: 8 },
      { weekOfMonth: 3, relativeStrength: 1.05, avgSales: 315_000, sampleCount: 8 },
      { weekOfMonth: 4, relativeStrength: 0.80, avgSales: 240_000, sampleCount: 8 },
    ],
    dataMonthsUsed: 3,
    isReliable:     true,
    ...overrides,
  };
}

// ── Diagnosis ─────────────────────────────────────────────────────────────────

describe('buildAdviserPlan — diagnosis', () => {
  it('returns excellent diagnosis when pct >= 90', () => {
    const plan = buildAdviserPlan(makeClosing({ projectedAchievementPct: 95 }), null, null);
    expect(plan.diagnosis).toContain('excelente');
  });

  it('returns near-goal diagnosis when 80 <= pct < 90', () => {
    const plan = buildAdviserPlan(makeClosing({ projectedAchievementPct: 85 }), null, null);
    expect(plan.diagnosis).toContain('empuje');
  });

  it('returns recoverable diagnosis when 70 <= pct < 80', () => {
    const plan = buildAdviserPlan(makeClosing({ projectedAchievementPct: 75 }), null, null);
    expect(plan.diagnosis).toContain('Recuperable');
  });

  it('returns critical-but-recoverable diagnosis when pct < 70 and paceRatio < 2.5', () => {
    const plan = buildAdviserPlan(
      makeClosing({ projectedAchievementPct: 50 }),
      makeRisk({ paceRatio: 2.0 }),
      null,
    );
    expect(plan.diagnosis).toContain('inmediata');
  });

  it('returns hard-gap diagnosis when pct < 70 and no risk or paceRatio >= 2.5', () => {
    const plan = buildAdviserPlan(makeClosing({ projectedAchievementPct: 50 }), null, null);
    expect(plan.diagnosis).toContain('80%');
    expect(plan.diagnosis).toContain('Brecha');
  });
});

// ── gap80 / dailyNeeded ────────────────────────────────────────────────────────

describe('buildAdviserPlan — gap80 and dailyNeeded', () => {
  it('computes gap80 as goal*0.8 minus currentSales', () => {
    const plan = buildAdviserPlan(
      makeClosing({ fullMonthGoal: 10_000_000, currentSales: 6_000_000 }),
      null, null,
    );
    expect(plan.gap80).toBe(2_000_000); // 10M*0.8 - 6M = 2M
  });

  it('clamps gap80 to 0 when already above 80% threshold', () => {
    const plan = buildAdviserPlan(
      makeClosing({ fullMonthGoal: 10_000_000, currentSales: 9_000_000 }),
      null, null,
    );
    expect(plan.gap80).toBe(0);
  });

  it('sets dailyNeeded to Infinity when daysRemaining = 0', () => {
    const plan = buildAdviserPlan(
      makeClosing({ daysRemaining: 0, fullMonthGoal: 10_000_000, currentSales: 0 }),
      null, null,
    );
    expect(plan.dailyNeeded).toBe(Infinity);
  });

  it('divides gap80 by daysRemaining for dailyNeeded', () => {
    const plan = buildAdviserPlan(
      makeClosing({ fullMonthGoal: 10_000_000, currentSales: 6_000_000, daysRemaining: 10 }),
      null, null,
    );
    expect(plan.dailyNeeded).toBe(200_000);
  });
});

// ── Actions ───────────────────────────────────────────────────────────────────

describe('buildAdviserPlan — actions', () => {
  it('includes daily-target action when gap > 0 and days remain', () => {
    const plan = buildAdviserPlan(makeClosing(), null, null);
    const action = plan.actions.find(a => a.iconType === 'target');
    expect(action).toBeDefined();
    expect(action!.detail).toContain('/día');
  });

  it('includes urgency-window action when daysToAct <= 12', () => {
    const plan = buildAdviserPlan(makeClosing(), makeRisk({ daysToAct: 5 }), null);
    const action = plan.actions.find(a => a.iconType === 'clock');
    expect(action).toBeDefined();
    expect(action!.title).toContain('5 días');
  });

  it('does NOT include urgency-window action when daysToAct = 0', () => {
    const plan = buildAdviserPlan(makeClosing(), makeRisk({ daysToAct: 0 }), null);
    expect(plan.actions.find(a => a.iconType === 'clock')).toBeUndefined();
  });

  it('does NOT include urgency-window action when daysToAct > 12', () => {
    const plan = buildAdviserPlan(makeClosing(), makeRisk({ daysToAct: 15 }), null);
    expect(plan.actions.find(a => a.iconType === 'clock')).toBeUndefined();
  });

  it('includes attack-days action when strong days exist in patterns', () => {
    const plan = buildAdviserPlan(makeClosing(), null, makePatterns());
    const action = plan.actions.find(a => a.iconType === 'bolt');
    expect(action).toBeDefined();
    expect(action!.detail).toContain('%');
  });

  it('includes worst-day info action when worst day strength < 0.75', () => {
    const plan = buildAdviserPlan(makeClosing(), null, makePatterns());
    const action = plan.actions.find(a => a.iconType === 'info');
    expect(action).toBeDefined();
    expect(action!.title).toContain('Lun');
  });

  it('does NOT include worst-day info when strength >= 0.75', () => {
    const patterns = makePatterns({
      dailyPattern: [
        { dayName: 'monday', relativeStrength: 0.80, avgSales: 240_000, sampleCount: 8 },
      ],
    });
    const plan = buildAdviserPlan(makeClosing(), null, patterns);
    expect(plan.actions.find(a => a.iconType === 'info')).toBeUndefined();
  });

  it('sorts actions with critical priority first', () => {
    const plan = buildAdviserPlan(makeClosing(), makeRisk({ daysToAct: 3 }), makePatterns());
    const priorities = plan.actions.map(a => a.priority);
    const order = { critical: 0, high: 1, medium: 2, info: 3 };
    for (let i = 1; i < priorities.length; i++) {
      expect(order[priorities[i]]).toBeGreaterThanOrEqual(order[priorities[i - 1]]);
    }
  });

  it('includes trend-up action when current pace is >15% above historical', () => {
    const plan = buildAdviserPlan(
      makeClosing({
        daysInMonth:         30,
        daysRemaining:       10,  // currentDay = 20
        currentSales:        8_000_000, // pace = 400k/day
        historicalDailyRate: 300_000,   // 33% above
        projectedAchievementPct: 95,
        fullMonthGoal:       10_000_000,
      }),
      null, null,
    );
    const action = plan.actions.find(a => a.iconType === 'trend-up');
    expect(action).toBeDefined();
  });

  it('includes trend-down action when current pace is <-20% below historical', () => {
    const plan = buildAdviserPlan(
      makeClosing({
        daysInMonth:         30,
        daysRemaining:       10,  // currentDay = 20
        currentSales:        3_000_000, // pace = 150k/day
        historicalDailyRate: 300_000,   // 50% below
        projectedAchievementPct: 45,
        fullMonthGoal:       10_000_000,
      }),
      null, null,
    );
    const action = plan.actions.find(a => a.iconType === 'trend-down');
    expect(action).toBeDefined();
  });
});
