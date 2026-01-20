import PropTypes from 'prop-types';
import { 
  FiCalendar, 
  FiTarget, 
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';

/**
 * CycleProgress Component
 * Displays the progress and details of a continuous improvement cycle
 * Shows milestones, completion status, and key metrics
 * 
 * @param {Object} props
 * @param {Object} props.cycle - Cycle data object
 * @param {boolean} props.compact - Compact view mode
 */
const CycleProgress = ({ cycle, compact = false }) => {
  if (!cycle) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center text-base-content/70">
          <FiAlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No active cycle</p>
          <p className="text-sm mt-1">Create a new improvement cycle to get started</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'progress-success';
    if (progress >= 50) return 'progress-warning';
    return 'progress-info';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'badge-success', label: 'Active' },
      planning: { class: 'badge-info', label: 'Planning' },
      review: { class: 'badge-warning', label: 'Under Review' },
      completed: { class: 'badge-primary', label: 'Completed' },
      archived: { class: 'badge-ghost', label: 'Archived' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!cycle.endDate) return null;
    const end = new Date(cycle.endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();

  if (compact) {
    return (
      <div className="card bg-base-100">
        <div className="card-body p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{cycle.name}</h3>
            {getStatusBadge(cycle.status)}
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-base-content/70">Overall Progress</span>
                <span className="text-xs font-semibold">{cycle.progress || 0}%</span>
              </div>
              <progress 
                className={`progress ${getProgressColor(cycle.progress || 0)} w-full`} 
                value={cycle.progress || 0} 
                max="100"
              ></progress>
            </div>
            {daysRemaining !== null && (
              <p className="text-xs text-base-content/70">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Overdue'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Cycle Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{cycle.name}</h2>
            {getStatusBadge(cycle.status)}
          </div>
          {cycle.description && (
            <p className="text-sm text-base-content/70">{cycle.description}</p>
          )}
        </div>
        {cycle.academicYear && (
          <div className="badge badge-lg badge-outline">
            {cycle.academicYear}
          </div>
        )}
      </div>

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <FiCalendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-base-content/70">Start Date</p>
                <p className="font-semibold text-sm">{formatDate(cycle.startDate)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <FiCalendar className="w-5 h-5 text-error" />
              <div>
                <p className="text-xs text-base-content/70">End Date</p>
                <p className="font-semibold text-sm">{formatDate(cycle.endDate)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <FiTarget className="w-5 h-5 text-success" />
              <div>
                <p className="text-xs text-base-content/70">Action Plans</p>
                <p className="font-semibold text-sm">
                  {cycle.completedActions || 0} / {cycle.totalActions || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body p-4">
            <div className="flex items-center gap-3">
              <FiUsers className="w-5 h-5 text-info" />
              <div>
                <p className="text-xs text-base-content/70">Stakeholders</p>
                <p className="font-semibold text-sm">{cycle.stakeholders || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="card bg-base-200 mb-6">
        <div className="card-body">
          <h3 className="font-semibold mb-4">Overall Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Cycle Completion</span>
                <span className="text-sm font-bold">{cycle.progress || 0}%</span>
              </div>
              <progress 
                className={`progress ${getProgressColor(cycle.progress || 0)} w-full h-3`} 
                value={cycle.progress || 0} 
                max="100"
              ></progress>
            </div>

            {/* Time Progress */}
            {cycle.startDate && cycle.endDate && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Time Progress</span>
                  <span className="text-sm">
                    {daysRemaining !== null && (
                      <>
                        {daysRemaining > 0 ? (
                          <span className="text-info">{daysRemaining} days remaining</span>
                        ) : (
                          <span className="text-error">Overdue by {Math.abs(daysRemaining)} days</span>
                        )}
                      </>
                    )}
                  </span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ 
                      width: `${Math.min(100, ((new Date() - new Date(cycle.startDate)) / (new Date(cycle.endDate) - new Date(cycle.startDate))) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Milestones/Phases */}
      {cycle.milestones && cycle.milestones.length > 0 && (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h3 className="font-semibold mb-4">Milestones</h3>
            <div className="space-y-3">
              {cycle.milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1">
                    {milestone.completed ? (
                      <FiCheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <FiClock className="w-5 h-5 text-base-content/30" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${milestone.completed ? 'text-base-content' : 'text-base-content/70'}`}>
                        {milestone.title}
                      </p>
                      <span className="text-xs text-base-content/70">
                        {formatDate(milestone.dueDate)}
                      </span>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-base-content/60 mt-1">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {cycle.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {Object.entries(cycle.metrics).map(([key, value], index) => (
            <div key={index} className="card bg-base-100 border border-base-300">
              <div className="card-body p-4 text-center">
                <p className="text-2xl font-bold text-primary">{value}</p>
                <p className="text-xs text-base-content/70 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

CycleProgress.propTypes = {
  cycle: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.oneOf(['active', 'planning', 'review', 'completed', 'archived']),
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    progress: PropTypes.number,
    academicYear: PropTypes.string,
    totalActions: PropTypes.number,
    completedActions: PropTypes.number,
    stakeholders: PropTypes.number,
    milestones: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      dueDate: PropTypes.string,
      completed: PropTypes.bool,
    })),
    metrics: PropTypes.object,
  }),
  compact: PropTypes.bool,
};

export default CycleProgress;
