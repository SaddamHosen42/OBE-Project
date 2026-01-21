import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/audit-logs/recent', {
        params: { limit: 10 }
      });
      
      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      setError(err.response?.data?.message || 'Failed to load recent activity');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action) => {
    const icons = {
      'CREATE': '➕',
      'UPDATE': '✏️',
      'DELETE': '🗑️',
      'LOGIN': '🔐',
      'LOGOUT': '🚪',
      'VIEW': '👁️'
    };
    return icons[action] || '📝';
  };

  const getActivityColor = (action) => {
    const colors = {
      'CREATE': 'text-green-600 bg-green-50',
      'UPDATE': 'text-blue-600 bg-blue-50',
      'DELETE': 'text-red-600 bg-red-50',
      'LOGIN': 'text-purple-600 bg-purple-50',
      'LOGOUT': 'text-gray-600 bg-gray-50',
      'VIEW': 'text-indigo-600 bg-indigo-50'
    };
    return colors[action] || 'text-gray-600 bg-gray-50';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activityTime.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchRecentActivity}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <button
          onClick={fetchRecentActivity}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
            >
              <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.action)}`}>
                <span className="text-lg">{getActivityIcon(activity.action)}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.action} {activity.entity_type}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  by {activity.user_name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(activity.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <a
          href="/audit-logs"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all activity →
        </a>
      </div>
    </div>
  );
};

export default RecentActivity;
