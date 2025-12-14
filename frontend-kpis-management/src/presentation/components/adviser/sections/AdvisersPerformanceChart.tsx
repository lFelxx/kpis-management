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


const AdvisersPerformanceChart: React.FC<Props> = ({ advisers }) =>{
    const chartData = useMemo(() =>({
        labels: advisers.map(a => `${a.name} ${a.lastName}`),
        datasets: [
            {
              label: 'Ventas',
              data: advisers.map(a => a.currentMonthSales ?? 0),
              backgroundColor: 'rgba(16, 185, 129, 0.6)',
              borderColor: 'rgba(16, 185, 129, 0.8)',
              borderWidth: 1,
              borderRadius: 6,
              barThickness: 20,
            },
            {
              label: 'Meta',
              data: advisers.map(a => a.goalValue),
              backgroundColor: 'rgba(244, 63, 94, 0.6)',
              borderColor: 'rgba(244, 63, 94, 0.8)',
              borderWidth: 1,
              borderRadius: 6,
              barThickness: 20,
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
              color: '#ffffff',
              font: { size: 14, family: "'Inter', sans-serif" },
              pointStyle: 'circle',
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: 'Ventas vs Metas por Asesor',
            color: '#ffffff',
            font: { size: 18, weight: 'bold', family: "'Inter', sans-serif" }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            usePointStyle: true,
            callbacks: {
              label: context => {
                const value = context.raw as number;
                return `${context.dataset.label}: $${value.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: '#ffffff',
              callback: val => `$${Number(val).toLocaleString()}`
            },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          y: {
            ticks: { color: '#ffffff', font: { size: 12 } },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      };
    
      return (
        <motion.div
          className="mb-8 bg-card p-8 rounded-2xl shadow-md border border-border"
          style={{ height: '500px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Bar key="advisers-performance-chart" data={chartData} options={chartOptions} />
        </motion.div>
      );
}

export default AdvisersPerformanceChart;