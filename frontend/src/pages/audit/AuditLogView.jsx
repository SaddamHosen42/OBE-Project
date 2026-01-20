import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFileText, FiUser, FiDatabase, FiClock, FiGlobe } from 'react-icons/fi';
import { useAuditLog } from '../../hooks/useAuditLogs';
import ChangesDiff from '../../components/audit/ChangesDiff';

const AuditLogView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch audit log details
  const {
    data: logData,
    isLoading,
    isError,
    error,
  } = useAuditLog(id);

  // Format date/time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  };

  // Action badge color mapping
  const getActionBadgeClass = (action) => {
    const actionClasses = {
      'INSERT': 'badge-success',
      'UPDATE': 'badge-warning',
      'DELETE': 'badge-error',
      'SELECT': 'badge-info',
    };
    return actionClasses[action] || 'badge-ghost';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error?.message || 'Failed to load audit log details'}</span>
        </div>
        <Link to="/audit-logs" className="btn btn-ghost mt-4">
          <FiArrowLeft size={20} />
          Back to List
        </Link>
      </div>
    );
  }

  // No log found
  if (!logData?.success || !logData.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>Audit log entry not found</span>
        </div>
        <Link to="/audit-logs" className="btn btn-ghost mt-4">
          <FiArrowLeft size={20} />
          Back to List
        </Link>
      </div>
    );
  }

  const log = logData.data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FiFileText className="mr-3 text-blue-600" size={36} />
            Audit Log Details
          </h1>
          <p className="text-gray-600 mt-2">Entry ID: {log.id}</p>
        </div>
        <Link to="/audit-logs" className="btn btn-ghost">
          <FiArrowLeft size={20} />
          Back to List
        </Link>
      </div>

      {/* Log Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                <FiFileText className="text-blue-600" size={32} />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold flex items-center space-x-3">
                  <span>{log.table_name}</span>
                  <span className={`badge ${getActionBadgeClass(log.action)}`}>
                    {log.action}
                  </span>
                </h2>
                <p className="text-blue-100">Record ID: {log.record_id || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* User Information */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <FiUser size={20} />
                <h3 className="font-semibold">User Information</h3>
              </div>
              <div className="pl-7 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{log.user_name || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-mono">{log.user_id || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Role:</span>
                  <span className="badge badge-outline">{log.user_role || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Database Information */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <FiDatabase size={20} />
                <h3 className="font-semibold">Database Information</h3>
              </div>
              <div className="pl-7 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Table:</span>
                  <span className="font-mono font-medium">{log.table_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Record ID:</span>
                  <span className="font-mono">{log.record_id || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Action:</span>
                  <span className={`badge ${getActionBadgeClass(log.action)}`}>
                    {log.action}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamp Information */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <FiClock size={20} />
                <h3 className="font-semibold">Timestamp</h3>
              </div>
              <div className="pl-7">
                <p className="text-gray-700">{formatDateTime(log.created_at)}</p>
              </div>
            </div>

            {/* Network Information */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <FiGlobe size={20} />
                <h3 className="font-semibold">Network Information</h3>
              </div>
              <div className="pl-7 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">IP Address:</span>
                  <span className="font-mono">{log.ip_address || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">User Agent:</span>
                  <span className="text-sm text-gray-700 break-all">
                    {log.user_agent || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {log.description && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600">{log.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Changes Diff Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Changes Detail</h3>
          <p className="text-gray-600 text-sm mt-1">
            View what was changed in this operation
          </p>
        </div>
        <div className="p-8">
          <ChangesDiff
            oldValues={log.old_values}
            newValues={log.new_values}
            action={log.action}
          />
        </div>
      </div>

      {/* View Related Records */}
      {log.table_name && log.record_id && (
        <div className="mt-6">
          <Link
            to={`/audit-logs?table_name=${log.table_name}&record_id=${log.record_id}`}
            className="btn btn-outline btn-primary"
          >
            View All Logs for This Record
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuditLogView;
