import { motion } from 'framer-motion';
import { FaBrain } from 'react-icons/fa';
import { TbChevronRight } from 'react-icons/tb';
import { StoreClosingPrediction, RiskLevel } from '../../../core/domain/Prediction/StoreClosingPrediction';
import { formatCurrency } from '../../lib/format';

interface StoreClosingCardProps {
  data: StoreClosingPrediction;
  onOpenDrawer: () => void;
  index?: number;
}

const ML_ACCENT = '#a78bfa';

const ORBITAL_RADIUS        = 48;
const ORBITAL_CIRCUMFERENCE = 2 * Math.PI * ORBITAL_RADIUS;
const ORBITAL_ARC           = ORBITAL_CIRCUMFERENCE * (210 / 360);

const RISK_COLORS: Record<RiskLevel, string> = {
  low:      '#34d399',
  medium:   '#fbbf24',
  high:     '#fb923c',
  critical: '#f87171',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low:      'Riesgo Bajo',
  medium:   'Riesgo Medio',
  high:     'Riesgo Alto',
  critical: 'Riesgo Crítico',
};

const CONFIDENCE_LABELS: Record<string, string> = {
  low:    'Confianza Baja',
  medium: 'Confianza Media',
  high:   'Confianza Alta',
};

export const StoreClosingCard = ({ data, onOpenDrawer, index = 0 }: StoreClosingCardProps) => {
  const riskColor = RISK_COLORS[data.riskLevel] ?? '#fbbf24';

  return (
    <motion.button
      onClick={onOpenDrawer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: 'easeOut' }}
      whileHover="hover"
      className="relative overflow-hidden rounded-[1.4rem] text-left w-full cursor-pointer"
      style={{
        background:  'var(--s-card)',
        border:      '1px solid var(--b-line)',
        boxShadow:   '0 1px 3px oklch(0 0 0 / 0.06)',
      }}
    >
      {/* Aurora bloom */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        variants={{ hover: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } } }}
        initial={{ opacity: 0 }}
        style={{
          background: `radial-gradient(ellipse 75% 55% at 10% 110%, ${ML_ACCENT}18 0%, transparent 65%)`,
        }}
      />

      {/* Ghost watermark */}
      <motion.div
        className="absolute bottom-[-10px] right-[-10px] pointer-events-none"
        style={{ opacity: 0.06 }}
        variants={{ hover: { opacity: 0.12, transition: { duration: 0.4 } } }}
      >
        <FaBrain size={110} style={{ color: 'var(--ghost)' }} />
      </motion.div>

      {/* Orbital arc */}
      <svg
        className="absolute top-0 right-0 pointer-events-none"
        width="88" height="88" viewBox="0 0 88 88"
        fill="none" aria-hidden="true"
      >
        <circle
          cx="88" cy="0" r={ORBITAL_RADIUS}
          stroke={ML_ACCENT} strokeWidth="1" fill="none"
          strokeDasharray={`${ORBITAL_ARC} ${ORBITAL_CIRCUMFERENCE}`}
          strokeLinecap="round" opacity="0.18"
        />
        <motion.circle
          cx="88" cy="0" r={ORBITAL_RADIUS}
          stroke={ML_ACCENT} strokeWidth="3" fill="none" strokeLinecap="round"
          strokeDasharray={`5 ${ORBITAL_CIRCUMFERENCE - 5}`}
          variants={{
            hover: {
              strokeDashoffset: [0, -(ORBITAL_ARC - 5)],
              opacity: [0, 1, 1, 0],
              transition: { duration: 0.9, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.3 },
            },
          }}
          initial={{ strokeDashoffset: 0, opacity: 0 }}
          style={{ filter: `drop-shadow(0 0 3px ${ML_ACCENT})` }}
        />
      </svg>

      <div className="relative z-10 p-4 md:p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${ML_ACCENT}18` }}
            >
              <FaBrain size={16} style={{ color: ML_ACCENT }} />
            </div>
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-widest uppercase"
              style={{ color: ML_ACCENT, background: `${ML_ACCENT}15` }}
            >
              IA
            </span>
          </div>

          <motion.div
            className="flex items-center gap-0.5"
            variants={{ hover: { x: 2, transition: { duration: 0.2 } } }}
          >
            <span className="text-[9px] font-bold" style={{ color: 'var(--t-micro)' }}>
              Ver desglose
            </span>
            <TbChevronRight size={12} style={{ color: 'var(--t-micro)' }} />
          </motion.div>
        </div>

        {/* Label */}
        <h3
          className="text-[10px] font-black uppercase tracking-[0.22em] mb-1.5 truncate"
          style={{ color: 'var(--t-micro)' }}
        >
          Proyección Cierre Tienda
        </h3>

        {/* Main value */}
        <motion.p
          className="text-2xl md:text-[1.9rem] font-black tracking-tighter leading-none truncate"
          style={{ color: 'var(--t-primary)', fontVariantNumeric: 'tabular-nums' }}
          variants={{ hover: { x: 2, transition: { duration: 0.2 } } }}
        >
          {formatCurrency(data.projectedStoreSales)}
        </motion.p>

        {/* Achievement + risk badge */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-black" style={{ color: riskColor }}>
            {data.projectedAchievementPct.toFixed(1)}%
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: riskColor, background: `${riskColor}15` }}
          >
            {RISK_LABELS[data.riskLevel]}
          </span>
        </div>

        {/* Footer */}
        <div
          className="mt-3.5 pt-3.5 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--b-subtle)' }}
        >
          <span className="text-[10px] font-medium" style={{ color: 'var(--t-micro)' }}>
            {data.advisersAtRisk > 0
              ? `${data.advisersAtRisk} asesor${data.advisersAtRisk > 1 ? 'es' : ''} en riesgo`
              : 'Equipo en buen ritmo'}
          </span>
          <span className="text-[10px] font-medium" style={{ color: 'var(--t-micro)' }}>
            {CONFIDENCE_LABELS[data.confidence] ?? data.confidence}
          </span>
        </div>
      </div>
    </motion.button>
  );
};
