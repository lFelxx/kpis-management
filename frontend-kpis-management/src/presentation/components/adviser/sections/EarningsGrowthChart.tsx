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

  // Datos para la gráfica de crecimiento
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthlySales = Array(12).fill(0);
  
  // Procesar datos mensuales
  monthlySummaries.forEach((m: MonthlySummary) => {
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
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'Ganancias Acumuladas',
        data: accumulatedEarnings,
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(147, 51, 234)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderDash: [5, 5],
        yAxisID: 'y',
      }
    ]
  };

  const lineOptions = {
    responsive: true,
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
          color: '#374151',
          font: {
            size: 12,
            weight: 'normal' as const
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          title: function (context: any) {
            return `${context[0].label} 2025`;
          },
          label: function (context: any) {
            const label = context.dataset.label;
            const value = formatCurrency(context.raw);
            return `${label}: ${value}`;
          },
          afterBody: function (context: any) {
            const monthIndex = context[0].dataIndex;
            if (monthIndex > 0 && netEarningsByMonth[monthIndex] > 0 && netEarningsByMonth[monthIndex - 1] > 0) {
              const current = netEarningsByMonth[monthIndex];
              const previous = netEarningsByMonth[monthIndex - 1];
              const growth = ((current - previous) / previous) * 100;
              return [``, `Crecimiento: ${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`];
            }
            return '';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value);
          },
          color: '#6b7280',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
          drawBorder: false
        },
        title: {
          display: true,
          text: 'Ganancias (COP)',
          color: '#374151',
          font: {
            size: 12,
            weight: 'bold' as const
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: 'Meses 2025',
          color: '#374151',
          font: {
            size: 12,
            weight: 'bold' as const
          }
        }
      }
    }
  };

  // Datos para el gráfico de barras
  const barData = {
    labels: ['Ventas', 'Meta'],
    datasets: [{
      label: 'Progreso',
      data: [currentAdviser.currentMonthSales ?? 0, currentAdviser.goalValue],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
    }],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Ventas vs Meta',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  // Calcular métricas
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthSummary = monthlySummaries.find((m: MonthlySummary) => m.month === currentMonth);
  const currentMonthSales = currentMonthSummary ? currentMonthSummary.totalSales : 0;
  const progress = Math.min((currentMonthSales / currentAdviser.goalValue) * 100, 100);

  // Calcular ventas brutas (con IVA) y netas (sin IVA) del mes actual
  const currentMonthSalesBruto = currentMonthSales; // Ventas con IVA incluido
  const currentMonthSalesNeto = currentMonthSales / 1.19; // Ventas sin IVA (dividir por 1.19)

  return (
    <div className="lg:col-span-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-emerald-800">Análisis de Ventas</h3>
          <p className="text-emerald-600">Ventas brutas, netas y comisiones del mes actual</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-emerald-700 animate-pulse">
            {formatCurrency(animateValue)}
          </p>
          <p className="text-sm text-emerald-600">Comisión del 1% (sobre ventas netas)</p>
        </div>
      </div>  

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gráfico de línea de crecimiento */}
        <div className="bg-white/50 p-6 rounded-lg border border-emerald-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-emerald-800">Evolución de Ganancias 2025</h4>
            <div className="text-right">
              <p className="text-sm text-emerald-600">Tasa de comisión: 1%</p>
              <p className="text-xs text-emerald-500">Sobre ventas netas (sin IVA)</p>
            </div>
          </div>
          <div className="h-80">
            <Line key={`line-chart-${currentAdviser.id}`} data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Gráfico de barras */}
        <div className="bg-white/50 p-6 rounded-lg border border-emerald-100">
          <h4 className="text-lg font-medium text-emerald-800 mb-4">Progreso de Ventas</h4>
          <div className="h-64">
            <Bar key={`bar-chart-${currentAdviser.id}`} data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Indicadores de ganancias */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/50 p-6 rounded-lg border border-emerald-100">
          <h4 className="text-sm font-medium text-emerald-800 mb-2">Ventas del Mes (Brutas)</h4>
          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(currentMonthSalesBruto)}</p>
          <p className="text-xs text-emerald-600 mt-1">Con IVA incluido</p>
        </div>

        <div className="bg-white/50 p-6 rounded-lg border border-emerald-100">
          <h4 className="text-sm font-medium text-emerald-800 mb-2">Ventas del Mes (Netas)</h4>
          <p className="text-2xl font-bold text-emerald-700">
            {formatCurrency(currentMonthSalesNeto)}
          </p>
          <p className="text-xs text-emerald-600 mt-1">Sin IVA</p>
        </div>

        <div className="bg-white/50 p-6 rounded-lg border border-emerald-100">
          <h4 className="text-sm font-medium text-emerald-800 mb-2">Progreso de Meta</h4>
          <div className="w-full bg-emerald-100 rounded-full h-2.5 mb-2">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm font-medium text-emerald-700">{progress.toFixed(1)}% alcanzado</p>
        </div>
      </div>
    </div>
  );
};
