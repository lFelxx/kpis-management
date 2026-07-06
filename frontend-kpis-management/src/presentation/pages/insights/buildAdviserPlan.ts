import { AdviserPrediction } from '../../../core/domain/Prediction/AdviserPrediction';
import { RiskDetection } from '../../../core/domain/Prediction/RiskDetection';
import { SalesPattern } from '../../../core/domain/Prediction/SalesPattern';
import { formatCurrency } from '../../lib/format';

const EMERALD = '#34d399';
const CYAN    = '#22d3ee';
const AMBER   = '#fbbf24';
const RED     = '#f87171';
const ORANGE  = '#fb923c';

const DAY_ES: Record<string, string> = {
  monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', thursday: 'Jue',
  friday: 'Vie', saturday: 'Sáb', sunday: 'Dom',
  lunes: 'Lun', martes: 'Mar', miércoles: 'Mié', jueves: 'Jue',
  viernes: 'Vie', sábado: 'Sáb', domingo: 'Dom',
};

function toDayEs(day: string): string {
  return DAY_ES[day?.toLowerCase()] ?? day?.slice(0, 3) ?? '?';
}

export type PlanIconType = 'target' | 'clock' | 'bolt' | 'calendar' | 'trend-up' | 'trend-down' | 'info';

export interface PlanAction {
  iconType: PlanIconType;
  title:    string;
  detail:   string;
  color:    string;
  priority: 'critical' | 'high' | 'medium' | 'info';
}

export interface AdviserPlan {
  diagnosis:      string;
  diagnosisColor: string;
  gap80:          number;
  dailyNeeded:    number;
  actions:        PlanAction[];
}

