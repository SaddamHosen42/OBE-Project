import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/**
 * PieChart Component
 * A reusable pie chart component with DaisyUI styling
 * 
 * @param {Object} props
 * @param {Array} props.labels - Array of labels for segments
 * @param {Array} props.data - Array of data values
 * @param {string} props.title - Chart title
 * @param {Array} props.backgroundColor - Array of background colors
 * @param {Array} props.borderColor - Array of border colors
 * @param {Object} props.options - Additional chart options
 * @param {string} props.height - Chart height (default: '300px')
 */
const PieChart = ({ 
  labels = [], 
  data = [], 
  title = '', 
  backgroundColor = [],
  borderColor = [],
  options = {},
  height = '300px'
}) => {
  // Default DaisyUI-based colors
  const defaultBackgroundColors = [
    'hsl(var(--p))',      // primary
    'hsl(var(--s))',      // secondary
    'hsl(var(--a))',      // accent
    'hsl(var(--su))',     // success
    'hsl(var(--wa))',     // warning
    'hsl(var(--er))',     // error
    'hsl(var(--in))',     // info
    'hsl(var(--n))',      // neutral
  ];

  const defaultBorderColors = [
    'hsl(var(--p))',
    'hsl(var(--s))',
    'hsl(var(--a))',
    'hsl(var(--su))',
    'hsl(var(--wa))',
    'hsl(var(--er))',
    'hsl(var(--in))',
    'hsl(var(--n))',
  ];

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
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
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: backgroundColor.length > 0 
        ? backgroundColor 
        : defaultBackgroundColors.slice(0, data.length),
      borderColor: borderColor.length > 0 
        ? borderColor 
        : defaultBorderColors.slice(0, data.length),
      borderWidth: 2,
      hoverOffset: 4,
    }],
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...(options.plugins || {}),
    },
  };

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-4">
        <div style={{ height }}>
          <Pie data={chartData} options={mergedOptions} />
        </div>
      </div>
    </div>
  );
};

export default PieChart;
