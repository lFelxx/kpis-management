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
import { useAdviserMetricsStore } from '../../../stores/advisers/adviserMetrics.store';
import { MonthlySummary } from '../../../../core/domain/Adviser/Adviser';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, DollarSign } from 'lucide-react';

// Registrar componentes de Chart.js
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

interface EarningsGrowthChartProps {
  monthlySummaries: MonthlySummary[];
  currentAdviser: {
    id: string | number;
    sales: number;
    goalValue: number;
    currentMonthSales?: number;
  };
  animateValue: number;
}

export const EarningsGrowthChart: React.FC<EarningsGrowthChartProps> = ({
  monthlySummaries,
  currentAdviser,
  animateValue
}) => {
  const { calculateAdviserEarnings, formatCurrency } = useAdviserMetricsStore();

  const currentYear = new Date().getFullYear();

  // Datos para la gráfica de crecimiento
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthlySales = Array(12).fill(0);

  // Procesar datos mensuales filtrando solo por el año actual
  monthlySummaries
    .filter((m: MonthlySummary) => m.year === currentYear)
    .forEach((m: MonthlySummary) => {
      if (m.month >= 1 && m.month <= 12) {
        monthlySales[m.month - 1] = m.totalSales || 0;
      }
    });

  const netEarningsByMonth = monthlySales.map((sales) => calculateAdviserEarnings(sales));
  const accumulatedEarnings: number[] = [];
  let sum = 0;
  for (let earning of netEarningsByMonth) {
    sum += earning;
    accumulatedEarnings.push(Math.round(sum));
  }

  // Configuración del gráfico de líneas
  const lineData = {
    labels: months,
    datasets: [
      {
        label: 'Ganancias Mensuales',
        data: netEarningsByMonth,
        borderColor: '#10b981', // Emerald 500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'Ganancias Acumuladas',
        data: accumulatedEarnings,
        borderColor: '#06b6d4', // Cyan 500
        backgroundColor: 'rgba(6, 181, 212, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderDash: [5, 5],
        yAxisID: 'y',
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: 'rgba(156, 163, 175, 1)', // Gray 400
          font: {
            size: 11,
            weight: 'bold' as const
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label;
            const value = formatCurrency(context.raw);
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${(value / 1000).toFixed(0)}k`,
          color: 'rgba(156, 163, 175, 0.5)',
          font: { size: 10 }
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: 'rgba(156, 163, 175, 0.5)',
          font: { size: 10 }
        },
        grid: { display: false }
      }
    }
  };

  // Datos para el gráfico de barras
  const barData = {
    labels: ['Ventas', 'Meta'],
    datasets: [{
      label: 'Valor',
      data: [currentAdviser.currentMonthSales ?? 0, currentAdviser.goalValue],
      backgroundColor: [
        'rgba(16, 185, 129, 0.6)',
        'rgba(255, 255, 255, 0.05)',
      ],
      borderColor: [
        '#10b981',
        'rgba(156, 163, 175, 0.2)',
      ],
      borderWidth: 1,
      borderRadius: 12,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        display: false
      },
      x: {
        grid: { display: false },
        ticks: {
          color: 'rgba(156, 163, 175, 0.5)',
          font: { size: 10, weight: 'bold' as const }
        }
      }
    }
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
        className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent rounded-[2rem] border border-emerald-500/20 p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl dark:shadow-none bg-white/40 dark:bg-black/40 backdrop-blur-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-center gap-6 text-left w-full md:w-auto">
          <div className="bg-emerald-500 p-4 rounded-3xl shadow-lg shadow-emerald-500/40">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] mb-1">Comisión Generada</h3>
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {formatCurrency(animateValue)}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-white/30 mt-1">1% sobre ventas netas (sin IVA)</p>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Zap className="w-4 h-4 fill-current" />
            <span className="text-sm font-black uppercase tracking-widest">Rendimiento</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-white/20">Calculado automáticamente cada mes</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-8 bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-slate-200/50 dark:border-white/10 p-8 shadow-xl dark:shadow-none">
          <div className="flex justify-between items-center mb-10">
            <div className="text-left">
              <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">Evolución Anual</h4>
              <p className="text-xs font-medium text-slate-500 dark:text-white/30">Crecimiento mensual vs acumulado</p>
            </div>
            <div className="px-3 py-1 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">
              FY {currentYear}
            </div>
          </div>
          <div className="h-80 relative">
            <Line key={`line-chart-${currentAdviser.id}`} data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Sidebar Metric Items */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Sales Progress Ring/Bar */}
          <div className="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-slate-200/50 dark:border-white/10 p-6 flex flex-col items-center justify-between shadow-xl dark:shadow-none min-h-[220px]">
            <div className="w-full flex justify-between items-center mb-6">
              <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">Progreso Meta</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{progress.toFixed(1)}%</span>
            </div>

            <div className="h-32 w-full relative -mt-4">
              <Bar data={barData} options={barOptions} />
            </div>

            <div className="w-full mt-4 pt-4 border-t border-slate-900/5 dark:border-white/5 flex flex-col gap-1 items-start">
              <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">Estado Actual</span>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {progress >= 100 ? '✅ OBJETIVO COMPLETADO' : '⚡ EN CAMINO AL ÉXITO'}
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[1.5rem] border border-slate-200/50 dark:border-white/10 p-5 shadow-xl dark:shadow-none">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">Ventas Brutas</span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white text-left">{formatCurrency(currentMonthSales)}</p>
            </div>

            <div className="bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-[1.5rem] border border-slate-200/50 dark:border-white/10 p-5 shadow-xl dark:shadow-none">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-cyan-500/10 rounded-xl">
                  <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <span className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">Ventas Netas</span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white text-left">{formatCurrency(currentMonthSales / 1.19)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
