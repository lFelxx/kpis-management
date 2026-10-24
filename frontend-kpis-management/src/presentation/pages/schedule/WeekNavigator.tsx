import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiPlus, FiCheck } from 'react-icons/fi';
import { WeeklyScheduleSummary } from '../../../core/domain/Schedule/Schedule';

interface Props {
  summaries: WeeklyScheduleSummary[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreateWeek: (weekStart: string) => void;
  loading: boolean;
}

function mondayOf(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d.toISOString().slice(0, 10);
}

const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

export function fmtWeek(ws: string, we: string): string {
  const s = new Date(ws + 'T00:00:00');
  const e = new Date(we + 'T00:00:00');
  const sm = MONTHS[s.getMonth()], em = MONTHS[e.getMonth()];
  if (sm === em) return `${s.getDate()} – ${e.getDate()} ${sm}`;
  return `${s.getDate()} ${sm} – ${e.getDate()} ${em}`;
}

export function fmtWeekYear(ws: string, we: string): string {
  const s = new Date(ws + 'T00:00:00');
  const e = new Date(we + 'T00:00:00');
  const sm = MONTHS[s.getMonth()], em = MONTHS[e.getMonth()];
  const year = e.getFullYear();
  if (sm === em) return `${s.getDate()} – ${e.getDate()} ${sm} ${year}`;
  return `${s.getDate()} ${sm} – ${e.getDate()} ${em} ${year}`;
}

export function weekNumber(ws: string): number {
  const d = new Date(ws + 'T00:00:00');
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - jan1.getTime()) / 864e5 + jan1.getDay() + 1) / 7);
}

// ── Timeline Carousel ────────────────────────────────────────────────────────

