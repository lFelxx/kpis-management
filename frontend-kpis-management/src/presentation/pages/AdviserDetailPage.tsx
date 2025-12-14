import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdvisersStore } from '../stores/advisers/advisers.store';
import { useAdviserMetricsStore } from '../stores/advisers/adviserMetrics.store';
import { WeeklyComparisonChart } from '../components/adviser/sections/WeeklyComparisonChart';
import { EarningsGrowthChart } from '../components/adviser/sections/EarningsGrowthChart';
import { MonthlySummary } from '../../core/domain/Adviser/Adviser';

export const AdviserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchAdviserById, currentAdviser, loading, error } = useAdvisersStore();
  const { calculateAdviserEarnings } = useAdviserMetricsStore();
  const [animateValue, setAnimateValue] = useState(0);

  // Obtener monthlySummaries directamente del currentAdviser
  const monthlySummaries: MonthlySummary[] = currentAdviser?.monthlySummaries || [];

  // Fetch datos del asesor
  useEffect(() => {
    if (!id) return;
    fetchAdviserById(id);
  }, [id, fetchAdviserById]);

  // Animación de ganancias
  useEffect(() => {
    if (currentAdviser && monthlySummaries.length > 0) {
      const currentMonth = new Date().getMonth() + 1;
      const currentMonthSummary = monthlySummaries.find((m: MonthlySummary) => m.month === currentMonth);
      const currentMonthSales = currentMonthSummary ? currentMonthSummary.totalSales : 0;
      const earnings = calculateAdviserEarnings(currentMonthSales);

      const duration = 2000;
      const steps = 60;
      const increment = earnings / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += increment;
        if (current >= earnings) {
          setAnimateValue(earnings);
          clearInterval(interval);
        } else {
          setAnimateValue(current);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [currentAdviser?.id, calculateAdviserEarnings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !currentAdviser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <p className="text-destructive">{error || 'Asesor no encontrado'}</p>
        <button
          onClick={() => navigate('/advisers')}
          className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <main className="flex-1 p-8 bg-background">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/advisers')}
          className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
        >
          Volver
        </button>
        <h1 className="text-3xl font-bold text-foreground">
          {currentAdviser.name} {currentAdviser.lastName}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card rounded-xl shadow-md border border-border p-6">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">Estado</h3>
          <p className={`text-2xl font-bold ${currentAdviser.active ? 'text-chart-1' : 'text-destructive'}`}>
            {currentAdviser.active ? 'Activo' : 'Inactivo'}
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-md border border-border p-6">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">UPT</h3>
          <p className="text-2xl font-bold text-foreground">
            {currentAdviser.upt || 'Sin datos registrados aún'}
          </p>
        </div>


        {/* Componente de gráficos de ganancias */}
        <EarningsGrowthChart 
          monthlySummaries={monthlySummaries}
          currentAdviser={currentAdviser}
          animateValue={animateValue}
        />

          {/* Comparación Semanal */}
        <div className="lg:col-span-3 mt-8">
            <WeeklyComparisonChart 
              adviserId={currentAdviser.id} 
            />
        </div>
      </div>
    </main>
  );
}; 