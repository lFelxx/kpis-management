import { useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt } from 'react-icons/fa';
import { useReportingDateStore } from '../stores/ui/reportingDate.store';
import { useTheme } from '../hooks/useTheme';

const EMERALD = '#34d399';
const R = 32;
const C = 2 * Math.PI * R;
const ARC = C * 0.45;

function formatLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function CutoffDateSelector() {
  const { cutoffDate, setCutoffDate } = useReportingDateStore();
  const { theme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <motion.div
      whileHover="hover"
      onClick={() => inputRef.current?.showPicker?.()}
      className="relative overflow-hidden rounded-2xl cursor-pointer select-none"
      style={{
        background: 'var(--s-card)',
        border: '1px solid var(--b-line)',
        boxShadow: '0 1px 3px oklch(0 0 0 / 0.08)',
      }}
    >
      {/* Aurora bloom */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        variants={{ hover: { opacity: 1, transition: { duration: 0.4 } } }}
        initial={{ opacity: 0 }}
        style={{
          background: `radial-gradient(ellipse 80% 60% at 0% 110%, ${EMERALD}18 0%, transparent 70%)`,
        }}
      />

      {/* Arco orbital */}
      <svg className="absolute top-0 right-0 pointer-events-none" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="64" cy="0" r={R} stroke={EMERALD} strokeWidth="1" fill="none"
          strokeDasharray={`${ARC} ${C}`} strokeLinecap="round" opacity="0.15" />
        <motion.circle
          cx="64" cy="0" r={R} stroke={EMERALD} strokeWidth="2.5" fill="none" strokeLinecap="round"
          strokeDasharray={`4 ${C - 4}`}
          variants={{
            hover: {
              strokeDashoffset: [0, -(ARC - 4)],
              opacity: [0, 1, 1, 0],
              transition: { duration: 0.85, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.4 },
            },
          }}
          initial={{ strokeDashoffset: 0, opacity: 0 }}
          style={{ filter: `drop-shadow(0 0 3px ${EMERALD})` }}
        />
      </svg>

      <div className="relative z-10 flex items-center gap-3 px-4 py-2.5">
        {/* Ícono */}
        <motion.div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${EMERALD}18` }}
          variants={{ hover: { scale: 1.08, transition: { duration: 0.2 } } }}
        >
          <FaCalendarAlt size={13} style={{ color: EMERALD }} />
        </motion.div>

        {/* Texto */}
        <div className="flex flex-col leading-tight min-w-0">
          <span
            className="text-[9px] font-black uppercase tracking-[0.22em] truncate"
            style={{ color: 'var(--t-micro)' }}
          >
            Datos hasta
          </span>
          <motion.span
            className="text-sm font-black tracking-tight truncate"
            style={{ color: 'var(--t-primary)' }}
            variants={{ hover: { x: 1, transition: { duration: 0.2 } } }}
          >
            {formatLabel(cutoffDate)}
          </motion.span>
        </div>

        {/* Input oculto */}
        <input
          ref={inputRef}
          type="date"
          value={cutoffDate}
          max={today}
          onChange={(e) => e.target.value && setCutoffDate(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          style={{ colorScheme: theme }}
          tabIndex={-1}
          aria-label="Seleccionar fecha de corte"
        />
      </div>
    </motion.div>
  );
}
