import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiUser, FiDatabase, FiClock } from 'react-icons/fi';

const AuditLogTable = ({ logs = [], loading = false }) => {
  const navigate = useNavigate();

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

  // Format date/time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Handle row click
  const handleRowClick = (log) => {
    navigate(`/audit-logs/${log.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-base-content/60">No audit logs found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full table-zebra">
        <thead>
          <tr>
            <th>ID</th>
            <th>Action</th>
            <th>Table</th>
            <th>Record ID</th>
            <th>User</th>
            <th>Timestamp</th>
            <th>IP Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="hover cursor-pointer" onClick={() => handleRowClick(log)}>
              <td className="font-mono text-sm">{log.id}</td>
              <td>
                <span className={`badge ${getActionBadgeClass(log.action)} badge-sm`}>
                  {log.action}
                </span>
              </td>
              <td>
                <div className="flex items-center space-x-2">
                  <FiDatabase className="text-gray-500" size={16} />
                  <span className="font-mono text-sm">{log.table_name}</span>
                </div>
              </td>
              <td className="font-mono text-sm">{log.record_id || 'N/A'}</td>
              <td>
                <div className="flex items-center space-x-2">
                  <FiUser className="text-gray-500" size={16} />
                  <div>
                    <div className="text-sm font-medium">{log.user_name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">ID: {log.user_id || 'N/A'}</div>
                  </div>
                </div>
              </td>
              <td>
                <div className="flex items-center space-x-2">
                  <FiClock className="text-gray-500" size={16} />
                  <span className="text-sm">{formatDateTime(log.created_at)}</span>
                </div>
              </td>
              <td className="font-mono text-sm">{log.ip_address || 'N/A'}</td>
              <td>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/audit-logs/${log.id}`);
                  }}
                  className="btn btn-sm btn-ghost text-blue-600"
                  title="View Details"
                >
                  <FiEye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogTable;
