import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, BookOpen, Target, TrendingUp, Edit, Trash2, Eye } from 'lucide-react';
import { useCLOs } from '../../hooks/useCLOs';
import CLOCard from '../../components/clo/CLOCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const CLOList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseOfferingId = searchParams.get('courseOffering');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [bloomLevelFilter, setBloomLevelFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { clos, loading, error, deleteCLO } = useCLOs(courseOfferingId);

  const bloomLevels = [
    { value: '', label: 'All Bloom Levels' },
    { value: '1', label: 'Remember' },
    { value: '2', label: 'Understand' },
    { value: '3', label: 'Apply' },
    { value: '4', label: 'Analyze' },
    { value: '5', label: 'Evaluate' },
    { value: '6', label: 'Create' }
  ];

  const filteredCLOs = clos?.filter(clo => {
    const matchesSearch = searchTerm === '' || 
      clo.clo_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clo.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBloom = bloomLevelFilter === '' || 
      clo.bloom_level_id?.toString() === bloomLevelFilter;
    
    return matchesSearch && matchesBloom;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this CLO? This action cannot be undone.')) {
      try {
        await deleteCLO(id);
      } catch (err) {
        console.error('Failed to delete CLO:', err);
      }
    }
  };

  const handleView = (id) => {
    navigate(`/clos/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/clos/${id}/edit`);
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
        Error loading CLOs: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Learning Outcomes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track CLOs for your courses
          </p>
        </div>
        <Button
          onClick={() => navigate(`/clos/create${courseOfferingId ? `?courseOffering=${courseOfferingId}` : ''}`)}
          icon={Plus}
        >
          Add CLO
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total CLOs</p>
              <p className="text-2xl font-semibold text-gray-900">{clos?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Mapped to PLOs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {clos?.filter(clo => clo.plo_mappings?.length > 0).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">With Assessments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {clos?.filter(clo => clo.assessment_count > 0).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
              <Filter className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Filtered</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredCLOs?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search CLOs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={Filter}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Bloom Taxonomy Level"
                value={bloomLevelFilter}
                onChange={(e) => setBloomLevelFilter(e.target.value)}
                options={bloomLevels}
              />
            </div>
          </div>
        )}
      </div>

      {/* CLO List */}
      {filteredCLOs && filteredCLOs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredCLOs.map((clo) => (
            <CLOCard
              key={clo.clo_id}
              clo={clo}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No CLOs found"
          description={searchTerm || bloomLevelFilter ? 
            "No CLOs match your search criteria. Try adjusting your filters." :
            "Get started by creating your first Course Learning Outcome."
          }
          action={{
            label: "Create CLO",
            onClick: () => navigate(`/clos/create${courseOfferingId ? `?courseOffering=${courseOfferingId}` : ''}`)
          }}
        />
      )}
    </div>
  );
};

export default CLOList;
