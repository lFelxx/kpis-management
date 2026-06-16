import { useEffect, useMemo } from 'react';
import { useAdvisersStore } from '../stores/advisers/advisers.store';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useBudgetStore } from '../stores/budget/budget.store';
import { useReportingDateStore } from '../stores/ui/reportingDate.store';
import { formatCurrency } from '../lib/format';
import { DashboardCard } from '../components/DashboardCard';
import { DashboardCardSkeleton, AdviserTableSkeleton } from '../components/skeletons/SkeletonLoader';
import { AtRiskBanner } from '../components/AtRiskBanner';
import { CutoffDateSelector } from '../components/CutoffDateSelector';
import { useAtRiskAdvisers } from '../hooks/useAtRiskAdvisers';
import {
  FaChartLine,
  FaBullseye,
  FaCheckCircle,
  FaCalendarCheck,
  FaUserPlus,
  FaTrophy
} from 'react-icons/fa';
import { AdviserTable } from '../components/adviser/AdviserTable';

export const Dashboard = () => {
  const { advisers, fetchAdvisers } = useAdvisersStore();
  const { atRisk, loading: atRiskLoading } = useAtRiskAdvisers();
  const {
    totalSales,
    goalAchievement,
    bestAdviser,
    bestUptAdviser,
    loading,
    error,
    fetchMetrics,
  } = useDashboardMetrics();

  const cutoffDate = useReportingDateStore((s) => s.cutoffDate);

  const cutoff    = useMemo(() => new Date(cutoffDate + 'T00:00:00'), [cutoffDate]);
  const currentYear  = cutoff.getFullYear();
  const currentMonth = cutoff.getMonth() + 1;
  const daysElapsed  = cutoff.getDate();
  const daysInMonth  = new Date(currentYear, currentMonth, 0).getDate();

  const { template, fetchTemplate } = useBudgetStore();

  useEffect(() => {
    fetchAdvisers(cutoffDate);
    fetchMetrics();
    fetchTemplate(currentYear, currentMonth);
    window.scrollTo(0, 0);
  }, [fetchAdvisers, fetchMetrics, fetchTemplate, cutoffDate, currentYear, currentMonth]);

  const paf = useMemo(() => {
    if (!template?.days) return null;
    return template.days
      .filter((d) => d.date <= cutoffDate)
      .reduce((sum, d) => sum + d.dailyAmount, 0);
  }, [template, cutoffDate]);

  const totalBudget = template?.totalBudget ?? null;

  const projection = useMemo(() => {
    if (!totalBudget || !totalSales || daysElapsed === 0) return null;
    const projectedSales = (totalSales / daysElapsed) * daysInMonth;
    const projectedPct   = (projectedSales / totalBudget) * 100;
    return { projectedSales, projectedPct };
  }, [totalSales, totalBudget, daysElapsed, daysInMonth]);

  const safeGoalAchievement = typeof goalAchievement === 'number' ? goalAchievement : 0;
  const safeTotalSales      = typeof totalSales === 'number' ? totalSales : 0;

  const projectionDesc = projection
    ? `Proyección al cierre: ${formatCurrency(projection.projectedSales)} (${projection.projectedPct.toFixed(1)}% del presupuesto)`
    : 'Ventas brutas del equipo';

  const dashboardCards = [
    {
      icon: FaChartLine,
      title: "Total Ventas",
      value: formatCurrency(safeTotalSales),
      description: projectionDesc,
      color: "bg-emerald-500",
    },
    {
      icon: FaBullseye,
      title: "Meta Total",
      value: totalBudget != null ? formatCurrency(totalBudget) : '—',
      description: "Presupuesto total del mes",
      color: "bg-cyan-500",
    },
    {
      icon: FaTrophy,
      title: "Asesor con Mejor UPT",
      value: bestUptAdviser ? bestUptAdviser.adviserName : "--",
      description: bestUptAdviser ? `UPT: ${bestUptAdviser.upt}` : "Asigna UPT a los asesores para ver el ranking",
      color: "bg-amber-500",
    },
    {
      icon: FaCheckCircle,
      title: "Cumplimiento",
      value: `${safeGoalAchievement.toFixed(1)}%`,
      description: "Progreso hacia el objetivo",
      color: safeGoalAchievement >= 100 ? "bg-emerald-500" : "bg-orange-500",
    },
    {
      icon: FaCalendarCheck,
      title: "PAF Global",
      value: paf != null ? formatCurrency(paf) : '—',
      description: `Presupuesto acumulado hasta la fecha`,
      color: "bg-slate-700 dark:bg-slate-800",
    },
    {
      icon: FaUserPlus,
      title: "Líder de Ventas",
      value: bestAdviser ? bestAdviser.adviserName : "Cargando...",
      description: bestAdviser ? `Liderando con ${formatCurrency(bestAdviser.totalSales)}` : "Analizando...",
      color: "bg-indigo-500",
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6">
        <div className="bg-red-500/10 p-8 rounded-[2rem] border border-red-500/20 text-center max-w-sm">
          <p className="text-red-600 dark:text-red-400 font-bold mb-4">{error}</p>
          <button
            onClick={() => { fetchAdvisers(cutoffDate); fetchMetrics(); }}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-6 md:mb-10 text-left">
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em] mb-2 block">Panel de Control</span>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              Dashboard
            </h1>
            <CutoffDateSelector />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-white/30 mt-1 max-w-md">
            Métricas de rendimiento en tiempo real para la gestión estratégica del equipo.
          </p>
        </header>

        <AtRiskBanner advisers={atRisk} loading={atRiskLoading} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {loading
            ? Array.from({ length: 6 }, (_, i) => <DashboardCardSkeleton key={i} index={i} />)
            : dashboardCards.map((card, index) => <DashboardCard key={index} {...card} index={index} />)
          }
        </div>

        <section className="mt-8 md:mt-12 lg:mt-16">
          {loading
            ? <AdviserTableSkeleton rows={6} hideActions />
            : <AdviserTable advisers={advisers} hideActions />
          }
        </section>
      </div>
    </main>
  );
};
