import PropTypes from 'prop-types';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';

export default function AttainmentLevelBadge({ level, size = 'md', showIcon = true, className = '' }) {
  // Determine level from value if a number is passed
  const getLevel = () => {
    if (typeof level === 'number') {
      if (level >= 80) return 'excellent';
      if (level >= 70) return 'high';
      if (level >= 60) return 'medium';
      if (level >= 50) return 'low';
      return 'very-low';
    }
    return level?.toLowerCase() || 'unknown';
  };

  const attainmentLevel = getLevel();

  // Configuration for different levels
  const levelConfig = {
    excellent: {
      label: 'Excellent',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    },
    high: {
      label: 'High',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: TrendingUp,
      iconColor: 'text-blue-600'
    },
    medium: {
      label: 'Medium',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600'
    },
    low: {
      label: 'Low',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: AlertTriangle,
      iconColor: 'text-orange-600'
    },
    'very-low': {
      label: 'Very Low',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
      iconColor: 'text-red-600'
    },
    unknown: {
      label: 'Unknown',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: AlertTriangle,
      iconColor: 'text-gray-600'
    }
  };

  const config = levelConfig[attainmentLevel] || levelConfig.unknown;
  const Icon = config.icon;

  // Size variations
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span
      className={`inline-flex items-center font-semibold border rounded-full ${config.color} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && (
        <Icon className={`${iconSizeClasses[size]} ${config.iconColor} mr-1.5`} />
      )}
      {config.label}
    </span>
  );
}

AttainmentLevelBadge.propTypes = {
  level: PropTypes.oneOfType([
    PropTypes.oneOf(['excellent', 'high', 'medium', 'low', 'very-low', 'unknown']),
    PropTypes.number
  ]).isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  className: PropTypes.string
};
