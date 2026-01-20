import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const CGPAChart = ({ data, type, title }) => {
  // Sample data structure if not provided
  const sampleData = data || [
    { range: '3.5-4.0', count: 25, percentage: 25 },
    { range: '3.0-3.5', count: 35, percentage: 35 },
    { range: '2.5-3.0', count: 20, percentage: 20 },
    { range: '2.0-2.5', count: 15, percentage: 15 },
    { range: '< 2.0', count: 5, percentage: 5 },
  ];

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sampleData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#1976d2" name="Number of Students" />
        <Bar dataKey="percentage" fill="#2196f3" name="Percentage %" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => {
    // Transform data for line chart (typically for semester-wise trends)
    const lineData = data || [
      { semester: 'Sem 1', cgpa: 3.2 },
      { semester: 'Sem 2', cgpa: 3.3 },
      { semester: 'Sem 3', cgpa: 3.4 },
      { semester: 'Sem 4', cgpa: 3.5 },
      { semester: 'Sem 5', cgpa: 3.6 },
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={lineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" />
          <YAxis domain={[0, 4]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="cgpa"
            stroke="#1976d2"
            strokeWidth={2}
            name="Average CGPA"
            dot={{ fill: '#1976d2', r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title || (type === 'line' ? 'CGPA Trend' : 'CGPA Distribution')}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {type === 'line' ? renderLineChart() : renderBarChart()}
        </Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {type !== 'line' && sampleData.map((item, index) => (
            <Box key={index} sx={{ textAlign: 'center', minWidth: 100 }}>
              <Typography variant="h6" color="primary">
                {item.count}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.range}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

CGPAChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      range: PropTypes.string,
      count: PropTypes.number,
      percentage: PropTypes.number,
      semester: PropTypes.string,
      cgpa: PropTypes.number,
    })
  ),
  type: PropTypes.oneOf(['bar', 'line']),
  title: PropTypes.string,
};

CGPAChart.defaultProps = {
  data: null,
  type: 'bar',
  title: '',
};

export default CGPAChart;
