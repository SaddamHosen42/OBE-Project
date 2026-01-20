import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * BarChart Component
 * A reusable bar chart component with DaisyUI styling
 * 
 * @param {Object} props
 * @param {Array} props.labels - Array of labels for x-axis
 * @param {Array} props.datasets - Array of dataset objects
 * @param {string} props.title - Chart title
 * @param {Object} props.options - Additional chart options
 * @param {string} props.height - Chart height (default: '300px')
 */
const BarChart = ({ 
  labels = [], 
  datasets = [], 
  title = '', 
  options = {},
  height = '300px'
}) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      title: {
        display: !!title,
        text: title,
        font: {
          family: "'Inter', sans-serif",
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
        },
      },
    },
  };

  const chartData = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label || `Dataset ${index + 1}`,
      data: dataset.data || [],
      backgroundColor: dataset.backgroundColor || 'hsl(var(--p))',
      borderColor: dataset.borderColor || 'hsl(var(--p))',
      borderWidth: dataset.borderWidth || 1,
      borderRadius: dataset.borderRadius || 6,
      ...dataset,
    })),
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...(options.plugins || {}),
    },
    scales: {
      ...defaultOptions.scales,
      ...(options.scales || {}),
    },
  };

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-4">
        <div style={{ height }}>
          <Bar data={chartData} options={mergedOptions} />
        </div>
      </div>
    </div>
  );
};

export default BarChart;
