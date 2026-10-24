import { WeeklyAdviserSummary, ScheduleSlot, formatNetTime, formatTotalWithLunch, grossMinutes } from '../../../core/domain/Schedule/Schedule';

interface Props {
  summaries: WeeklyAdviserSummary[];
  slots: ScheduleSlot[];
}

function hex2rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN: '#8b5cf6', CO_ADMIN: '#06b6d4', ADVISER: '#10b981', AUXILIARY: '#f59e0b',
};

export function WeeklySummaryRow({ summaries, slots }: Props) {
  if (summaries.length === 0) return null;

  const teamTotal = summaries.reduce((a, s) => a + s.totalNetMinutes, 0);
  const teamGrossTotal = slots.reduce((a, s) => a + grossMinutes(s), 0);
  const target = 44;
  const extraH = summaries.reduce((a, s) => {
    const diff = s.totalNetMinutes / 60 - target;
    return a + (diff > 0 ? diff : 0);
  }, 0);
  const avgH = summaries.length > 0 ? (teamTotal / 60 / summaries.length).toFixed(1) : '0.0';

  const byRole: Record<string, number> = {};
  for (const s of summaries) {
    byRole[s.teamRole] = (byRole[s.teamRole] ?? 0) + s.totalNetMinutes;
  }

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 2fr)' }}>

      {/* Big number card */}
      <div className="rounded-[22px] p-6 flex flex-col gap-4"
        style={{
          background: 'linear-gradient(160deg, rgba(16,185,129,0.12), rgba(6,182,212,0.04) 60%, transparent)',
          border: '1px solid rgba(16,185,129,0.22)',
        }}>
        <span className="text-[10px] font-bold tracking-[0.36em] text-emerald-500 uppercase">Total horas trabajadas</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[72px] font-bold tracking-[-0.06em] leading-[0.9]" style={{ color: 'var(--t-primary)' }}>
            {(teamTotal / 60).toFixed(0)}
          </span>
          <span className="text-[20px] font-semibold" style={{ color: 'var(--t-muted)' }}>horas</span>
        </div>
        <span className="text-[14px]" style={{ color: 'var(--t-muted)' }}>
          {summaries.length} asesor{summaries.length !== 1 ? 'es' : ''} · {formatTotalWithLunch(teamGrossTotal, teamTotal)}
        </span>
      </div>

      {/* Distribution card */}
      <div className="rounded-[22px] p-6 flex flex-col gap-5"
        style={{ background: 'var(--s-card)', border: '1px solid var(--b-line)' }}>
        <div className="flex justify-between items-center flex-wrap gap-3">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: 'var(--t-micro)' }}>
            Distribución por rol
          </span>
          <div className="flex gap-7">
            <div className="flex flex-col gap-0.5 items-end">
              <span className="text-[20px] font-bold tracking-tight leading-none" style={{ color: 'var(--t-primary)' }}>{avgH}h</span>
              <span className="text-[10px]" style={{ color: 'var(--t-micro)' }}>promedio / asesor</span>
            </div>
            <div className="flex flex-col gap-0.5 items-end">
              <span className="text-[20px] font-bold tracking-tight leading-none" style={{ color: '#f59e0b' }}>
                {extraH.toFixed(0)}h
              </span>
              <span className="text-[10px]" style={{ color: 'var(--t-micro)' }}>horas extra</span>
            </div>
          </div>
        </div>

        {/* Bar */}
        <div className="flex h-3 rounded-full overflow-hidden gap-1">
          {Object.entries(byRole).map(([role, min]) => (
            <div key={role} className="rounded-sm"
              style={{ flex: min || 0.001, background: ROLE_COLOR[role] ?? '#6b7280' }} />
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-5 flex-wrap">
          {summaries.map((s) => {
            const color = ROLE_COLOR[s.teamRole] ?? '#6b7280';
            return (
              <div key={s.adviserId} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
                <span className="text-[12px]" style={{ color: 'var(--t-secondary)' }}>{s.adviserName.split(' ')[0]}</span>
                <span className="text-[12px] font-mono font-semibold" style={{ color: 'var(--t-primary)' }}>
                  {formatNetTime(s.totalNetMinutes)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
