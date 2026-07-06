import { motion } from 'framer-motion';
import { StoreClosingPrediction, AdviserProjection } from '../../../core/domain/Prediction/StoreClosingPrediction';

interface AiInsightBannerProps {
  data: StoreClosingPrediction;
  onClick: () => void;
}

const EMERALD = '#34d399';
const CYAN    = '#22d3ee';

// ── Sparkline ────────────────────────────────────────────────────────────────

function buildSparklinePath(projections: AdviserProjection[], w: number, h: number): { line: string; area: string } {
  const values = projections.length > 1
    ? projections.map(p => p.projectedAchievementPct)
    : [40, 55, 48, 70, 62, 80, 75, 88, 72, 85]; // decorative fallback

  const min   = Math.min(...values) * 0.85;
  const max   = Math.max(...values) * 1.05;
  const range = max - min || 1;
  const step  = w / (values.length - 1);

  const pts = values.map((v, i) => ({
    x: i * step,
    y: h - ((v - min) / range) * h * 0.85 - h * 0.05,
  }));

  let line = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    const cx = p.x + (c.x - p.x) / 2;
    line += ` C ${cx} ${p.y}, ${cx} ${c.y}, ${c.x} ${c.y}`;
  }

  const area = `${line} L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`;
  return { line, area };
}

// ── Animated scanner line ────────────────────────────────────────────────────

function ScannerLine() {
  return (
    <motion.div
      className="absolute inset-y-0 w-px pointer-events-none"
      style={{ background: `linear-gradient(180deg, transparent, ${CYAN}60, transparent)` }}
      initial={{ left: '-2%' }}
      animate={{ left: '102%' }}
      transition={{ duration: 4, ease: 'linear', repeat: Infinity, repeatDelay: 2 }}
    />
  );
}

// ── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({ projections }: { projections: AdviserProjection[] }) {
  const W = 180;
  const H = 52;
  const { line, area } = buildSparklinePath(projections, W, H);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W} height={H}
      className="overflow-visible shrink-0"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={EMERALD} stopOpacity="0.25" />
          <stop offset="100%" stopColor={EMERALD} stopOpacity="0" />
        </linearGradient>
        <filter id="spark-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Area fill */}
      <motion.path
        d={area}
        fill="url(#spark-fill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
      />

      {/* Line */}
      <motion.path
        d={line}
        fill="none"
        stroke={EMERALD}
        strokeWidth="1.8"
        strokeLinecap="round"
        filter="url(#spark-glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
      />
    </svg>
  );
}

// ── Stat block ───────────────────────────────────────────────────────────────

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0">
      <span
        className="text-2xl font-black tabular-nums leading-none"
        style={{ color }}
      >
        {value}
      </span>
      <span
        className="text-[8px] font-black uppercase tracking-[0.25em]"
        style={{ color: 'oklch(1 0 0 / 0.35)' }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export const AiInsightBanner = ({ data, onClick }: AiInsightBannerProps) => {
  const title = data.advisersAtRisk > 0
    ? `${data.advisersAtRisk} asesor${data.advisersAtRisk > 1 ? 'es' : ''} necesita${data.advisersAtRisk > 1 ? 'n' : ''} atención`
    : 'El equipo va en buen ritmo';

  const subtitle = `El equipo proyecta ${data.projectedAchievementPct.toFixed(0)}% de la meta`;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover="hover"
      className="relative w-full text-left overflow-hidden rounded-2xl mb-6 md:mb-8 cursor-pointer"
      style={{
        background:  'oklch(0.13 0.025 160 / 0.95)',
        border:      `1px solid ${EMERALD}22`,
        boxShadow:   `0 0 0 1px ${EMERALD}08, 0 4px 24px oklch(0 0 0 / 0.35), inset 0 1px 0 oklch(1 0 0 / 0.04)`,
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 45% 100% at 0% 50%, ${EMERALD}12 0%, transparent 60%),
            radial-gradient(ellipse 20% 80% at 100% 50%, ${CYAN}08 0%, transparent 55%)
          `,
        }}
      />

      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:  `linear-gradient(${EMERALD}08 1px, transparent 1px), linear-gradient(90deg, ${EMERALD}08 1px, transparent 1px)`,
          backgroundSize:   '28px 28px',
          opacity: 0.6,
        }}
      />

      {/* Hover lift */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        variants={{ hover: { boxShadow: `inset 0 0 0 1px ${EMERALD}30` } }}
        initial={{ boxShadow: 'inset 0 0 0 1px transparent' }}
        transition={{ duration: 0.25 }}
      />

      {/* Scanner */}
      <ScannerLine />

      <div className="relative z-10 flex items-center gap-4 px-5 py-4 md:px-6 md:py-5">

        {/* Left: text */}
        <div className="flex-1 min-w-0">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: EMERALD }}
              />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: EMERALD }} />
            </span>
            <span
              className="text-[9px] font-black uppercase tracking-[0.3em]"
              style={{ color: EMERALD }}
            >
              Inteligencia IA · En vivo
            </span>
          </div>

          <p className="text-base md:text-lg font-black leading-tight truncate" style={{ color: 'oklch(0.95 0.05 160)' }}>
            {title}
          </p>
          <p className="text-[11px] font-medium mt-0.5 truncate" style={{ color: 'oklch(1 0 0 / 0.4)' }}>
            {subtitle}
          </p>
        </div>

        {/* Center: sparkline */}
        <div className="hidden sm:flex items-center shrink-0 opacity-80">
          <Sparkline projections={data.adviserProjections} />
        </div>

        {/* Right: stats + button */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Vertical divider */}
          <div className="hidden md:block w-px h-10 self-center" style={{ background: `${EMERALD}20` }} />

          <Stat
            value={String(data.advisersAtRisk)}
            label="En riesgo"
            color={data.advisersAtRisk > 0 ? '#fb923c' : EMERALD}
          />

          {/* Vertical divider */}
          <div className="hidden md:block w-px h-10 self-center" style={{ background: `${EMERALD}20` }} />

          <Stat
            value={`${data.projectedAchievementPct.toFixed(0)}%`}
            label="Proyección"
            color={CYAN}
          />

          {/* Vertical divider */}
          <div className="hidden md:block w-px h-10 self-center" style={{ background: `${EMERALD}20` }} />

          {/* CTA */}
          <motion.span
            className="hidden md:flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl"
            style={{
              background: `${EMERALD}15`,
              color:      EMERALD,
              border:     `1px solid ${EMERALD}30`,
            }}
            variants={{ hover: { background: `${EMERALD}25`, x: 2 } }}
            transition={{ duration: 0.2 }}
          >
            Ver análisis
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.span>
        </div>
      </div>
    </motion.button>
  );
};
