import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * LineChart Component
 * A reusable line chart component with DaisyUI styling
 * 
 * @param {Object} props
 * @param {Array} props.labels - Array of labels for x-axis
 * @param {Array} props.datasets - Array of dataset objects
 * @param {string} props.title - Chart title
 * @param {Object} props.options - Additional chart options
 * @param {string} props.height - Chart height (default: '300px')
 * @param {boolean} props.fill - Whether to fill area under line
 */
const LineChart = ({ 
  labels = [], 
  datasets = [], 
  title = '', 
  options = {},
  height = '300px',
  fill = false
}) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
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
          color: 'rgba(0, 0, 0, 0.03)',
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
      borderColor: dataset.borderColor || 'hsl(var(--p))',
      backgroundColor: dataset.backgroundColor || 'hsla(var(--p), 0.1)',
      borderWidth: dataset.borderWidth || 2,
      fill: dataset.fill !== undefined ? dataset.fill : fill,
      tension: dataset.tension !== undefined ? dataset.tension : 0.4,
      pointRadius: dataset.pointRadius !== undefined ? dataset.pointRadius : 3,
      pointHoverRadius: dataset.pointHoverRadius !== undefined ? dataset.pointHoverRadius : 5,
      pointBackgroundColor: dataset.pointBackgroundColor || 'hsl(var(--p))',
      pointBorderColor: dataset.pointBorderColor || '#fff',
      pointBorderWidth: dataset.pointBorderWidth || 2,
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
          <Line data={chartData} options={mergedOptions} />
        </div>
      </div>
    </div>
  );
};

export default LineChart;
