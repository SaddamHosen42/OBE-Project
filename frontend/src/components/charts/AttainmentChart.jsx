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
 * AttainmentChart Component
 * Specialized chart for displaying CLO/PLO attainment levels with threshold indicators
 * Uses DaisyUI styling and color coding based on attainment levels
 * 
 * @param {Object} props
 * @param {Array} props.labels - Array of CLO/PLO labels
 * @param {Array} props.attainmentData - Array of attainment percentages (0-100)
 * @param {number} props.threshold - Minimum attainment threshold (default: 60)
 * @param {string} props.title - Chart title
 * @param {string} props.type - Type of outcomes ('CLO' or 'PLO')
 * @param {Object} props.options - Additional chart options
 * @param {string} props.height - Chart height (default: '400px')
 */
const AttainmentChart = ({ 
  labels = [], 
  attainmentData = [], 
  threshold = 60,
  title = '', 
  type = 'CLO',
  options = {},
  height = '400px'
}) => {
  // Color coding based on attainment level
  const getBarColor = (value) => {
    if (value >= 80) return 'hsl(var(--su))'; // Success - Excellent
    if (value >= threshold) return 'hsl(var(--p))'; // Primary - Satisfactory
    if (value >= 50) return 'hsl(var(--wa))'; // Warning - Marginal
    return 'hsl(var(--er))'; // Error - Below threshold
  };

  const backgroundColor = attainmentData.map(value => getBarColor(value));

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
            const value = context.parsed.y;
            let status = '';
            if (value >= 80) status = 'Excellent';
            else if (value >= threshold) status = 'Satisfactory';
            else if (value >= 50) status = 'Marginal';
            else status = 'Below Threshold';
            return `Attainment: ${value}% (${status})`;
          }
        }
      },
      annotation: {
        annotations: {
          thresholdLine: {
            type: 'line',
            yMin: threshold,
            yMax: threshold,
            borderColor: 'hsl(var(--er))',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: `Threshold: ${threshold}%`,
              enabled: true,
              position: 'end',
              backgroundColor: 'hsl(var(--er))',
              color: 'white',
              font: {
                size: 11,
                weight: 'bold',
              },
            },
          },
        },
      },
    },
    scales: {
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
          },
        },
        title: {
          display: true,
          text: 'Attainment Level (%)',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: 'bold',
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
        title: {
          display: true,
          text: type === 'CLO' ? 'Course Learning Outcomes' : 'Program Learning Outcomes',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
  };

  const chartData = {
    labels,
    datasets: [{
      label: `${type} Attainment`,
      data: attainmentData,
      backgroundColor,
      borderColor: backgroundColor,
      borderWidth: 1,
      borderRadius: 6,
    }],
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

  // Calculate statistics
  const averageAttainment = attainmentData.length > 0
    ? (attainmentData.reduce((sum, val) => sum + val, 0) / attainmentData.length).toFixed(1)
    : 0;
  
  const achievedCount = attainmentData.filter(val => val >= threshold).length;
  const achievementRate = attainmentData.length > 0
    ? ((achievedCount / attainmentData.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-4">
        {/* Statistics Header */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="stat bg-base-200 rounded-lg p-3">
            <div className="stat-title text-xs">Average Attainment</div>
            <div className="stat-value text-2xl">{averageAttainment}%</div>
          </div>
          <div className="stat bg-base-200 rounded-lg p-3">
            <div className="stat-title text-xs">Achievement Rate</div>
            <div className="stat-value text-2xl">{achievementRate}%</div>
          </div>
          <div className="stat bg-base-200 rounded-lg p-3">
            <div className="stat-title text-xs">Achieved / Total</div>
            <div className="stat-value text-2xl">{achievedCount}/{attainmentData.length}</div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ height }}>
          <Bar data={chartData} options={mergedOptions} />
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--su))' }}></div>
            <span>Excellent (≥80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--p))' }}></div>
            <span>Satisfactory (≥{threshold}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--wa))' }}></div>
            <span>Marginal (≥50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--er))' }}></div>
            <span>Below Threshold (&lt;50%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttainmentChart;