interface CarouselProps {
  sorted: WeeklyScheduleSummary[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  loading: boolean;
}

function WeekCarousel({ sorted, selectedId, onSelect, loading }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Smooth-scroll the track so the active pill is centred.
  const scrollToSelected = useCallback((id: number | null) => {
    if (!id || !trackRef.current) return;
    const pill = pillRefs.current.get(id);
    if (!pill) return;
    const track = trackRef.current;
    const offset = pill.offsetLeft - track.clientWidth / 2 + pill.offsetWidth / 2;
    track.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToSelected(selectedId); }, [selectedId, scrollToSelected]);

  // Also scroll on mount once refs are populated.
  useEffect(() => {
    const raf = requestAnimationFrame(() => scrollToSelected(selectedId));
    return () => cancelAnimationFrame(raf);
  }, []); // eslint-disable-line

  if (sorted.length <= 1) return null;

  return (
    <div className="relative w-full mt-2 min-w-0">
      {/* Edge fade masks */}
      <div
        className="absolute inset-y-0 left-0 w-10 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, var(--bg, #0a0a0a), transparent)' }}
      />
      <div
        className="absolute inset-y-0 right-0 w-10 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, var(--bg, #0a0a0a), transparent)' }}
      />

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex items-center gap-2 overflow-x-auto py-1.5 px-3 select-none"
        style={{
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          cursor: 'grab',
        }}
        onMouseDown={e => {
          const el = e.currentTarget;
          el.style.cursor = 'grabbing';
          const startX = e.pageX - el.scrollLeft;
          const onMove = (ev: MouseEvent) => { el.scrollLeft = ev.pageX - startX; };
          const onUp = () => {
            el.style.cursor = 'grab';
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
      >
        {/* Connector track line */}
        <div
          className="absolute left-3 right-3 h-px pointer-events-none"
          style={{
            top: '50%',
            background: 'linear-gradient(to right, transparent, var(--b-subtle) 10%, var(--b-subtle) 90%, transparent)',
            zIndex: 0,
          }}
        />

        {sorted.map((s, i) => {
          const isActive = s.id === selectedId;
          const isPublished = s.status === 'PUBLISHED';

          return (
            <motion.button
              key={s.id}
              ref={el => {
                if (el) pillRefs.current.set(s.id, el);
                else pillRefs.current.delete(s.id);
              }}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.025, 0.25), type: 'spring', stiffness: 340, damping: 26 }}
              whileHover={!isActive ? { scale: 1.04, y: -1 } : {}}
              whileTap={{ scale: 0.95 }}
              onClick={() => !loading && onSelect(s.id)}
              disabled={loading}
              className="relative shrink-0 flex items-center gap-1.5 rounded-xl text-[11px] font-semibold transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 z-[1]"
              style={{
                padding: isActive ? '5px 12px' : '4px 10px',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.22), rgba(6,182,212,0.14))'
                  : isPublished
                    ? 'rgba(16,185,129,0.06)'
                    : 'var(--s-subtle)',
                border: isActive
                  ? '1.5px solid rgba(16,185,129,0.55)'
                  : isPublished
                    ? '1px solid rgba(16,185,129,0.2)'
                    : '1px solid var(--b-subtle)',
                color: isActive
                  ? '#10b981'
                  : isPublished
                    ? 'var(--t-secondary)'
                    : 'var(--t-muted)',
                boxShadow: isActive
                  ? '0 0 0 3px rgba(16,185,129,0.12), 0 2px 8px rgba(16,185,129,0.15)'
                  : 'none',
              }}
            >
              {/* Active pulsing ring */}
              {isActive && (
                <motion.span
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  animate={{ opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ border: '1.5px solid rgba(16,185,129,0.5)' }}
                />
              )}

              {/* Status indicator */}
              {isPublished ? (
                <FiCheck size={10} className="shrink-0" style={{ color: isActive ? '#10b981' : 'rgba(16,185,129,0.7)' }} />
              ) : (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: '#06b6d4',
                    opacity: isActive ? 1 : 0.6,
                    animation: isActive ? 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' : 'none',
                  }}
                />
              )}

              {fmtWeekYear(s.weekStart, s.weekEnd)}

              {/* Week number badge on active */}
              {isActive && (
                <span
                  className="ml-0.5 text-[9px] font-bold tracking-wide opacity-60 uppercase"
                  style={{ letterSpacing: '0.1em' }}
                >
                  S{weekNumber(s.weekStart)}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── WeekNavigator ────────────────────────────────────────────────────────────

export function WeekNavigator({ summaries, selectedId, onSelect, onCreateWeek, loading }: Props) {
  const sorted = [...summaries].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  const idx    = sorted.findIndex(s => s.id === selectedId);
  const current = sorted[idx];

  const currentMonday = mondayOf(new Date());

  const maxAllowedMonday = (() => {
    const d = new Date(currentMonday + 'T00:00:00');
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  })();

  const nextToCreate = (() => {
    if (sorted.length === 0) return currentMonday;
    const afterEnd = new Date(sorted[0].weekEnd + 'T00:00:00');
    afterEnd.setDate(afterEnd.getDate() + 1);
    return afterEnd.toISOString().slice(0, 10);
  })();

  const canCreate = nextToCreate <= maxAllowedMonday;

  return (
    <div className="flex flex-col gap-0 w-full min-w-0">
      {/* ── Top row: 3-column grid so week nav stays perfectly centered ── */}
      <div
        className="items-center gap-3 w-full"
        style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr' }}
      >

        {/* Left: create button */}
        <div>
          <motion.button
            whileHover={canCreate ? { scale: 1.02 } : {}}
            whileTap={canCreate ? { scale: 0.97 } : {}}
            onClick={() => canCreate && onCreateWeek(nextToCreate)}
            disabled={loading || !canCreate}
            title={!canCreate ? 'Solo puedes crear hasta la semana siguiente a la actual' : undefined}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus size={14} />
            Nueva semana
          </motion.button>
        </div>

        {/* Center: Prev / hero week label / Next */}
        <div className="flex justify-center">
          {sorted.length > 0 && (
            <div
              className="flex items-center gap-0.5 rounded-[18px] p-1.5"
              style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}
            >
              <button
                onClick={() => idx < sorted.length - 1 && onSelect(sorted[idx + 1].id)}
                disabled={idx >= sorted.length - 1 || loading}
                className="w-9 h-9 rounded-[12px] flex items-center justify-center transition-colors hover:bg-white/8 disabled:opacity-25 cursor-pointer"
              >
                <FiChevronLeft size={18} />
              </button>

              <div className="flex flex-col items-center px-4 min-w-[200px]">
                <span
                  className="text-[10px] font-bold tracking-[0.35em] uppercase"
                  style={{ color: 'var(--t-micro)' }}
                >
                  {current ? `SEMANA ${weekNumber(current.weekStart)}` : '—'}
                </span>
                <span
                  className="text-[20px] font-bold tracking-tight leading-tight mt-0.5"
                  style={{ color: 'var(--t-primary)', letterSpacing: '-0.035em' }}
                >
                  {current ? fmtWeek(current.weekStart, current.weekEnd) : '—'}
                </span>
              </div>

              <button
                onClick={() => idx > 0 && onSelect(sorted[idx - 1].id)}
                disabled={idx <= 0 || loading}
                className="w-9 h-9 rounded-[12px] flex items-center justify-center transition-colors hover:bg-white/8 disabled:opacity-25 cursor-pointer"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Right: status badge */}
        <div className="flex justify-end">
          {current && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold ${
                current.status === 'PUBLISHED'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/25'
                  : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500/25'
              }`}
            >
              {current.status === 'PUBLISHED' ? (
                <>
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                  Publicado
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  Borrador
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Timeline carousel (oldest left → newest right) ── */}
      <WeekCarousel
        sorted={[...sorted].reverse()}
        selectedId={selectedId}
        onSelect={onSelect}
        loading={loading}
      />
    </div>
  );
}
