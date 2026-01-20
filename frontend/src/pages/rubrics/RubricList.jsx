import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRubrics } from '../../hooks/useRubrics';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon 
} from '@heroicons/react/24/outline';

const RubricList = () => {
  const navigate = useNavigate();
  const { rubrics, loading, error, fetchRubrics, deleteRubric } = useRubrics();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filteredRubrics, setFilteredRubrics] = useState([]);

  useEffect(() => {
    fetchRubrics();
  }, []);

  useEffect(() => {
    let filtered = rubrics;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(rubric =>
        rubric.rubric_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rubric.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(rubric => rubric.rubric_type === filterType);
    }

    setFilteredRubrics(filtered);
  }, [rubrics, searchTerm, filterType]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rubric?')) {
      await deleteRubric(id);
      fetchRubrics();
    }
  };

  const handleView = (id) => {
    navigate(`/rubrics/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/rubrics/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/rubrics/create');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading rubrics: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rubrics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage assessment rubrics and scoring criteria
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Rubric
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search rubrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Types</option>
              <option value="analytical">Analytical</option>
              <option value="holistic">Holistic</option>
              <option value="checklist">Checklist</option>
              <option value="single-point">Single Point</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rubrics Grid */}
      {filteredRubrics.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">No rubrics found</p>
          <button
            onClick={handleCreate}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create First Rubric
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRubrics.map((rubric) => (
            <div
              key={rubric.rubric_id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {rubric.rubric_name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {rubric.rubric_type?.replace('-', ' ').toUpperCase()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    rubric.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rubric.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                  {rubric.description || 'No description'}
                </p>

                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span>Max Score: {rubric.max_score || 'N/A'}</span>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleView(rubric.rubric_id)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title="View"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(rubric.rubric_id)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(rubric.rubric_id)}
                  className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RubricList;
