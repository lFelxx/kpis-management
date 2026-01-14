import { useEffect } from 'react';
import { useAdvisersStore } from '../stores/advisers/advisers.store';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { DashboardCard } from '../components/DashboardCard';
import {
  FaChartLine,
  FaBullseye,
  FaCheckCircle,
  FaChartBar,
  FaUserPlus,
  FaTrophy
} from 'react-icons/fa';
import { AdviserTable } from '../components/adviser/AdviserTable';

export const Dashboard = () => {
  const { advisers, fetchAdvisers } = useAdvisersStore();
  const {
    totalSales,
    totalGoal,
    goalAchievement,
    averageSales,
    bestAdviser,
    bestUptAdviser,
    loading,
    error,
    fetchMetrics,
    formatCurrency
  } = useDashboardMetrics();

  useEffect(() => {
    fetchAdvisers();
    fetchMetrics();
    window.scrollTo(0, 0);
  }, []);


  const safeGoalAchievement = typeof goalAchievement === 'number' ? goalAchievement : 0;
  const safeTotalSales = typeof totalSales === 'number' ? totalSales : 0;
  const safeTotalGoal = typeof totalGoal === 'number' ? totalGoal : 0;
  const safeAverageSales = typeof averageSales === 'number' ? averageSales : 0;

  const dashboardCards = [
    {
      icon: FaChartLine,
      title: "Total Ventas",
      value: formatCurrency(safeTotalSales),
      description: "Ventas brutas del equipo",
      color: "bg-emerald-500"
    },
    {
      icon: FaBullseye,
      title: "Meta Global",
      value: formatCurrency(safeTotalGoal),
      description: "Meta global del equipo",
      color: "bg-cyan-500"
    },
    {
      icon: FaTrophy,
      title: "Asesor con Mejor UPT",
      value: bestUptAdviser ? bestUptAdviser.adviserName : "Cargando...",
      description: bestUptAdviser ? `UPT: ${bestUptAdviser.upt}` : "Sin datos registrados",
      color: "bg-amber-500"
    },
    {
      icon: FaCheckCircle,
      title: "Cumplimiento",
      value: `${safeGoalAchievement.toFixed(1)}%`,
      description: "Progreso hacia el objetivo",
      color: safeGoalAchievement >= 100 ? "bg-emerald-500" : "bg-orange-500"
    },
    {
      icon: FaChartBar,
      title: "Promedio de Ventas",
      value: formatCurrency(safeAverageSales),
      description: "Venta media por asesor",
      color: "bg-slate-700 dark:bg-slate-800"
    },
    {
      icon: FaUserPlus,
      title: "Líder de Ventas",
      value: bestAdviser ? bestAdviser.adviserName : "Cargando...",
      description: bestAdviser ? `Liderando con ${formatCurrency(bestAdviser.totalSales)}` : "Analizando...",
      color: "bg-indigo-500"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6">
        <div className="bg-red-500/10 p-8 rounded-[2rem] border border-red-500/20 text-center max-w-sm">
          <p className="text-red-600 dark:text-red-400 font-bold mb-4">{error}</p>
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
    <main className="flex-1 p-8 bg-background min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-10 text-left">
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em] mb-2 block">Panel de Control</span>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-white/30 mt-1 max-w-md">
            Métricas de rendimiento en tiempo real para la gestión estratégica del equipo.
          </p>
        </header>

        {/* Tarjetas del Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {dashboardCards.map((card, index) => (
            <DashboardCard key={index} {...card} />
          ))}
        </div>

        {/* Tabla de asesores */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div className="text-left">
              <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-[0.3em] mb-1 block">Listado General</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Resumen de Asesores
              </h2>
            </div>
          </div>
          <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-[2rem] border border-slate-200/50 dark:border-white/5 overflow-hidden shadow-lg dark:shadow-none">
            <AdviserTable advisers={advisers} hideActions />
          </div>
        </section>
      </div>
    </main>
  );
};