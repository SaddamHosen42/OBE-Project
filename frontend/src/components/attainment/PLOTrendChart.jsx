import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const COLORS = {
  primary: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  secondary: '#6B7280',
  info: '#06B6D4'
};

const LINE_COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export default function PLOTrendChart({
  data,
  plos = [],
  showThreshold = true,
  threshold = 70,
  height = 400,
  className = ''
}) {
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data;
  }, [data]);

  const ploLines = useMemo(() => {
    if (plos.length > 0) return plos;
    
    // Extract PLO keys from data
    if (chartData.length > 0) {
      const firstDataPoint = chartData[0];
      return Object.keys(firstDataPoint)
        .filter(key => key !== 'period' && key !== 'semester' && key !== 'session')
        .map((key, index) => ({
          key,
          name: key,
          color: LINE_COLORS[index % LINE_COLORS.length]
        }));
    }
    return [];
  }, [chartData, plos]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}%
            </p>
          ))}
          {showThreshold && (
            <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200">
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
        <p className="text-gray-500">No trend data available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="period"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E7EB' }}
            domain={[0, 100]}
            label={{ value: 'Attainment %', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 12 } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          {showThreshold && (
            <ReferenceLine
              y={threshold}
              stroke={COLORS.danger}
              strokeDasharray="3 3"
              label={{
                value: `Target: ${threshold}%`,
                position: 'right',
                fill: COLORS.danger,
                fontSize: 12
              }}
            />
          )}

          {ploLines.map((plo) => (
            <Line
              key={plo.key}
              type="monotone"
              dataKey={plo.key}
              name={plo.name}
              stroke={plo.color}
              strokeWidth={2}
              dot={{ r: 4, fill: plo.color }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

PLOTrendChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  plos: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string
    })
  ),
  showThreshold: PropTypes.bool,
  threshold: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string
};
