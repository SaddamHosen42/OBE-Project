import PropTypes from 'prop-types';
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
 * GapChart Component
 * Visualizes performance gaps between target and actual attainment
 * Shows both target and actual values with gap indicators
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of gap data objects with code, target, actual
 * @param {string} props.type - Type of outcomes (CLO/PLO/PEO)
 * @param {string} props.height - Chart height
 * @param {string} props.title - Chart title
 */
const GapChart = ({ 
  data = [], 
  type = 'CLO',
  height = '400px',
  title = ''
}) => {
  // Prepare chart data
  const labels = data.map(item => item.code || item.label);
  const targetData = data.map(item => item.target || 0);
  const actualData = data.map(item => item.actual || 0);

  // Color coding for actual values based on performance
  const getBarColor = (actual, target) => {
    if (actual >= target) return 'rgba(34, 197, 94, 0.8)'; // Success - Met target
    if (actual >= target - 10) return 'rgba(59, 130, 246, 0.8)'; // Info - Near target
    if (actual >= target - 20) return 'rgba(251, 146, 60, 0.8)'; // Warning - Below target
    return 'rgba(239, 68, 68, 0.8)'; // Error - Critical gap
  };

  const actualColors = data.map(item => 
    getBarColor(item.actual || 0, item.target || 0)
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Target (%)',
        data: targetData,
        backgroundColor: 'rgba(147, 51, 234, 0.3)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
      },
      {
        label: 'Actual (%)',
        data: actualData,
        backgroundColor: actualColors,
        borderColor: actualColors.map(color => color.replace('0.8', '1')),
        borderWidth: 1,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
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
        text: title || `${type} Gap Analysis`,
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
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(1)}%`;
          },
          afterLabel: function(context) {
            if (context.datasetIndex === 1) {
              const target = targetData[context.dataIndex];
              const actual = actualData[context.dataIndex];
              const gap = target - actual;
              if (gap > 0) {
                return `Gap: -${gap.toFixed(1)}%`;
              } else if (gap < 0) {
                return `Exceeded: +${Math.abs(gap).toFixed(1)}%`;
              }
              return 'Target Met';
            }
            return '';
          }
        }
      },
    },
    scales: {
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
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          callback: function(value) {
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Attainment (%)',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center text-base-content/70">
          <FiBarChart2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No gap data available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
      
      {/* Gap Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.8)' }}></div>
          <span>Target Met</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.8)' }}></div>
          <span>Near Target (&lt;10% gap)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(251, 146, 60, 0.8)' }}></div>
          <span>Below Target (&lt;20% gap)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)' }}></div>
          <span>Critical Gap (&gt;20%)</span>
        </div>
      </div>
    </div>
  );
};

GapChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string,
    label: PropTypes.string,
    target: PropTypes.number,
    actual: PropTypes.number,
  })),
  type: PropTypes.oneOf(['CLO', 'PLO', 'PEO']),
  height: PropTypes.string,
  title: PropTypes.string,
};

// Import FiBarChart2 for empty state
import { FiBarChart2 } from 'react-icons/fi';

export default GapChart;
