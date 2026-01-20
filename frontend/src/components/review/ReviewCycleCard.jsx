import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiFileText, FiEye } from 'react-icons/fi';

const ReviewCycleCard = ({ cycle }) => {
  // Determine status badge color
  const getStatusColor = (status) => {
    const colors = {
      'planned': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'archived': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Determine review type color
  const getReviewTypeColor = (type) => {
    const colors = {
      'annual': 'bg-purple-100 text-purple-800',
      'mid_cycle': 'bg-indigo-100 text-indigo-800',
      'comprehensive': 'bg-pink-100 text-pink-800',
      'continuous': 'bg-teal-100 text-teal-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (cycle.status === 'completed') return 100;
    if (cycle.status === 'planned') return 0;
    
    if (cycle.start_date && cycle.end_date) {
      const start = new Date(cycle.start_date);
      const end = new Date(cycle.end_date);
      const now = new Date();
      
      if (now < start) return 0;
      if (now > end) return 100;
      
      const total = end - start;
      const elapsed = now - start;
      return Math.round((elapsed / total) * 100);
    }
    
    return 0;
  };

  const progress = calculateProgress();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-1">
              {cycle.cycle_name}
            </h3>
            {cycle.degree_name && (
              <p className="text-blue-100 text-sm">
                {cycle.degree_name} - {cycle.department_name}
              </p>
            )}
          </div>
          <Link
            to={`/review-cycles/${cycle.id}`}
            className="ml-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
            title="View Details"
          >
            <FiEye className="w-5 h-5 text-white" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Status and Type Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cycle.status)}`}>
            {cycle.status?.replace('_', ' ').toUpperCase()}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReviewTypeColor(cycle.review_type)}`}>
            {cycle.review_type?.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">Start Date</div>
              <div className="font-medium">{formatDate(cycle.start_date)}</div>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiClock className="w-4 h-4 mr-2 text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">End Date</div>
              <div className="font-medium">{formatDate(cycle.end_date)}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {cycle.status === 'in_progress' && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Description */}
        {cycle.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {cycle.description}
          </p>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <FiFileText className="w-4 h-4" />
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {cycle.total_reports || 0}
            </div>
            <div className="text-xs text-gray-500">Reports</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-green-600 mb-1">
              <FiCheckCircle className="w-4 h-4" />
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {cycle.completed_items || 0}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-yellow-600 mb-1">
              <FiAlertCircle className="w-4 h-4" />
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {cycle.pending_items || 0}
            </div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
};

ReviewCycleCard.propTypes = {
  cycle: PropTypes.shape({
    id: PropTypes.number.isRequired,
    cycle_name: PropTypes.string.isRequired,
    degree_name: PropTypes.string,
    department_name: PropTypes.string,
    status: PropTypes.string.isRequired,
    review_type: PropTypes.string.isRequired,
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    description: PropTypes.string,
    total_reports: PropTypes.number,
    completed_items: PropTypes.number,
    pending_items: PropTypes.number,
  }).isRequired,
};

export default ReviewCycleCard;
