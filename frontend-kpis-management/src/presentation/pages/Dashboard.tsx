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
    fetchMetrics(); // Obtener métricas del backend
  }, []);


  // Validaciones defensivas para evitar errores
  const safeGoalAchievement = typeof goalAchievement === 'number' ? goalAchievement : 0;
  const safeTotalSales = typeof totalSales === 'number' ? totalSales : 0;
  const safeTotalGoal = typeof totalGoal === 'number' ? totalGoal : 0;
  const safeAverageSales = typeof averageSales === 'number' ? averageSales : 0;

  const dashboardCards = [
    {
      icon: FaChartLine,
      title: "Total Ventas",
      value: formatCurrency(safeTotalSales),
      description: "Ventas totales del equipo",
      color: "bg-chart-4",
      trend: { value: 12, isPositive: true }
    },
    {
      icon: FaBullseye,
      title: "Meta Total",
      value: formatCurrency(safeTotalGoal),
      description: "Meta establecida",
      color: "bg-primary",
      trend: { value: 8, isPositive: true }
    },
    {
      icon: FaTrophy,
      title: "Asesor con mejor UPT",
      value: bestUptAdviser ? bestUptAdviser.adviserName : "N/A",
      description: bestUptAdviser ? `UPT: ${bestUptAdviser.upt || 'N/A'}` : "Sin datos",
      color: "bg-chart-1"
    },
    {
      icon: FaCheckCircle,
      title: "Cumplimiento",
      value: `${safeGoalAchievement.toFixed(1)}%`,
      description: "Porcentaje de meta alcanzada",
      color: "bg-chart-2",
      trend: { value: 5, isPositive: safeGoalAchievement > 100 }
    },
    {
      icon: FaChartBar,
      title: "Promedio de Ventas",
      value: formatCurrency(safeAverageSales),
      description: "Por asesor",
      color: "bg-chart-3",
      trend: { value: 3, isPositive: true }
    },
    {
      icon: FaUserPlus,
      title: "Mejor Asesor",
      value: bestAdviser ? bestAdviser.adviserName : "N/A",
      description: bestAdviser ? `${formatCurrency(bestAdviser.totalSales)} en ventas` : "",
      color: "bg-accent-foreground"
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <p className="text-destructive">{error}</p>
        <button
          onClick={() => {
            fetchAdvisers();
            fetchMetrics();
          }}
          className="px-4 py-2 bg-chart-1/20 hover:bg-chart-1/30 text-chart-1 rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Visión general del rendimiento del equipo</p>
      </div>

      {/* Tarjetas del Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {dashboardCards.map((card, index) => (
          <DashboardCard key={index} {...card} />
        ))}
      </div>

      {/* Tabla de asesores */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Resumen de Asesores</h2>
        <AdviserTable advisers={advisers} hideActions />
      </div>
    </div>
  );
}; 