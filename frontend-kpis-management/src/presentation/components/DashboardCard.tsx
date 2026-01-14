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
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const DashboardCard = ({ icon: Icon, title, value, description, color, valueColor, trend }: DashboardCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] p-6 border border-slate-200/50 dark:border-white/10 shadow-lg dark:shadow-none transition-all duration-300 relative overflow-hidden group text-left"
    >
      {/* Subtle hover glow area */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] group-hover:bg-emerald-500/10 transition-colors" />

      <div className="flex flex-col h-full relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${color} shadow-lg shadow-black/5 flex items-center justify-center`}>
            <Icon size={20} className="text-white" />
          </div>

          {trend && (
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${trend.isPositive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
              }`}>
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">{title}</h3>
          <p className={`text-3xl font-black tracking-tighter ${valueColor ?? 'text-slate-900 dark:text-white'}`}>
            {value}
          </p>
        </div>

        {description && (
          <div className="mt-4 pt-4 border-t border-slate-900/5 dark:border-white/5">
            <p className="text-xs font-medium text-slate-500 dark:text-white/30 truncate">
              {description}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};