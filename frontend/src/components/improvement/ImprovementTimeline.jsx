import PropTypes from 'prop-types';
import { 
  FiCheckCircle, 
  FiCircle, 
  FiClock,
  FiTrendingUp,
  FiAlertCircle
} from 'react-icons/fi';

/**
 * ImprovementTimeline Component
 * Displays a chronological timeline of improvement initiatives and their outcomes
 * Shows progress, milestones, and key achievements
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of timeline events
 * @param {boolean} props.showFilters - Show date range filters
 */
const ImprovementTimeline = ({ data = [], showFilters = false }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="w-5 h-5 text-success" />;
      case 'in-progress':
        return <FiClock className="w-5 h-5 text-warning" />;
      case 'pending':
        return <FiCircle className="w-5 h-5 text-info" />;
      case 'cancelled':
        return <FiAlertCircle className="w-5 h-5 text-error" />;
      default:
        return <FiCircle className="w-5 h-5 text-base-content/50" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-success';
      case 'in-progress':
        return 'border-warning';
      case 'pending':
        return 'border-info';
      case 'cancelled':
        return 'border-error';
      default:
        return 'border-base-content/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-base-content/70">
          <FiClock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No timeline data available</p>
          <p className="text-sm mt-1">Improvements will appear here as they are tracked</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showFilters && (
        <div className="flex gap-4 mb-6">
          <select className="select select-bordered select-sm">
            <option>Last 6 Months</option>
            <option>Last Year</option>
            <option>Last 2 Years</option>
            <option>All Time</option>
          </select>
          <select className="select select-bordered select-sm">
            <option>All Status</option>
            <option>Completed</option>
            <option>In Progress</option>
            <option>Pending</option>
          </select>
        </div>
      )}

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-base-300"></div>

        {/* Timeline Events */}
        <div className="space-y-6">
          {data.map((event, index) => (
            <div key={index} className="relative flex gap-6">
              {/* Timeline Dot */}
              <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-4 ${getStatusColor(event.status)} bg-base-100 flex items-center justify-center`}>
                {getStatusIcon(event.status)}
              </div>

              {/* Event Content */}
              <div className="flex-1 pb-6">
                <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
                  <div className="card-body p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{event.title}</h3>
                        <p className="text-xs text-base-content/70 mt-1">
                          {formatDate(event.date)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {event.improvement !== undefined && (
                          <div className="flex items-center gap-1 text-success">
                            <FiTrendingUp className="w-4 h-4" />
                            <span className="font-semibold text-sm">
                              +{event.improvement}%
                            </span>
                          </div>
                        )}
                        {event.type && (
                          <span className="badge badge-sm badge-outline">
                            {event.type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                      <p className="text-sm text-base-content/80 mb-3">
                        {event.description}
                      </p>
                    )}

                    {/* Details */}
                    <div className="flex flex-wrap gap-3 text-xs">
                      {event.department && (
                        <div className="flex items-center gap-1 text-base-content/70">
                          <span className="font-semibold">Department:</span>
                          <span>{event.department}</span>
                        </div>
                      )}
                      {event.owner && (
                        <div className="flex items-center gap-1 text-base-content/70">
                          <span className="font-semibold">Owner:</span>
                          <span>{event.owner}</span>
                        </div>
                      )}
                      {event.affectedOutcomes && (
                        <div className="flex items-center gap-1 text-base-content/70">
                          <span className="font-semibold">Outcomes:</span>
                          <span>{event.affectedOutcomes}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar (for in-progress items) */}
                    {event.status === 'in-progress' && event.progress !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-base-content/70">Progress</span>
                          <span className="text-xs font-semibold">{event.progress}%</span>
                        </div>
                        <div className="w-full bg-base-200 rounded-full h-2">
                          <div 
                            className="bg-warning h-2 rounded-full transition-all" 
                            style={{ width: `${event.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Metrics (for completed items) */}
                    {event.status === 'completed' && event.metrics && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {event.metrics.map((metric, idx) => (
                          <div key={idx} className="bg-base-200 rounded p-2 text-center">
                            <p className="text-xs text-base-content/70">{metric.label}</p>
                            <p className="font-semibold text-sm">{metric.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions/Links */}
                    {event.actionPlanId && (
                      <div className="mt-3">
                        <a 
                          href={`/action-plans/${event.actionPlanId}`}
                          className="link link-primary text-xs"
                        >
                          View Action Plan →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="mt-8 p-4 bg-base-200 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-success">
              {data.filter(e => e.status === 'completed').length}
            </p>
            <p className="text-xs text-base-content/70">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">
              {data.filter(e => e.status === 'in-progress').length}
            </p>
            <p className="text-xs text-base-content/70">In Progress</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-info">
              {data.filter(e => e.status === 'pending').length}
            </p>
            <p className="text-xs text-base-content/70">Pending</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">
              {data.reduce((sum, e) => sum + (e.improvement || 0), 0) / data.filter(e => e.improvement).length || 0}%
            </p>
            <p className="text-xs text-base-content/70">Avg. Improvement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

ImprovementTimeline.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    date: PropTypes.string,
    status: PropTypes.oneOf(['completed', 'in-progress', 'pending', 'cancelled']),
    improvement: PropTypes.number,
    type: PropTypes.string,
    department: PropTypes.string,
    owner: PropTypes.string,
    affectedOutcomes: PropTypes.string,
    progress: PropTypes.number,
    metrics: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })),
    actionPlanId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  })),
  showFilters: PropTypes.bool,
};

export default ImprovementTimeline;
