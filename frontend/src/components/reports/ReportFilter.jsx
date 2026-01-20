import React, { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';

const ReportFilter = ({ filters, onFilterChange, onClose, reportType }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (name, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = Object.keys(localFilters).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const renderFilterFields = () => {
    switch (reportType) {
      case 'clo-attainment':
        return (
          <>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Course Offering
              </label>
              <select
                value={localFilters.courseOffering || ''}
                onChange={(e) => handleInputChange('courseOffering', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Course Offerings</option>
                <option value="1">SE-301 Fall 2025</option>
                <option value="2">CS-202 Spring 2025</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Assessment Type
              </label>
              <select
                value={localFilters.assessmentType || 'all'}
                onChange={(e) => handleInputChange('assessmentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Assessments</option>
                <option value="direct">Direct Assessment</option>
                <option value="indirect">Indirect Assessment</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Date Range
              </label>
              <select
                value={localFilters.dateRange || 'semester'}
                onChange={(e) => handleInputChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="semester">Current Semester</option>
                <option value="year">Academic Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </>
        );

      case 'plo-attainment':
        return (
          <>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Degree Program
              </label>
              <select
                value={localFilters.degree || ''}
                onChange={(e) => handleInputChange('degree', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Program</option>
                <option value="1">BS Software Engineering</option>
                <option value="2">BS Computer Science</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Academic Session
              </label>
              <select
                value={localFilters.academicSession || ''}
                onChange={(e) => handleInputChange('academicSession', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sessions</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Batch
              </label>
              <select
                value={localFilters.batch || 'all'}
                onChange={(e) => handleInputChange('batch', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Batches</option>
                <option value="2022">Batch 2022</option>
                <option value="2023">Batch 2023</option>
                <option value="2024">Batch 2024</option>
              </select>
            </div>
          </>
        );

      case 'course':
        return (
          <>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Course Offering
              </label>
              <select
                value={localFilters.courseOffering || ''}
                onChange={(e) => handleInputChange('courseOffering', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Course</option>
                <option value="1">SE-301 Fall 2025</option>
                <option value="2">CS-202 Spring 2025</option>
              </select>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.includeStudentDetails || false}
                  onChange={(e) => handleInputChange('includeStudentDetails', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Include Student Details
                </span>
              </label>
            </div>
          </>
        );

      case 'program':
        return (
          <>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Degree Program
              </label>
              <select
                value={localFilters.degree || ''}
                onChange={(e) => handleInputChange('degree', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Program</option>
                <option value="1">BS Software Engineering</option>
                <option value="2">BS Computer Science</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Academic Session
              </label>
              <select
                value={localFilters.academicSession || ''}
                onChange={(e) => handleInputChange('academicSession', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sessions</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.includePEO || false}
                  onChange={(e) => handleInputChange('includePEO', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Include PEO Assessment
                </span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.includePLO || false}
                  onChange={(e) => handleInputChange('includePLO', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Include PLO Attainment
                </span>
              </label>
            </div>
          </>
        );

      case 'student':
        return (
          <>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Student
              </label>
              <input
                type="text"
                value={localFilters.student || ''}
                onChange={(e) => handleInputChange('student', e.target.value)}
                placeholder="Enter roll number or name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Academic Session
              </label>
              <select
                value={localFilters.academicSession || ''}
                onChange={(e) => handleInputChange('academicSession', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sessions</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.includeAllSemesters || false}
                  onChange={(e) => handleInputChange('includeAllSemesters', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Include All Semesters
                </span>
              </label>
            </div>
          </>
        );

      case 'batch':
        return (
          <>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Batch
              </label>
              <select
                value={localFilters.batch || ''}
                onChange={(e) => handleInputChange('batch', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Batch</option>
                <option value="2022">Batch 2022</option>
                <option value="2023">Batch 2023</option>
                <option value="2024">Batch 2024</option>
                <option value="2025">Batch 2025</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Degree Program
              </label>
              <select
                value={localFilters.degree || ''}
                onChange={(e) => handleInputChange('degree', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Programs</option>
                <option value="1">BS Software Engineering</option>
                <option value="2">BS Computer Science</option>
              </select>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.compareWithOtherBatches || false}
                  onChange={(e) => handleInputChange('compareWithOtherBatches', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Compare with Other Batches
                </span>
              </label>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Filter Report</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Fields */}
        <div className="space-y-4 mb-6">
          {renderFilterFields()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilter;
