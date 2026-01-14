import React, { useMemo } from "react";
import { Adviser } from "../../../../core/domain/Adviser/Adviser";
import { motion } from 'framer-motion';
import { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  advisers: Adviser[];
}

const AdvisersPerformanceChart: React.FC<Props> = ({ advisers }) => {
  const chartData = useMemo(() => ({
    labels: advisers.map(a => `${a.name} ${a.lastName}`),
    datasets: [
      {
        label: 'Ventas',
        data: advisers.map(a => a.currentMonthSales ?? 0),
        backgroundColor: '#10b981', // Emerald 500
        borderRadius: 4,
        barThickness: 12,
      },
      {
        label: 'Meta',
        data: advisers.map(a => a.goalValue),
        backgroundColor: 'rgba(156, 163, 175, 0.2)', // Gray 400 with opacity
        borderRadius: 4,
        barThickness: 12,
      },
    ],
  }), [advisers]);

  const chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(156, 163, 175, 0.8)',
          font: { size: 11, weight: 'bold', family: "'Inter', sans-serif" },
          pointStyle: 'circle',
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: context => {
            const value = context.raw as number;
            return ` ${context.dataset.label}: $${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(156, 163, 175, 0.5)',
          font: { size: 10 },
          callback: val => `$${Number(val).toLocaleString()}`
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.05)',
        },
        border: { display: false }
      },
      y: {
        ticks: {
          color: 'rgba(156, 163, 175, 0.8)',
          font: { size: 10, weight: 'bold' }
        },
        grid: { display: false },
        border: { display: false }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  return (
    <motion.div
      className="bg-white/70 dark:bg-black/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 shadow-xl dark:shadow-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] mb-1 block">Rendimiento Global</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ventas vs Metas</h2>
        </div>
      </div>
      <div style={{ height: '400px' }}>
        <Bar key="advisers-performance-chart" data={chartData} options={chartOptions} />
      </div>
    </motion.div>
  );
}

export default AdvisersPerformanceChart;