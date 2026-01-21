import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiDownload, FiBarChart2 } from 'react-icons/fi';
import AuditLogTable from '../../components/audit/AuditLogTable';
import AuditLogFilter from '../../components/audit/AuditLogFilter';
import { useAuditLogs, useAuditStatistics } from '../../hooks/useAuditLogs';

const AuditLogList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [filters, setFilters] = useState({
    action: '',
    table_name: '',
    user_id: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  // Prepare query params
  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    ...Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '')
    ),
  };

  // Fetch audit logs
  const {
    data: logsData,
    isLoading,
    isError,
    error,
  } = useAuditLogs(queryParams);

  // Fetch statistics
  const {
    data: statsData,
  } = useAuditStatistics(
    Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '')
    )
  );

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle filter reset
  const handleFilterReset = (resetFilters) => {
    setFilters(resetFilters);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Export to CSV
  const handleExport = () => {
    // TODO: Implement CSV export
    alert('Export functionality will be implemented');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FiFileText className="mr-3 text-blue-600" size={36} />
            Audit Logs
          </h1>
          <p className="text-gray-600 mt-2">View and analyze system audit trail</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="btn btn-outline btn-primary"
          >
            <FiDownload size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statsData?.success && statsData.data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <FiBarChart2 size={32} />
              </div>
              <div className="stat-title">Total Logs</div>
              <div className="stat-value text-primary">
                {statsData.data.totalLogs || 0}
              </div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">INSERTs</div>
              <div className="stat-value text-success">
                {statsData.data.actionCounts?.INSERT || 0}
              </div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">UPDATEs</div>
              <div className="stat-value text-warning">
                {statsData.data.actionCounts?.UPDATE || 0}
              </div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">DELETEs</div>
              <div className="stat-value text-error">
                {statsData.data.actionCounts?.DELETE || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <AuditLogFilter
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* Error Alert */}
      {isError && (
        <div className="alert alert-error mb-6">
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
          <span>{error?.message || 'Failed to load audit logs'}</span>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <AuditLogTable
          logs={logsData?.data || []}
          loading={isLoading}
        />

        {/* Pagination */}
        {logsData?.pagination && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="select select-bordered select-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, logsData.pagination.totalItems)} of{' '}
                {logsData.pagination.totalItems} entries
              </span>
            </div>

            <div className="btn-group">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-sm"
              >
                «
              </button>
              <button className="btn btn-sm">
                Page {currentPage} of {logsData.pagination.totalPages}
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === logsData.pagination.totalPages}
                className="btn btn-sm"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogList;
