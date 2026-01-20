import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Target, BookOpen, TrendingUp, Users } from 'lucide-react';
import { usePLOs } from '../../hooks/usePLOs';
import PLOCard from '../../components/plo/PLOCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const PLOList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const degreeId = searchParams.get('degree');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [bloomLevelFilter, setBloomLevelFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { plos, loading, error, deletePLO } = usePLOs(degreeId);

  const bloomLevels = [
    { value: '', label: 'All Bloom Levels' },
    { value: '1', label: 'Remember' },
    { value: '2', label: 'Understand' },
    { value: '3', label: 'Apply' },
    { value: '4', label: 'Analyze' },
    { value: '5', label: 'Evaluate' },
    { value: '6', label: 'Create' }
  ];

  const filteredPLOs = plos?.filter(plo => {
    const matchesSearch = searchTerm === '' || 
      plo.plo_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plo.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBloom = bloomLevelFilter === '' || 
      plo.bloom_level_id?.toString() === bloomLevelFilter;
    
    return matchesSearch && matchesBloom;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this PLO? This action cannot be undone.')) {
      try {
        await deletePLO(id);
      } catch (err) {
        console.error('Failed to delete PLO:', err);
      }
    }
  };

  const handleView = (id) => {
    navigate(`/plos/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/plos/${id}/edit`);
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
        Error loading PLOs: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Program Learning Outcomes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track PLOs for your degree programs
          </p>
        </div>
        <Button
          onClick={() => navigate(`/plos/create${degreeId ? `?degree=${degreeId}` : ''}`)}
          icon={Plus}
        >
          Add PLO
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total PLOs</p>
              <p className="text-2xl font-semibold text-gray-900">{plos?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Mapped to CLOs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {plos?.filter(plo => plo.clo_mappings?.length > 0).length || 0}
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
              <p className="text-sm font-medium text-gray-500">Mapped to PEOs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {plos?.filter(plo => plo.peo_mappings?.length > 0).length || 0}
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
              <p className="text-sm font-medium text-gray-500">Avg. Attainment</p>
              <p className="text-2xl font-semibold text-gray-900">
                {plos?.reduce((acc, plo) => acc + (plo.attainment || 0), 0) / (plos?.length || 1) || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search PLOs..."
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

      {/* PLO List */}
      {filteredPLOs && filteredPLOs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredPLOs.map((plo) => (
            <PLOCard
              key={plo.plo_id}
              plo={plo}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No PLOs found"
          description={searchTerm || bloomLevelFilter ? 
            "No PLOs match your search criteria. Try adjusting your filters." :
            "Get started by creating your first Program Learning Outcome."
          }
          action={{
            label: "Create PLO",
            onClick: () => navigate(`/plos/create${degreeId ? `?degree=${degreeId}` : ''}`)
          }}
        />
      )}
    </div>
  );
};

export default PLOList;
