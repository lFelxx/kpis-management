import { IconType } from 'react-icons';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  icon: IconType;
  title: string;
  value: ReactNode;
  description?: string;
  color: string;
  valueColor?: string;
  index?: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const ACCENT_MAP: Record<string, string> = {
  'bg-emerald-500': '#34d399',
  'bg-cyan-500':    '#22d3ee',
  'bg-amber-500':   '#fbbf24',
  'bg-orange-500':  '#fb923c',
  'bg-indigo-500':  '#818cf8',
  'bg-slate-700':   '#64748b',
  'bg-slate-800':   '#64748b',
};

const ORBITAL_RADIUS        = 48;
const ORBITAL_CIRCUMFERENCE = 2 * Math.PI * ORBITAL_RADIUS;
const ORBITAL_ARC           = ORBITAL_CIRCUMFERENCE * (210 / 360);

function resolveAccent(color: string): string {
  return ACCENT_MAP[color] ?? '#34d399';
}

export const DashboardCard = ({
  icon: Icon,
  title,
  value,
  description,
  color,
  valueColor,
  index = 0,
  trend,
}: DashboardCardProps) => {
  const accent = resolveAccent(color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: 'easeOut' }}
      whileHover="hover"
      className="relative overflow-hidden rounded-[1.4rem] text-left cursor-default"
      style={{
        background: 'var(--s-card)',
        border: '1px solid var(--b-line)',
        boxShadow: '0 1px 3px oklch(0 0 0 / 0.06)',
      }}
    >
      {/* Aurora bloom */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        variants={{ hover: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } } }}
        initial={{ opacity: 0 }}
        style={{
          background: `radial-gradient(ellipse 75% 55% at 10% 110%, ${accent}18 0%, transparent 65%)`,
        }}
      />

      {/* Ícono ghost watermark */}
      <motion.div
        className="absolute bottom-[-10px] right-[-10px] pointer-events-none"
        style={{ opacity: 0.06 }}
        variants={{ hover: { opacity: 0.12, transition: { duration: 0.4 } } }}
      >
        <Icon size={110} style={{ color: 'var(--ghost)' }} />
      </motion.div>

      {/* Arco orbital */}
      <svg className="absolute top-0 right-0 pointer-events-none" width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true">
        <circle cx="88" cy="0" r={ORBITAL_RADIUS} stroke={accent} strokeWidth="1" fill="none"
          strokeDasharray={`${ORBITAL_ARC} ${ORBITAL_CIRCUMFERENCE}`} strokeLinecap="round" opacity="0.18" />
        <motion.circle
          cx="88" cy="0" r={ORBITAL_RADIUS} stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round"
          strokeDasharray={`5 ${ORBITAL_CIRCUMFERENCE - 5}`}
          variants={{
            hover: {
              strokeDashoffset: [0, -(ORBITAL_ARC - 5)],
              opacity: [0, 1, 1, 0],
              transition: { duration: 0.9, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.3 },
            },
          }}
          initial={{ strokeDashoffset: 0, opacity: 0 }}
          style={{ filter: `drop-shadow(0 0 3px ${accent})` }}
        />
      </svg>

      <div className="relative z-10 p-4 md:p-5">
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${accent}18` }}>
            <Icon size={16} style={{ color: accent }} />
          </div>

          {trend && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{
                color:      trend.isPositive ? '#34d399' : '#fb923c',
                background: trend.isPositive ? '#34d39915' : '#fb923c15',
              }}>
              {trend.isPositive ? '+' : '−'}{trend.value}%
            </span>
          )}
        </div>

        <h3 className="text-[10px] font-black uppercase tracking-[0.22em] mb-1.5 truncate"
          style={{ color: 'var(--t-micro)' }}>
          {title}
        </h3>

        <motion.p
          className="text-2xl md:text-[1.9rem] font-black tracking-tighter leading-none truncate"
          style={{
            color: valueColor ?? 'var(--t-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
          variants={{ hover: { x: 2, transition: { duration: 0.2 } } }}
        >
          {value}
        </motion.p>

        {description && (
          <p className="mt-3.5 pt-3.5 text-[10px] font-medium truncate"
            style={{ color: 'var(--t-micro)', borderTop: '1px solid var(--b-subtle)' }}>
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
};
