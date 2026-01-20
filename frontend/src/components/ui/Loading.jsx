import React from 'react';
import PropTypes from 'prop-types';

/**
 * Loading spinner component
 */
const Loading = ({
  size = 'md',
  variant = 'spinner',
  color = 'blue',
  text,
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    white: 'text-white'
  };

  const Spinner = () => (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  const Dots = () => (
    <div className="flex space-x-2">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  const Pulse = () => (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse bg-current`}></div>
  );

  const Bars = () => (
    <div className="flex space-x-1 items-end">
      <div className={`w-1 bg-current ${colorClasses[color]} animate-pulse`} style={{ height: '16px', animationDelay: '0ms' }}></div>
      <div className={`w-1 bg-current ${colorClasses[color]} animate-pulse`} style={{ height: '24px', animationDelay: '150ms' }}></div>
      <div className={`w-1 bg-current ${colorClasses[color]} animate-pulse`} style={{ height: '16px', animationDelay: '300ms' }}></div>
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return <Dots />;
      case 'pulse':
        return <Pulse />;
      case 'bars':
        return <Bars />;
      case 'spinner':
      default:
        return <Spinner />;
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderVariant()}
      {text && (
        <p className={`text-sm font-medium ${colorClasses[color]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
        {content}
      </div>
    );
  }

  return content;
};

Loading.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['spinner', 'dots', 'pulse', 'bars']),
  color: PropTypes.oneOf(['blue', 'gray', 'green', 'red', 'yellow', 'white']),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
  className: PropTypes.string
};

export default Loading;
