import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

/**
 * RadarChart Component
 * A reusable radar chart component with DaisyUI styling
 * Perfect for displaying PLO/CLO attainment across multiple dimensions
 * 
 * @param {Object} props
 * @param {Array} props.labels - Array of labels for each axis
 * @param {Array} props.datasets - Array of dataset objects
 * @param {string} props.title - Chart title
 * @param {Object} props.options - Additional chart options
 * @param {string} props.height - Chart height (default: '400px')
 */
const RadarChart = ({ 
  labels = [], 
  datasets = [], 
  title = '', 
  options = {},
  height = '400px'
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
      r: {
        beginAtZero: true,
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 10,
          },
          backdropColor: 'transparent',
        },
      },
    },
  };

  const chartData = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label || `Dataset ${index + 1}`,
      data: dataset.data || [],
      backgroundColor: dataset.backgroundColor || 'hsla(var(--p), 0.2)',
      borderColor: dataset.borderColor || 'hsl(var(--p))',
      borderWidth: dataset.borderWidth || 2,
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
          <Radar data={chartData} options={mergedOptions} />
        </div>
      </div>
    </div>
  );
};

export default RadarChart;
