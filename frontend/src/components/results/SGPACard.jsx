import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

const SGPACard = ({ title, value, trend, icon }) => {
  const getIcon = () => {
    switch (icon) {
      case 'people':
        return <PeopleIcon sx={{ fontSize: 40 }} />;
      case 'school':
        return <SchoolIcon sx={{ fontSize: 40 }} />;
      default:
        return <SchoolIcon sx={{ fontSize: 40 }} />;
    }
  };

  const getTrendIcon = () => {
    if (trend === undefined || trend === null) return null;
    if (trend > 0) {
      return <TrendingUpIcon color="success" />;
    } else if (trend < 0) {
      return <TrendingDownIcon color="error" />;
    }
    return null;
  };

  const getGPAColor = (gpa) => {
    if (typeof gpa !== 'number') return 'text.secondary';
    if (gpa >= 3.5) return 'success.main';
    if (gpa >= 3.0) return 'primary.main';
    if (gpa >= 2.5) return 'warning.main';
    return 'error.main';
  };

  const getProgressValue = (gpa) => {
    if (typeof gpa !== 'number') return 0;
    return (gpa / 4.0) * 100;
  };

  const isNumeric = typeof value === 'number';

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
            >
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontWeight: 'bold',
                  color: isNumeric ? getGPAColor(value) : 'text.primary',
                }}
              >
                {isNumeric ? value.toFixed(2) : value}
              </Typography>
              {trend !== undefined && trend !== null && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {getTrendIcon()}
                  <Typography
                    variant="body2"
                    color={trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary'}
                  >
                    {Math.abs(trend).toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Box>
            {isNumeric && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={getProgressValue(value)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getGPAColor(value),
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {value >= 0 ? `${((value / 4.0) * 100).toFixed(0)}%` : 'N/A'} of maximum GPA
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 2,
              backgroundColor: 'primary.light',
              color: 'primary.main',
            }}
          >
            {getIcon()}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

SGPACard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  trend: PropTypes.number,
  icon: PropTypes.oneOf(['people', 'school']),
};

SGPACard.defaultProps = {
  trend: undefined,
  icon: 'school',
};

export default SGPACard;
