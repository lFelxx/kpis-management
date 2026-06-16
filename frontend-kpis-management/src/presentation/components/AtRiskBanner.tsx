import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AtRiskAdviser } from '../hooks/useAtRiskAdvisers';
import { formatCurrency } from '../lib/format';

interface Props {
  advisers: AtRiskAdviser[];
  loading:  boolean;
}

export function AtRiskBanner({ advisers, loading }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded,  setExpanded]  = useState(false);

  if (loading || dismissed || advisers.length === 0) return null;

  const preview = advisers.slice(0, 3);
  const rest    = advisers.length - 3;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative rounded-2xl overflow-hidden mb-6"
        style={{
          background: 'rgba(251,146,60,0.06)',
          border: '1.5px solid rgba(251,146,60,0.25)',
        }}
      >
        {/* Borde izquierdo de acento */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ background: 'linear-gradient(to bottom, #fb923c, #f87171)' }}
        />

        <div className="pl-5 pr-4 py-4">
          {/* Cabecera */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl" role="img" aria-label="alerta">⚠️</span>
              <div>
                <p className="text-sm font-black" style={{ color: '#fb923c' }}>
                  {advisers.length === 1
                    ? '1 asesor proyecta cerrar bajo el 80% de meta'
                    : `${advisers.length} asesores proyectan cerrar bajo el 80% de meta`}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--t-muted)' }}>
                  Proyección lineal al cierre del mes con el ritmo actual de ventas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                style={{
                  background: 'rgba(251,146,60,0.12)',
                  color: '#fb923c',
                  border: '1px solid rgba(251,146,60,0.2)',
                }}
              >
                {expanded ? 'Ocultar' : 'Ver detalle'}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-xs font-bold px-2 py-1.5 rounded-lg cursor-pointer transition-colors"
                style={{ color: 'var(--t-micro)', background: 'var(--s-subtle)' }}
                aria-label="Cerrar alerta"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Lista de preview (siempre visible) */}
          <div className="flex flex-wrap gap-2 mt-3">
            {preview.map((a) => (
              <span
                key={a.adviserId}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(251,146,60,0.1)',
                  border: '1px solid rgba(251,146,60,0.2)',
                  color: 'var(--t-secondary)',
                }}
              >
                {a.adviserName.split(' ')[0]}
                <span style={{ color: '#f87171' }}>
                  {a.projectedAchievement.toFixed(0)}%
                </span>
              </span>
            ))}
            {rest > 0 && !expanded && (
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer"
                style={{ color: 'var(--t-micro)', background: 'var(--s-subtle)' }}
                onClick={() => setExpanded(true)}
              >
                +{rest} más
              </span>
            )}
          </div>

          {/* Detalle expandible */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-4 pt-4 grid gap-2"
                  style={{ borderTop: '1px solid rgba(251,146,60,0.15)' }}
                >
                  {/* Header columnas */}
                  <div
                    className="grid text-[9px] font-black uppercase tracking-[0.2em] pb-1"
                    style={{
                      gridTemplateColumns: '1fr 6rem 6rem 6rem 5rem',
                      color: 'var(--t-micro)',
                      borderBottom: '1px solid var(--b-subtle)',
                    }}
                  >
                    <span>Asesor</span>
                    <span className="text-right">Ventas hoy</span>
                    <span className="text-right">Proyectado</span>
                    <span className="text-right">Meta</span>
                    <span className="text-right">Proyección</span>
                  </div>

                  {advisers.map((a, i) => {
                    const pct   = a.projectedAchievement;
                    const color = pct >= 60 ? '#fb923c' : '#f87171';
                    return (
                      <motion.div
                        key={a.adviserId}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="grid items-center py-1.5"
                        style={{ gridTemplateColumns: '1fr 6rem 6rem 6rem 5rem' }}
                      >
                        <span className="text-sm font-bold truncate pr-3" style={{ color: 'var(--t-primary)' }}>
                          {a.adviserName}
                        </span>
                        <span className="text-xs text-right" style={{ color: 'var(--t-muted)', fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(a.currentSales)}
                        </span>
                        <span className="text-xs font-bold text-right" style={{ color, fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(a.projectedSales)}
                        </span>
                        <span className="text-xs text-right" style={{ color: 'var(--t-muted)', fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(a.goal)}
                        </span>
                        <span className="text-sm font-black text-right" style={{ color, fontVariantNumeric: 'tabular-nums' }}>
                          {pct.toFixed(1)}%
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
