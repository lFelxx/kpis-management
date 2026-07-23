import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useStoreClosing } from '../hooks/useStoreClosing';
import { usePredictionStore } from '../stores/prediction/prediction.store';
import { useSalesReportStore } from '../stores/salesReport/salesReport.store';
import { useAdviserInsights } from '../hooks/useAdviserInsights';
import { AdviserProjection, RiskLevel, StoreClosingPrediction } from '../../core/domain/Prediction/StoreClosingPrediction';
import { formatCurrency } from '../lib/format';
import { buildAdviserPlan, PlanIconType } from './insights/buildAdviserPlan';

const DAY_ES: Record<string, string> = {
  monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', thursday: 'Jue',
  friday: 'Vie', saturday: 'Sáb', sunday: 'Dom',
  lunes: 'Lun', martes: 'Mar', miércoles: 'Mié', jueves: 'Jue',
  viernes: 'Vie', sábado: 'Sáb', domingo: 'Dom',
};
function toDayEs(day: string): string {
  return DAY_ES[day?.toLowerCase()] ?? day?.slice(0, 3) ?? '?';
}

const EMERALD = '#34d399';
const CYAN    = '#22d3ee';
const AMBER   = '#fbbf24';
const RED     = '#f87171';
const ORANGE  = '#fb923c';

const DAY_NAMES_EN = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos]         = useState({ top: 0, left: 0 });
  const btnRef                = useRef<HTMLButtonElement>(null);

  const updatePos = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({
      top:  r.top - 8,
      left: r.left + r.width / 2,
    });
  };

  return (
    <span className="inline-flex items-center" style={{ verticalAlign: 'middle' }}>
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={() => { updatePos(); setVisible(true); }}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => { updatePos(); setVisible(true); }}
        onBlur={() => setVisible(false)}
        className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center cursor-help ml-1 shrink-0"
        style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)', color: 'var(--t-micro)' }}
        aria-label="Más información"
      >
        <span style={{ fontSize: 8, fontWeight: 900, lineHeight: 1 }}>?</span>
      </button>

      {visible && createPortal(
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[9999] w-52 rounded-xl px-3 py-2.5 text-[10px] leading-relaxed pointer-events-none"
          style={{
            top:       pos.top,
            left:      pos.left,
            transform: 'translate(-50%, -100%)',
            background: 'oklch(0.12 0.02 220 / 0.98)',
            border:     '1px solid oklch(1 0 0 / 0.12)',
            color:      'oklch(0.85 0.01 220)',
            boxShadow:  '0 8px 24px oklch(0 0 0 / 0.5)',
          }}
        >
          {text}
          <div
            className="absolute top-full left-1/2 w-2 h-2 rotate-45"
            style={{
              transform:   'translateX(-50%) rotate(45deg)',
              background:  'oklch(0.12 0.02 220 / 0.98)',
              border:      '1px solid oklch(1 0 0 / 0.12)',
              borderTop:   'none',
              borderLeft:  'none',
              marginTop:   -5,
            }}
          />
        </motion.div>,
        document.body
      )}
    </span>
  );
}

// ── Risk / Alert configs ──────────────────────────────────────────────────────

const RISK_ORDER: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  critical: { label: 'Crítico', color: RED,    bg: `${RED}12`    },
  high:     { label: 'Alto',    color: ORANGE, bg: `${ORANGE}12` },
  medium:   { label: 'Medio',   color: AMBER,  bg: `${AMBER}12`  },
  low:      { label: 'Bajo',    color: EMERALD,bg: `${EMERALD}12`},
};

const ALERT_CONFIG: Record<string, { label: string; color: string }> = {
  safe:     { label: 'Seguro',   color: EMERALD },
  watch:    { label: 'Vigilar',  color: AMBER   },
  warning:  { label: 'Alerta',   color: ORANGE  },
  critical: { label: 'Crítico',  color: RED     },
};

// ── SVG: Radial gauge ─────────────────────────────────────────────────────────

function RadialGauge({
  pct, color, size = 88, label,
}: { pct: number; color: string; size?: number; label?: string }) {
  const r  = size * 0.37;
  const c  = size / 2;
  const circ       = 2 * Math.PI * r;
  const arcRatio   = 240 / 360;
  const trackLen   = circ * arcRatio;
  const fillLen    = trackLen * Math.min(Math.max(pct, 0), 100) / 100;
  const rotation   = 150; // start at 7 o'clock
  const sw         = size * 0.085;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {/* Glow filter */}
      <defs>
        <filter id={`glow-${color.replace('#','')}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Track */}
      <circle
        cx={c} cy={c} r={r}
        fill="none"
        stroke={`${color}18`}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${trackLen} ${circ}`}
        style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${c}px ${c}px` }}
      />

      {/* Fill */}
      <motion.circle
        cx={c} cy={c} r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`0 ${circ}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: `${c}px ${c}px`,
          filter: `drop-shadow(0 0 4px ${color}70)`,
        }}
        animate={{ strokeDasharray: `${fillLen} ${circ}` }}
        transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
      />

      {/* Center % */}
      <text
        x={c} y={c + 4}
        textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={size * 0.19} fontWeight="900"
        fontFamily="ui-monospace, monospace" letterSpacing="-1"
      >
        {pct.toFixed(0)}%
      </text>

      {label && (
        <text
          x={c} y={c + size * 0.22}
          textAnchor="middle"
          fill={`${color}55`} fontSize={size * 0.09} fontWeight="700"
          fontFamily="system-ui" letterSpacing="1"
        >
          {label}
        </text>
      )}
    </svg>
  );
}

// ── SVG: Score bar 0→1 ───────────────────────────────────────────────────────

function ScoreBar({ score, color }: { score: number; color: string }) {
  const pct = Math.min(score, 1) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: `${color}15` }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
        />
      </div>
      <span className="text-[10px] font-black tabular-nums w-8 text-right shrink-0" style={{ color }}>
        {score.toFixed(2)}
      </span>
    </div>
  );
}

// ── SVG: Confidence meter ─────────────────────────────────────────────────────

function ConfidenceMeter({ level }: { level: string }) {
  const levels = { low: 1, medium: 2, high: 3 };
  const filled = levels[level as keyof typeof levels] ?? 1;
  const color  = filled === 3 ? EMERALD : filled === 2 ? CYAN : AMBER;
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: 16,
            background: i <= filled ? color : `${color}20`,
            boxShadow: i <= filled ? `0 0 5px ${color}60` : 'none',
          }}
        />
      ))}
      <span className="text-[10px] font-bold ml-1 capitalize" style={{ color }}>
        {level === 'low' ? 'baja' : level === 'medium' ? 'media' : 'alta'}
      </span>
    </div>
  );
}

// ── SVG: Day bar chart ────────────────────────────────────────────────────────

const LOW_SAMPLE_THRESHOLD = 4;

const BAR_CHART_H = 64;
const BAR_MAX_H   = 44; // espacio para la barra; los ~20px restantes son para el label de valor

