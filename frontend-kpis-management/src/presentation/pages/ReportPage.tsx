import { useEffect, useMemo, useRef, useState } from 'react';
import { useAdvisersStore } from '../stores/advisers/advisers.store';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { motion } from 'framer-motion';
import { FaBullseye, FaChartLine, FaCoins, FaTrophy, FaUserMinus } from 'react-icons/fa';
import { toPng } from 'html-to-image';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const ReportPage = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { advisers, fetchAdvisers } = useAdvisersStore();
  const {
    totalGoal,
    totalSales,
    goalAchievement,
    bestAdviser,
    worstAdviser,
    loading,
    error,
    fetchMetrics,
    formatCurrency,
    calculateAdviserEarnings,
    calculateProgressPercentage,
    getProgressColor,
  } = useDashboardMetrics();

  useEffect(() => {
    fetchAdvisers();
    fetchMetrics();
    window.scrollTo(0, 0);
  }, []);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const monthLabel = `${MONTH_NAMES[currentMonth - 1]} ${currentYear}`;
  const currentDateLabel = `${now.getDate()} de ${MONTH_NAMES[currentMonth - 1]} de ${currentYear}`;

  const formatAchievement = (value: number) =>
    Number.isFinite(value) ? `${value.toFixed(1)}%` : '—';

  const handleDownloadImage = async () => {
    const node = reportRef.current;
    if (!node) return;
    setDownloading(true);
    try {
      const isDark = document.documentElement.classList.contains('dark');
      const backgroundColor = isDark ? '#0a0a0a' : '#fafafa';
      const dataUrl = await toPng(node, {
        backgroundColor,
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `reporte-${monthLabel.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Error al generar la imagen:', e);
    } finally {
      setDownloading(false);
    }
  };

  const sortedAdvisers = useMemo(
    () => [...advisers].sort((a, b) => (b.currentMonthSales ?? b.sales ?? 0) - (a.currentMonthSales ?? a.sales ?? 0)),
    [advisers]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background gap-6">
        <div className="bg-destructive/10 p-8 rounded-2xl border border-destructive/20 text-center max-w-sm">
          <p className="text-destructive font-bold mb-4">{error}</p>
          <button
            onClick={() => {
              fetchAdvisers();
              fetchMetrics();
            }}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {downloading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
              Generando imagen…
            </>
          ) : (
            <>Descargar reporte como imagen</>
          )}
        </button>
      </div>
      <div ref={reportRef} className="space-y-8 bg-background rounded-2xl p-6">
        <header className="text-left">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">
          Reporte
        </span>
        <h1 className="text-4xl font-black text-foreground tracking-tighter">
          Reporte hasta la fecha
        </h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          {currentDateLabel} — Meta global, ventas, cumplimiento y comisión por asesor.
        </p>
      </header>

      {/* Meta total y métricas de la tienda */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-[2rem] p-6 border border-border shadow-lg dark:shadow-none"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FaBullseye className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              Meta global
            </h2>
            <p className="text-2xl font-black text-foreground">
              {formatCurrency(totalGoal ?? 0)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
              Ventas totales
            </p>
            <p className="text-xl font-black text-foreground">
              {formatCurrency(totalSales ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
              Cumplimiento de la tienda
            </p>
            <p className={`text-xl font-black ${getProgressColor(goalAchievement ?? 0)}`}>
              {formatAchievement(goalAchievement ?? 0)}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Mejor y peor asesor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bestAdviser && (
          <motion.section
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-[2rem] p-6 border border-border shadow-lg dark:shadow-none"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-chart-1/20 flex items-center justify-center">
                <FaTrophy className="w-5 h-5 text-chart-1" />
              </div>
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
                Mejor asesor
              </h2>
            </div>
            <p className="text-xl font-black text-foreground mb-4">
              {bestAdviser.adviserName}
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Meta</span>
                <span className="font-bold text-foreground">{formatCurrency(bestAdviser.totalGoal)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Ventas</span>
                <span className="font-bold text-foreground">{formatCurrency(bestAdviser.totalSales)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Cumplimiento</span>
                <span className="font-bold text-chart-1">{formatAchievement(Number(bestAdviser.goalAchievement))}</span>
              </li>
            </ul>
          </motion.section>
        )}

        {worstAdviser && (
          <motion.section
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-[2rem] p-6 border border-border shadow-lg dark:shadow-none"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <FaUserMinus className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
                Plan hermano
              </h2>
            </div>
            <p className="text-xl font-black text-foreground mb-4">
              {worstAdviser.adviserName}
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Meta</span>
                <span className="font-bold text-foreground">{formatCurrency(worstAdviser.totalGoal)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Ventas</span>
                <span className="font-bold text-foreground">{formatCurrency(worstAdviser.totalSales)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Cumplimiento</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">{formatAchievement(Number(worstAdviser.goalAchievement))}</span>
              </li>
            </ul>
          </motion.section>
        )}
      </div>

      {/* Tabla por asesor */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-[2rem] border border-border shadow-lg dark:shadow-none overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <FaChartLine className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
            Detalle por asesor
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Asesor</th>
                <th className="px-6 py-4">Meta</th>
                <th className="px-6 py-4">Ventas</th>
                <th className="px-6 py-4">Cumplimiento</th>
                <th className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-chart-1">
                    <FaCoins className="w-3.5 h-3.5" />
                    Comisión
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAdvisers.map((adviser) => {
                const sales = adviser.currentMonthSales ?? adviser.sales ?? 0;
                const goal = adviser.goalValue ?? 0;
                const achievement = calculateProgressPercentage(sales, goal);
                const commission = calculateAdviserEarnings(sales);
                const name = `${adviser.name} ${adviser.lastName}`.trim() || '—';
                return (
                  <tr
                    key={adviser.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-foreground">{name}</td>
                    <td className="px-6 py-4 text-foreground">{formatCurrency(goal)}</td>
                    <td className="px-6 py-4 text-foreground">{formatCurrency(sales)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          achievement >= 100
                            ? 'text-chart-1 font-bold'
                            : achievement >= 60
                              ? 'text-orange-600 dark:text-orange-400 font-bold'
                              : 'text-destructive font-bold'
                        }
                      >
                        {achievement.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-chart-1/15 px-3 py-1.5 text-base font-black text-chart-1">
                        <FaCoins className="w-4 h-4 opacity-90" />
                        {formatCurrency(commission)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sortedAdvisers.length === 0 && (
          <p className="px-6 py-8 text-center text-muted-foreground">No hay asesores para mostrar.</p>
        )}
      </motion.section>
      </div>
    </div>
  );
};
