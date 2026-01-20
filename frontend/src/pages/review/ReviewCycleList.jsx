import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiFilter, FiDownload, FiCalendar } from 'react-icons/fi';
import useReviewCycles from '../../hooks/useReviewCycles';
import ReviewCycleCard from '../../components/review/ReviewCycleCard';
import SearchBar from '../../components/data/SearchBar';
import FilterPanel from '../../components/data/FilterPanel';
import ExportButton from '../../components/data/ExportButton';

const ReviewCycleList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewTypeFilter, setReviewTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 12;

  // Fetch review cycles
  const { data, isLoading, error } = useReviewCycles({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    status: statusFilter,
    reviewType: reviewTypeFilter,
    withDegree: 'true',
  });

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (filters) => {
    setStatusFilter(filters.status || '');
    setReviewTypeFilter(filters.reviewType || '');
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setStatusFilter('');
    setReviewTypeFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Filter options
  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'planned', label: 'Planned' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'archived', label: 'Archived' },
      ],
    },
    {
      key: 'reviewType',
      label: 'Review Type',
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        { value: 'annual', label: 'Annual' },
        { value: 'mid_cycle', label: 'Mid-Cycle' },
        { value: 'comprehensive', label: 'Comprehensive' },
        { value: 'continuous', label: 'Continuous' },
      ],
    },
  ];

  // Export data
  const exportData = () => {
    if (!data?.data) return [];
    return data.data.map(cycle => ({
      'Cycle Name': cycle.cycle_name,
      'Degree': cycle.degree_name,
      'Department': cycle.department_name,
      'Status': cycle.status,
      'Review Type': cycle.review_type,
      'Start Date': cycle.start_date,
      'End Date': cycle.end_date,
      'Total Reports': cycle.total_reports || 0,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiCalendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">OBE Review Cycles</h1>
                <p className="text-sm text-gray-600">Manage and track OBE review cycles</p>
              </div>
            </div>
            <Link
              to="/review-cycles/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Create Review Cycle
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search review cycles..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 border rounded-lg transition-colors ${
                  showFilters || statusFilter || reviewTypeFilter
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiFilter className="w-4 h-4 mr-2" />
                Filters
                {(statusFilter || reviewTypeFilter) && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {[statusFilter, reviewTypeFilter].filter(Boolean).length}
                  </span>
                )}
              </button>

              <ExportButton
                data={exportData()}
                filename="review-cycles"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiDownload className="w-4 h-4 mr-2" />
                Export
              </ExportButton>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <FilterPanel
                filters={filterOptions}
                values={{ status: statusFilter, reviewType: reviewTypeFilter }}
                onChange={handleFilterChange}
                onClear={clearFilters}
              />
            </div>
          )}
        </div>

        {/* Stats Overview */}
        {data?.data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Total Cycles</div>
              <div className="text-2xl font-bold text-gray-900">{data.pagination?.totalItems || 0}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">In Progress</div>
              <div className="text-2xl font-bold text-blue-600">
                {data.data.filter(c => c.status === 'in_progress').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-600">
                {data.data.filter(c => c.status === 'completed').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Planned</div>
              <div className="text-2xl font-bold text-purple-600">
                {data.data.filter(c => c.status === 'planned').length}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              {error.message || 'Failed to load review cycles'}
            </p>
          </div>
        )}

        {/* Review Cycles Grid */}
        {!isLoading && !error && data?.data && (
          <>
            {data.data.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FiCalendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Review Cycles Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || statusFilter || reviewTypeFilter
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first review cycle'}
                </p>
                {!searchQuery && !statusFilter && !reviewTypeFilter && (
                  <Link
                    to="/review-cycles/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus className="w-5 h-5 mr-2" />
                    Create Review Cycle
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {data.data.map((cycle) => (
                    <ReviewCycleCard key={cycle.id} cycle={cycle} />
                  ))}
                </div>

                {/* Pagination */}
                {data.pagination && data.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, data.pagination.totalItems)} of{' '}
                      {data.pagination.totalItems} results
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {data.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(data.pagination.totalPages, prev + 1))}
                        disabled={currentPage === data.pagination.totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewCycleList;
