import React, { useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

const AuditLogFilter = ({ onFilterChange, onReset }) => {
  const [filters, setFilters] = useState({
    action: '',
    table_name: '',
    user_id: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  // Handle filter change
  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters = {
      action: '',
      table_name: '',
      user_id: '',
      startDate: '',
      endDate: '',
      search: '',
    };
    setFilters(resetFilters);
    onReset(resetFilters);
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="badge badge-primary badge-sm">Active</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-sm btn-ghost"
          >
            {showFilters ? 'Hide' : 'Show'}
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="btn btn-sm btn-ghost text-error"
            >
              <FiX size={16} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter Fields */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Action Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Action</span>
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleChange('action', e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">All Actions</option>
              <option value="INSERT">INSERT</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="SELECT">SELECT</option>
            </select>
          </div>

          {/* Table Name Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Table Name</span>
            </label>
            <input
              type="text"
              value={filters.table_name}
              onChange={(e) => handleChange('table_name', e.target.value)}
              placeholder="e.g., users, courses"
              className="input input-bordered w-full"
            />
          </div>

          {/* User ID Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">User ID</span>
            </label>
            <input
              type="number"
              value={filters.user_id}
              onChange={(e) => handleChange('user_id', e.target.value)}
              placeholder="Enter user ID"
              className="input input-bordered w-full"
            />
          </div>

          {/* Start Date Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Start Date</span>
            </label>
            <input
              type="datetime-local"
              value={filters.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          {/* End Date Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">End Date</span>
            </label>
            <input
              type="datetime-local"
              value={filters.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          {/* Search Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Search</span>
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Search in changes..."
              className="input input-bordered w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogFilter;
