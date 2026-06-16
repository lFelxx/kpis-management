import React, { useEffect } from 'react';
import { useAdviserWow } from '../../../hooks/useAdviserWow';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Calendar, RefreshCcw, LayoutGrid } from 'lucide-react';
import { formatCurrency } from '../../../lib/format';

import { EMERALD, CYAN } from '../../../lib/colors';

interface WeeklyComparisonChartProps {
  adviserId: string | number;
}

export const WeeklyComparisonChart: React.FC<WeeklyComparisonChartProps> = ({ adviserId }) => {
  const { data, loading, error, fetch } = useAdviserWow(adviserId);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) {
    return (
      <div className="rounded-[2rem] p-8 min-h-[400px] flex items-center justify-center"
        style={{ background: 'var(--s-card)', border: '1px solid var(--b-line)' }}>
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-8 h-8 animate-spin" style={{ color: EMERALD }} />
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--t-micro)' }}>
            Analizando semanas...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] p-8 min-h-[400px] flex items-center justify-center"
        style={{ background: 'var(--s-card)', border: '1px solid rgba(248,113,113,0.25)' }}>
        <div className="text-center">
          <p className="text-red-400 font-bold mb-2">Error al cargar comparación</p>
          <p className="text-xs" style={{ color: 'var(--t-muted)' }}>{error}</p>
        </div>
      </div>
    );
  }

  const displayData = data ?? { currentWeekSales: 0, previousWeekSales: 0, growthPercentage: 0, isPositive: true };
  const maxValue = Math.max(displayData.currentWeekSales, displayData.previousWeekSales, 1);
  const prevPct = (displayData.previousWeekSales / maxValue) * 100;
  const currPct = (displayData.currentWeekSales / maxValue) * 100;

  const growthText = () => {
    if (!data) return '0.0%';
    if (displayData.previousWeekSales === 0) return 'Sin comparación';
    const sign = displayData.isPositive ? '+' : '';
    return `${sign}${displayData.growthPercentage.toFixed(1)}%`;
  };

  const renderPct = (pct: number, value: number) => {
    if (value > 0 && pct < 1) return '< 1%';
    return `${Math.round(pct)}%`;
  };

  return (
    <div className="rounded-[2.5rem] border p-8"
      style={{ background: 'var(--s-card)', border: '1px solid var(--b-line)' }}>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4 text-left">
          <div className="p-3 rounded-2xl" style={{ background: `${CYAN}12`, border: `1px solid ${CYAN}25` }}>
            <Calendar className="w-6 h-6" style={{ color: CYAN }} />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight uppercase" style={{ color: 'var(--t-primary)' }}>Comparativa Semanal</h3>
            <p className="text-xs font-medium" style={{ color: 'var(--t-muted)' }}>
              WoW — datos del reporte CSV del mes actual
            </p>
          </div>
        </div>
        <button onClick={fetch} disabled={loading} className="btn-primary flex items-center gap-2 group">
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {!data && (
        <p className="text-center text-sm mb-8" style={{ color: 'var(--t-muted)' }}>
          Sin datos WoW — sube el CSV de ventas del mes actual para ver la comparativa.
        </p>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Semana actual */}
        <div className="rounded-[2rem] p-6 text-left relative overflow-hidden group"
          style={{ background: `${EMERALD}0d`, border: `1px solid ${EMERALD}25` }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-12 h-12" style={{ color: EMERALD }} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: EMERALD }}>
            Semana Actual
          </p>
          <p className="text-3xl font-black tracking-tighter" style={{ color: 'var(--t-primary)' }}>
            {formatCurrency(displayData.currentWeekSales)}
          </p>
          <div className="mt-2 h-1 w-8 rounded-full" style={{ background: EMERALD }} />
        </div>

        {/* Semana anterior */}
        <div className="rounded-[2rem] p-6 text-left relative overflow-hidden group"
          style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Calendar className="w-12 h-12" style={{ color: 'var(--t-secondary)' }} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--t-muted)' }}>
            Semana Anterior
          </p>
          <p className="text-3xl font-black tracking-tighter" style={{ color: 'var(--t-secondary)' }}>
            {formatCurrency(displayData.previousWeekSales)}
          </p>
          <div className="mt-2 h-1 w-8 rounded-full" style={{ background: 'var(--b-line)' }} />
        </div>

        {/* WoW % */}
        <div className="rounded-[2rem] p-6 text-left relative overflow-hidden group"
          style={{
            background: displayData.isPositive ? `${EMERALD}0d` : 'rgba(248,113,113,0.08)',
            border: `1px solid ${displayData.isPositive ? `${EMERALD}25` : 'rgba(248,113,113,0.2)'}`,
          }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            {displayData.isPositive
              ? <ArrowUpRight className="w-12 h-12" style={{ color: EMERALD }} />
              : <ArrowDownRight className="w-12 h-12" style={{ color: '#f87171' }} />
            }
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1"
            style={{ color: displayData.isPositive ? `${EMERALD}cc` : 'rgba(248,113,113,0.7)' }}>
            {data && displayData.previousWeekSales > 0
              ? (displayData.isPositive ? 'Crecimiento' : 'Decrecimiento')
              : 'WoW'}
          </p>
          <p className="text-3xl font-black tracking-tighter"
            style={{ color: displayData.isPositive ? EMERALD : '#f87171' }}>
            {growthText()}
          </p>
          <div className="mt-2 h-1 w-8 rounded-full"
            style={{ background: displayData.isPositive ? EMERALD : '#f87171' }} />
        </div>
      </div>

      {/* Barras visuales */}
      <div className="rounded-[2rem] border p-8"
        style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}>
        <div className="flex items-center gap-3 mb-10 text-left">
          <LayoutGrid className="w-5 h-5" style={{ color: EMERALD }} />
          <h4 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--t-secondary)' }}>Benchmarking Visual</h4>
        </div>

        <div className="space-y-12">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest"
              style={{ color: 'var(--t-micro)' }}>
              <span>Semana Anterior</span>
              <span>{renderPct(prevPct, displayData.previousWeekSales)}</span>
            </div>
            <div className="h-4 w-full rounded-full overflow-hidden"
              style={{ background: 'var(--s-subtle)', border: '1px solid var(--b-subtle)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(prevPct, displayData.previousWeekSales > 0 ? 2 : 0)}%` }}
                transition={{ duration: 1.5, ease: 'circOut' }}
                className="h-full rounded-full"
                style={{ background: 'var(--b-strong)' }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest"
              style={{ color: EMERALD }}>
              <span>Semana Actual (Última del CSV)</span>
              <span>{renderPct(currPct, displayData.currentWeekSales)}</span>
            </div>
            <div className="h-6 w-full rounded-full overflow-hidden"
              style={{ background: `${EMERALD}08`, border: `1px solid ${EMERALD}15` }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(currPct, displayData.currentWeekSales > 0 ? 2 : 0)}%` }}
                transition={{ duration: 1.5, delay: 0.2, ease: 'circOut' }}
                className="h-full rounded-full overflow-hidden relative"
                style={{ background: `linear-gradient(to right, ${EMERALD}, ${CYAN})`, boxShadow: `0 0 12px ${EMERALD}40` }}
              >
                <div className="absolute inset-x-0 top-0 h-[30%] bg-white/20 blur-[1px]" />
              </motion.div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-[9px] font-bold uppercase tracking-[0.2em] text-center"
          style={{ color: 'var(--t-micro)' }}>
          Datos calculados desde el reporte CSV — semanas ISO
        </p>
      </div>
    </div>
  );
};
