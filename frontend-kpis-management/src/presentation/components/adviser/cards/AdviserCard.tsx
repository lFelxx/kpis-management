import React from "react";
import { Adviser } from "../../../../core/domain/Adviser/Adviser";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { ChevronRightIcon, TrendingUp } from 'lucide-react';

interface AdviserCardProps {
  adviser: Adviser;
}

export const AdviserCard: React.FC<AdviserCardProps> = ({ adviser }) => {
  const navigate = useNavigate();

  // Calcula el progreso (puede ser mayor a 100%)
  const rawProgress = adviser.goalValue
    ? ((adviser.currentMonthSales ?? 0) / adviser.goalValue) * 100
    : 0;
  const progress = Math.min(rawProgress, 100);

  const initials = `${adviser.name?.charAt(0) || ''}${adviser.lastName?.charAt(0) || ''}`;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <div className="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-slate-200/50 dark:border-white/10 p-6 flex flex-col h-full shadow-xl dark:shadow-none hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all duration-300">

        {/* Header: Avatar + Status */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4 text-left">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{initials}</span>
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">Asesor</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {adviser.name} {adviser.lastName}
              </h3>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900/5 dark:bg-white/5 rounded-2xl p-3 border border-slate-900/5 dark:border-white/5 text-left">
            <p className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest mb-1">Ventas</p>
            <p className="text-base font-black text-slate-900 dark:text-white truncate">
              ${(adviser.currentMonthSales ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-900/5 dark:bg-white/5 rounded-2xl p-3 border border-slate-900/5 dark:border-white/5 text-left">
            <p className="text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest mb-1">Meta</p>
            <p className="text-base font-bold text-slate-500 dark:text-white/60 truncate">
              ${(adviser.goalValue ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="w-full mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">Cumplimiento</span>
            <span className={`text-xs font-black ${rawProgress >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
              {rawProgress.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden border border-slate-300/50 dark:border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${rawProgress >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-emerald-500'
                }`}
            />
          </div>
        </div>

        {/* UPT Badge if exists */}
        {adviser.upt && (
          <div className="flex items-center gap-2 mb-6 text-left">
            <div className="px-3 py-1 bg-emerald-500/10 dark:bg-white/5 border border-emerald-500/20 dark:border-white/10 rounded-full flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">UPT: {adviser.upt}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          className="btn-primary w-full flex items-center justify-center gap-2 group/btn mt-auto"
          onClick={() => navigate(`/advisers/${adviser.id}`)}
        >
          <span>Ver Detalle</span>
          <ChevronRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};