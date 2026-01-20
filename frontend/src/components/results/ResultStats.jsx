import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
} from '@mui/icons-material';

const ResultStats = ({ results }) => {
  const {
    total_students = 0,
    passing_percentage = 0,
    average_marks = 0,
    highest_marks = 0,
    lowest_marks = 0,
    std_deviation = 0,
    median_marks = 0,
    passed_students = 0,
    failed_students = 0,
  } = results;

  const statsCards = [
    {
      title: 'Total Students',
      value: total_students,
      icon: <PeopleIcon />,
      color: 'primary.main',
      bgColor: 'primary.light',
    },
    {
      title: 'Passed',
      value: passed_students || Math.round((passing_percentage / 100) * total_students),
      icon: <CheckCircleIcon />,
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      title: 'Failed',
      value: failed_students || total_students - Math.round((passing_percentage / 100) * total_students),
      icon: <CancelIcon />,
      color: 'error.main',
      bgColor: 'error.light',
    },
    {
      title: 'Pass Rate',
      value: `${passing_percentage.toFixed(1)}%`,
      icon: passing_percentage >= 70 ? <TrendingUpIcon /> : <TrendingDownIcon />,
      color: passing_percentage >= 70 ? 'success.main' : 'warning.main',
      bgColor: passing_percentage >= 70 ? 'success.light' : 'warning.light',
    },
  ];

  const performanceMetrics = [
    {
      label: 'Average Marks',
      value: average_marks.toFixed(2),
      max: 100,
      color: 'primary',
    },
    {
      label: 'Highest Marks',
      value: highest_marks,
      max: 100,
      color: 'success',
    },
    {
      label: 'Lowest Marks',
      value: lowest_marks,
      max: 100,
      color: 'error',
    },
    {
      label: 'Median Marks',
      value: median_marks || average_marks.toFixed(2),
      max: 100,
      color: 'info',
    },
  ];

  return (
    <Box>
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: stat.bgColor,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Performance Metrics */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance Metrics
          </Typography>
          <Grid container spacing={3}>
            {performanceMetrics.map((metric, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" fontWeight="medium">
                      {metric.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.value} / {metric.max}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(parseFloat(metric.value) / metric.max) * 100}
                    color={metric.color}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Additional Statistics */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Standard Deviation
                </Typography>
                <Typography variant="h5" fontWeight="medium">
                  {std_deviation?.toFixed(2) || 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Measure of score spread
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Class Average
                </Typography>
                <Typography variant="h5" fontWeight="medium">
                  {average_marks.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mean performance score
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Performance Rating
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" gap={0.5}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      sx={{
                        color: i < Math.round((passing_percentage / 100) * 5) ? 'warning.main' : 'action.disabled',
                        fontSize: 24,
                      }}
                    />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Based on pass rate
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Indicators
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Excellent (90-100)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {results.grade_counts?.['A+'] || 0} students
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Good (80-89)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(results.grade_counts?.['A'] || 0) + (results.grade_counts?.['A-'] || 0)} students
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Average (70-79)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(results.grade_counts?.['B+'] || 0) + (results.grade_counts?.['B'] || 0)} students
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Below Average (60-69)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(results.grade_counts?.['C+'] || 0) + (results.grade_counts?.['C'] || 0)} students
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Poor (&lt;60)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(results.grade_counts?.['D'] || 0) + (results.grade_counts?.['F'] || 0)} students
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Class Performance Analysis
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {passing_percentage >= 80
                    ? 'Excellent class performance with high pass rate.'
                    : passing_percentage >= 70
                    ? 'Good class performance with satisfactory pass rate.'
                    : passing_percentage >= 60
                    ? 'Average class performance. Consider additional support.'
                    : 'Below average performance. Immediate attention required.'}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  The average score of {average_marks.toFixed(2)} indicates{' '}
                  {average_marks >= 75
                    ? 'strong overall understanding'
                    : average_marks >= 60
                    ? 'moderate understanding'
                    : 'need for improvement'}{' '}
                  of course content.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Score distribution (SD: {std_deviation?.toFixed(2) || 'N/A'}) shows{' '}
                  {std_deviation < 10
                    ? 'consistent performance across students'
                    : std_deviation < 20
                    ? 'moderate variation in student performance'
                    : 'high variation in student performance levels'}.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

ResultStats.propTypes = {
  results: PropTypes.shape({
    total_students: PropTypes.number,
    passing_percentage: PropTypes.number,
    average_marks: PropTypes.number,
    highest_marks: PropTypes.number,
    lowest_marks: PropTypes.number,
    std_deviation: PropTypes.number,
    median_marks: PropTypes.number,
    passed_students: PropTypes.number,
    failed_students: PropTypes.number,
    grade_counts: PropTypes.object,
  }).isRequired,
};

export default ResultStats;
