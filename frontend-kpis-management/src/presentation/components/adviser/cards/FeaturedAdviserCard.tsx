import React from "react";
import { Adviser } from "../../../../core/domain/Adviser/Adviser";
import { motion } from 'framer-motion';
import { FiTrendingUp, FiNavigation, FiZap } from 'react-icons/fi';
import { formatCurrency } from "../../../lib/format";

interface FeaturedAdviserCardProps {
  adviser: Adviser | null;
  type: 'best' | 'worst';
}

import { EMERALD, CYAN, ORANGE } from '../../../lib/colors';

const ORB_R   = 56;
const ORB_C   = 2 * Math.PI * ORB_R;
const ORB_ARC = ORB_C * 0.58;

const FeaturedAdviserCard: React.FC<FeaturedAdviserCardProps> = ({ adviser, type }) => {
  if (!adviser && type === 'worst') return null;

  const achievement = adviser?.goalValue && adviser.goalValue > 0 && adviser.currentMonthSales !== undefined
    ? (adviser.currentMonthSales / adviser.goalValue) * 100
    : 0;

  const initials = `${adviser?.name?.charAt(0) || ''}${adviser?.lastName?.charAt(0) || ''}`.toUpperCase();

  /* ─── MEJOR ASESOR ─────────────────────────────────────── */
  if (type === 'best') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover="hover"
        className="relative overflow-hidden rounded-[1.4rem] h-full flex flex-col"
        style={{
          background: 'var(--s-card)',
          border: `1px solid ${EMERALD}30`,
        }}
      >
        {/* Aurora bloom */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          variants={{ hover: { opacity: 1 } }}
          initial={{ opacity: 0.6 }}
          transition={{ duration: 0.7 }}
          style={{
            background: `radial-gradient(ellipse 90% 60% at 50% 115%, ${EMERALD}22 0%, transparent 65%)`,
          }}
        />

        {/* Arco orbital */}
        <svg className="absolute top-0 right-0 pointer-events-none opacity-15"
          width="110" height="110" viewBox="0 0 110 110" fill="none" aria-hidden="true">
          <circle cx="110" cy="0" r={ORB_R} stroke={EMERALD} strokeWidth="1" fill="none"
            strokeDasharray={`${ORB_ARC} ${ORB_C}`} strokeLinecap="round" />
        </svg>
        <svg className="absolute top-0 right-0 pointer-events-none"
          width="110" height="110" viewBox="0 0 110 110" fill="none" aria-hidden="true">
          <motion.circle
            cx="110" cy="0" r={ORB_R} stroke={EMERALD} strokeWidth="3.5" fill="none" strokeLinecap="round"
            strokeDasharray={`6 ${ORB_C - 6}`}
            variants={{
              hover: {
                strokeDashoffset: [0, -(ORB_ARC - 6)],
                opacity: [0, 1, 1, 0],
                transition: { duration: 0.9, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.3 },
              },
            }}
            initial={{ strokeDashoffset: 0, opacity: 0 }}
            style={{ filter: `drop-shadow(0 0 5px ${EMERALD})` }}
          />
        </svg>

        {/* Ghost initials */}
        <div className="absolute -bottom-4 -left-2 pointer-events-none select-none"
          style={{ opacity: 0.04, fontSize: 130, fontWeight: 900, lineHeight: 1, color: EMERALD, letterSpacing: '-0.05em' }}>
          {initials}
        </div>

        <div className="relative z-10 p-7 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <motion.div
              animate={{ y: [0, -4, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
              style={{
                background: `${EMERALD}15`,
                border: `1px solid ${EMERALD}30`,
                boxShadow: `0 0 18px ${EMERALD}20`,
              }}
            >
              🏆
            </motion.div>

            <span className="text-[9px] font-black uppercase tracking-[0.28em] px-2.5 py-1 rounded-full"
              style={{ color: EMERALD, background: `${EMERALD}12`, border: `1px solid ${EMERALD}25` }}>
              MVP del Mes
            </span>
          </div>

          {/* Nombre */}
          <div className="mb-4 text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] mb-1"
              style={{ color: 'var(--t-muted)' }}>
              Mejor Asesor
            </p>
            <h2 className="text-2xl font-black tracking-tighter leading-tight" style={{ color: 'var(--t-primary)' }}>
              {adviser?.name} {adviser?.lastName}
            </h2>
          </div>

          {/* Metric spotlight con shimmer */}
          <div className="rounded-2xl p-5 mb-4 text-left relative overflow-hidden"
            style={{ background: `${EMERALD}08`, border: `1px solid ${EMERALD}18` }}>
            <motion.div
              className="absolute inset-0 pointer-events-none"
              variants={{
                hover: {
                  x: ['-100%', '200%'],
                  transition: { duration: 0.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6 },
                },
              }}
              initial={{ x: '-100%' }}
              style={{
                background: `linear-gradient(105deg, transparent 40%, ${EMERALD}18 50%, transparent 60%)`,
                width: '60%',
              }}
            />
            <p className="text-[9px] font-black uppercase tracking-widest mb-2 relative z-10"
              style={{ color: 'var(--t-muted)' }}>
              Ventas del Mes
            </p>
            <span
              className="text-4xl font-black tracking-tighter block mb-2 relative z-10"
              style={{
                background: `linear-gradient(135deg, ${EMERALD}, ${CYAN})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCurrency(adviser?.currentMonthSales ?? 0)}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold relative z-10"
              style={{ color: `${EMERALD}cc` }}>
              <FiTrendingUp size={12} />
              <span>{achievement.toFixed(1)}% de la meta</span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mb-5">
            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--b-line)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(achievement, 100)}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(to right, ${EMERALD}, ${CYAN})`,
                  boxShadow: `0 0 10px ${EMERALD}70`,
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 flex items-center gap-3"
            style={{ borderTop: '1px solid var(--b-subtle)' }}>
            <div className="relative shrink-0">
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.4, 0.15] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-xl blur-md pointer-events-none"
                style={{ background: EMERALD }}
              />
              <div
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black"
                style={{ background: `${EMERALD}18`, border: `1.5px solid ${EMERALD}45`, color: EMERALD }}
              >
                {initials}
              </div>
            </div>
            <p className="text-[9px] italic leading-relaxed" style={{ color: 'var(--t-micro)' }}>
              "La excelencia no es un acto, es un hábito"
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ─── PLAN HERMANO ─────────────────────────────────────── */
  const gapToGoal       = Math.max(0, (adviser?.goalValue ?? 0) - (adviser?.currentMonthSales ?? 0));
  const progressClamped = Math.min(achievement, 100);
  const DIAL_R          = 40;
  const DIAL_C          = 2 * Math.PI * DIAL_R;
  const dialFill        = DIAL_C * (progressClamped / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 }}
      whileHover="hover"
      className="relative overflow-hidden rounded-[1.4rem] h-full flex flex-col"
      style={{
        background: 'var(--s-card)',
        border: `1.5px dashed ${ORANGE}35`,
      }}
    >
      {/* Aurora bloom orange */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        variants={{ hover: { opacity: 1 } }}
        initial={{ opacity: 0.6 }}
        style={{
          background: `radial-gradient(ellipse 80% 55% at 10% 110%, ${ORANGE}18 0%, transparent 65%)`,
        }}
      />

      {/* Líneas de trayectoria animadas */}
      <svg className="absolute top-0 right-0 pointer-events-none"
        width="100" height="120" viewBox="0 0 100 120" fill="none" aria-hidden="true">
        <motion.path
          d="M100 0 Q55 45 10 120"
          stroke={ORANGE} strokeWidth="1" fill="none" strokeLinecap="round"
          strokeDasharray="4 7" opacity={0.15}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
        />
        <motion.path
          d="M100 25 Q60 65 20 120"
          stroke={ORANGE} strokeWidth="1" fill="none" strokeLinecap="round"
          strokeDasharray="4 7" opacity={0.08}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.6 }}
        />
      </svg>

      {/* Ghost initials */}
      <div className="absolute -bottom-4 -right-2 pointer-events-none select-none"
        style={{ opacity: 0.04, fontSize: 130, fontWeight: 900, lineHeight: 1, color: ORANGE, letterSpacing: '-0.05em' }}>
        {initials}
      </div>

      <div className="relative z-10 p-7 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: `${ORANGE}15`, border: `1px solid ${ORANGE}30`, boxShadow: `0 0 18px ${ORANGE}18` }}
          >
            <FiNavigation size={18} style={{ color: ORANGE }} />
          </motion.div>
          <span className="text-[9px] font-black uppercase tracking-[0.28em] px-2.5 py-1 rounded-full"
            style={{ color: ORANGE, background: `${ORANGE}12`, border: `1px solid ${ORANGE}25` }}>
            Plan Hermano
          </span>
        </div>

        {/* Nombre */}
        <div className="mb-5 text-left">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] mb-1"
            style={{ color: 'var(--t-muted)' }}>
            Ruta de Despegue
          </p>
          <h2 className="text-2xl font-black tracking-tighter leading-tight" style={{ color: 'var(--t-primary)' }}>
            {adviser?.name} {adviser?.lastName}
          </h2>
          <p className="text-[10px] mt-1" style={{ color: 'var(--t-muted)' }}>
            Estamos aquí para apoyarte a subir de nivel
          </p>
        </div>

        {/* Dial circular + métricas */}
        <div className="flex items-center gap-5 mb-5">
          <div className="relative shrink-0" style={{ width: 92, height: 92 }}>
            <svg width="92" height="92" viewBox="0 0 92 92" fill="none">
              <circle cx="46" cy="46" r={DIAL_R} stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
              <motion.circle
                cx="46" cy="46" r={DIAL_R}
                stroke={ORANGE} strokeWidth="6" fill="none" strokeLinecap="round"
                strokeDasharray={`0 ${DIAL_C}`}
                animate={{ strokeDasharray: `${dialFill} ${DIAL_C}` }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                transform="rotate(-90 46 46)"
                style={{ filter: `drop-shadow(0 0 5px ${ORANGE}80)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-black leading-none" style={{ color: ORANGE, fontVariantNumeric: 'tabular-nums' }}>
                {achievement.toFixed(0)}%
              </span>
              <span className="text-[8px] font-bold mt-0.5" style={{ color: 'var(--t-muted)' }}>meta</span>
            </div>
          </div>

          <div className="flex-1 text-left space-y-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1"
                style={{ color: 'var(--t-muted)' }}>Ventas actuales</p>
              <p className="text-base font-black" style={{ color: 'var(--t-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(adviser?.currentMonthSales ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1"
                style={{ color: 'var(--t-muted)' }}>Meta del mes</p>
              <p className="text-base font-black" style={{ color: 'var(--t-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(adviser?.goalValue ?? 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Gap box pulsante */}
        <motion.div
          className="rounded-2xl p-4 mb-5 text-left"
          style={{ background: `${ORANGE}08`, border: `1px solid ${ORANGE}20` }}
          variants={{ hover: { borderColor: `${ORANGE}40`, background: `${ORANGE}12` } }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${ORANGE}15` }}
            >
              <FiZap size={14} style={{ color: ORANGE }} />
            </motion.div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest"
                style={{ color: 'var(--t-muted)' }}>Siguiente objetivo</p>
              <p className="text-xl font-black mt-0.5"
                style={{ color: 'var(--t-primary)', fontVariantNumeric: 'tabular-nums' }}>
                Faltan {formatCurrency(gapToGoal)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--b-subtle)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black"
              style={{ background: `${ORANGE}15`, border: `1px solid ${ORANGE}25`, color: ORANGE }}>
              {initials}
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]"
              style={{ color: 'var(--t-micro)' }}>
              Ruta de Mejora
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${ORANGE}15`, border: `1px solid ${ORANGE}25` }}>
            <FiTrendingUp size={13} style={{ color: ORANGE }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedAdviserCard;
