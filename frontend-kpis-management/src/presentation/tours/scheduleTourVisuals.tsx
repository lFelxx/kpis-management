const SHIFT_SAMPLES = [
  { name: 'Apertura', time: '8:00 – 4:00', color: '#10b981' },
  { name: 'Cierre',   time: '1:30 – 8:30', color: '#06b6d4' },
  { name: 'Libre',    time: 'descanso',    color: '#6b7280' },
];

export function ShiftChips() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SHIFT_SAMPLES.map(({ name, time, color }) => (
        <span
          key={name}
          className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold"
          style={{ background: `${color}20`, border: `1.5px solid ${color}55`, color }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
          {name}
          <span className="font-mono opacity-60">{time}</span>
        </span>
      ))}
    </div>
  );
}

const WEEK_SAMPLE = [
  { day: 'L', color: '#10b981' },
  { day: 'M', color: '#10b981' },
  { day: 'M', color: '#06b6d4' },
  { day: 'J', color: '#06b6d4' },
  { day: 'V', color: '#10b981' },
  { day: 'S', color: '#06b6d4' },
  { day: 'D', color: '#6b7280' },
];

export function WeekRow() {
  return (
    <div className="grid grid-cols-7 gap-1">
      {WEEK_SAMPLE.map(({ day, color }, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-bold tracking-widest" style={{ color: 'var(--t-micro)' }}>{day}</span>
          <span
            className="w-full h-7 rounded-lg"
            style={{ background: `${color}26`, border: `1.5px ${color === '#6b7280' ? 'dashed' : 'solid'} ${color}66` }}
          />
        </div>
      ))}
    </div>
  );
}

export function HoursSample() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className="font-bold leading-none" style={{ fontSize: 28, color: 'var(--t-primary)' }}>40</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--t-muted)' }}>h</span>
        </div>
        <span className="font-mono text-[12px]" style={{ color: 'var(--t-muted)' }}>45h - 5h de almuerzo</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--b-subtle)' }}>
        <div className="h-full rounded-full" style={{ width: '90%', background: '#06b6d4' }} />
      </div>
    </div>
  );
}
