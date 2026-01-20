import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Award, BookOpen, TrendingUp, Users } from 'lucide-react';
import { usePEOs } from '../../hooks/usePEOs';
import PEOCard from '../../components/peo/PEOCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const PEOList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const degreeId = searchParams.get('degree');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { peos, loading, error, deletePEO } = usePEOs(degreeId);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'archived', label: 'Archived' }
  ];

  const filteredPEOs = peos?.filter(peo => {
    const matchesSearch = searchTerm === '' || 
      peo.peo_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peo.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || 
      peo.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this PEO? This action cannot be undone.')) {
      try {
        await deletePEO(id);
      } catch (err) {
        console.error('Failed to delete PEO:', err);
      }
    }
  };

  const handleView = (id) => {
    navigate(`/peos/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/peos/${id}/edit`);
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
        Error loading PEOs: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Program Educational Objectives</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track PEOs for your degree programs
          </p>
        </div>
        <Button
          onClick={() => navigate(`/peos/create${degreeId ? `?degree=${degreeId}` : ''}`)}
          icon={Plus}
        >
          Add PEO
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total PEOs</p>
              <p className="text-2xl font-semibold text-gray-900">{peos?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active PEOs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {peos?.filter(p => p.status === 'active').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">PLO Mappings</p>
              <p className="text-2xl font-semibold text-gray-900">
                {peos?.reduce((sum, p) => sum + (p.plo_mappings?.length || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Under Review</p>
              <p className="text-2xl font-semibold text-gray-900">
                {peos?.filter(p => p.status === 'under_review').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search PEOs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={Filter}
            >
              Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
        )}
      </div>

      {/* PEO List */}
      {filteredPEOs?.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No PEOs found"
          description="Get started by creating your first Program Educational Objective"
          action={{
            label: 'Add PEO',
            onClick: () => navigate(`/peos/create${degreeId ? `?degree=${degreeId}` : ''}`)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPEOs?.map((peo) => (
            <PEOCard
              key={peo.peo_id}
              peo={peo}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PEOList;
