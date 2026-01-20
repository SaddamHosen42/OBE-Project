import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const GradeDistribution = ({ results }) => {
  // Extract grade distribution data
  const getGradeDistribution = () => {
    if (!results.grade_distribution && !results.student_results) {
      return [];
    }

    // If we have pre-calculated grade distribution
    if (results.grade_distribution) {
      return Object.entries(results.grade_distribution).map(([grade, count]) => ({
        grade,
        count,
        percentage: ((count / results.total_students) * 100).toFixed(1),
      }));
    }

    // Calculate from student results
    const gradeMap = {};
    results.student_results?.forEach((student) => {
      const grade = student.letter_grade;
      gradeMap[grade] = (gradeMap[grade] || 0) + 1;
    });

    return Object.entries(gradeMap)
      .map(([grade, count]) => ({
        grade,
        count,
        percentage: ((count / results.student_results.length) * 100).toFixed(1),
      }))
      .sort((a, b) => {
        const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];
        return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
      });
  };

  const distributionData = getGradeDistribution();

  const COLORS = {
    'A+': '#1e7e34',
    'A': '#28a745',
    'A-': '#4caf50',
    'B+': '#17a2b8',
    'B': '#5bc0de',
    'B-': '#7dd3fc',
    'C+': '#ffc107',
    'C': '#ffeb3b',
    'C-': '#fff176',
    'D': '#ff9800',
    'F': '#dc3545',
  };

  const getGradeColor = (grade) => {
    return COLORS[grade] || '#9e9e9e';
  };

  if (!distributionData || distributionData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No grade distribution data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Bar Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Grade Distribution Chart
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Number of Students">
                {distributionData.map((entry) => (
                  <Cell key={entry.grade} fill={getGradeColor(entry.grade)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Grade Distribution Pie
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="count"
                    nameKey="grade"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.grade}: ${entry.count}`}
                  >
                    {distributionData.map((entry) => (
                      <Cell key={entry.grade} fill={getGradeColor(entry.grade)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Grade Breakdown
              </Typography>
              <Box>
                {distributionData.map((item) => (
                  <Box key={item.grade} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" fontWeight="medium">
                        Grade {item.grade}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.count} students ({item.percentage}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={parseFloat(item.percentage)}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getGradeColor(item.grade),
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Statistics */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Grade Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Total Students
              </Typography>
              <Typography variant="h5">
                {distributionData.reduce((sum, item) => sum + item.count, 0)}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Most Common Grade
              </Typography>
              <Typography variant="h5">
                {distributionData.reduce((max, item) =>
                  item.count > max.count ? item : max
                ).grade}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                A Grades (A+, A, A-)
              </Typography>
              <Typography variant="h5" color="success.main">
                {distributionData
                  .filter((item) => ['A+', 'A', 'A-'].includes(item.grade))
                  .reduce((sum, item) => sum + item.count, 0)}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Failed (F)
              </Typography>
              <Typography variant="h5" color="error.main">
                {distributionData
                  .filter((item) => item.grade === 'F')
                  .reduce((sum, item) => sum + item.count, 0)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

GradeDistribution.propTypes = {
  results: PropTypes.shape({
    total_students: PropTypes.number,
    grade_distribution: PropTypes.object,
    student_results: PropTypes.arrayOf(
      PropTypes.shape({
        letter_grade: PropTypes.string,
      })
    ),
  }).isRequired,
};

export default GradeDistribution;
