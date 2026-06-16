import React from "react";
import { Adviser } from "../../../../core/domain/Adviser/Adviser";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { FiChevronRight, FiTrendingUp } from 'react-icons/fi';

interface AdviserCardProps {
  adviser: Adviser;
  index?: number;
}

import { EMERALD, CYAN } from '../../../lib/colors';

export const AdviserCard: React.FC<AdviserCardProps> = ({ adviser, index = 0 }) => {
  const navigate = useNavigate();

  const rawProgress = adviser.goalValue
    ? ((adviser.currentMonthSales ?? 0) / adviser.goalValue) * 100
    : 0;
  const progress  = Math.min(rawProgress, 100);
  const uptValue  = Number(adviser.upt ?? 0);
  const isOnTrack = rawProgress >= 100;

  const initials = `${adviser.name?.charAt(0) || ''}${adviser.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
      whileHover="hover"
      className="relative overflow-hidden rounded-[1.4rem] cursor-default flex flex-col"
      style={{
        background: 'var(--s-card)',
        border: '1px solid var(--b-line)',
        boxShadow: '0 1px 4px oklch(0 0 0 / 0.06)',
      }}
    >
      {/* Aurora bloom */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        variants={{ hover: { opacity: 1 } }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: `radial-gradient(ellipse 70% 50% at 10% 110%, ${EMERALD}12 0%, transparent 65%)`,
        }}
      />

      {/* Initials ghost watermark */}
      <motion.div
        className="absolute -bottom-3 -right-3 pointer-events-none select-none"
        style={{ opacity: 0.04, fontSize: 96, fontWeight: 900, lineHeight: 1, color: EMERALD, letterSpacing: '-0.05em' }}
        variants={{ hover: { opacity: 0.08 } }}
        transition={{ duration: 0.4 }}
      >
        {initials}
      </motion.div>

      <div className="relative z-10 p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black"
            style={{ background: `${EMERALD}15`, color: EMERALD, border: `1px solid ${EMERALD}25` }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.22em] mb-0.5"
              style={{ color: 'var(--t-micro)' }}>
              Asesor
            </p>
            <h3 className="font-black text-lg leading-tight truncate"
              style={{ color: 'var(--t-primary)' }}>
              {adviser.name} {adviser.lastName}
            </h3>
          </div>

          {isOnTrack && (
            <span
              className="ml-auto shrink-0 text-xs font-black px-2 py-0.5 rounded-full"
              style={{ color: EMERALD, background: `${EMERALD}15`, border: `1px solid ${EMERALD}25` }}
            >
              ✓ Meta
            </span>
          )}
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="rounded-xl p-3 text-left"
            style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-1"
              style={{ color: 'var(--t-micro)' }}>Ventas</p>
            <p className="text-base font-black truncate"
              style={{ color: 'var(--t-primary)', fontVariantNumeric: 'tabular-nums' }}>
              ${(adviser.currentMonthSales ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl p-3 text-left"
            style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-1"
              style={{ color: 'var(--t-micro)' }}>Meta</p>
            <p className="text-base font-bold truncate"
              style={{ color: 'var(--t-secondary)', fontVariantNumeric: 'tabular-nums' }}>
              ${(adviser.goalValue ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-black uppercase tracking-widest"
              style={{ color: 'var(--t-micro)' }}>Cumplimiento</span>
            <span className="text-xs font-black"
              style={{ color: isOnTrack ? EMERALD : 'var(--t-secondary)', fontVariantNumeric: 'tabular-nums' }}>
              {rawProgress.toFixed(1)}%
            </span>
          </div>
          <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'var(--b-line)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: index * 0.06 + 0.3 }}
              className="h-full rounded-full"
              style={{
                background: isOnTrack ? `linear-gradient(to right, ${EMERALD}, ${CYAN})` : EMERALD,
                boxShadow: isOnTrack ? `0 0 8px ${EMERALD}60` : undefined,
              }}
            />
          </div>
        </div>

        {/* UPT */}
        <div className="mb-5">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{
              color: uptValue > 0 ? EMERALD : 'var(--t-muted)',
              background: uptValue > 0 ? `${EMERALD}12` : 'var(--s-subtle)',
              border: `1px solid ${uptValue > 0 ? `${EMERALD}25` : 'var(--b-subtle)'}`,
            }}
          >
            <FiTrendingUp size={10} />
            UPT: {Number.isFinite(uptValue) ? uptValue.toFixed(2) : '0.00'}
          </span>
        </div>

        {/* CTA */}
        <motion.button
          onClick={() => navigate(`/advisers/${adviser.id}`)}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-colors duration-200"
          style={{
            background: `linear-gradient(135deg, ${EMERALD}20, ${CYAN}15)`,
            border: `1px solid ${EMERALD}30`,
            color: EMERALD,
          }}
        >
          <span>Ver Detalle</span>
          <FiChevronRight size={15} />
        </motion.button>
      </div>
    </motion.div>
  );
};
