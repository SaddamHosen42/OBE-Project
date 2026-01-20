/**
 * LoadingSpinner Component
 * Displays a loading spinner with customizable size
 * 
 * @component
 * @param {Object} props
 * @param {'small'|'medium'|'large'} props.size - Size of the spinner (default: 'medium')
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <LoadingSpinner size="large" />
 */
const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'loading-sm',
    medium: 'loading-md',
    large: 'loading-lg',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className={`loading loading-spinner ${sizeClasses[size]}`}></span>
    </div>
  );
};

export default LoadingSpinner;
