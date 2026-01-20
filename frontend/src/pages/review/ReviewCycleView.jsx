import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiEdit, FiTrash2, FiCalendar, FiClock, 
  FiFileText, FiCheckCircle, FiAlertCircle, FiDownload 
} from 'react-icons/fi';
import { useReviewCycle } from '../../hooks/useReviewCycles';
import ReviewTimeline from '../../components/review/ReviewTimeline';
import api from '../../services/api';

const ReviewCycleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(true);

  // Fetch review cycle data
  const { data, isLoading, error, refetch } = useReviewCycle(id, {
    queryParams: { withDegree: 'true' }
  });

  const cycle = data?.data;

  // Fetch timeline events
  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        // Mock timeline events - replace with actual API call
        const mockEvents = [
          {
            id: 1,
            title: 'Review Cycle Initiated',
            description: 'Review cycle has been created and planning phase started',
            date: cycle?.start_date,
            status: 'completed',
            is_completed: true,
            completed_at: cycle?.created_at,
            priority: 'high'
          },
          {
            id: 2,
            title: 'Data Collection Phase',
            description: 'Gathering assessment data and course outcomes',
            date: cycle?.start_date,
            status: cycle?.status === 'in_progress' ? 'in_progress' : 'completed',
            is_current: cycle?.status === 'in_progress',
            priority: 'high'
          },
          {
            id: 3,
            title: 'Analysis and Evaluation',
            description: 'Analyzing collected data and evaluating program outcomes',
            date: cycle?.end_date,
            status: cycle?.status === 'completed' ? 'completed' : 'planned',
            priority: 'medium'
          },
          {
            id: 4,
            title: 'Final Report Submission',
            description: 'Submit comprehensive review report',
            deadline: cycle?.end_date,
            status: cycle?.status === 'completed' ? 'completed' : 'planned',
            completed_at: cycle?.status === 'completed' ? cycle?.end_date : null,
            priority: 'high'
          },
        ];
        setTimelineEvents(mockEvents);
      } catch (err) {
        console.error('Error fetching timeline:', err);
      } finally {
        setIsLoadingTimeline(false);
      }
    };

    if (cycle) {
      fetchTimeline();
    }
  }, [cycle]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'planned': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'archived': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get review type color
  const getReviewTypeColor = (type) => {
    const colors = {
      'annual': 'bg-purple-100 text-purple-800',
      'mid_cycle': 'bg-indigo-100 text-indigo-800',
      'comprehensive': 'bg-pink-100 text-pink-800',
      'continuous': 'bg-teal-100 text-teal-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await api.delete(`/obe-review-cycles/${id}`);
      if (response.data.success) {
        navigate('/review-cycles', {
          state: { message: 'Review cycle deleted successfully' }
        });
      }
    } catch (err) {
      console.error('Error deleting review cycle:', err);
      alert(err.response?.data?.message || 'Failed to delete review cycle');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error || !cycle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              {error?.message || 'Review cycle not found'}
            </p>
            <Link
              to="/review-cycles"
              className="mt-4 inline-flex items-center text-red-700 hover:text-red-800"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Review Cycles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/review-cycles"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiCalendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{cycle.cycle_name}</h1>
                  <p className="text-sm text-gray-600">
                    {cycle.degree_name} - {cycle.department_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                to={`/review-cycles/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiEdit className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg bg-white text-red-700 hover:bg-red-50 transition-colors"
              >
                <FiTrash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
              
              {/* Status and Type */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cycle.status)}`}>
                  {cycle.status?.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReviewTypeColor(cycle.review_type)}`}>
                  {cycle.review_type?.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Start Date</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(cycle.start_date)}</p>
                </div>
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <FiClock className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">End Date</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(cycle.end_date)}</p>
                </div>
              </div>

              {/* Description */}
              {cycle.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{cycle.description}</p>
                </div>
              )}

              {/* Summary Report */}
              {cycle.summary_report && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Summary Report</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 whitespace-pre-wrap">{cycle.summary_report}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Review Timeline</h2>
              {isLoadingTimeline ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ReviewTimeline 
                  events={timelineEvents} 
                  currentStatus={cycle.status?.replace('_', ' ')}
                />
              )}
            </div>
          </div>

          {/* Right Column - Statistics & Actions */}
          <div className="space-y-6">
            {/* Statistics Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <FiFileText className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Total Reports</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{cycle.total_reports || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <FiCheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{cycle.completed_items || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <FiAlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">Pending</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">{cycle.pending_items || 0}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                  <span className="text-sm font-medium text-gray-700">Generate Report</span>
                  <FiFileText className="w-4 h-4 text-gray-600" />
                </button>
                
                <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left">
                  <span className="text-sm font-medium text-gray-700">Export Data</span>
                  <FiDownload className="w-4 h-4 text-gray-600" />
                </button>
                
                <Link 
                  to={`/review-cycles/${id}/edit`}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <span className="text-sm font-medium text-gray-700">Edit Details</span>
                  <FiEdit className="w-4 h-4 text-gray-600" />
                </Link>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {formatDate(cycle.created_at)}
                  </span>
                </div>
                
                {cycle.updated_at && (
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {formatDate(cycle.updated_at)}
                    </span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-600">Review Cycle ID:</span>
                  <span className="ml-2 font-medium text-gray-900">{cycle.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Review Cycle</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{cycle.cycle_name}</strong>? This action cannot be undone.
            </p>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCycleView;
