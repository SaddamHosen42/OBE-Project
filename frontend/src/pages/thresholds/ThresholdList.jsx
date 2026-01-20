import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Target, TrendingUp, Award } from 'lucide-react';
import { useThresholds } from '../../hooks/useThresholds';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useDegrees } from '../../hooks/useDegrees';

const ThresholdList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const degreeIdParam = searchParams.get('degree');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [degreeFilter, setDegreeFilter] = useState(degreeIdParam || '');
  const [showFilters, setShowFilters] = useState(false);
  
  const { thresholds, loading, error, deleteThreshold } = useThresholds(degreeFilter);
  const { degrees } = useDegrees();

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'CLO', label: 'CLO - Course Learning Outcomes' },
    { value: 'PLO', label: 'PLO - Program Learning Outcomes' },
    { value: 'PEO', label: 'PEO - Program Educational Objectives' }
  ];

  const degreeOptions = [
    { value: '', label: 'All Degrees' },
    ...(degrees?.map(degree => ({
      value: degree.id,
      label: degree.name
    })) || [])
  ];

  const filteredThresholds = thresholds?.filter(threshold => {
    const matchesSearch = searchTerm === '' || 
      threshold.level_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      threshold.degree_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === '' || 
      threshold.threshold_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Group thresholds by degree and type
  const groupedThresholds = filteredThresholds?.reduce((acc, threshold) => {
    const key = `${threshold.degree_id}-${threshold.threshold_type}`;
    if (!acc[key]) {
      acc[key] = {
        degree_id: threshold.degree_id,
        degree_name: threshold.degree_name,
        threshold_type: threshold.threshold_type,
        thresholds: []
      };
    }
    acc[key].thresholds.push(threshold);
    return acc;
  }, {});

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this threshold? This action cannot be undone.')) {
      try {
        await deleteThreshold(id);
      } catch (err) {
        console.error('Failed to delete threshold:', err);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/thresholds/${id}/edit`);
  };

  const getAttainmentBadgeColor = (isAttained) => {
    return isAttained 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading thresholds: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attainment Thresholds</h1>
          <p className="text-gray-600 mt-2">
            Configure threshold levels for CLO, PLO, and PEO attainment evaluation
          </p>
        </div>
        <Button
          onClick={() => navigate('/thresholds/create')}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Threshold
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CLO Thresholds</p>
              <p className="text-2xl font-bold text-gray-900">
                {thresholds?.filter(t => t.threshold_type === 'CLO').length || 0}
              </p>
            </div>
            <Target className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">PLO Thresholds</p>
              <p className="text-2xl font-bold text-gray-900">
                {thresholds?.filter(t => t.threshold_type === 'PLO').length || 0}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">PEO Thresholds</p>
              <p className="text-2xl font-bold text-gray-900">
                {thresholds?.filter(t => t.threshold_type === 'PEO').length || 0}
              </p>
            </div>
            <Award className="w-10 h-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by level name or degree..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <Select
              label="Threshold Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={typeOptions}
            />
            <Select
              label="Degree"
              value={degreeFilter}
              onChange={(e) => setDegreeFilter(e.target.value)}
              options={degreeOptions}
            />
          </div>
        )}
      </div>

      {/* Thresholds List */}
      {!filteredThresholds || filteredThresholds.length === 0 ? (
        <EmptyState
          title="No thresholds found"
          description="Get started by creating your first attainment threshold."
          action={{
            label: 'Add Threshold',
            onClick: () => navigate('/thresholds/create')
          }}
        />
      ) : (
        <div className="space-y-6">
          {Object.values(groupedThresholds || {}).map((group, groupIndex) => (
            <div key={groupIndex} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                  {group.degree_name} - {group.threshold_type} Thresholds
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Min Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Max Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {group.thresholds.map((threshold) => (
                      <tr key={threshold.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {threshold.level_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {threshold.min_percentage}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {threshold.max_percentage}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAttainmentBadgeColor(threshold.is_attained)}`}>
                            {threshold.is_attained ? 'Attained' : 'Not Attained'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(threshold.id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(threshold.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThresholdList;