function DayBarChart({
  days, bestDay, worstDay,
}: {
  days: { dayName: string; relativeStrength: number; avgSales: number; sampleCount: number }[];
  bestDay: string;
  worstDay: string;
}) {
  if (!days.length) return null;
  const maxStr = Math.max(...days.map(d => d.relativeStrength), 0.01);

  const baseColorFor = (d: typeof days[0]): string =>
    d.dayName?.toLowerCase() === bestDay?.toLowerCase()  ? EMERALD :
    d.dayName?.toLowerCase() === worstDay?.toLowerCase() ? RED      : CYAN;

  return (
    <div className="w-full">
      {/* Área del gráfico: altura fija, barras pegadas al fondo */}
      <div className="flex items-end gap-1" style={{ height: BAR_CHART_H }}>
        {days.map((d, i) => {
          const base        = baseColorFor(d);
          const isLowSample = d.sampleCount < LOW_SAMPLE_THRESHOLD;
          const isBest      = base === EMERALD;
          const isWorst     = base === RED;
          const barH        = Math.max((d.relativeStrength / maxStr) * BAR_MAX_H, 4);
          // base siempre es hex de 6 dígitos — appending 2 dígitos de alpha es siempre válido
          const barColor    = isLowSample ? `${base}50` : isBest || isWorst ? base : `${base}90`;
          const labelColor  = `${base}90`;

          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="text-[8px] font-black tabular-nums mb-1" style={{ color: labelColor }}>
                {(d.relativeStrength * 100).toFixed(0)}
              </div>
              <motion.div
                className="w-full rounded-t-md"
                style={{
                  background: barColor,
                  boxShadow: (isBest || isWorst) && !isLowSample ? `0 0 8px ${base}60` : 'none',
                }}
                initial={{ height: 0 }}
                animate={{ height: barH }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.07 }}
              />
            </div>
          );
        })}
      </div>

      {/* Etiquetas de día y muestra — fuera del área del gráfico */}
      <div className="flex gap-1 mt-1">
        {days.map((d, i) => {
          const base        = baseColorFor(d);
          const isLowSample = d.sampleCount < LOW_SAMPLE_THRESHOLD;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <span className="text-[9px] font-black" style={{ color: `${base}90` }}>
                {toDayEs(d.dayName)}
              </span>
              {isLowSample && (
                <span className="text-[7px] tabular-nums" style={{ color: `${AMBER}80` }} title={`Solo ${d.sampleCount} muestra${d.sampleCount !== 1 ? 's' : ''}`}>
                  {d.sampleCount}×
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SVG: Week bars ────────────────────────────────────────────────────────────

function WeekBars({ weeks, bestWeek }: { weeks: { weekOfMonth: number; relativeStrength: number; avgSales: number; sampleCount: number }[]; bestWeek: number }) {
  if (!weeks.length) return null;
  const maxStr = Math.max(...weeks.map(w => w.relativeStrength), 0.01);

  return (
    <div className="space-y-1.5">
      {weeks.map((w, i) => {
        const isBest      = w.weekOfMonth === bestWeek;
        const isLowSample = w.sampleCount < LOW_SAMPLE_THRESHOLD;
        const color       = isBest ? EMERALD : `${CYAN}70`;
        const pct         = (w.relativeStrength / maxStr) * 100;
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[9px] font-black w-14 shrink-0" style={{ color: 'var(--t-muted)' }}>
              Sem. {w.weekOfMonth}
            </span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: `${color}15` }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.1 }}
                style={{
                  background: isLowSample ? `${color}50` : color,
                  boxShadow: isBest && !isLowSample ? `0 0 6px ${color}50` : 'none',
                }}
              />
            </div>
            <span className="text-[10px] font-black tabular-nums w-10 text-right shrink-0" style={{ color: isLowSample ? `${color}60` : color }}>
              {formatCurrency(w.avgSales).replace('$ ', '$')}
            </span>
            {isLowSample && (
              <span className="text-[7px] tabular-nums shrink-0" style={{ color: `${AMBER}80` }} title={`Solo ${w.sampleCount} muestra${w.sampleCount !== 1 ? 's' : ''}`}>
                {w.sampleCount}×
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Daily bar chart (full width) ──────────────────────────────────────────────

function DailyBarChart({
  dailySales, historicalDailyRate, daysInMonth, adviserName, color,
}: {
  dailySales: { day: number; amount: number }[];
  historicalDailyRate: number;
  daysInMonth: number;
  adviserName: string;
  color: string;
}) {
  const salesMap = new Map(dailySales.map(d => [d.day, d.amount]));
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const maxVal = Math.max(historicalDailyRate * 1.6, ...dailySales.map(d => d.amount), 1);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--s-card)', border: '1px solid var(--b-subtle)' }}>
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--b-subtle)' }}>
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: `${color}70` }}>
            Ventas diarias del mes
          </div>
          <div className="font-black text-sm" style={{ color: 'var(--t-primary)' }}>{adviserName}</div>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-bold">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: color }} />
            Venta real
          </span>
          <span className="flex items-center gap-1.5" style={{ color: 'var(--t-muted)' }}>
            <span className="inline-block w-6 h-0.5 rounded" style={{ background: AMBER }} />
            Prom. histórico ({formatCurrency(historicalDailyRate)}/día)
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="px-5 py-4">
        <div className="relative" style={{ height: 140 }}>
          {/* Average line */}
          <div
            className="absolute left-0 right-0 border-t border-dashed pointer-events-none z-10"
            style={{
              top: `${100 - (historicalDailyRate / maxVal) * 100}%`,
              borderColor: `${AMBER}60`,
            }}
          />

          {/* Bars */}
          <div className="absolute inset-0 flex items-end gap-px">
            {days.map((day) => {
              const amount   = salesMap.get(day) ?? null;
              const hasData  = amount !== null;
              const barH     = hasData ? Math.max((amount! / maxVal) * 100, 2) : 0;
              const aboveAvg = hasData && amount! >= historicalDailyRate * 0.9;
              const baseColor  = !hasData ? 'transparent' : aboveAvg ? color : RED;
              const barGradient = hasData
                ? `linear-gradient(to bottom, ${baseColor}cc 0%, ${baseColor}00 100%)`
                : 'transparent';
              const topLine     = hasData ? `2px solid ${baseColor}${aboveAvg ? 'dd' : '90'}` : 'none';

              return (
                <div key={day} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  {/* Tooltip on hover */}
                  {hasData && (
                    <div
                      className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[8px] font-black whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20"
                      style={{ background: 'oklch(0.12 0.02 220 / 0.95)', color: 'oklch(0.9 0.01 220)', border: '1px solid oklch(1 0 0 / 0.1)' }}
                    >
                      Día {day}: {formatCurrency(amount!)}
                    </div>
                  )}

                  <motion.div
                    className="w-full"
                    style={{
                      background:  barGradient,
                      borderTop:   topLine,
                      boxShadow:   aboveAvg && hasData ? `0 0 6px ${color}30` : 'none',
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${barH}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: day * 0.015 }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* X axis labels */}
        <div className="flex mt-1.5 gap-px">
          {days.map((day) => (
            <div key={day} className="flex-1 text-center">
              {(day === 1 || day % 5 === 0 || day === daysInMonth) && (
                <span className="text-[7px] font-bold" style={{ color: 'var(--t-micro)' }}>{day}</span>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-[8px]" style={{ color: 'var(--t-micro)' }}>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm" style={{ background: color }} />
            Por encima del promedio
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm" style={{ background: `${RED}90` }} />
            Por debajo del promedio
          </span>
          <span className="flex items-center gap-1">
            Sin datos registrados
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Plan: sprint calendar ─────────────────────────────────────────────────────

function SprintCalendar({
  daysInMonth, currentDay, patterns,
}: {
  daysInMonth: number;
  currentDay:  number;
  patterns:    ReturnType<typeof useAdviserInsights>['patterns'];
}) {
  const strengthByDay: Record<string, number> = {};
  if (patterns) {
    for (const d of patterns.dailyPattern) {
      strengthByDay[d.dayName.toLowerCase()] = d.relativeStrength;
    }
  }

  const now       = new Date();
  const year      = now.getFullYear();
  const month     = now.getMonth();
  const firstDow  = new Date(year, month, 1).getDay(); // 0=Sun

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const colorForDay = (day: number): { bg: string; noData: boolean } => {
    const dow  = new Date(year, month, day).getDay();
    const name = DAY_NAMES_EN[dow];
    const str  = strengthByDay[name];
    if (str === undefined) return { bg: 'transparent', noData: true };
    if (str >= 1.3) return { bg: `${EMERALD}60`, noData: false };
    if (str >= 1.1) return { bg: `${CYAN}50`,    noData: false };
    if (str >= 0.9) return { bg: `${AMBER}30`,   noData: false };
    return { bg: `${RED}40`, noData: false };
  };

  const DOW_LABELS = ['D','L','M','X','J','V','S'];

  return (
    <div>
      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DOW_LABELS.map(l => (
          <div key={l} className="text-center text-[7px] font-black" style={{ color: 'var(--t-micro)' }}>{l}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const isPast    = day < currentDay;
          const isToday   = day === currentDay;
          const isFuture  = day > currentDay;
          const dayStyle  = isFuture ? colorForDay(day) : null;
          const bg        = isFuture ? (dayStyle!.noData ? 'transparent' : dayStyle!.bg) : isPast ? `${EMERALD}18` : `${EMERALD}40`;
          const border    = isToday
            ? `1px solid ${EMERALD}`
            : isFuture && dayStyle?.noData
            ? '1px dashed var(--b-subtle)'
            : '1px solid transparent';
          return (
            <motion.div
              key={day}
              initial={isFuture ? { opacity: 0, scale: 0.8 } : {}}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: isFuture ? (day - currentDay) * 0.02 : 0 }}
              className="aspect-square rounded flex items-center justify-center"
              style={{ background: bg, border, opacity: isPast ? 0.35 : 1 }}
            >
              <span
                className="text-[8px] font-black tabular-nums"
                style={{ color: isToday ? EMERALD : isFuture && dayStyle?.noData ? 'var(--t-micro)' : isFuture ? 'var(--t-secondary)' : 'var(--t-micro)' }}
              >
                {day}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {[
          { color: `${EMERALD}60`, label: 'Día fuerte', dashed: false },
          { color: `${CYAN}50`,    label: 'Buen día',   dashed: false },
          { color: `${AMBER}30`,   label: 'Normal',     dashed: false },
          { color: `${RED}40`,     label: 'Día débil',  dashed: false },
          { color: 'transparent',  label: 'Sin datos',  dashed: true  },
        ].map(({ color, label, dashed }) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-sm"
              style={{
                background: color,
                border: dashed ? '1px dashed var(--b-subtle)' : 'none',
              }}
            />
            <span className="text-[7px] font-bold" style={{ color: 'var(--t-micro)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Plan: recovery trajectory ─────────────────────────────────────────────────

function RecoveryTrajectory({
  closing,
}: {
  closing: NonNullable<ReturnType<typeof useAdviserInsights>['closing']>;
}) {
  const { currentSales, fullMonthGoal, daysRemaining, historicalDailyRate } = closing;
  const gap80        = Math.max(0, fullMonthGoal * 0.8 - currentSales);
  const dailyNeeded  = daysRemaining > 0 ? gap80 / daysRemaining : 0;

  const scenarios = [
    { label: 'Necesario',  rate: dailyNeeded,             color: AMBER  },
    { label: 'Histórico',  rate: historicalDailyRate,      color: CYAN   },
    { label: 'Meta 100%',  rate: daysRemaining > 0 ? Math.max(0, fullMonthGoal - currentSales) / daysRemaining : 0, color: EMERALD },
  ].filter(s => s.rate > 0);

  if (daysRemaining <= 0 || fullMonthGoal <= 0) return null;

  // Build trajectory points for each scenario (currentDay → daysInMonth)
  const points    = Array.from({ length: daysRemaining + 1 }, (_, i) => i);
  const AXIS_W    = 28; // left margin for Y labels
  const W         = 260;
  const H         = 120;
  const maxPct    = 115;
  const currentPct = (currentSales / fullMonthGoal) * 100;

  const toX = (i: number) => AXIS_W + (i / daysRemaining) * (W - AXIS_W);
  const toY = (pct: number) => H - (Math.min(Math.max(pct, 0), maxPct) / maxPct) * H;

  const pathFor = (rate: number) =>
    points.map((i, idx) => {
      const pct = ((currentSales + rate * i) / fullMonthGoal) * 100;
      return `${idx === 0 ? 'M' : 'L'} ${toX(idx).toFixed(1)} ${toY(pct).toFixed(1)}`;
    }).join(' ');

  const yLabels = [0, 40, 80, 100];

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 6}`} style={{ display: 'block', overflow: 'visible' }}>
        {/* Y-axis grid lines + labels */}
        {yLabels.map(pct => (
          <g key={pct}>
            <line
              x1={AXIS_W} y1={toY(pct)} x2={W} y2={toY(pct)}
              stroke="oklch(1 0 0 / 0.06)" strokeWidth="1"
            />
            <text
              x={AXIS_W - 4} y={toY(pct) + 3.5}
              textAnchor="end" fontSize="7" fontWeight="700"
              fill="oklch(0.7 0 0 / 0.5)" fontFamily="ui-monospace, monospace"
            >
              {pct}%
            </text>
          </g>
        ))}

        {/* Reference lines at 80% and 100% */}
        <line x1={AXIS_W} y1={toY(80)}  x2={W} y2={toY(80)}  stroke={`${AMBER}60`}   strokeWidth="1" strokeDasharray="4 3" />
        <line x1={AXIS_W} y1={toY(100)} x2={W} y2={toY(100)} stroke={`${EMERALD}60`} strokeWidth="1" strokeDasharray="4 3" />

        {/* Scenario paths */}
        {scenarios.map((s, i) => (
          <motion.path
            key={s.label}
            d={pathFor(s.rate)}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 3px ${s.color}60)` }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 + i * 0.15 }}
          />
        ))}

        {/* Current position dot */}
        <circle
          cx={toX(0)} cy={toY(currentPct)} r="4" fill={EMERALD}
          style={{ filter: `drop-shadow(0 0 4px ${EMERALD})` }}
        />
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-1 text-[8px] font-bold" style={{ color: 'var(--t-micro)', paddingLeft: AXIS_W }}>
        <span>Hoy</span>
        <span>Fin de mes</span>
      </div>

      {/* Legend with end % */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {scenarios.map(s => {
          const endPct = Math.min(((currentSales + s.rate * daysRemaining) / fullMonthGoal) * 100, 115);
          return (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 rounded-full" style={{ background: s.color }} />
              <span className="text-[8px] font-bold" style={{ color: 'var(--t-muted)' }}>
                {s.label} · {formatCurrency(s.rate)}/día
              </span>
              <span className="text-[8px] font-black tabular-nums" style={{ color: s.color }}>
                → {endPct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Plan: icon ────────────────────────────────────────────────────────────────

function PlanIcon({ type, size = 13, color }: { type: PlanIconType; size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      {type === 'target'     && <><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2"/><line x1="8" y1="2" x2="8" y2="4"/><line x1="8" y1="12" x2="8" y2="14"/><line x1="2" y1="8" x2="4" y2="8"/><line x1="12" y1="8" x2="14" y2="8"/></>}
      {type === 'clock'      && <><circle cx="8" cy="8" r="6"/><polyline points="8,5 8,8 10.5,10.5"/></>}
      {type === 'bolt'       && <polyline points="10,2 5,9 8.5,9 6,14 13,7 9.5,7 10,2"/>}
      {type === 'calendar'   && <><rect x="2" y="4" width="12" height="10" rx="1.5"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="5" y1="2" x2="5" y2="5"/><line x1="11" y1="2" x2="11" y2="5"/></>}
      {type === 'trend-up'   && <><polyline points="1,12 5,7 9,10 15,3"/><polyline points="11,3 15,3 15,7"/></>}
      {type === 'trend-down' && <><polyline points="1,4 5,9 9,6 15,13"/><polyline points="11,13 15,13 15,9"/></>}
      {type === 'info'       && <><circle cx="8" cy="8" r="6"/><line x1="8" y1="7" x2="8" y2="11"/><circle cx="8" cy="5" r="0.5" fill={color} stroke="none"/></>}
    </svg>
  );
}

// ── Plan: full-width section ───────────────────────────────────────────────────

function AdviserPlanSection({
  adviserId, adviserName, riskLevel, year, month, isPulsing, isOpen, onOpen,
}: {
  adviserId:   number;
  adviserName: string;
  riskLevel:   RiskLevel;
  year:        number;
  month:       number;
  isPulsing:   boolean;
  isOpen:      boolean;
  onOpen:      () => void;
}) {
  const detail      = useAdviserInsights(adviserId, year, month);
  const accentColor = RISK_CONFIG[riskLevel].color;

  const isLoading = detail.loadingClosing || detail.loadingRisk || detail.loadingPatterns;
  const closing   = detail.closing;
  const canPlan   = closing && closing.fullMonthGoal > 0 && closing.daysRemaining > 0;

  const plan       = canPlan ? buildAdviserPlan(closing!, detail.risk, detail.patterns) : null;
  const currentDay = closing ? closing.daysInMonth - closing.daysRemaining : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity:   1,
        y:         0,
        boxShadow: isPulsing
          ? [`0 0 0 0px ${accentColor}00`, `0 0 0 8px ${accentColor}55`, `0 0 0 0px ${accentColor}00`]
          : `0 0 0 0px ${accentColor}00`,
      }}
      exit={{ opacity: 0, y: 12 }}
      transition={{
        opacity:   { duration: 0.35, ease: 'easeOut' },
        y:         { duration: 0.35, ease: 'easeOut' },
        boxShadow: isPulsing ? { duration: 1.2, times: [0, 0.4, 1], ease: 'easeInOut' } : { duration: 0 },
      }}
      className="rounded-2xl mt-4"
      style={{
        background: 'var(--s-card)',
        border:     `1px solid ${isPulsing ? `${accentColor}60` : 'var(--b-subtle)'}`,
        borderTop:  `2px solid ${accentColor}${isPulsing ? 'ee' : '40'}`,
        transition: 'border-color 0.3s, border-top-color 0.3s',
        overflow:   'hidden',
      }}
    >
      {/* Header — always visible, clickable para toggle */}
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left px-4 py-3 flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3 cursor-pointer"
        style={{ borderBottom: isOpen ? '1px solid var(--b-subtle)' : 'none', background: `${accentColor}05` }}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: `${accentColor}70` }}>
            Plan de acción
          </div>
          <div className="font-black text-sm truncate" style={{ color: 'var(--t-primary)' }}>{adviserName}</div>
        </div>

        {/* Diagnosis badge (cuando hay datos) */}
        {plan && !isLoading && (
          <div
            className="text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 max-w-[220px] text-center truncate"
            style={{ color: plan.diagnosisColor, background: `${plan.diagnosisColor}10`, border: `1px solid ${plan.diagnosisColor}25` }}
          >
            {plan.diagnosis}
          </div>
        )}

        {/* Chevron animado */}
        <motion.svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          stroke={`${accentColor}80`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="shrink-0"
        >
          <polyline points="2,5 7,10 12,5" />
        </motion.svg>
      </button>

      {/* Body — animado con altura */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="plan-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.25 } }}
            style={{ overflow: 'hidden' }}
          >

      {/* Body content */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 space-y-3 animate-pulse" style={{ borderBottom: i < 2 ? '1px solid var(--b-subtle)' : 'none' }}>
              {[70, 50, 80, 40].map((w, j) => (
                <div key={j} className="h-3 rounded-lg" style={{ width: `${w}%`, background: 'var(--s-subtle)' }} />
              ))}
            </div>
          ))}
        </div>
      )}

      {!isLoading && !canPlan && (
        <div className="flex flex-col items-center gap-3 py-12">
          <RadarIdle />
          <span className="text-sm font-bold" style={{ color: 'var(--t-muted)' }}>
            {!closing || closing.fullMonthGoal === 0
              ? 'Meta no configurada para este mes'
              : 'El mes ya cerró — el plan aplica para meses activos'}
          </span>
        </div>
      )}

      {!isLoading && canPlan && plan && closing && (
        <div className="grid grid-cols-1 md:grid-cols-3">

          {/* ── Col 1: KPIs + acciones ── */}
          <div className="p-4 space-y-4" style={{ borderBottom: '1px solid var(--b-subtle)' }}>

            {/* KPI tiles */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Brecha al 80%',  value: plan.gap80 > 0 ? formatCurrency(plan.gap80) : 'Cubierta',                        color: plan.gap80 > 0 ? AMBER : EMERALD },
                { label: 'Meta por día',   value: closing.daysRemaining > 0 ? formatCurrency(plan.dailyNeeded) : 'N/A',             color: plan.actions[0]?.color ?? AMBER },
                { label: 'Días restantes', value: String(closing.daysRemaining),                                                     color: closing.daysRemaining <= 7 ? RED : 'var(--t-primary)' },
                { label: 'Ritmo histórico',value: formatCurrency(closing.historicalDailyRate) + '/día',                              color: CYAN },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl px-3 py-2.5" style={{ background: 'var(--s-subtle)' }}>
                  <div className="text-[8px] font-black uppercase tracking-wide mb-0.5" style={{ color: 'var(--t-micro)' }}>{label}</div>
                  <div className="text-xs font-black tabular-nums truncate" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Action list */}
            <div>
              <div className="text-[8px] font-black uppercase tracking-[0.25em] mb-1" style={{ color: 'var(--t-micro)' }}>
                Acciones
              </div>
              <div>
                {plan.actions.map((action, i) => {
                  const isVar    = action.color === 'var(--t-muted)';
                  const hexColor = isVar ? '#888888' : action.color;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: 0.1 + i * 0.06 }}
                      className="flex items-start gap-2.5 py-2.5"
                      style={{ borderBottom: i < plan.actions.length - 1 ? '1px solid var(--b-subtle)' : 'none' }}
                    >
                      <div className="mt-0.5 shrink-0">
                        <PlanIcon type={action.iconType} color={hexColor} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black leading-tight mb-0.5" style={{ color: isVar ? 'var(--t-muted)' : action.color }}>
                          {action.title}
                        </div>
                        <div className="text-[9px] leading-snug" style={{ color: 'var(--t-secondary)' }}>
                          {action.detail}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Col 2: trayectoria ── */}
          <div className="p-4 flex flex-col" style={{ borderBottom: '1px solid var(--b-subtle)' }}>
            <div className="text-[8px] font-black uppercase tracking-[0.25em] mb-0.5 flex items-center" style={{ color: 'var(--t-micro)' }}>
              Trayectoria de recuperación
              <Tooltip text="Cómo evolucionaría tu % de cumplimiento hasta fin de mes según tres escenarios de venta diaria." />
            </div>
            <div className="text-[10px] mb-3" style={{ color: 'var(--t-muted)' }}>
              Proyección desde hoy al cierre del mes
            </div>
            <div className="flex-1 rounded-xl px-3 py-3" style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}>
              <RecoveryTrajectory closing={closing} />
            </div>
          </div>

          {/* ── Col 3: calendario ── */}
          <div className="p-4 flex flex-col" style={{ borderBottom: '1px solid transparent' }}>
            <div className="text-[8px] font-black uppercase tracking-[0.25em] mb-0.5 flex items-center" style={{ color: 'var(--t-micro)' }}>
              Calendario de sprint
              <Tooltip text="Días restantes coloreados por fuerza histórica. Verde oscuro = días fuertes para concentrar tus mejores gestiones." />
            </div>
            <div className="text-[10px] mb-3" style={{ color: 'var(--t-muted)' }}>
              {closing.daysRemaining} días disponibles este mes
            </div>
            <div className="flex-1 rounded-xl px-3 py-3" style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}>
              <SprintCalendar
                daysInMonth={closing.daysInMonth}
                currentDay={currentDay}
                patterns={detail.patterns}
              />
            </div>
          </div>

        </div>
      )}

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Simulator tab ─────────────────────────────────────────────────────────────

function SimulatorTab({ detail }: { detail: ReturnType<typeof useAdviserInsights> }) {
  const closing = detail.closing;

  const historicalRate = closing?.historicalDailyRate ?? 0;
  const currentSales   = closing?.currentSales ?? 0;
  const daysRemaining  = closing?.daysRemaining ?? 0;
  const fullMonthGoal  = closing?.fullMonthGoal ?? 0;

  const [dailyRate, setDailyRate] = useState<number>(historicalRate);

  useEffect(() => {
    if (historicalRate > 0) setDailyRate(historicalRate);
  }, [historicalRate]);

  if (detail.loadingClosing) return <TabSkeleton />;
  if (!closing || fullMonthGoal === 0 || daysRemaining === 0) {
    return <TabEmpty label="Se necesitan ventas y meta para simular" />;
  }

  const sliderMax     = Math.max(historicalRate * 3, dailyRate * 1.5, 1);
  const simProjected  = currentSales + dailyRate * daysRemaining;
  const simPct        = fullMonthGoal > 0 ? (simProjected / fullMonthGoal) * 100 : 0;
  const simColor      = simPct >= 100 ? EMERALD : simPct >= 80 ? CYAN : simPct >= 70 ? AMBER : RED;
  const salesNeeded   = Math.max(0, fullMonthGoal * 0.8 - currentSales);
  const daysToReach80 = dailyRate > 0 ? Math.ceil(salesNeeded / dailyRate) : null;

  const paceVsHistorical = historicalRate > 0 ? dailyRate / historicalRate : 1;

  return (
    <div className="space-y-5">
      {/* Result hero */}
      <div
        className="rounded-2xl px-4 py-4 text-center"
        style={{ background: `${simColor}0a`, border: `1px solid ${simColor}20` }}
      >
        <div className="text-[9px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: `${simColor}70` }}>
          Cierre proyectado
        </div>
        <motion.div
          key={simPct.toFixed(0)}
          initial={{ scale: 0.9, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-3xl font-black tabular-nums"
          style={{ color: simColor }}
        >
          {simPct.toFixed(1)}%
        </motion.div>
        <div className="text-[10px] mt-1 font-bold" style={{ color: 'var(--t-muted)' }}>
          {formatCurrency(simProjected)} de {formatCurrency(fullMonthGoal)}
        </div>
      </div>

      {/* Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--t-micro)' }}>
            Ventas diarias
          </span>
          <span className="text-[11px] font-black tabular-nums" style={{ color: simColor }}>
            {formatCurrency(dailyRate)}/día
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={sliderMax}
          step={sliderMax / 200}
          value={dailyRate}
          onChange={e => setDailyRate(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${simColor} ${(dailyRate / sliderMax) * 100}%, var(--s-subtle) 0%)`,
            accentColor: simColor,
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[8px]" style={{ color: 'var(--t-micro)' }}>$0</span>
          <span className="text-[8px]" style={{ color: 'var(--t-micro)' }}>{formatCurrency(sliderMax)}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--s-subtle)' }}>
          <div className="text-[8px] font-black uppercase tracking-wide mb-0.5" style={{ color: 'var(--t-micro)' }}>
            vs. ritmo histórico
          </div>
          <div className="text-sm font-black" style={{ color: paceVsHistorical >= 1 ? EMERALD : AMBER }}>
            {paceVsHistorical.toFixed(2)}×
          </div>
        </div>
        <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--s-subtle)' }}>
          <div className="text-[8px] font-black uppercase tracking-wide mb-0.5" style={{ color: 'var(--t-micro)' }}>
            Días para llegar al 80%
          </div>
          <div className="text-sm font-black" style={{ color: daysToReach80 !== null && daysToReach80 <= daysRemaining ? EMERALD : RED }}>
            {daysToReach80 === null ? '∞' : daysToReach80 > daysRemaining ? `>${daysRemaining}` : daysToReach80}
          </div>
        </div>
      </div>

      {/* Threshold markers */}
      <div className="space-y-1.5">
        {[
          { label: 'Meta completa (100%)', val: fullMonthGoal,        color: EMERALD },
          { label: 'Mínimo aceptable (80%)', val: fullMonthGoal * 0.8, color: AMBER  },
          { label: 'Ritmo histórico',        val: historicalRate,      color: CYAN, isRate: true },
        ].map(({ label, val, color, isRate }) => {
          const rateForThis = isRate ? val : fullMonthGoal > 0 && daysRemaining > 0
            ? Math.max(0, val - currentSales) / daysRemaining
            : 0;
          const active = isRate
            ? Math.abs(dailyRate - val) < sliderMax * 0.02
            : Math.abs(dailyRate - rateForThis) < sliderMax * 0.02;
          return (
            <button
              key={label}
              onClick={() => setDailyRate(isRate ? val : rateForThis)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 text-left"
              style={{
                background: active ? `${color}12` : 'transparent',
                border: `1px solid ${active ? `${color}30` : 'transparent'}`,
              }}
            >
              <span className="text-[9px] font-bold" style={{ color: active ? color : 'var(--t-muted)' }}>{label}</span>
              <span className="text-[9px] font-black tabular-nums" style={{ color }}>
                {formatCurrency(isRate ? val : rateForThis)}/día
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Risk badge ────────────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: RiskLevel }) {
  const cfg = RISK_CONFIG[level];
  return (
    <span
      className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full shrink-0"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30` }}
    >
      {cfg.label}
    </span>
  );
}

// ── Store breakdown: coverage + ranking ───────────────────────────────────────

function StoreBreakdown({ storeClosing }: { storeClosing: StoreClosingPrediction }) {
  const { adviserProjections, storeGoal, projectedStoreSales } = storeClosing;

  const ranked = useMemo(
    () => [...adviserProjections].sort((a, b) => b.projectedSales - a.projectedSales),
    [adviserProjections],
  );

  const gap          = storeGoal - projectedStoreSales;
  const isAboveGoal  = projectedStoreSales >= storeGoal;
  const gapColor     = isAboveGoal ? EMERALD : gap > storeGoal * 0.25 ? RED : AMBER;
  const coveragePct  = storeGoal > 0 ? Math.min((projectedStoreSales / storeGoal) * 100, 100) : 0;

  // Floor scenario: what if every adviser at-risk hits at least 80% of their implied goal
  const floorTotal = ranked.reduce((sum, a) => {
    if (a.projectedAchievementPct >= 80 || a.projectedAchievementPct <= 0) {
      return sum + a.projectedSales;
    }
    const impliedGoal = (a.projectedSales / a.projectedAchievementPct) * 100;
    return sum + impliedGoal * 0.8;
  }, 0);
  const floorPct  = storeGoal > 0 ? Math.min((floorTotal / storeGoal) * 100, 100) : 0;
  const floorGap  = storeGoal - floorTotal;
  const floorReachesGoal = floorTotal >= storeGoal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
      className="rounded-2xl mb-4"
      style={{ background: 'var(--s-card)', border: '1px solid var(--b-subtle)' }}
    >
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--b-subtle)' }}>
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: `${CYAN}70` }}>
            Análisis de tienda
          </div>
          <div className="font-black text-sm" style={{ color: 'var(--t-primary)' }}>
            Cobertura colectiva de meta
          </div>
        </div>
        <div
          className="text-[10px] font-black px-2.5 py-1 rounded-full tabular-nums"
          style={{ color: gapColor, background: `${gapColor}12`, border: `1px solid ${gapColor}25` }}
        >
          {isAboveGoal ? '+' : '-'}{formatCurrency(Math.abs(gap))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-5">

        {/* ── Coverage bars ── */}
        <div className="space-y-3">

          {/* Current trajectory */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--t-micro)' }}>
                Trayectoria actual
              </span>
              <span className="text-[9px] font-black tabular-nums" style={{ color: gapColor }}>
                {coveragePct.toFixed(1)}% de la meta
              </span>
            </div>
            <div className="relative h-5 rounded-full overflow-hidden flex gap-px" style={{ background: 'var(--s-subtle)' }}>
              {ranked.map((a, i) => {
                const segPct = projectedStoreSales > 0 ? (a.projectedSales / projectedStoreSales) * coveragePct : 0;
                const color  = RISK_CONFIG[a.riskLevel].color;
                return (
                  <motion.div
                    key={a.adviserId}
                    className="h-full relative"
                    title={`${a.adviserName}: ${formatCurrency(a.projectedSales)}`}
                    style={{ background: color, boxShadow: `inset 0 1px 0 ${color}60` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${segPct}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 + i * 0.1 }}
                  />
                );
              })}
              {/* Goal marker at 100% */}
              <div
                className="absolute top-0 bottom-0 w-px pointer-events-none"
                style={{
                  right: 0,
                  background: 'oklch(0.95 0 0 / 0.6)',
                  boxShadow: '0 0 4px oklch(0.95 0 0 / 0.4)',
                }}
              />
            </div>
          </div>

          {/* Floor scenario */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-1" style={{ color: 'var(--t-micro)' }}>
                Si rezagados alcanzan 80%
                <Tooltip text="Escenario conservador: asesores por debajo del 80% de cumplimiento asumen exactamente ese umbral. Los que ya superan el 80% mantienen su proyección actual." />
              </span>
              <span
                className="text-[9px] font-black tabular-nums"
                style={{ color: floorReachesGoal ? EMERALD : AMBER }}
              >
                {floorPct.toFixed(1)}% de la meta
              </span>
            </div>
            <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--s-subtle)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${floorPct}%` }}
                transition={{ duration: 1.0, ease: 'easeOut', delay: 0.5 }}
                style={{
                  background: floorReachesGoal
                    ? `linear-gradient(90deg, ${EMERALD}80, ${CYAN}80)`
                    : `linear-gradient(90deg, ${AMBER}80, ${AMBER}50)`,
                  boxShadow: floorReachesGoal ? `0 0 6px ${EMERALD}40` : 'none',
                }}
              />
            </div>
            <div className="mt-1 text-[8px]" style={{ color: 'var(--t-micro)' }}>
              {floorReachesGoal
                ? `Excedente mínimo: +${formatCurrency(Math.abs(floorGap))}`
                : `Aún faltarían: ${formatCurrency(Math.abs(floorGap))}`}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {ranked.map((a) => {
              const color = RISK_CONFIG[a.riskLevel].color;
              return (
                <div key={a.adviserId} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: color }} />
                  <span className="text-[8px] font-bold" style={{ color: 'var(--t-muted)' }}>
                    {a.adviserName.split(' ')[0]}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center gap-1 ml-auto">
              <div className="w-4 h-px" style={{ background: 'oklch(0.85 0 0 / 0.6)' }} />
              <span className="text-[8px] font-bold" style={{ color: 'var(--t-micro)' }}>Meta</span>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

// ── Store summary bar ─────────────────────────────────────────────────────────

function StoreSummaryBar({ year, month }: { year: number; month: number }) {
  const { storeClosing, loading } = useStoreClosing(year, month);

  if (loading) {
    return <div className="h-24 rounded-2xl animate-pulse mb-6" style={{ background: 'var(--s-subtle)' }} />;
  }
  if (!storeClosing) return null;

  const pct        = storeClosing.projectedAchievementPct;
  const gaugeColor = pct >= 80 ? EMERALD : pct >= 60 ? AMBER : RED;

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-5 py-4 md:px-6 md:py-5 flex flex-wrap items-center gap-5 mb-6"
      style={{
        background: 'oklch(0.13 0.025 210 / 0.95)',
        border: `1px solid ${EMERALD}20`,
        boxShadow: `0 0 0 1px ${EMERALD}08, 0 4px 24px oklch(0 0 0 / 0.25)`,
      }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 40% 100% at 0% 50%, ${EMERALD}10 0%, transparent 60%)`,
      }} />

      {/* Gauge */}
      <div className="relative z-10 shrink-0">
        <RadialGauge pct={pct} color={gaugeColor} size={72} label="META" />
      </div>

      {/* Sales amounts */}
      <div className="relative z-10 shrink-0 flex flex-col gap-1">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.3em] mb-0.5" style={{ color: `${EMERALD}70` }}>
            Vendido hasta hoy
          </div>
          <div className="text-xl font-black leading-tight" style={{ color: 'oklch(0.95 0.04 210)' }}>
            {formatCurrency(storeClosing.currentStoreSales)}
          </div>
        </div>
        <div className="h-px w-full" style={{ background: `${EMERALD}15` }} />
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.3em] mb-0.5" style={{ color: `${CYAN}70` }}>
            Proyección de cierre
          </div>
          <div className="text-base font-black leading-tight" style={{ color: CYAN }}>
            {formatCurrency(storeClosing.projectedStoreSales)}
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--t-micro)' }}>
            meta {formatCurrency(storeClosing.storeGoal)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 flex-1 min-w-[140px]">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: `${gaugeColor}15` }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }}
            style={{ background: `linear-gradient(90deg, ${gaugeColor}, ${CYAN})`, boxShadow: `0 0 8px ${gaugeColor}50` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 flex items-center gap-4 shrink-0">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xl font-black tabular-nums" style={{ color: storeClosing.advisersAtRisk > 0 ? ORANGE : EMERALD }}>
            {storeClosing.advisersAtRisk}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-wide" style={{ color: 'oklch(1 0 0 / 0.35)' }}>
            En riesgo
          </span>
        </div>
        <div className="w-px h-8" style={{ background: `${EMERALD}20` }} />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xl font-black tabular-nums" style={{ color: EMERALD }}>
            {storeClosing.advisersOnTrack}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-wide" style={{ color: 'oklch(1 0 0 / 0.35)' }}>
            En ritmo
          </span>
        </div>
        <div className="w-px h-8" style={{ background: `${EMERALD}20` }} />
        <RiskBadge level={storeClosing.riskLevel} />
      </div>
    </div>
  );
}

// ── Adviser row ───────────────────────────────────────────────────────────────

function AdviserRow({
  adviser, isSelected, onClick,
}: { adviser: AdviserProjection; isSelected: boolean; onClick: () => void }) {
  const cfg = RISK_CONFIG[adviser.riskLevel];
  const pct = adviser.projectedAchievementPct;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer"
      style={{
        background: isSelected ? `${EMERALD}0d` : 'transparent',
        border: `1px solid ${isSelected ? `${EMERALD}35` : 'transparent'}`,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Color strip */}
      <div className="w-1 self-stretch rounded-full shrink-0"
        style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}50` }} />

      {/* Name + bars */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-bold text-sm truncate" style={{ color: 'var(--t-primary)' }}>
            {adviser.adviserName}
          </span>
          <RiskBadge level={adviser.riskLevel} />
        </div>
        {/* Achievement bar */}
        <div className="flex items-center gap-1.5 mb-1">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: `${cfg.color}15` }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ background: cfg.color }}
            />
          </div>
          <span className="text-[9px] font-black tabular-nums w-7 text-right" style={{ color: cfg.color }}>
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Projected amount */}
      <div className="text-right shrink-0">
        <div className="text-xs font-black" style={{ color: 'var(--t-primary)' }}>
          {formatCurrency(adviser.projectedSales)}
        </div>
        <div className="text-[9px]" style={{ color: 'var(--t-micro)' }}>proyectado</div>
      </div>

      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
        style={{ color: isSelected ? EMERALD : 'var(--t-micro)', flexShrink: 0 }}>
        <path d="M3 1.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.button>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────

type DetailTab = 'closing' | 'patterns' | 'simulator';

function AdviserDetailPanel({
  adviserId, adviserName, year, month, onClose, onScrollToPlan,
}: { adviserId: number; adviserName: string; year: number; month: number; onClose: () => void; onScrollToPlan: () => void }) {
  const [activeTab, setActiveTab] = useState<DetailTab>('closing');
  const detail = useAdviserInsights(adviserId, year, month);
  const { reports } = useSalesReportStore();
  const starReport = reports.find(r => r.adviserId === adviserId);
  const starProductSku = starReport?.starProductSku ?? null;
  const starProductQty = starReport?.starProductQty ?? null;

  const tabs: { key: DetailTab; label: string }[] = [
    { key: 'closing',   label: 'Proyección' },
    { key: 'patterns',  label: 'Patrones'   },
    { key: 'simulator', label: 'Simulador'  },
  ];

  return (
    <motion.div
      key={adviserId}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--s-card)', border: '1px solid var(--b-subtle)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--b-subtle)', background: `${EMERALD}06` }}
      >
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: `${EMERALD}70` }}>
            Análisis individual
          </div>
          <div className="font-black text-sm" style={{ color: 'var(--t-primary)' }}>{adviserName}</div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
          style={{ color: 'var(--t-muted)', background: 'var(--s-subtle)' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-3 pt-3 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all duration-200"
            style={{
              color:      activeTab === tab.key ? EMERALD : 'var(--t-muted)',
              background: activeTab === tab.key ? `${EMERALD}15` : 'transparent',
              border:     `1px solid ${activeTab === tab.key ? `${EMERALD}30` : 'transparent'}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'closing' && (
            <motion.div key="closing"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <ClosingTab detail={detail} />
            </motion.div>
          )}
          {activeTab === 'patterns' && (
            <motion.div key="patterns"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <PatternsTab detail={detail} starProductSku={starProductSku} starProductQty={starProductQty} />
            </motion.div>
          )}
          {activeTab === 'simulator' && (
            <motion.div key="simulator"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <SimulatorTab detail={detail} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ghost button → scroll to plan */}
      <div className="px-4 pb-4">
        <motion.button
          onClick={onScrollToPlan}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] cursor-pointer flex items-center justify-center gap-2"
          style={{
            color:      `${EMERALD}90`,
            background: `${EMERALD}08`,
            border:     `1px solid ${EMERALD}20`,
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background    = `${EMERALD}14`;
            (e.currentTarget as HTMLButtonElement).style.borderColor   = `${EMERALD}40`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background    = `${EMERALD}08`;
            (e.currentTarget as HTMLButtonElement).style.borderColor   = `${EMERALD}20`;
          }}
        >
          Plan de acción
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,4 6,8 10,4" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Tab: Closing ──────────────────────────────────────────────────────────────

function ClosingTab({ detail }: { detail: ReturnType<typeof useAdviserInsights> }) {
  if (detail.loadingClosing || detail.loadingRisk) return <TabSkeleton />;
  if (!detail.closing && !detail.risk) return <TabEmpty label="No hay proyección disponible" />;

  const closing = detail.closing;
  const risk    = detail.risk;
  const pct     = closing?.projectedAchievementPct ?? 0;
  const gaugeColor = pct >= 80 ? EMERALD : pct >= 60 ? AMBER : RED;
  const alertCfg = ALERT_CONFIG[risk?.alertLevel ?? 'safe'];

  return (
    <div className="space-y-4">

      {/* Gauge hero */}
      {closing && (
        <div className="flex items-center gap-4">
          <RadialGauge pct={pct} color={gaugeColor} size={88} label="CUMPL." />
          <div className="flex-1">
            <div className="text-[9px] font-black uppercase tracking-[0.25em] mb-0.5" style={{ color: 'var(--t-micro)' }}>
              Vendido hasta hoy
            </div>
            <div className="text-base font-black leading-tight" style={{ color: 'var(--t-primary)' }}>
              {formatCurrency(closing.currentSales)}
            </div>
            <div className="text-[9px] font-black uppercase tracking-[0.25em] mt-2 mb-0.5" style={{ color: 'var(--t-micro)' }}>
              Proyección de cierre
            </div>
            <div className="text-lg font-black leading-tight" style={{ color: gaugeColor }}>
              {formatCurrency(closing.projectedSales)}
            </div>
            <div className="mt-2">
              <div className="text-[9px] mb-1 flex items-center" style={{ color: 'var(--t-micro)' }}>
                Confianza
                <Tooltip text="Qué tan fiable es la proyección según el historial disponible. Alta = más datos históricos. Baja = pocos meses de referencia." />
              </div>
              <ConfidenceMeter level={closing.confidence} />
            </div>
            <div className="mt-2 text-[9px]" style={{ color: 'var(--t-muted)' }}>
              {closing.daysRemaining === 0
                ? 'Mes cerrado'
                : `${closing.daysRemaining} días restantes`}
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px" style={{ background: 'var(--b-subtle)' }} />

      {/* Risk section */}
      {risk && (
        <div className="space-y-3">
          {/* Alert badge */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] flex items-center" style={{ color: 'var(--t-micro)' }}>
              Nivel de alerta
              <Tooltip text="Clasificación del riesgo según la proyección de ventas al cierre del mes. Seguro ≥90%, Vigilar ≥80%, Alerta ≥70%, Crítico <70%." />
            </span>
            <span
              className="text-[10px] font-black px-2.5 py-0.5 rounded-full"
              style={{
                color: alertCfg.color,
                background: `${alertCfg.color}15`,
                border: `1px solid ${alertCfg.color}30`,
              }}
            >
              {alertCfg.label}
            </span>
          </div>

          {/* Risk score bar */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center" style={{ color: 'var(--t-micro)' }}>
                Score de riesgo
                <Tooltip text="Índice de 0.0 a 1.0 que combina qué tan difícil es recuperar la meta (60%) y qué tan lejos está de ella (40%). 0.0 = sin riesgo, 1.0 = riesgo máximo." />
              </span>
            </div>
            <ScoreBar score={risk.riskScore} color={alertCfg.color} />
          </div>

          {/* Pace ratio */}
          <div className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--b-subtle)' }}>
            <span className="text-[10px] font-bold flex items-center" style={{ color: 'var(--t-muted)' }}>
              Pace ratio
              <Tooltip text="Cuántas veces más rápido debe vender el asesor para llegar al 80% de la meta. 1.0× = a su ritmo actual llega justo. 2.0× = necesita doblar su ritmo, casi imposible." />
            </span>
            <span className="text-[11px] font-black" style={{ color: risk.paceRatio >= 99 ? 'var(--t-micro)' : alertCfg.color }}>
              {risk.paceRatio >= 99 ? 'N/A' : `${risk.paceRatio.toFixed(2)}×`}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--b-subtle)' }}>
            <span className="text-[10px] font-bold flex items-center" style={{ color: 'var(--t-muted)' }}>
              Días para actuar
              <Tooltip text="Días disponibles antes de que sea matemáticamente imposible recuperar el 80% de la meta, asumiendo que el asesor puede vender máximo el doble de su ritmo histórico." />
            </span>
            <span className="text-[11px] font-black" style={{ color: risk.daysToAct <= 2 ? RED : 'var(--t-primary)' }}>
              {risk.daysToAct}
            </span>
          </div>

          {/* Reason */}
          {risk.reason && (
            <div
              className="px-3 py-2.5 rounded-xl text-[10px] leading-relaxed"
              style={{ background: `${alertCfg.color}08`, border: `1px solid ${alertCfg.color}18`, color: 'var(--t-secondary)' }}
            >
              {risk.reason}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab: Patterns ─────────────────────────────────────────────────────────────

function PatternsTab({ detail, starProductSku, starProductQty }: { detail: ReturnType<typeof useAdviserInsights>; starProductSku?: string | null; starProductQty?: number | null }) {
  if (detail.loadingPatterns) return <TabSkeleton />;
  if (!detail.patterns) return <TabEmpty label="No hay patrones disponibles" />;

  const p = detail.patterns;

  return (
    <div className="space-y-5">
      {/* Summary chips */}
      <div className="grid grid-cols-2 gap-2">
        <StatChip label="Mejor día"    value={toDayEs(p.bestDayOfWeek)}         color={EMERALD} />
        <StatChip label="Peor día"     value={toDayEs(p.worstDayOfWeek)}        color={RED}     />
        <StatChip label="Mejor semana" value={`Semana ${p.bestWeekOfMonth}`}    color={CYAN}    />
        <StatChip label="Prom. diario" value={formatCurrency(p.overallDailyAvg)} color={AMBER}  />
      </div>

      {/* Star product */}
      {starProductSku && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl p-4"
          style={{
            background: 'linear-gradient(120deg, #051a10 0%, #04120b 55%, #0d0d0d 100%)',
            border: `1px solid ${EMERALD}40`,
            boxShadow: `0 0 0 1px ${EMERALD}06, inset 0 1px 0 ${EMERALD}20`,
          }}
        >
          {/* Top glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 80% 55% at 50% -15%, ${EMERALD}14 0%, transparent 70%)`,
          }} />
          <div className="absolute top-0 inset-x-0 h-px" style={{
            background: `linear-gradient(90deg, transparent 10%, ${EMERALD}50 50%, transparent 90%)`,
          }} />

          <div className="relative z-10 flex items-center gap-3">
            {/* Star icon */}
            <motion.div
              animate={{ rotate: [0, 12, -12, 6, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${EMERALD}22, ${EMERALD}08)`,
                border: `1px solid ${EMERALD}45`,
                boxShadow: `0 0 12px ${EMERALD}30`,
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2.5l2.6 5.3 5.9.85-4.25 4.15 1 5.87L12 15.8l-5.25 2.77 1-5.87L3.5 8.65l5.9-.85z"
                  fill={EMERALD} stroke={EMERALD} strokeWidth="0.6" strokeLinejoin="round"
                />
              </svg>
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-[8px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: `${EMERALD}70` }}>
                Producto estrella del mes
              </div>
              <div
                className="font-mono text-base font-black leading-tight"
                style={{ color: EMERALD, textShadow: `0 0 18px ${EMERALD}50` }}
              >
                {starProductSku}
              </div>
              {starProductQty != null && (
                <div className="text-[9px] font-bold mt-0.5" style={{ color: `${EMERALD}80` }}>
                  {starProductQty} uds. vendidas
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Day bar chart */}
      {p.dailyPattern.length > 0 && (
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.25em] mb-3 flex items-center" style={{ color: 'var(--t-micro)' }}>
            Fuerza relativa por día
            <Tooltip text="Qué tan productivo es cada día de la semana comparado con el promedio. 100 = promedio normal. Por encima = días fuertes, por debajo = días débiles." />
          </div>
          <DayBarChart
            days={p.dailyPattern.map(d => ({ dayName: d.dayName, relativeStrength: d.relativeStrength, avgSales: d.avgSales, sampleCount: d.sampleCount }))}
            bestDay={p.bestDayOfWeek}
            worstDay={p.worstDayOfWeek}
          />
        </div>
      )}

      {/* Week bars */}
      {p.weeklyPattern.length > 0 && (
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.25em] mb-2 flex items-center" style={{ color: 'var(--t-micro)' }}>
            Rendimiento por semana del mes
            <Tooltip text="Promedio de ventas por semana del mes según el historial. Útil para anticipar en qué semana suele rendir más el asesor." />
          </div>
          <WeekBars
            weeks={p.weeklyPattern.map(w => ({ weekOfMonth: w.weekOfMonth, relativeStrength: w.relativeStrength, avgSales: w.avgSales, sampleCount: w.sampleCount }))}
            bestWeek={p.bestWeekOfMonth}
          />
        </div>
      )}

      {!p.isReliable && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold"
          style={{ background: `${AMBER}10`, color: AMBER, border: `1px solid ${AMBER}20` }}>
          <FaExclamationTriangle size={10} />
          {p.dataMonthsUsed} mes{p.dataMonthsUsed !== 1 ? 'es' : ''} de datos — patrón no confiable aún
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="px-3 py-2 rounded-xl" style={{ background: `${color}0a`, border: `1px solid ${color}18` }}>
      <div className="text-[8px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: `${color}70` }}>{label}</div>
      <div className="text-xs font-black truncate" style={{ color }}>{value}</div>
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-full" style={{ background: 'var(--s-subtle)' }} />
        <div className="flex-1 space-y-2 pt-2">
          <div className="h-4 rounded-lg w-3/4" style={{ background: 'var(--s-subtle)' }} />
          <div className="h-3 rounded-lg w-1/2" style={{ background: 'var(--s-subtle)' }} />
          <div className="h-3 rounded-lg w-2/3" style={{ background: 'var(--s-subtle)' }} />
        </div>
      </div>
      {[80, 60, 70, 50].map((w, i) => (
        <div key={i} className="h-4 rounded-lg" style={{ background: 'var(--s-subtle)', width: `${w}%` }} />
      ))}
    </div>
  );
}

function RadarIdle() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {[28, 20, 12].map((r) => (
        <circle key={r} cx="32" cy="32" r={r} stroke={`${EMERALD}14`} strokeWidth="1" />
      ))}
      {[0, 45, 90, 135].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line key={deg}
            x1={32 + 28 * Math.cos(rad)} y1={32 + 28 * Math.sin(rad)}
            x2={32 - 28 * Math.cos(rad)} y2={32 - 28 * Math.sin(rad)}
            stroke={`${EMERALD}14`} strokeWidth="1" />
        );
      })}
      <polyline points="8,44 16,38 24,41 32,33 40,36 48,29 56,32"
        fill="none" stroke={`${EMERALD}20`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="2" fill={`${EMERALD}30`} />
    </svg>
  );
}

function TabEmpty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <RadarIdle />
      <span className="text-[11px] font-bold" style={{ color: 'var(--t-muted)' }}>{label}</span>
    </div>
  );
}

// ── Weekly top product widget ─────────────────────────────────────────────────


function WeeklyTopProductWidget({ sku, qty }: { sku: string; qty: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.22 }}
      className="relative overflow-hidden rounded-2xl mb-4"
      style={{
        background: 'linear-gradient(110deg, #051a10 0%, #04120b 60%, #0d0d0d 100%)',
        border: `1px solid ${EMERALD}40`,
        boxShadow: `0 0 0 1px ${EMERALD}08, 0 8px 40px #00000055, inset 0 1px 0 ${EMERALD}20`,
      }}
    >
      {/* Left glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 40% 140% at -8% 50%, ${EMERALD}18 0%, transparent 65%)`,
      }} />
      {/* Top shimmer */}
      <div className="absolute top-0 inset-x-0 h-px" style={{
        background: `linear-gradient(90deg, transparent 5%, ${EMERALD}50 35%, ${EMERALD}50 65%, transparent 95%)`,
      }} />

      <div className="relative z-10 flex items-center gap-4 px-5 py-4">

        {/* Icon block */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <motion.div
            animate={{ boxShadow: [`0 0 8px ${EMERALD}30`, `0 0 22px ${EMERALD}60`, `0 0 8px ${EMERALD}30`] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${EMERALD}28, ${EMERALD}0a)`,
              border: `1px solid ${EMERALD}50`,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2.5l2.6 5.3 5.9.85-4.25 4.15 1 5.87L12 15.8l-5.25 2.77 1-5.87L3.5 8.65l5.9-.85z"
                fill={EMERALD} stroke={EMERALD} strokeWidth="0.6" strokeLinejoin="round"
              />
            </svg>
          </motion.div>
          <span className="text-[7px] font-black uppercase tracking-widest" style={{ color: `${EMERALD}80` }}>
            Semana
          </span>
        </div>

        {/* SKU */}
        <div className="flex-1 min-w-0">
          <div className="text-[8px] font-black uppercase tracking-[0.35em] mb-1.5" style={{ color: `${EMERALD}70` }}>
            Top producto de la semana · Tienda
          </div>
          <div
            className="font-mono text-xl font-black tracking-tight leading-none"
            style={{ color: EMERALD, textShadow: `0 0 28px ${EMERALD}55` }}
          >
            {sku}
          </div>
        </div>

        {/* Qty badge */}
        <div
          className="shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl"
          style={{ background: `${EMERALD}0e`, border: `1px solid ${EMERALD}28` }}
        >
          <span className="text-2xl font-black tabular-nums leading-none" style={{ color: EMERALD }}>
            {qty}
          </span>
          <span className="text-[7px] font-black uppercase tracking-widest mt-0.5" style={{ color: `${EMERALD}70` }}>
            uds
          </span>
        </div>

      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const InsightsPage = () => {
  const now          = useMemo(() => new Date(), []);
  const currentYear  = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const monthName    = now.toLocaleString('es-CO', { month: 'long' });

  const { storeClosing, loading } = useStoreClosing(currentYear, currentMonth);
  const { selectedAdviserId, selectAdviser, adviserDetail } = usePredictionStore();
  const { summary, fetchReports } = useSalesReportStore();

  useEffect(() => { fetchReports(currentYear, currentMonth); }, [currentYear, currentMonth]);

  const noGoal   = storeClosing !== null && storeClosing.storeGoal === 0;
  const noSales  = storeClosing !== null && storeClosing.projectedStoreSales === 0;
  const notReady = noGoal || noSales;

  const planRef              = useRef<HTMLDivElement>(null);
  const [isPulsing, setIsPulsing]   = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);

  // Colapsar el plan al cambiar de asesor
  useEffect(() => { setIsPlanOpen(false); }, [selectedAdviserId]);

  const handleScrollToPlan = useCallback(() => {
    setIsPlanOpen(true);
    // Dar un tick para que el DOM se expanda antes de scrollear
    setTimeout(() => {
      planRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 1400);
      }, 600);
    }, 50);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const sortedAdvisers = useMemo(() => {
    if (!storeClosing || notReady) return [];
    return [...storeClosing.adviserProjections].sort(
      (a, b) => RISK_ORDER.indexOf(a.riskLevel) - RISK_ORDER.indexOf(b.riskLevel)
    );
  }, [storeClosing, notReady]);

  const selectedAdviser = sortedAdvisers.find(a => a.adviserId === selectedAdviserId) ?? null;

  const handleSelectAdviser = (adviser: AdviserProjection) => {
    selectAdviser(selectedAdviserId === adviser.adviserId ? null : adviser.adviserId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }} className="mb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: EMERALD }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: EMERALD }} />
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.35em]" style={{ color: `${EMERALD}80` }}>
            Análisis estadístico · Estadísticas predictivas
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--t-primary)' }}>
          Inteligencia de ventas
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--t-muted)' }}>
          Proyecciones para el mes actual · {now.toLocaleString('es-CO', { month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Store summary */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <StoreSummaryBar year={currentYear} month={currentMonth} />
      </motion.div>

      {/* Store breakdown */}
      {!loading && storeClosing && !notReady && storeClosing.adviserProjections.length > 0 && (
        <StoreBreakdown storeClosing={storeClosing} />
      )}

      {/* Weekly top product */}
      {summary?.weeklyTopProductSku && summary.weeklyTopProductQty != null && (
        <WeeklyTopProductWidget sku={summary.weeklyTopProductSku} qty={summary.weeklyTopProductQty} />
      )}

      {/* Not-ready notice */}
      {!loading && notReady && (
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="rounded-2xl px-5 py-5 mb-4 flex gap-4 items-start"
          style={{ background: 'oklch(0.13 0.025 210 / 0.95)', border: `1px solid ${AMBER}30` }}
        >
          <FaExclamationTriangle size={18} style={{ color: AMBER, flexShrink: 0, marginTop: 2 }} />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-black" style={{ color: AMBER }}>
              {noGoal ? `Meta de ${monthName} no configurada` : `Sin ventas registradas en ${monthName}`}
            </span>
            <span className="text-xs leading-relaxed" style={{ color: 'var(--t-muted)' }}>
              {noGoal
                ? `Configura la meta de ${monthName} en la sección de asesores para activar las proyecciones.`
                : `Sube el primer CSV de ${monthName} para calcular el ritmo de ventas y proyectar el cierre.`}
            </span>
          </div>
        </motion.div>
      )}

      {/* Main grid */}
      <div className={`grid gap-4 ${selectedAdviser ? 'md:grid-cols-[1fr_390px]' : 'grid-cols-1'}`}>

        {/* Risk matrix */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--s-card)', border: '1px solid var(--b-subtle)' }}
        >
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--b-subtle)' }}>
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: `${EMERALD}70` }}>
                Matriz de riesgo
              </div>
              <div className="font-black text-sm" style={{ color: 'var(--t-primary)' }}>Todos los asesores</div>
            </div>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
              style={{ background: `${EMERALD}12`, color: EMERALD, border: `1px solid ${EMERALD}25` }}>
              {sortedAdvisers.length} asesores
            </span>
          </div>

          <div className="p-2">
            {loading && (
              <div className="space-y-2 p-2 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl" style={{ background: 'var(--s-subtle)' }} />
                ))}
              </div>
            )}

            {!loading && sortedAdvisers.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-12">
                <RadarIdle />
                <span className="text-sm font-bold" style={{ color: 'var(--t-muted)' }}>
                  {notReady ? `Pendiente de datos de ${monthName}` : 'Sin datos de proyección'}
                </span>
              </div>
            )}

            {sortedAdvisers.map((adviser) => (
              <AdviserRow
                key={adviser.adviserId}
                adviser={adviser}
                isSelected={selectedAdviserId === adviser.adviserId}
                onClick={() => handleSelectAdviser(adviser)}
              />
            ))}
          </div>
        </motion.div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedAdviser && (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <AdviserDetailPanel
                adviserId={selectedAdviser.adviserId}
                adviserName={selectedAdviser.adviserName}
                year={currentYear}
                month={currentMonth}
                onClose={() => selectAdviser(null)}
                onScrollToPlan={handleScrollToPlan}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Plan section — full-width, below grid */}
      <AnimatePresence>
        {selectedAdviser && (
          <div ref={planRef}>
            <AdviserPlanSection
              key={selectedAdviser.adviserId}
              adviserId={selectedAdviser.adviserId}
              adviserName={selectedAdviser.adviserName}
              riskLevel={selectedAdviser.riskLevel}
              year={currentYear}
              month={currentMonth}
              isPulsing={isPulsing}
              isOpen={isPlanOpen}
              onOpen={() => setIsPlanOpen(o => !o)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Daily bar chart — visible when adviser selected */}
      <AnimatePresence>
        {selectedAdviser && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mt-4"
          >
            {adviserDetail.loadingClosing && (
              <div className="h-48 rounded-2xl animate-pulse" style={{ background: 'var(--s-card)' }} />
            )}
            {!adviserDetail.loadingClosing && adviserDetail.closing && adviserDetail.closing.daysInMonth > 0 && (
              <DailyBarChart
                dailySales={adviserDetail.closing.dailySalesByDay}
                historicalDailyRate={adviserDetail.closing.historicalDailyRate}
                daysInMonth={adviserDetail.closing.daysInMonth}
                adviserName={selectedAdviser.adviserName}
                color={RISK_CONFIG[selectedAdviser.riskLevel].color}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
