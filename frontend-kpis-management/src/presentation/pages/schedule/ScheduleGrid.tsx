import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { WeeklySchedule, ScheduleSlot, DAY_LABELS, grossMinutes, formatTotalWithLunch } from '../../../core/domain/Schedule/Schedule';
import { Brush } from './ShiftBrushBar';

interface Props {
  schedule: WeeklySchedule;
  weekDates: string[];
  brushes: Brush[];
  activeBrush: Brush | null;
  onCellClick: (slot: ScheduleSlot) => void;
}

// 6am–midnight = 18h window for the time bar
const SPAN_START = 6;
const SPAN = 18;

// ─── Warning parsing ────────────────────────────────────────────────────────

interface ParsedWarnings {
  byDay: Map<number, string[]>;     // dayOfWeek (1-7) → messages
  byAdviser: Map<string, string[]>; // adviserName → messages
}

function parseWarnings(warnings: string[]): ParsedWarnings {
  const byDay = new Map<number, string[]>();
  const byAdviser = new Map<string, string[]>();

  for (const w of warnings) {
    const dayMatch = w.match(/^Día (\d+):\s*/);
    if (dayMatch) {
      const day = parseInt(dayMatch[1]);
      const msg = w.replace(/^Día \d+:\s*/, '');
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(msg);
    } else {
      const colonIdx = w.indexOf(':');
      if (colonIdx > 0) {
        const name = w.substring(0, colonIdx).trim();
        const msg = w.substring(colonIdx + 1).trim();
        if (!byAdviser.has(name)) byAdviser.set(name, []);
        byAdviser.get(name)!.push(msg);
      }
    }
  }

  return { byDay, byAdviser };
}

// ─── Warning tooltip (portal, no clipping inside overflow-x-auto) ───────────

const WARN_BG    = 'rgba(28,25,23,0.97)';
const WARN_AMBER = 'rgba(245,158,11,1)';

