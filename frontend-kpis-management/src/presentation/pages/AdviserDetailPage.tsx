import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdvisersStore } from '../stores/advisers/advisers.store';
import { useAdviserMetricsStore } from '../stores/advisers/adviserMetrics.store';
import { WeeklyComparisonChart } from '../components/adviser/sections/WeeklyComparisonChart';
import { EarningsGrowthChart } from '../components/adviser/sections/EarningsGrowthChart';
import { MonthlySummary } from '../../core/domain/Adviser/Adviser';
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdviserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchAdviserById, currentAdviser, loading, error } = useAdvisersStore();
  const { calculateAdviserEarnings } = useAdviserMetricsStore();
  const [animateValue, setAnimateValue] = useState(0);

  // Obtener monthlySummaries directamente del currentAdviser
  const monthlySummaries: MonthlySummary[] = currentAdviser?.monthlySummaries || [];

  // Fetch datos del asesor y resetear scroll
  useEffect(() => {
    window.scrollTo(0, 0); // Reset scroll to top
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-background">
        <div className="bg-red-500/10 p-6 rounded-[2rem] border border-red-500/20 text-center max-w-sm">
          <p className="text-red-600 dark:text-red-400 font-bold mb-4">{error || 'Asesor no encontrado'}</p>
          <button
            onClick={() => navigate('/advisers')}
            className="btn-primary"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const initials = `${currentAdviser.name?.charAt(0) || ''}${currentAdviser.lastName?.charAt(0) || ''}`;

  return (
    <main className="flex-1 p-8 bg-background relative overflow-hidden min-h-screen">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/advisers')}
              className="btn-glass p-3 flex items-center justify-center rounded-2xl group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-600 p-[2px] shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full rounded-[1.4rem] bg-white dark:bg-black flex items-center justify-center border-2 border-white dark:border-black">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{initials}</span>
                </div>
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] mb-1 block">Perfil de Asesor</span>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {currentAdviser.name} {currentAdviser.lastName}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${currentAdviser.active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-white/60">
                {currentAdviser.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Info Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-slate-200/50 dark:border-white/10 p-8 flex items-center gap-6 shadow-xl dark:shadow-none"
          >
            <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20">
              <TrendingUp className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] mb-1">Unidades por Ticket</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {currentAdviser.upt || '0.00'}
              </p>
            </div>
          </motion.div>

          <EarningsGrowthChart
            monthlySummaries={monthlySummaries}
            currentAdviser={currentAdviser}
            animateValue={animateValue}
          />
        </div>

        {/* Full Width Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <WeeklyComparisonChart
            adviserId={currentAdviser.id}
          />
        </motion.div>
      </div>
    </main>
  );
};