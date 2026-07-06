import { AnimatePresence, motion } from 'framer-motion';
import { FaBrain, FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import {
  StoreClosingPrediction,
  AdviserProjection,
  RiskLevel,
} from '../../../core/domain/Prediction/StoreClosingPrediction';
import { formatCurrency } from '../../lib/format';

interface StoreClosingDrawerProps {
  data: StoreClosingPrediction | null;
  isOpen: boolean;
  onClose: () => void;
}

const ML_ACCENT = '#a78bfa';

const RISK_COLORS: Record<RiskLevel, string> = {
  low:      '#34d399',
  medium:   '#fbbf24',
  high:     '#fb923c',
  critical: '#f87171',
};

const RISK_ORDER: Record<RiskLevel, number> = {
  critical: 0,
  high:     1,
  medium:   2,
  low:      3,
};

function isAtRisk(riskLevel: RiskLevel): boolean {
  return riskLevel === 'high' || riskLevel === 'critical';
}

function sortByRisk(projections: AdviserProjection[]): AdviserProjection[] {
  return [...projections].sort((a, b) => RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel]);
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--b-subtle)' }}>
      <p
        className="text-[9px] font-black uppercase tracking-wider mb-1"
        style={{ color: 'var(--t-micro)' }}
      >
        {label}
      </p>
      <p
        className="text-sm font-black tabular-nums"
        style={{ color: 'var(--t-primary)' }}
      >
        {value}
      </p>
    </div>
  );
}

function StatPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[10px] font-bold px-2 py-1 rounded-full"
      style={{ color, background: `${color}15` }}
    >
      {label}
    </span>
  );
}

function AdviserRow({ adviser, delay }: { adviser: AdviserProjection; delay: number }) {
  const riskColor = RISK_COLORS[adviser.riskLevel];
  const atRisk    = isAtRisk(adviser.riskLevel);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between py-3 px-3 rounded-xl gap-3"
      style={{
        background: atRisk ? `${riskColor}08` : 'transparent',
        border:     `1px solid ${atRisk ? riskColor + '20' : 'var(--b-subtle)'}`,
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${riskColor}15` }}
        >
          {atRisk
            ? <FaExclamationTriangle size={10} style={{ color: riskColor }} />
            : <FaCheckCircle         size={10} style={{ color: riskColor }} />
          }
        </div>
        <span className="text-xs font-semibold truncate" style={{ color: 'var(--t-primary)' }}>
          {adviser.adviserName}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-black tabular-nums" style={{ color: 'var(--t-primary)' }}>
          {formatCurrency(adviser.projectedSales)}
        </span>
        <span
          className="text-[10px] font-black px-1.5 py-0.5 rounded-md"
          style={{ color: riskColor, background: `${riskColor}15` }}
        >
          {adviser.projectedAchievementPct.toFixed(0)}%
        </span>
      </div>
    </motion.div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export const StoreClosingDrawer = ({ data, isOpen, onClose }: StoreClosingDrawerProps) => {
  const sortedProjections = data ? sortByRisk(data.adviserProjections) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'oklch(0 0 0 / 0.4)', backdropFilter: 'blur(2px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            className="fixed right-0 top-0 h-full z-50 flex flex-col"
            style={{
              width:       'min(420px, 100vw)',
              background:  'var(--s-card)',
              borderLeft:  '1px solid var(--b-line)',
              boxShadow:   '-8px 0 32px oklch(0 0 0 / 0.15)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-5 shrink-0"
              style={{ borderBottom: '1px solid var(--b-line)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${ML_ACCENT}18` }}
                >
                  <FaBrain size={14} style={{ color: ML_ACCENT }} />
                </div>
                <div>
                  <p
                    className="text-[9px] font-black uppercase tracking-widest"
                    style={{ color: ML_ACCENT }}
                  >
                    Análisis IA
                  </p>
                  <h2 className="text-sm font-black" style={{ color: 'var(--t-primary)' }}>
                    Proyección Cierre Tienda
                  </h2>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:opacity-70"
                style={{ background: 'var(--b-subtle)' }}
              >
                <FaTimes size={12} style={{ color: 'var(--t-micro)' }} />
              </button>
            </div>

            {/* Summary stats */}
            {data && (
              <div
                className="p-5 shrink-0"
                style={{ borderBottom: '1px solid var(--b-line)' }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <StatBlock label="Proyección"   value={formatCurrency(data.projectedStoreSales)} />
                  <StatBlock label="Meta"          value={formatCurrency(data.storeGoal)} />
                  <StatBlock label="Cumplimiento"  value={`${data.projectedAchievementPct.toFixed(1)}%`} />
                  <StatBlock label="Confianza"     value={capitalizeFirst(data.confidence)} />
                </div>

                <div
                  className="flex items-center gap-3 mt-3 pt-3"
                  style={{ borderTop: '1px solid var(--b-subtle)' }}
                >
                  <StatPill label={`${data.advisersAtRisk} en riesgo`}   color="#fb923c" />
                  <StatPill label={`${data.advisersOnTrack} en ritmo`}   color="#34d399" />
                </div>
              </div>
            )}

            {/* Advisers list */}
            <div className="flex-1 overflow-y-auto p-5">
              <p
                className="text-[10px] font-black uppercase tracking-widest mb-3"
                style={{ color: 'var(--t-micro)' }}
              >
                Desglose por asesor
              </p>
              <div className="flex flex-col gap-2">
                {sortedProjections.map((adviser, i) => (
                  <AdviserRow key={adviser.adviserId} adviser={adviser} delay={i * 0.04} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              className="p-4 shrink-0 text-center"
              style={{ borderTop: '1px solid var(--b-line)' }}
            >
              <p className="text-[9px] font-medium" style={{ color: 'var(--t-micro)' }}>
                Proyección basada en historial ponderado · ML Service
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
