import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

const COLORS = {
  primary: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  secondary: '#6B7280'
};

const CHART_COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export default function IndirectAttainmentChart({
  data,
  type = 'bar',
  showThreshold = false,
  threshold = 70,
  height = 400,
  className = ''
}) {
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data;
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
          {showThreshold && (
            <p className="text-xs text-gray-600 mt-1">
              Threshold: {threshold}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 ${className}`} style={{ height }}>
        <p className="text-gray-500">No data available for chart</p>
      </div>
    );
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="label" 
          stroke="#6B7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6B7280"
          style={{ fontSize: '12px' }}
          domain={[0, 100]}
          label={{ value: 'Attainment (%)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {showThreshold && (
          <ReferenceLine 
            y={threshold} 
            stroke={COLORS.danger} 
            strokeDasharray="3 3"
            label={{ value: `Threshold (${threshold}%)`, position: 'right' }}
          />
        )}
        <Bar 
          dataKey="attainment" 
          fill={COLORS.primary}
          name="Attainment %"
          radius={[8, 8, 0, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.attainment >= threshold ? COLORS.success : COLORS.warning}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="label" 
          stroke="#6B7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6B7280"
          style={{ fontSize: '12px' }}
          domain={[0, 100]}
          label={{ value: 'Attainment (%)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {showThreshold && (
          <ReferenceLine 
            y={threshold} 
            stroke={COLORS.danger} 
            strokeDasharray="3 3"
            label={{ value: `Threshold (${threshold}%)`, position: 'right' }}
          />
        )}
        <Line 
          type="monotone" 
          dataKey="attainment" 
          stroke={COLORS.primary}
          strokeWidth={2}
          name="Attainment %"
          dot={{ fill: COLORS.primary, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderRadarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis 
          dataKey="label" 
          stroke="#6B7280"
          style={{ fontSize: '11px' }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]}
          stroke="#6B7280"
          style={{ fontSize: '10px' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Radar
          name="Attainment %"
          dataKey="attainment"
          stroke={COLORS.primary}
          fill={COLORS.primary}
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'radar':
        return renderRadarChart();
      case 'bar':
      default:
        return renderBarChart();
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {renderChart()}
    </div>
  );
}

IndirectAttainmentChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      attainment: PropTypes.number.isRequired
    })
  ).isRequired,
  type: PropTypes.oneOf(['bar', 'line', 'radar']),
  showThreshold: PropTypes.bool,
  threshold: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string
};
