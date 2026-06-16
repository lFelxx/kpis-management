import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdvisersStore } from '../stores/advisers/advisers.store';
import { getMonthlyCommissionsUseCase } from '../../core/instances/instances';
import { WeeklyComparisonChart } from '../components/adviser/sections/WeeklyComparisonChart';
import { EarningsGrowthChart } from '../components/adviser/sections/EarningsGrowthChart';
import { MonthlySummary } from '../../core/domain/Adviser/Adviser';
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

import { EMERALD, CYAN } from '../lib/colors';

export const AdviserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchAdviserById, clearSelectAdviser, currentAdviser, loading, error } = useAdvisersStore();
  const [animateValue, setAnimateValue] = useState(0);
  const [monthlyCommissions, setMonthlyCommissions] = useState<number[]>(() => Array(12).fill(0));
  const currentYear = new Date().getFullYear();

  const monthlySummaries: MonthlySummary[] = currentAdviser?.monthlySummaries || [];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;
    clearSelectAdviser();
    fetchAdviserById(id);
  }, [id, fetchAdviserById, clearSelectAdviser]);

  useEffect(() => {
    if (!currentAdviser?.id) return;
    let cancelled = false;
    getMonthlyCommissionsUseCase
      .execute(currentAdviser.id, currentYear)
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length === 12) {
          setMonthlyCommissions(data);
        }
      })
      .catch(() => {
        if (!cancelled) setMonthlyCommissions(Array(12).fill(0));
      });
    return () => { cancelled = true; };
  }, [currentAdviser?.id, currentYear]);

  useEffect(() => {
    if (!currentAdviser) return;
    const earnings = currentAdviser.commission ?? 0;
    if (earnings <= 0) { setAnimateValue(0); return; }
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
  }, [currentAdviser?.id, currentAdviser?.commission]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !currentAdviser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-background">
        <div className="p-6 rounded-[2rem] text-center max-w-sm"
          style={{
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.2)',
          }}>
          <p className="text-red-400 font-bold mb-4">{error || 'Asesor no encontrado'}</p>
          <button onClick={() => navigate('/advisers')} className="btn-primary">
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const initials = `${currentAdviser.name?.charAt(0) || ''}${currentAdviser.lastName?.charAt(0) || ''}`;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background relative min-h-screen">
      {/* Background Ornaments — isolated overflow-hidden wrapper avoids backdrop-filter compositor bug */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[200px] sm:w-[350px] lg:w-[500px] h-[200px] sm:h-[350px] lg:h-[500px] rounded-full blur-[120px]"
          style={{ background: `${EMERALD}0d` }} />
        <div className="absolute bottom-0 left-0 w-[200px] sm:w-[350px] lg:w-[500px] h-[200px] sm:h-[350px] lg:h-[500px] rounded-full blur-[120px]"
          style={{ background: `${CYAN}0d` }} />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-10 gap-4 md:gap-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/advisers')}
              className="p-3 flex items-center justify-center rounded-2xl group transition-all duration-300 cursor-pointer"
              style={{
                background: 'var(--s-subtle)',
                border: '1px solid var(--b-subtle)',
              }}
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-all" style={{ color: 'var(--t-muted)' }} />
            </button>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black shrink-0"
                style={{
                  background: `${EMERALD}15`,
                  border: `2px solid ${EMERALD}40`,
                  color: EMERALD,
                  boxShadow: `0 0 20px ${EMERALD}20`,
                }}
              >
                {initials}
              </div>
              <div className="text-left">
                <span className="text-xs font-black uppercase tracking-[0.3em] mb-1 block"
                  style={{ color: EMERALD }}>
                  Perfil de Asesor
                </span>
                <h1 className="text-4xl font-black tracking-tighter" style={{ color: 'var(--t-primary)' }}>
                  {currentAdviser.name} {currentAdviser.lastName}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="px-5 py-2.5 rounded-2xl flex items-center gap-2"
              style={{
                background: 'var(--s-subtle)',
                border: '1px solid var(--b-subtle)',
              }}
            >
              <div className={`w-2 h-2 rounded-full ${currentAdviser.active ? 'animate-pulse' : ''}`}
                style={{ background: currentAdviser.active ? EMERALD : '#f87171' }} />
              <span className="text-xs font-black uppercase tracking-widest"
                style={{ color: 'var(--t-secondary)' }}>
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
            className="rounded-[2rem] p-8 flex items-center gap-6"
            style={{
              background: 'var(--s-card)',
              border: '1px solid var(--b-line)',
            }}
          >
            <div
              className="p-4 rounded-2xl"
              style={{
                background: `${CYAN}12`,
                border: `1px solid ${CYAN}25`,
              }}
            >
              <TrendingUp className="w-8 h-8" style={{ color: CYAN }} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                style={{ color: 'var(--t-muted)' }}>
                Unidades por Ticket
              </p>
              <p className="text-2xl font-black" style={{ color: 'var(--t-primary)' }}>
                {currentAdviser.upt ? Number(currentAdviser.upt).toFixed(2) : '0.00'}
              </p>
            </div>
          </motion.div>

          <EarningsGrowthChart
            monthlySummaries={monthlySummaries}
            monthlyCommissions={monthlyCommissions}
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
          <WeeklyComparisonChart adviserId={currentAdviser.id} />
        </motion.div>
      </div>
    </main>
  );
};
