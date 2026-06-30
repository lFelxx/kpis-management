import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { formatCurrency } from '../../../lib/format';
import { MonthlySummary } from '../../../../core/domain/Adviser/Adviser';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, DollarSign } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { EMERALD, CYAN } from '../../../lib/colors';

interface EarningsGrowthChartProps {
  monthlySummaries: MonthlySummary[];
  monthlyCommissions: number[];
  currentAdviser: {
    id: string | number;
    sales: number;
    goalValue: number;
    currentMonthSales?: number;
  };
  animateValue: number;
}

const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || v;

export const EarningsGrowthChart: React.FC<EarningsGrowthChartProps> = ({
  monthlySummaries,
  monthlyCommissions,
  currentAdviser,
  animateValue,
}) => {
  const currentYear = new Date().getFullYear();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const commissionsByMonth = Array.from({ length: 12 }, (_, i) => {
    const c = monthlyCommissions[i];
    return typeof c === 'number' && !Number.isNaN(c) ? c : 0;
  });

  const accumulatedCommissions: number[] = [];
  let runningTotal = 0;
  for (const c of commissionsByMonth) {
    runningTotal += c;
    accumulatedCommissions.push(Math.round(runningTotal));
  }

  const lineData = {
    labels: months,
    datasets: [
      {
        label: 'Comisión Mensual',
        data: commissionsByMonth,
        borderColor: EMERALD,
        backgroundColor: `${EMERALD}1a`,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: EMERALD,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'Comisión Acumulada',
        data: accumulatedCommissions,
        borderColor: CYAN,
        backgroundColor: `${CYAN}0d`,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: CYAN,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderDash: [5, 5],
        yAxisID: 'y',
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: css('--t-muted'),
          font: { size: 11, weight: 'bold' as const },
        },
      },
      tooltip: {
        backgroundColor: css('--s-sidebar'),
        titleColor: css('--t-primary'),
        bodyColor: css('--t-secondary'),
        borderColor: css('--b-line'),
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label;
            const value = formatCurrency(context.raw);
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${(value / 1000).toFixed(0)}k`,
          color: css('--t-micro'),
          font: { size: 10 },
        },
        grid: { color: css('--b-subtle'), drawBorder: false },
        border: { display: false },
      },
      x: {
        ticks: { color: css('--t-muted'), font: { size: 10 } },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  const barData = {
    labels: ['Ventas', 'Meta'],
    datasets: [
      {
        label: 'Valor',
        data: [currentAdviser.currentMonthSales ?? 0, currentAdviser.goalValue],
        backgroundColor: [`${EMERALD}55`, css('--s-subtle')],
        borderColor: [EMERALD, css('--b-subtle')],
        borderWidth: 1,
        borderRadius: 12,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, display: false },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: css('--t-muted'),
          font: { size: 10, weight: 'bold' as const },
        },
      },
    },
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentMonthSummary = monthlySummaries.find((m: MonthlySummary) => m.month === currentMonth);
  const currentMonthSales = currentMonthSummary ? currentMonthSummary.totalSales : 0;
  const progress = Math.min((currentMonthSales / currentAdviser.goalValue) * 100, 100);

  return (
    <div className="lg:col-span-3 space-y-8">
      {/* Commission Spotlight Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2rem] border p-8 flex flex-col md:flex-row justify-between items-center gap-8"
        style={{
          background: `linear-gradient(135deg, ${EMERALD}0f 0%, var(--s-card) 55%, var(--s-card) 100%)`,
          border: `1px solid ${EMERALD}25`,
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
          style={{ background: `${EMERALD}12` }} />

        <div className="flex items-center gap-6 text-left w-full md:w-auto">
          <div className="p-4 rounded-3xl shadow-lg"
            style={{
              background: EMERALD,
              boxShadow: `0 8px 24px ${EMERALD}40`,
            }}>
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-1"
              style={{ color: EMERALD }}>
              Comisión Generada
            </h3>
            <p className="text-4xl font-black tracking-tighter" style={{ color: 'var(--t-primary)' }}>
              {formatCurrency(animateValue)}
            </p>
            <p className="text-xs font-medium mt-1" style={{ color: 'var(--t-muted)' }}>
              Hasta 1,2% según cumplimiento de la tienda
            </p>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-end gap-1">
          <div className="flex items-center gap-2" style={{ color: EMERALD }}>
            <Zap className="w-4 h-4 fill-current" />
            <span className="text-sm font-black uppercase tracking-widest">Rendimiento</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--t-micro)' }}>
            Calculado automáticamente cada mes
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-8 rounded-[2rem] border p-8"
          style={{
            background: 'var(--s-card)',
            border: '1px solid var(--b-line)',
          }}>
          <div className="flex justify-between items-center mb-10">
            <div className="text-left">
              <h4 className="text-lg font-black tracking-tight uppercase" style={{ color: 'var(--t-primary)' }}>
                Evolución Anual
              </h4>
              <p className="text-xs font-medium" style={{ color: 'var(--t-muted)' }}>
                Crecimiento mensual vs acumulado
              </p>
            </div>
            <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
              style={{
                background: 'var(--s-subtle)',
                border: '1px solid var(--b-line)',
                color: 'var(--t-muted)',
              }}>
              FY {currentYear}
            </div>
          </div>
          <div className="h-80 relative">
            <Line key={`line-chart-${currentAdviser.id}`} data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Sidebar Metric Items */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Sales Progress */}
          <div className="rounded-[2rem] border p-6 flex flex-col items-center justify-between min-h-[220px]"
            style={{
              background: 'var(--s-card)',
              border: '1px solid var(--b-line)',
            }}>
            <div className="w-full flex justify-between items-center mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]"
                style={{ color: 'var(--t-muted)' }}>
                Progreso Meta
              </span>
              <span className="text-sm font-black" style={{ color: EMERALD }}>
                {progress.toFixed(1)}%
              </span>
            </div>

            <div className="h-32 w-full relative -mt-4">
              <Bar data={barData} options={barOptions} />
            </div>

            <div className="w-full mt-4 pt-4 flex flex-col gap-1 items-start"
              style={{ borderTop: '1px solid var(--b-subtle)' }}>
              <span className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: 'var(--t-muted)' }}>
                Estado Actual
              </span>
              <p className="text-sm font-black" style={{ color: 'var(--t-secondary)' }}>
                {progress >= 100 ? '✅ OBJETIVO COMPLETADO' : '⚡ EN CAMINO AL ÉXITO'}
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-[1.5rem] border p-5"
              style={{
                background: 'var(--s-card)',
                border: '1px solid var(--b-line)',
              }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl"
                  style={{ background: `${EMERALD}12`, border: `1px solid ${EMERALD}20` }}>
                  <TrendingUp className="w-4 h-4" style={{ color: EMERALD }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: 'var(--t-muted)' }}>
                  Ventas Brutas
                </span>
              </div>
              <p className="text-xl font-black text-left" style={{ color: 'var(--t-primary)' }}>
                {formatCurrency(currentMonthSales)}
              </p>
            </div>

            <div className="rounded-[1.5rem] border p-5"
              style={{
                background: 'var(--s-card)',
                border: '1px solid var(--b-line)',
              }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl"
                  style={{ background: `${CYAN}12`, border: `1px solid ${CYAN}20` }}>
                  <Zap className="w-4 h-4" style={{ color: CYAN }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: 'var(--t-muted)' }}>
                  Ventas Netas
                </span>
              </div>
              <p className="text-xl font-black text-left" style={{ color: 'var(--t-primary)' }}>
                {formatCurrency(currentMonthSales / 1.19)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
