import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = {
  primary: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  secondary: '#6B7280'
};

export default function PLOAttainmentRadar({
  data,
  height = 400,
  showLegend = true,
  className = ''
}) {
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(item => ({
      ...item,
      name: item.ploCode || item.name || 'Unknown',
      value: parseFloat(item.attainmentPercentage || item.value || 0)
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-indigo-600">
            Attainment: {data.value.toFixed(1)}%
          </p>
          {data.description && (
            <p className="text-xs text-gray-600 mt-1 max-w-xs">
              {data.description}
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
        <p className="text-gray-500">No data available for radar chart</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#6B7280', fontSize: 10 }}
          />
          <Radar
            name="PLO Attainment"
            dataKey="value"
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.6}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

PLOAttainmentRadar.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      ploCode: PropTypes.string,
      name: PropTypes.string,
      attainmentPercentage: PropTypes.number,
      value: PropTypes.number,
      description: PropTypes.string
    })
  ).isRequired,
  height: PropTypes.number,
  showLegend: PropTypes.bool,
  className: PropTypes.string
};
