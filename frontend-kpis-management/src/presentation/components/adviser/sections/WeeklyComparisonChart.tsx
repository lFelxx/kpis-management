import React from 'react';
import { useWeeklyComparisons } from '../../../hooks/useWeeklyComparisons';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Calendar, RefreshCcw, LayoutGrid } from 'lucide-react';

interface WeeklyComparisonChartProps {
    adviserId: string | number;
}

export const WeeklyComparisonChart: React.FC<WeeklyComparisonChartProps> = ({
    adviserId
}) => {
    const {
        data,
        loading,
        error,
        formatSales,
        getPercentageChangeText,
        getChangeLabel,
        generateComparison } = useWeeklyComparisons(adviserId);

    if (loading) {
        return (
            <div className="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-slate-200/50 dark:border-white/10 p-8 shadow-xl dark:shadow-none min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin text-emerald-500">
                        <RefreshCcw className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-black text-slate-400 dark:text-white/20 uppercase tracking-widest">Analizando semanas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-red-500/10 p-8 shadow-xl dark:shadow-none min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 font-bold mb-2">Error al cargar comparación</p>
                    <p className="text-xs text-slate-500 dark:text-white/30">{error}</p>
                </div>
            </div>
        );
    }

    const getWeekNumber = () => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    };

    const displayData = data || {
        weekNumber: getWeekNumber(),
        currentWeekSales: 0,
        previousWeekSales: 0,
        percentageChange: 0,
        isPositive: true
    };

    const maxValue = Math.max(displayData.currentWeekSales, displayData.previousWeekSales, 1);

    // Calcular porcentajes relativos para las barras
    const prevPercentage = (displayData.previousWeekSales / maxValue) * 100;
    const currPercentage = (displayData.currentWeekSales / maxValue) * 100;

    // Función para renderizar el porcentaje de forma legible
    const renderPercentage = (pct: number, value: number) => {
        if (value > 0 && pct < 1) return '< 1%';
        return `${Math.round(pct)}%`;
    };

    return (
        <div className="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 p-8 shadow-xl dark:shadow-none">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex items-center gap-4 text-left">
                    <div className="p-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                        <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">Comparativa Semanal</h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-white/30">Análisis detallado • Semana {displayData.weekNumber}</p>
                    </div>
                </div>
                <button
                    onClick={generateComparison}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2 group"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    <span>Actualizar Datos</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Metric 1: Current Week */}
                <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-6 text-left relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ArrowUpRight className="w-12 h-12 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Semana Actual</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {formatSales(displayData.currentWeekSales)}
                    </p>
                    <div className="mt-2 h-1 w-8 bg-emerald-500 rounded-full" />
                </div>

                {/* Metric 2: Previous Week */}
                <div className="bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 text-left relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Calendar className="w-12 h-12 text-slate-400" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-1">Semana Anterior</p>
                    <p className="text-3xl font-black text-slate-600 dark:text-white/60 tracking-tighter">
                        {formatSales(displayData.previousWeekSales)}
                    </p>
                    <div className="mt-2 h-1 w-8 bg-slate-400/30 rounded-full" />
                </div>

                {/* Metric 3: Delta */}
                <div className={`border rounded-[2rem] p-6 text-left relative overflow-hidden group ${displayData.isPositive
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        {displayData.isPositive ? <ArrowUpRight className="w-12 h-12" /> : <ArrowDownRight className="w-12 h-12" />}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">
                        {data ? getChangeLabel() : 'Crecimiento Estimado'}
                    </p>
                    <p className="text-3xl font-black tracking-tighter">
                        {data ? getPercentageChangeText() : '0.00%'}
                    </p>
                    <div className={`mt-2 h-1 w-8 rounded-full ${displayData.isPositive ? 'bg-current' : 'bg-red-500'}`} />
                </div>
            </div>

            {/* Visual Comparison with Bars */}
            <div className="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-slate-200/50 dark:border-white/5 p-8 shadow-inner">
                <div className="flex items-center gap-3 mb-10 text-left">
                    <LayoutGrid className="w-5 h-5 text-emerald-500" />
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Benchmarking Visual</h4>
                </div>

                <div className="space-y-12">
                    {/* Previous Week Bar */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/20">
                            <span>Semana Anterior</span>
                            <span>{renderPercentage(prevPercentage, displayData.previousWeekSales)}</span>
                        </div>
                        <div className="h-4 w-full bg-slate-900/5 dark:bg-white/5 rounded-full overflow-hidden border border-slate-900/5 dark:border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(prevPercentage, displayData.previousWeekSales > 0 ? 2 : 0)}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="h-full bg-slate-400/40 dark:bg-white/10 rounded-full relative group/bar"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/bar:translate-x-full transition-transform duration-1000" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Current Week Bar */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                            <span>Semana Actual (En Curso)</span>
                            <span>{renderPercentage(currPercentage, displayData.currentWeekSales)}</span>
                        </div>
                        <div className="h-6 w-full bg-emerald-500/5 dark:bg-white/5 rounded-full overflow-hidden border border-emerald-500/10 dark:border-white/5 shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(currPercentage, displayData.currentWeekSales > 0 ? 2 : 0)}%` }}
                                transition={{ duration: 1.5, delay: 0.2, ease: "circOut" }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full shadow-lg shadow-emerald-500/20 relative group/bar"
                            >
                                <div className="absolute inset-x-0 top-0 h-[30%] bg-white/20 blur-[1px]" />
                                <div className="absolute inset-0 animate-shine opacity-30" />
                            </motion.div>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-[9px] font-bold text-slate-400 dark:text-white/10 uppercase tracking-[0.2em] text-center">
                    Datos sincronizados en tiempo real con el servidor de métricas
                </p>
            </div>
        </div>
    );
};