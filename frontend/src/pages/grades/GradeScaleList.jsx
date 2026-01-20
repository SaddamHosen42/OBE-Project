import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Award, CheckCircle, XCircle } from 'lucide-react';
import { useGradeScales } from '../../hooks/useGradeScales';
import GradeScaleTable from '../../components/grades/GradeScaleTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const GradeScaleList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  
  const {
    gradeScales,
    loading,
    error,
    deleteGradeScale,
    activateGradeScale,
    deactivateGradeScale
  } = useGradeScales(showActiveOnly);

  const filteredGradeScales = gradeScales?.filter(scale => {
    const matchesSearch = searchTerm === '' || 
      scale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (scale.description && scale.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grade scale? This action cannot be undone.')) {
      try {
        await deleteGradeScale(id);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete grade scale');
        console.error('Failed to delete grade scale:', err);
      }
    }
  };

  const handleActivate = async (id) => {
    if (window.confirm('Are you sure you want to activate this grade scale? This will deactivate all other grade scales.')) {
      try {
        await activateGradeScale(id);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to activate grade scale');
        console.error('Failed to activate grade scale:', err);
      }
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this grade scale?')) {
      try {
        await deactivateGradeScale(id);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to deactivate grade scale');
        console.error('Failed to deactivate grade scale:', err);
      }
    }
  };

  const handleView = (id) => {
    navigate(`/grades/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/grades/${id}/edit`);
  };

  const activeScalesCount = gradeScales?.filter(s => s.is_active).length || 0;
  const inactiveScalesCount = gradeScales?.filter(s => !s.is_active).length || 0;

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
        Error loading grade scales: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grade Scales</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage grading scales and grade point definitions
          </p>
        </div>
        <Button
          onClick={() => navigate('/grades/create')}
          icon={Plus}
        >
          Create Grade Scale
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Scales</p>
              <p className="text-2xl font-bold text-gray-900">{gradeScales?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeScalesCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-500 rounded-md p-3">
              <XCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{inactiveScalesCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Show Active Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredGradeScales?.length || 0}</span> grade scale(s)
        </p>
      </div>

      {/* Grade Scales Table */}
      <GradeScaleTable
        gradeScales={filteredGradeScales}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
      />
    </div>
  );
};

export default GradeScaleList;