export function buildAdviserPlan(
  closing:  AdviserPrediction,
  risk:     RiskDetection | null,
  patterns: SalesPattern | null,
): AdviserPlan {
  const { currentSales, fullMonthGoal, daysRemaining, daysInMonth, historicalDailyRate, projectedAchievementPct } = closing;
  const currentDay = daysInMonth - daysRemaining;

  const gap80       = Math.max(0, fullMonthGoal * 0.8 - currentSales);
  const dailyNeeded = daysRemaining > 0 ? gap80 / daysRemaining : Infinity;
  const pct         = projectedAchievementPct;

  const diagnosis      = pct >= 90 ? 'En excelente ritmo — solo mantener el paso.'
    : pct >= 80 ? 'Muy cerca de la meta — un empuje final la cierra.'
    : pct >= 70 ? 'Recuperable — requiere subir el ritmo en las próximas semanas.'
    : risk && risk.paceRatio < 2.5 ? 'Situación crítica pero recuperable — acción inmediata requerida.'
    : 'Brecha difícil de cerrar — foco total en llegar al 80% mínimo.';

  const diagnosisColor = pct >= 90 ? EMERALD : pct >= 80 ? CYAN : pct >= 70 ? AMBER : pct >= 55 ? ORANGE : RED;

  const actions: PlanAction[] = [];

  if (gap80 > 0 && daysRemaining > 0) {
    const mult = historicalDailyRate > 0 ? dailyNeeded / historicalDailyRate : null;
    actions.push({
      iconType: 'target',
      title:    'Objetivo diario mínimo',
      detail:   `${formatCurrency(dailyNeeded)}/día para llegar al 80%${mult ? ` — ${mult.toFixed(1)}× tu ritmo histórico` : ''}.`,
      color:    dailyNeeded > historicalDailyRate * 2 ? RED : dailyNeeded > historicalDailyRate * 1.2 ? AMBER : EMERALD,
      priority: dailyNeeded > historicalDailyRate * 2 ? 'critical' : 'high',
    });
  }

  if (risk && risk.daysToAct > 0 && risk.daysToAct <= 12) {
    actions.push({
      iconType: 'clock',
      title:    `Ventana de acción: ${risk.daysToAct} día${risk.daysToAct !== 1 ? 's' : ''}`,
      detail:   `Pasado el día ${currentDay + risk.daysToAct} del mes es matemáticamente imposible recuperar el 80%, incluso duplicando el ritmo.`,
      color:    risk.daysToAct <= 3 ? RED : ORANGE,
      priority: 'critical',
    });
  }

  if (patterns) {
    const strongDays = patterns.dailyPattern
      .filter(d => d.relativeStrength > 1.08)
      .sort((a, b) => b.relativeStrength - a.relativeStrength)
      .slice(0, 3);

    if (strongDays.length > 0) {
      const names = strongDays.map(d => toDayEs(d.dayName)).join(', ');
      const best  = strongDays[0];
      actions.push({
        iconType: 'bolt',
        title:    'Días de ataque',
        detail:   `Vendes un ${((best.relativeStrength - 1) * 100).toFixed(0)}% más los ${names}. Concentra tus mejores gestiones esos días.`,
        color:    CYAN,
        priority: 'high',
      });
    }

    const worstDay = patterns.dailyPattern.find(d => d.dayName.toLowerCase() === patterns.worstDayOfWeek.toLowerCase());
    if (worstDay && worstDay.relativeStrength < 0.75) {
      actions.push({
        iconType: 'info',
        title:    `${toDayEs(patterns.worstDayOfWeek)}: buen momento para trabajo interno o operatividad`,
        detail:   `Rendimiento del ${(worstDay.relativeStrength * 100).toFixed(0)}% del promedio. Ideal para seguimiento y preparación de propuestas.`,
        color:    'var(--t-muted)',
        priority: 'info',
      });
    }

    const bestWeekData = patterns.weeklyPattern.find(w => w.weekOfMonth === patterns.bestWeekOfMonth);
    if (bestWeekData) {
      const currentWeek    = Math.ceil(currentDay / 7);
      const isInBestWeek   = currentWeek === patterns.bestWeekOfMonth;
      const weeksRemaining = Math.ceil(daysRemaining / 7);
      const bestWeekAhead  = patterns.bestWeekOfMonth > currentWeek && weeksRemaining > 0;
      actions.push({
        iconType: 'calendar',
        title:    isInBestWeek
          ? `Semana ${patterns.bestWeekOfMonth} — tu semana fuerte, es ahora`
          : `Semana ${patterns.bestWeekOfMonth} es tu semana más productiva`,
        detail: isInBestWeek
          ? `Promedias ${formatCurrency(bestWeekData.avgSales)} en esta semana. Empuja al máximo.`
          : bestWeekAhead
          ? `Prepara tus mejores propuestas para esa semana — ahí es cuando más cierras.`
          : `Ya pasó tu semana más fuerte este mes. Compensa con consistencia diaria.`,
        color:    isInBestWeek ? EMERALD : CYAN,
        priority: isInBestWeek ? 'critical' : 'medium',
      });
    }
  }

  if (currentDay >= 4 && historicalDailyRate > 0) {
    const currentPace = currentSales / currentDay;
    const momentumPct = (currentPace / historicalDailyRate - 1) * 100;
    if (momentumPct > 15) {
      actions.push({
        iconType: 'trend-up',
        title:    'Ritmo por encima del histórico',
        detail:   `${formatCurrency(currentPace)}/día este mes vs ${formatCurrency(historicalDailyRate)}/día histórico — ${momentumPct.toFixed(0)}% más rápido. Mantén ese ritmo.`,
        color:    EMERALD,
        priority: 'info',
      });
    } else if (momentumPct < -20) {
      actions.push({
        iconType: 'trend-down',
        title:    'Ritmo por debajo del histórico',
        detail:   `${formatCurrency(currentSales / currentDay)}/día vs ${formatCurrency(historicalDailyRate)}/día histórico. Necesitas acelerar para compensar.`,
        color:    AMBER,
        priority: 'high',
      });
    }
  }

  const priorityOrder: Record<PlanAction['priority'], number> = { critical: 0, high: 1, medium: 2, info: 3 };
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return { diagnosis, diagnosisColor, gap80, dailyNeeded, actions };
}
