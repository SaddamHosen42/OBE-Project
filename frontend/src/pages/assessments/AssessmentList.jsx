import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, ClipboardList, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { useAssessments } from '../../hooks/useAssessments';
import AssessmentCard from '../../components/assessment/AssessmentCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const AssessmentList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseOfferingId = searchParams.get('courseOffering');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { assessments, loading, error, deleteAssessment } = useAssessments(courseOfferingId);

  const assessmentCategories = [
    { value: '', label: 'All Categories' },
    { value: 'Formative', label: 'Formative' },
    { value: 'Summative', label: 'Summative' }
  ];

  const filteredAssessments = assessments?.filter(assessment => {
    const matchesSearch = searchTerm === '' || 
      assessment.assessment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.type_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === '' || 
      assessment.assessment_type_id?.toString() === typeFilter;
    
    const matchesCategory = categoryFilter === '' || 
      assessment.category?.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      try {
        await deleteAssessment(id);
      } catch (err) {
        console.error('Failed to delete assessment:', err);
      }
    }
  };

  const handleView = (id) => {
    navigate(`/assessments/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/assessments/${id}/edit`);
  };

  const handleMapCLOs = (id) => {
    navigate(`/assessments/${id}/clo-mapping`);
  };

  // Calculate statistics
  const stats = {
    total: assessments?.length || 0,
    formative: assessments?.filter(a => a.category === 'Formative').length || 0,
    summative: assessments?.filter(a => a.category === 'Summative').length || 0,
    upcoming: assessments?.filter(a => new Date(a.scheduled_date) > new Date()).length || 0
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
        Error loading assessments: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track course assessments
          </p>
        </div>
        <Button
          onClick={() => navigate(`/assessments/create${courseOfferingId ? `?courseOffering=${courseOfferingId}` : ''}`)}
          icon={Plus}
        >
          Add Assessment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Formative</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.formative}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Summative</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.summative}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Upcoming</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.upcoming}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-lg">
            <Input
              type="text"
              placeholder="Search assessments..."
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
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <Select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={assessmentCategories}
            />
          </div>
        )}
      </div>

      {/* Assessment List */}
      {filteredAssessments?.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assessments found"
          description={
            searchTerm || typeFilter || categoryFilter
              ? "No assessments match your search criteria. Try adjusting your filters."
              : courseOfferingId
              ? "No assessments have been created for this course offering yet."
              : "Get started by creating your first assessment."
          }
          action={
            <Button onClick={() => navigate(`/assessments/create${courseOfferingId ? `?courseOffering=${courseOfferingId}` : ''}`)}>
              Create Assessment
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAssessments?.map(assessment => (
            <AssessmentCard
              key={assessment.assessment_component_id}
              assessment={assessment}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMapCLOs={handleMapCLOs}
            />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {filteredAssessments?.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Showing {filteredAssessments.length} of {assessments?.length} assessments
        </div>
      )}
    </div>
  );
};

export default AssessmentList;
