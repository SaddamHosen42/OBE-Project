import PropTypes from 'prop-types';
import { FiCheckCircle, FiCircle, FiClock, FiCalendar } from 'react-icons/fi';

const ReviewTimeline = ({ events, currentStatus }) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determine if event is completed
  const isCompleted = (event) => {
    return event.status === 'completed' || event.is_completed;
  };

  // Determine if event is current
  const isCurrent = (event) => {
    return event.status === 'in_progress' || event.is_current;
  };

  // Get event icon
  const getEventIcon = (event) => {
    if (isCompleted(event)) {
      return <FiCheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (isCurrent(event)) {
      return <FiClock className="w-5 h-5 text-blue-600 animate-pulse" />;
    }
    return <FiCircle className="w-5 h-5 text-gray-400" />;
  };

  // Get event color classes
  const getEventColor = (event) => {
    if (isCompleted(event)) {
      return {
        bg: 'bg-green-100',
        border: 'border-green-500',
        text: 'text-green-800',
        line: 'bg-green-500'
      };
    }
    if (isCurrent(event)) {
      return {
        bg: 'bg-blue-100',
        border: 'border-blue-500',
        text: 'text-blue-800',
        line: 'bg-blue-500'
      };
    }
    return {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      text: 'text-gray-600',
      line: 'bg-gray-300'
    };
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FiCalendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No timeline events available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300" />

      {/* Timeline Events */}
      <div className="space-y-6">
        {events.map((event, index) => {
          const colors = getEventColor(event);
          
          return (
            <div key={event.id || index} className="relative pl-16">
              {/* Event Icon */}
              <div className={`absolute left-0 w-12 h-12 rounded-full border-4 ${colors.border} ${colors.bg} flex items-center justify-center z-10`}>
                {getEventIcon(event)}
              </div>

              {/* Connecting Line */}
              {index < events.length - 1 && (
                <div className={`absolute left-6 top-12 w-0.5 h-6 ${colors.line}`} />
              )}

              {/* Event Card */}
              <div className={`bg-white rounded-lg shadow-sm border ${colors.border} p-4 hover:shadow-md transition-shadow`}>
                {/* Event Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className={`font-semibold ${colors.text} mb-1`}>
                      {event.title || event.event_name}
                    </h4>
                    {event.description && (
                      <p className="text-sm text-gray-600">{event.description}</p>
                    )}
                  </div>
                  {event.priority && (
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                      event.priority === 'high' ? 'bg-red-100 text-red-800' :
                      event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.priority}
                    </span>
                  )}
                </div>

                {/* Event Details */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {event.date && (
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-1 text-gray-400" />
                      <span>{formatDate(event.date)}</span>
                      {event.date && formatTime(event.date) && (
                        <span className="ml-1 text-gray-400">
                          at {formatTime(event.date)}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {event.deadline && (
                    <div className="flex items-center">
                      <FiClock className="w-4 h-4 mr-1 text-gray-400" />
                      <span>Due: {formatDate(event.deadline)}</span>
                    </div>
                  )}

                  {event.responsible_person && (
                    <div className="flex items-center">
                      <span className="text-gray-500">By:</span>
                      <span className="ml-1 font-medium">{event.responsible_person}</span>
                    </div>
                  )}
                </div>

                {/* Event Metadata */}
                {(event.notes || event.attachments_count > 0) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {event.notes && (
                      <p className="text-xs text-gray-500 mb-2">{event.notes}</p>
                    )}
                    {event.attachments_count > 0 && (
                      <span className="inline-flex items-center text-xs text-gray-500">
                        📎 {event.attachments_count} attachment{event.attachments_count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}

                {/* Completion Info */}
                {isCompleted(event) && event.completed_at && (
                  <div className="mt-2 text-xs text-green-600">
                    ✓ Completed on {formatDate(event.completed_at)}
                    {event.completed_by && ` by ${event.completed_by}`}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Status Summary */}
      {currentStatus && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center text-blue-800">
            <FiClock className="w-5 h-5 mr-2" />
            <span className="font-medium">Current Status: </span>
            <span className="ml-2">{currentStatus}</span>
          </div>
        </div>
      )}
    </div>
  );
};

ReviewTimeline.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      title: PropTypes.string,
      event_name: PropTypes.string,
      description: PropTypes.string,
      date: PropTypes.string,
      deadline: PropTypes.string,
      status: PropTypes.string,
      is_completed: PropTypes.bool,
      is_current: PropTypes.bool,
      priority: PropTypes.string,
      responsible_person: PropTypes.string,
      notes: PropTypes.string,
      attachments_count: PropTypes.number,
      completed_at: PropTypes.string,
      completed_by: PropTypes.string,
    })
  ),
  currentStatus: PropTypes.string,
};

ReviewTimeline.defaultProps = {
  events: [],
  currentStatus: null,
};

export default ReviewTimeline;
