import { useEffect, useMemo, useRef, useState } from 'react';
import { useAdvisersStore } from '../stores/advisers/advisers.store';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useSalesReportStore } from '../stores/salesReport/salesReport.store';
import { useReportingDateStore } from '../stores/ui/reportingDate.store';
import { notificationService } from '../../core/instances/instances';
import { motion } from 'framer-motion';
import { FaBullseye, FaBoxOpen, FaChartLine, FaCoins, FaFileInvoiceDollar, FaStar, FaTrophy, FaUserMinus } from 'react-icons/fa';
import { toPng } from 'html-to-image';
import { formatCurrency, getProgressColor } from '../lib/format';
import { MONTH_NAMES } from '../lib/constants';
import { CutoffDateSelector } from '../components/CutoffDateSelector';

export const ReportPage = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [showGrowthPercentages, setShowGrowthPercentages] = useState(false);
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
  } = useDashboardMetrics();

  const { reports: salesReports, fetchReports } = useSalesReportStore();

  const cutoffDate = useReportingDateStore((s) => s.cutoffDate);
  const cutoff       = useMemo(() => new Date(cutoffDate + 'T00:00:00'), [cutoffDate]);
  const currentYear  = cutoff.getFullYear();
  const currentMonth = cutoff.getMonth() + 1;
  const monthLabel       = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
  const currentDateLabel = `${cutoff.getDate()} de ${MONTH_NAMES[currentMonth]} de ${currentYear}`;

  useEffect(() => {
    fetchAdvisers(cutoffDate);
    fetchMetrics();
    fetchReports(currentYear, currentMonth);
    window.scrollTo(0, 0);
  }, [fetchAdvisers, fetchMetrics, fetchReports, cutoffDate, currentYear, currentMonth]);

  const formatAchievement = (value: number) =>
    Number.isFinite(value) ? `${value.toFixed(1)}%` : '—';

  const handleDownloadImage = async () => {
    const node = reportRef.current;
    if (!node) return;
    setDownloading(true);

    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const originalViewport = viewportMeta?.getAttribute('content') ?? '';

    try {
      const isDark = document.documentElement.classList.contains('dark');
      const backgroundColor = isDark ? '#0a0a0a' : '#fafafa';

      // Forzar viewport desktop para que Tailwind aplique breakpoints de pantalla grande
      viewportMeta?.setAttribute('content', 'width=1280');
      await new Promise((r) => setTimeout(r, 280));

      // Eliminar overflow-hidden/auto para que html-to-image capture la tabla completa
      const overflowEls = node.querySelectorAll<HTMLElement>('*');
      const overflowBackup: { el: HTMLElement; value: string }[] = [];
      overflowEls.forEach((el) => {
        const ov = getComputedStyle(el).overflow;
        const ovx = getComputedStyle(el).overflowX;
        if (ov === 'hidden' || ov === 'auto' || ov === 'scroll' || ovx === 'auto' || ovx === 'scroll') {
          overflowBackup.push({ el, value: el.style.overflow });
          el.style.overflow = 'visible';
        }
      });

      const dataUrl = await toPng(node, {
        backgroundColor,
        pixelRatio: 2,
        cacheBust: true,
        width: node.scrollWidth,
        height: node.scrollHeight,
      });

      overflowBackup.forEach(({ el, value }) => { el.style.overflow = value; });

      const link = document.createElement('a');
      link.download = `reporte-${monthLabel.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      notificationService.showError('Error al generar la imagen');
    } finally {
      viewportMeta?.setAttribute('content', originalViewport);
      setDownloading(false);
    }

  };

  const sortedAdvisers = useMemo(
    () => [...advisers].sort((a, b) => (b.currentMonthSales ?? b.sales ?? 0) - (a.currentMonthSales ?? a.sales ?? 0)),
    [advisers]
  );

  const storeWowPercent = useMemo(() => {
    if (salesReports.length === 0) return null;
    const current  = salesReports.reduce((s, r) => s + (r.wowCurrentWeekSales ?? 0), 0);
    const previous = salesReports.reduce((s, r) => s + (r.wowPreviousWeekSales ?? 0), 0);
    if (previous === 0) return current > 0 ? 100 : null;
    return ((current - previous) / previous) * 100;
  }, [salesReports]);

  const formatWeekOverWeek = (pct: number | null | undefined) => {
    if (pct == null || !Number.isFinite(pct)) return '—';
    const sign = pct > 0 ? '+' : '';
    return `${sign}${pct.toFixed(1)}%`;
  };

  const weekOverWeekClass = (pct: number | null | undefined) => {
    if (pct == null || !Number.isFinite(pct)) return 'text-muted-foreground font-bold';
    if (pct > 0) return 'text-chart-1 font-bold';
    if (pct < 0) return 'text-destructive font-bold';
    return 'text-muted-foreground font-bold';
  };

  const salesReportByAdviserId = useMemo(
    () => new Map(salesReports.map((r) => [r.adviserId, r])),
    [salesReports]
  );

  const storeCommissionRatePercent = useMemo(() => {
    const v = sortedAdvisers.find((a) => a.commissionRatePercent != null)?.commissionRatePercent;
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  }, [sortedAdvisers]);

  const formatCommissionRate = (pct: number) => `${pct}%`;

  const salesKpis = useMemo(() => {
    if (salesReports.length === 0) return null;
    const totalInvoices = salesReports.reduce((s, r) => s + r.invoiceCount, 0);
    const totalUnits = salesReports.reduce((s, r) => s + r.unitsSold, 0);
    const totalGross = salesReports.reduce((s, r) => s + r.grossSales, 0);
    const generalUpt = totalInvoices > 0 ? totalUnits / totalInvoices : 0;
    const storeAtv = totalInvoices > 0 ? totalGross / totalInvoices : 0;
    const bestUptReport = [...salesReports].sort((a, b) => b.upt - a.upt)[0];
    // Precio promedio por unidad = ventas netas / unidades vendidas
    const withAvgPrice = salesReports
      .filter((r) => r.unitsSold > 0)
      .map((r) => ({ ...r, avgUnitPrice: r.grossSales / r.unitsSold }));
    const bestAvgPriceReport = withAvgPrice.sort((a, b) => b.avgUnitPrice - a.avgUnitPrice)[0] ?? null;
    const withAtv = salesReports
      .filter((r) => r.invoiceCount > 0)
      .map((r) => ({ ...r, atv: r.grossSales / r.invoiceCount }));
    const bestAtvReport = withAtv.sort((a, b) => b.atv - a.atv)[0] ?? null;
    return { totalInvoices, totalUnits, generalUpt, storeAtv, bestUptReport, bestAvgPriceReport, bestAtvReport };
  }, [salesReports]);

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
              fetchAdvisers(cutoffDate);
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
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-4">
        <CutoffDateSelector />
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <label className="inline-flex cursor-pointer select-none items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted/40">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-border accent-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/45 focus:ring-offset-2 focus:ring-offset-background"
            checked={showGrowthPercentages}
            onChange={(e) => setShowGrowthPercentages(e.target.checked)}
          />
          Ver WoW (semana a semana)
        </label>
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
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
      </div>
      <div ref={reportRef} className="space-y-8 bg-background rounded-2xl p-6">
        <header className="text-left">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">
          Reporte
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tighter">
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
        transition={{ delay: 0 }}
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
        <div
          className={`grid grid-cols-1 gap-4 pt-4 border-t border-border sm:grid-cols-2 ${
            showGrowthPercentages ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
          }`}
        >
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
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
              Tasa de comisión aplicable
            </p>
            <p className="text-xl font-black text-foreground" title="Sobre ventas del asesor; según cumplimiento global de la tienda (hasta 1,2%).">
              {storeCommissionRatePercent != null ? formatCommissionRate(storeCommissionRatePercent) : '—'}
            </p>
          </div>
          {showGrowthPercentages && (
            <div title="Última semana vs semana anterior según datos del CSV de ventas.">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                WoW Tienda
              </p>
              <p className={`text-xl font-black ${weekOverWeekClass(storeWowPercent)}`}>
                {formatWeekOverWeek(storeWowPercent)}
              </p>
            </div>
          )}
        </div>
      </motion.section>

      {/* KPIs de ventas CSV */}
      {salesKpis && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-[2rem] p-6 border border-border shadow-lg dark:shadow-none"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <FaFileInvoiceDollar className="w-5 h-5 text-cyan-500" />
            </div>
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
              KPIs de ventas
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-6">
            {/* Columna izquierda: métricas numéricas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                  UPT General
                </p>
                <p className="text-xl font-black text-cyan-500">
                  {salesKpis.generalUpt.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                  ATV Tienda
                </p>
                <p className="text-xl font-black text-foreground">
                  {formatCurrency(salesKpis.storeAtv)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                  Facturas
                </p>
                <p className="text-xl font-black text-foreground">
                  {salesKpis.totalInvoices}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                  Unidades vendidas
                </p>
                <p className="text-xl font-black text-foreground">
                  {salesKpis.totalUnits}
                </p>
              </div>
            </div>
            {/* Columna derecha: KPIs dinámicos por asesor */}
            <div className="flex flex-row gap-6 border-t border-border pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-6">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <FaStar className="w-3 h-3 text-amber-500" />
                  Mejor UPT
                </p>
                <p className="text-lg font-black text-foreground">
                  {salesKpis.bestUptReport.adviserName.split(' ').slice(0, 2).join(' ')}
                </p>
                <p className="text-sm font-bold text-cyan-500 mt-0.5">
                  {salesKpis.bestUptReport.upt.toFixed(2)} upt
                </p>
              </div>
              {salesKpis.bestAvgPriceReport && (
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <FaBoxOpen className="w-3 h-3 text-amber-400" />
                    Artículos más caros por factura (AVG)
                  </p>
                  <p className="text-lg font-black text-foreground">
                    {salesKpis.bestAvgPriceReport.adviserName.split(' ').slice(0, 2).join(' ')}
                  </p>
                  <p className="text-sm font-bold text-amber-500 mt-0.5">
                    {formatCurrency(salesKpis.bestAvgPriceReport.avgUnitPrice)} / unidad
                  </p>
                </div>
              )}
              {salesKpis.bestAtvReport && (
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <FaFileInvoiceDollar className="w-3 h-3 text-emerald-500" />
                    Mejor ATV
                  </p>
                  <p className="text-lg font-black text-foreground">
                    {salesKpis.bestAtvReport.adviserName.split(' ').slice(0, 2).join(' ')}
                  </p>
                  <p className="text-sm font-bold text-emerald-500 mt-0.5">
                    {formatCurrency(salesKpis.bestAtvReport.atv)} / factura
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* Mejor y peor asesor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bestAdviser && (
          <motion.section
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
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
            transition={{ delay: 0.2 }}
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
        transition={{ delay: 0.3 }}
        className="bg-card rounded-[2rem] border border-border shadow-lg dark:shadow-none overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <FaChartLine className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest">
            Detalle por asesor
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ minWidth: '700px' }}>
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Asesor</th>
                <th className="px-6 py-4">Meta</th>
                <th className="px-6 py-4">Ventas</th>
                <th className="px-6 py-4">Cumplimiento</th>
                {showGrowthPercentages && (
                  <th
                    className="px-6 py-4 max-w-[140px]"
                    title="Variación % de ventas lun–hoy vs misma franja la semana pasada."
                  >
                    WoW
                  </th>
                )}
                <th className="px-4 py-4 text-cyan-500">UPT</th>
                <th className="px-4 py-4">Facturas</th>
                <th className="px-4 py-4">Artículos</th>
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
                const sales       = adviser.currentMonthSales ?? adviser.sales ?? 0;
                const goal        = adviser.goalValue ?? 0;
                const achievement = goal > 0 ? (sales / goal) * 100 : 0;
                const commission  = adviser.commission ?? 0;
                const name        = `${adviser.name} ${adviser.lastName}`.trim() || '—';
                const sr          = salesReportByAdviserId.get(Number(adviser.id));

                const achievementColor =
                  achievement >= 100 ? 'text-chart-1 font-bold'
                  : achievement >= 60 ? 'text-orange-600 dark:text-orange-400 font-bold'
                  : 'text-destructive font-bold';

                return (
                  <tr
                    key={adviser.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-foreground">{name}</td>
                    <td className="px-6 py-4 text-foreground">{formatCurrency(goal)}</td>
                    <td className="px-6 py-4 text-foreground">{formatCurrency(sales)}</td>
                    <td className="px-6 py-4">
                      <span className={achievementColor}>
                        {achievement.toFixed(1)}%
                      </span>
                    </td>
                    {showGrowthPercentages && (
                      <td className="px-6 py-4">
                        <span
                          className={weekOverWeekClass(sr?.wowGrowthPercentage)}
                          title={sr?.wowCurrentWeekSales != null
                            ? `Última semana: ${formatCurrency(sr.wowCurrentWeekSales)} · Semana anterior: ${formatCurrency(sr.wowPreviousWeekSales ?? 0)}`
                            : undefined}
                        >
                          {formatWeekOverWeek(sr?.wowGrowthPercentage)}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-4 font-bold text-cyan-500">
                      {sr ? sr.upt.toFixed(2) : '—'}
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {sr ? sr.invoiceCount : '—'}
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {sr ? sr.unitsSold : '—'}
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