function WarningPill({ messages, side = 'top' }: { messages: string[]; side?: 'top' | 'bottom' }) {
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  if (messages.length === 0) return null;

  const show = () => ref.current && setAnchor(ref.current.getBoundingClientRect());
  const hide = () => setAnchor(null);

  const tipStyle: React.CSSProperties = anchor ? {
    position: 'fixed',
    zIndex: 9999,
    left: anchor.left + anchor.width / 2,
    ...(side === 'top'
      ? { top: anchor.top - 10, transform: 'translate(-50%, -100%)' }
      : { top: anchor.bottom + 10, transform: 'translate(-50%, 0)' }),
  } : {};

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={hide}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full cursor-default shrink-0"
        style={{
          background: 'rgba(245,158,11,0.18)',
          border: '1px solid rgba(245,158,11,0.55)',
          color: WARN_AMBER,
          fontSize: 9,
          fontWeight: 700,
          lineHeight: 1,
        }}
        aria-label={`${messages.length} advertencia${messages.length > 1 ? 's' : ''}`}
      >
        !
      </span>
      {anchor && createPortal(
        <AnimatePresence>
          <motion.div
            key="warning-tip"
            initial={{ opacity: 0, y: side === 'top' ? 4 : -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.13, ease: 'easeOut' }}
            className="max-w-[230px] rounded-xl px-3 py-2.5 shadow-2xl pointer-events-none"
            style={{
              ...tipStyle,
              background: WARN_BG,
              border: '1px solid rgba(245,158,11,0.30)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 12, height: 12, color: WARN_AMBER, flexShrink: 0 }}>
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <span style={{ fontSize: 10, fontWeight: 700, color: WARN_AMBER, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {messages.length === 1 ? 'Advertencia' : `${messages.length} advertencias`}
              </span>
            </div>
            <div className="space-y-1">
              {messages.map((m, i) => (
                <p key={i} style={{ fontSize: 12, color: 'rgba(253,230,138,0.90)', lineHeight: 1.45 }}>{m}</p>
              ))}
            </div>
            {/* Arrow */}
            <div style={{
              position: 'absolute',
              ...(side === 'top'
                ? { bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)' }
                : { top: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)' }),
              width: 8, height: 8,
              background: WARN_BG,
              border: side === 'top'
                ? '1px solid rgba(245,158,11,0.30)' : '1px solid rgba(245,158,11,0.30)',
              borderTop: side === 'top' ? 'none' : undefined,
              borderLeft: side === 'top' ? 'none' : undefined,
              borderBottom: side === 'bottom' ? 'none' : undefined,
              borderRight: side === 'bottom' ? 'none' : undefined,
            }} />
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseMinsGrid(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function hex2rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

function detectBrush(slot: ScheduleSlot, brushes: Brush[]): Brush | null {
  if (slot.shiftTemplateId != null) {
    const byId = brushes.find(b => b.id === String(slot.shiftTemplateId));
    if (byId) return byId;
  }
  if (slot.isRestDay) return brushes.find(b => b.isRest) ?? null;
  if (!slot.startTime) return null;
  const s = slot.startTime.slice(0, 5);
  const e = slot.endTime?.slice(0, 5) ?? '';
  return brushes.find(b => !b.isRest && b.start === s && b.end === e) ?? {
    id: 'custom', name: 'Turno', start: s, end: e, color: '#6b7280', isRest: false,
  };
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function fmtShort(t: string) {
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr > 12 ? hr - 12 : hr}:${m}${hr < 12 ? 'am' : 'pm'}`;
}

// ─── Cell ────────────────────────────────────────────────────────────────────

const PUBLISHED_TOAST_ID = 'schedule-locked';

interface CellProps {
  slot: ScheduleSlot | undefined;
  brushes: Brush[];
  isPublished: boolean;
  isToday: boolean;
  columnWarnings: string[];  // warnings that apply to this day-column
  onCellClick: (slot: ScheduleSlot) => void;
}

function Cell({ slot, brushes, isPublished, isToday, columnWarnings, onCellClick }: CellProps) {
  const [shaking, setShaking] = useState(false);
  const hasColWarn = columnWarnings.length > 0;

  const handleClick = () => {
    if (isPublished) {
      setShaking(true);
      setTimeout(() => setShaking(false), 350);
      toast('Horario publicado · usa Desbloquear para editar', {
        id: PUBLISHED_TOAST_ID,
        duration: 2500,
        style: { fontSize: '13px' },
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14, color: '#10b981', flexShrink: 0 }}>
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
          </svg>
        ),
      });
      return;
    }
    if (slot) onCellClick(slot);
  };

  if (!slot) return (
    <div className="h-[66px] rounded-xl border border-dashed"
      style={{ borderColor: hasColWarn ? 'rgba(245,158,11,0.40)' : 'rgba(255,255,255,0.07)' }} />
  );

  const brush = detectBrush(slot, brushes);
  const isEmpty = !slot.isRestDay && !slot.startTime && slot.shiftTemplateId == null;
  const isRest = slot.isRestDay;
  const isNoHours = !isRest && slot.shiftTemplateId != null && !slot.startTime;

  // Warning border overrides the shift color border
  const warnBorder = hasColWarn ? 'rgba(245,158,11,0.55)' : null;

  if (isEmpty) {
    if (isPublished) {
      return (
        <motion.div
          animate={shaking ? { x: [0, -3, 3, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleClick}
          className="h-[66px] rounded-xl border border-dashed cursor-not-allowed"
          style={{
            borderColor: warnBorder ?? (isToday ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)'),
            background: isToday ? 'rgba(16,185,129,0.04)' : 'transparent',
          }}
        />
      );
    }
    return (
      <button
        onClick={handleClick}
        className="h-[66px] w-full rounded-xl border border-dashed transition-all duration-150 cursor-pointer"
        style={{
          borderColor: warnBorder ?? (isToday ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)'),
          background: isToday ? 'rgba(16,185,129,0.04)' : 'transparent',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = isToday ? 'rgba(16,185,129,0.04)' : 'transparent'; }}
      />
    );
  }

  const color = brush?.color ?? '#6b7280';
  const slotStart = !isRest && slot.startTime ? parseMinsGrid(slot.startTime.slice(0, 5)) : 0;
  const slotEnd   = !isRest && slot.endTime   ? parseMinsGrid(slot.endTime.slice(0, 5))   : 0;
  const netMins = slot.netMinutes;
  const hh = Math.floor(netMins / 60);
  const mm = netMins % 60;
  const durationLabel = mm > 0 ? `${hh}h ${mm}m` : `${hh}h`;
  const barLeft  = Math.max(0, (slotStart / 60 - SPAN_START) / SPAN * 100);
  const barWidth = Math.min(100 - barLeft, ((slotEnd - slotStart) / 60) / SPAN * 100);

  return (
    <motion.button
      onClick={handleClick}
      animate={shaking ? { x: [0, -3, 3, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
      className={[
        'h-[66px] w-full rounded-xl border flex flex-col justify-between px-2.5 py-2 text-left transition-all duration-150',
        isPublished ? 'cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
      style={{
        background: hex2rgba(color, isToday ? 0.20 : 0.14),
        borderColor: warnBorder ?? hex2rgba(color, isToday ? 0.55 : 0.40),
        borderStyle: isRest ? 'dashed' : 'solid',
        // Subtle amber glow background on column-warned cells
        boxShadow: hasColWarn ? 'inset 0 0 0 1px rgba(245,158,11,0.12)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isPublished) {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
          (e.currentTarget as HTMLElement).style.background = hex2rgba(color, 0.22);
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.background = hex2rgba(color, isToday ? 0.20 : 0.14);
      }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-semibold leading-none truncate" style={{ color }}>
          {isRest ? 'Libre' : (brush?.name ?? 'Turno')}
        </span>
        {!isRest && netMins > 0 && (
          <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--t-muted)' }}>{durationLabel}</span>
        )}
      </div>

      {!isRest && !isNoHours && brush && brush.start && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono" style={{ color: 'var(--t-muted)' }}>
            {fmtShort(brush.start)} – {fmtShort(brush.end)}
          </span>
          <div className="relative h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="absolute top-0 bottom-0 rounded-full"
              style={{ left: `${barLeft}%`, width: `${barWidth}%`, background: color }} />
          </div>
        </div>
      )}

      {isRest && (
        <span className="text-[9px] font-mono" style={{ color: 'var(--t-muted)' }}>descanso</span>
      )}
      {isNoHours && (
        <span className="text-[9px] font-mono" style={{ color: 'var(--t-muted)' }}>sin horas</span>
      )}
    </motion.button>
  );
}

// ─── Main grid ───────────────────────────────────────────────────────────────

export function ScheduleGrid({ schedule, weekDates, brushes, activeBrush, onCellClick }: Props) {
  const { byDay, byAdviser } = parseWarnings(schedule.warnings ?? []);

  const ORDER: Record<string, number> = { ADMIN: 0, CO_ADMIN: 1, ADVISER: 2, AUXILIARY: 3 };
  const grouped = new Map<number, { name: string; role: string; slots: ScheduleSlot[] }>();
  for (const slot of schedule.slots) {
    if (!grouped.has(slot.adviserId))
      grouped.set(slot.adviserId, { name: slot.adviserName, role: slot.teamRole, slots: [] });
    grouped.get(slot.adviserId)!.slots.push(slot);
  }
  const rows = [...grouped.entries()]
    .sort((a, b) => (ORDER[a[1].role] ?? 9) - (ORDER[b[1].role] ?? 9));

  const isPublished = schedule.status === 'PUBLISHED';
  const today = new Date().toISOString().slice(0, 10);
  const todayIdx = weekDates.indexOf(today);

  const dayTotalMinutes = Array(7).fill(0);
  const dayCoverage = Array(7).fill(0);
  for (const [, { slots }] of rows) {
    const byDay2 = new Map(slots.map(s => [s.dayOfWeek, s]));
    for (let d = 1; d <= 7; d++) {
      const slot = byDay2.get(d);
      if (slot && !slot.isRestDay && slot.startTime) {
        dayTotalMinutes[d - 1] += slot.netMinutes;
        dayCoverage[d - 1]++;
      }
    }
  }

  const ROLE_LABEL: Record<string, string> = {
    ADMIN: 'Admin', CO_ADMIN: 'Co-Admin', ADVISER: 'Asesor', AUXILIARY: 'Auxiliar',
  };
  const ROLE_COLOR: Record<string, string> = {
    ADMIN: '#8b5cf6', CO_ADMIN: '#06b6d4', ADVISER: '#10b981', AUXILIARY: '#f59e0b',
  };

  return (
    <div className="rounded-[22px] overflow-hidden border"
      style={{ background: 'var(--s-card)', borderColor: 'var(--b-line)' }}>
      <div className="overflow-x-auto">
        <div style={{ minWidth: 960 }}>

          {/* Header */}
          <div className="grid gap-2 px-5 py-4 border-b"
            style={{ gridTemplateColumns: '210px repeat(7, minmax(0, 1fr)) 160px', borderColor: 'var(--b-line)' }}>
            <span className="text-[10px] font-bold tracking-[0.28em] self-end pb-1"
              style={{ color: 'var(--t-micro)' }}>ASESOR</span>

            {DAY_LABELS.slice(1).map((day, i) => {
              const isToday = i === todayIdx;
              const date = weekDates[i] ? new Date(weekDates[i] + 'T00:00:00') : null;
              const isWeekend = i >= 5;
              const dayOfWeek = i + 1; // 1=Mon
              const dayMsgs = byDay.get(dayOfWeek) ?? [];
              const hasWarn = dayMsgs.length > 0;

              return (
                <div key={day + i}
                  className="relative flex items-baseline gap-1.5 px-2.5 py-1.5 rounded-xl"
                  style={{
                    background: isToday ? 'rgba(16,185,129,0.10)' : 'transparent',
                    // Amber bottom underline for warned columns
                    borderBottom: hasWarn ? '2px solid rgba(245,158,11,0.55)' : 'none',
                    paddingBottom: hasWarn ? '4px' : undefined,
                  }}>
                  <span className="text-[10px] font-bold tracking-[0.22em]"
                    style={{ color: isToday ? '#10b981' : isWeekend ? 'var(--t-micro)' : 'var(--t-muted)' }}>
                    {day}
                  </span>
                  {date && (
                    <span className="text-[15px] font-bold leading-none"
                      style={{ color: isToday ? 'var(--t-primary)' : isWeekend ? 'var(--t-muted)' : 'var(--t-secondary)' }}>
                      {date.getDate()}
                    </span>
                  )}
                  {/* Warning pill — top-right of header cell */}
                  {hasWarn && (
                    <span className="absolute top-1 right-1">
                      <WarningPill messages={dayMsgs} side="bottom" />
                    </span>
                  )}
                </div>
              );
            })}

            <span className="text-[10px] font-bold tracking-[0.28em] self-end pb-1 text-right"
              style={{ color: 'var(--t-micro)' }}>SEMANA</span>
          </div>

          {/* Rows */}
          {rows.map(([adviserId, { name, role, slots }], rowIndex) => {
            const byDay2 = new Map(slots.map(s => [s.dayOfWeek, s]));
            const totalMin = slots.reduce((a, s) => a + s.netMinutes, 0);
            const totalH = (totalMin / 60).toFixed(1);
            const totalGrossMin = slots.reduce((a, s) => a + grossMinutes(s), 0);
            const target = 44;
            const pct = Math.min(100, totalMin / (target * 60) * 100);
            const diff = totalMin / 60 - target;
            const rc = ROLE_COLOR[role] ?? '#10b981';
            const adviserMsgs = byAdviser.get(name) ?? [];
            const hasAdviserWarn = adviserMsgs.length > 0;

            return (
              <div key={adviserId}
                className="grid gap-2 px-5 py-2.5 border-b transition-colors"
                style={{
                  gridTemplateColumns: '210px repeat(7, minmax(0, 1fr)) 160px',
                  borderColor: 'var(--b-line)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Adviser info — amber left stripe if has warnings */}
                <div className="flex items-center gap-3 min-w-0 py-1 pl-1"
                  style={{
                    boxShadow: hasAdviserWarn ? 'inset 3px 0 0 rgba(245,158,11,0.65)' : 'none',
                    borderRadius: hasAdviserWarn ? '0 0 0 4px' : undefined,
                  }}>
                  <div className="w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center text-[11px] font-bold"
                    style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.30)', color: '#06b6d4' }}>
                    {getInitials(name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: 'var(--t-primary)' }}>{name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[10px] leading-tight" style={{ color: 'var(--t-micro)' }}>
                        {ROLE_LABEL[role] ?? role}
                      </p>
                      {/* Warning pill beside role label */}
                      {hasAdviserWarn && <WarningPill messages={adviserMsgs} side="bottom" />}
                    </div>
                  </div>
                </div>

                {/* Day cells */}
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <Cell
                    key={day}
                    slot={byDay2.get(day)}
                    brushes={brushes}
                    isPublished={isPublished}
                    isToday={day - 1 === todayIdx}
                    columnWarnings={byDay.get(day) ?? []}
                    onCellClick={onCellClick}
                  />
                ))}

                {/* Total column */}
                <div data-tour={rowIndex === 0 ? 'week-total' : undefined}
                  className="flex flex-col justify-center items-end gap-1.5 pl-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[26px] font-bold tracking-tight leading-none" style={{ color: 'var(--t-primary)' }}>
                      {totalH}
                    </span>
                    <span className="text-[12px] font-semibold" style={{ color: 'var(--t-muted)' }}>h</span>
                  </div>
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: diff > 0 ? '#f59e0b' : diff === 0 ? '#10b981' : '#06b6d4',
                      }} />
                  </div>
                  <span className="text-[12px] font-mono text-right leading-tight"
                    style={{ color: diff > 0 ? '#f59e0b' : diff === 0 ? '#10b981' : 'var(--t-micro)' }}>
                    {formatTotalWithLunch(totalGrossMin, totalMin)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Coverage footer */}
          <div data-tour="coverage" data-html2canvas-ignore="true" className="grid gap-2 px-5 py-4"
            style={{
              gridTemplateColumns: '210px repeat(7, minmax(0, 1fr)) 160px',
              background: 'var(--s-subtle)',
              borderTop: '1px solid var(--b-line)',
            }}>
            <div className="flex flex-col gap-1 justify-center">
              <span className="text-[10px] font-bold tracking-[0.28em] text-cyan-500">COBERTURA</span>
              <span className="text-[11px]" style={{ color: 'var(--t-micro)' }}>horas · personas</span>
            </div>
            {dayTotalMinutes.map((min, i) => {
              const h = (min / 60).toFixed(1);
              const count = dayCoverage[i];
              return (
                <div key={i} className="flex flex-col gap-1.5 px-2.5 py-2">
                  <span className="text-[18px] font-bold tracking-tight leading-none" style={{ color: 'var(--t-primary)' }}>
                    {h}<span className="text-[11px] font-normal ml-0.5" style={{ color: 'var(--t-muted)' }}>h</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: count }).map((_, j) => (
                      <span key={j} className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                    ))}
                  </div>
                </div>
              );
            })}
            <div />
          </div>

        </div>
      </div>

      {isPublished && (
        <div className="px-5 py-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--b-line)' }}>
          <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Publicado · solo lectura</span>
        </div>
      )}
    </div>
  );
}
