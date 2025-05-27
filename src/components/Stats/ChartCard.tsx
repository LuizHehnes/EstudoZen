import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// registra componentes do chartjs
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type ChartType = 'bar' | 'pie' | 'line';

interface ChartCardProps {
  title: string;
  description?: string;
  type: ChartType;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }[];
  };
  options?: any;
}

export function ChartCard({ title, description, type, data, options }: ChartCardProps) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(39, 39, 42, 0.95)',
        titleColor: 'rgb(250, 250, 250)',
        bodyColor: 'rgb(212, 212, 216)',
        borderColor: 'rgb(63, 63, 70)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 13,
        },
      },
    },
    scales: type !== 'pie' ? {
      x: {
        grid: {
          color: 'rgba(63, 63, 70, 0.3)',
          borderColor: 'rgb(63, 63, 70)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(63, 63, 70, 0.3)',
          borderColor: 'rgb(63, 63, 70)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11,
          },
        },
      },
    } : undefined,
  };

  const chartOptions = {
    ...defaultOptions,
    ...options,
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={chartOptions} />;
      case 'pie':
        return <Pie data={data} options={chartOptions} />;
      case 'line':
        return <Line data={data} options={chartOptions} />;
      default:
        return <Bar data={data} options={chartOptions} />;
    }
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-heading font-semibold text-light-text-primary dark:text-dark-text-primary">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
            {description}
          </p>
        )}
      </div>
      <div className="h-64 w-full">
        {renderChart()}
      </div>
    </div>
  );
} 