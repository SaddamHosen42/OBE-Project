import PropTypes from 'prop-types';

export default function AttainmentProgressBar({
  value,
  threshold = 70,
  size = 'md',
  showLabel = true,
  className = ''
}) {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  
  // Determine color based on value and threshold
  const getColor = () => {
    if (normalizedValue >= threshold) {
      return 'bg-green-500';
    } else if (normalizedValue >= threshold * 0.8) {
      return 'bg-yellow-500';
    } else if (normalizedValue >= threshold * 0.6) {
      return 'bg-orange-500';
    } else {
      return 'bg-red-500';
    }
  };

  // Size variations
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Progress Bar */}
        <div className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
          <div
            className={`${getColor()} h-full transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${normalizedValue}%` }}
          />
        </div>
        
        {/* Percentage Label */}
        {showLabel && (
          <span className={`font-semibold ${textSizeClasses[size]} text-gray-700 min-w-[3rem] text-right`}>
            {normalizedValue.toFixed(0)}%
          </span>
        )}
      </div>
      
      {/* Threshold Indicator */}
      {threshold && size !== 'sm' && (
        <div className="relative mt-1">
          <div
            className="absolute top-0 w-0.5 h-2 bg-gray-400"
            style={{ left: `${threshold}%` }}
          >
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {threshold}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

AttainmentProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  threshold: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showLabel: PropTypes.bool,
  className: PropTypes.string
};
