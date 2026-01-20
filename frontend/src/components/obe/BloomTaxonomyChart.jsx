import React from 'react';
import { Brain } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const BloomTaxonomyChart = ({ data = [], type = 'bar' }) => {
  const bloomLevels = [
    { id: 1, name: 'Remember', color: '#3B82F6', description: 'Recall facts and basic concepts' },
    { id: 2, name: 'Understand', color: '#10B981', description: 'Explain ideas or concepts' },
    { id: 3, name: 'Apply', color: '#F59E0B', description: 'Use information in new situations' },
    { id: 4, name: 'Analyze', color: '#EF4444', description: 'Draw connections among ideas' },
    { id: 5, name: 'Evaluate', color: '#8B5CF6', description: 'Justify a decision or course of action' },
    { id: 6, name: 'Create', color: '#EC4899', description: 'Produce new or original work' }
  ];

  // Process data to count outcomes at each Bloom level
  const processData = () => {
    const counts = {};
    bloomLevels.forEach(level => {
      counts[level.id] = 0;
    });

    data.forEach(item => {
      const levelId = item.bloom_level_id || item.bloom_level;
      if (levelId && counts[levelId] !== undefined) {
        counts[levelId]++;
      }
    });

    return bloomLevels.map(level => ({
      name: level.name,
      count: counts[level.id],
      color: level.color,
      description: level.description,
      percentage: data.length > 0 ? Math.round((counts[level.id] / data.length) * 100) : 0
    }));
  };

  const chartData = processData();
  const totalOutcomes = data.length;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{data.description}</p>
          <p className="text-sm font-medium text-blue-600 mt-1">
            Count: {data.count} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (totalOutcomes === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>No data available for Bloom's Taxonomy analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>Bloom's Taxonomy Distribution</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Analysis of {totalOutcomes} learning outcomes across cognitive levels
          </p>
        </div>
      </div>

      {/* Chart Visualization */}
      {type === 'bar' ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="count" 
                fill="#3B82F6"
                radius={[8, 8, 0, 0]}
                name="Number of Outcomes"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.filter(d => d.count > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chartData.map((level) => (
          <div
            key={level.name}
            className="bg-white border border-gray-200 rounded-lg p-4"
            style={{ borderLeftWidth: '4px', borderLeftColor: level.color }}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{level.name}</h4>
              <span className="text-2xl font-bold" style={{ color: level.color }}>
                {level.count}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">{level.description}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{ 
                  width: `${level.percentage}%`,
                  backgroundColor: level.color
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">{level.percentage}%</p>
          </div>
        ))}
      </div>

      {/* Analysis Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Distribution Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-1">Lower Order Thinking Skills (LOTS)</p>
            <p className="text-xs">
              Remember, Understand, Apply: {' '}
              <span className="font-semibold">
                {chartData.slice(0, 3).reduce((sum, level) => sum + level.count, 0)} outcomes
                ({chartData.slice(0, 3).reduce((sum, level) => sum + level.percentage, 0)}%)
              </span>
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Higher Order Thinking Skills (HOTS)</p>
            <p className="text-xs">
              Analyze, Evaluate, Create: {' '}
              <span className="font-semibold">
                {chartData.slice(3, 6).reduce((sum, level) => sum + level.count, 0)} outcomes
                ({chartData.slice(3, 6).reduce((sum, level) => sum + level.percentage, 0)}%)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {chartData.slice(3, 6).reduce((sum, level) => sum + level.percentage, 0) < 40 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2">Recommendation</h4>
          <p className="text-sm text-yellow-800">
            Consider increasing Higher Order Thinking Skills (HOTS) outcomes to at least 40% of total outcomes 
            to ensure students develop critical thinking and problem-solving abilities.
          </p>
        </div>
      )}
    </div>
  );
};

export default BloomTaxonomyChart;
