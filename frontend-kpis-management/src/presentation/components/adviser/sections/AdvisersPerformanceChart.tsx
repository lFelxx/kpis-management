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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import { EMERALD, CYAN } from '../../../lib/colors';

interface Props {
  advisers: Adviser[];
}

const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || v;

const AdvisersPerformanceChart: React.FC<Props> = ({ advisers }) => {
  const chartData = useMemo(() => ({
    labels: advisers.map(a => `${a.name} ${a.lastName}`),
    datasets: [
      {
        label: 'Ventas',
        data: advisers.map(a => a.currentMonthSales ?? 0),
        backgroundColor: EMERALD,
        borderRadius: 6,
        barThickness: 10,
      },
      {
        label: 'Meta',
        data: advisers.map(a => a.goalValue),
        backgroundColor: css('--s-subtle'),
        borderRadius: 6,
        barThickness: 10,
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
          color: css('--t-muted'),
          font: { size: 11, weight: 'bold' },
          pointStyle: 'circle',
          usePointStyle: true,
          padding: 20,
        },
      },
      title: { display: false },
      tooltip: {
        backgroundColor: css('--s-sidebar'),
        titleColor: css('--t-primary'),
        bodyColor: css('--t-secondary'),
        borderColor: css('--b-line'),
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: context => {
            const value = context.raw as number;
            return ` ${context.dataset.label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: css('--t-micro'),
          font: { size: 10 },
          callback: val => `$${Number(val).toLocaleString()}`,
        },
        grid: { color: css('--b-subtle') },
        border: { display: false },
      },
      y: {
        ticks: {
          color: css('--t-muted'),
          font: { size: 10, weight: 'bold' },
        },
        grid: { display: false },
        border: { display: false },
      },
    },
    animation: { duration: 900, easing: 'easeInOutQuart' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="relative overflow-hidden rounded-[1.4rem]"
      style={{
        background: 'var(--s-card)',
        border: '1px solid var(--b-line)',
      }}
    >
      {/* Aurora bloom decorativo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 0% 100%, ${EMERALD}0d 0%, transparent 60%)`,
        }}
      />

      {/* Header */}
      <div
        className="relative z-10 px-7 pt-6 pb-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--b-subtle)' }}
      >
        <div>
          <span
            className="text-xs font-black uppercase tracking-[0.28em] block mb-0.5"
            style={{ color: `${CYAN}80` }}
          >
            Rendimiento Global
          </span>
          <h2 className="text-lg font-black tracking-tighter" style={{ color: 'var(--t-primary)' }}>
            Ventas vs Metas
          </h2>
        </div>
      </div>

      {/* Chart */}
      <div className="relative z-10 p-7" style={{ height: 420 }}>
        <Bar key="advisers-performance-chart" data={chartData} options={chartOptions} />
      </div>
    </motion.div>
  );
};

export default AdvisersPerformanceChart;
