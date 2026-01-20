import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Target, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { useActionPlans } from '../../hooks/useActionPlans';
import ActionPlanCard from '../../components/actionplan/ActionPlanCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const ActionPlanList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const degreeId = searchParams.get('degree');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { actionPlans, loading, error, deleteActionPlan } = useActionPlans(degreeId);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Draft', label: 'Draft' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];

  const filteredActionPlans = actionPlans?.filter(plan => {
    const matchesSearch = searchTerm === '' || 
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.description && plan.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === '' || 
      plan.status === statusFilter;
    
    const matchesPriority = priorityFilter === '' || 
      plan.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this action plan? This action cannot be undone.')) {
      try {
        await deleteActionPlan(id);
      } catch (err) {
        console.error('Failed to delete action plan:', err);
      }
    }
  };

  const handleView = (id) => {
    navigate(`/action-plans/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/action-plans/${id}/edit`);
  };

  // Calculate statistics
  const stats = {
    total: actionPlans?.length || 0,
    inProgress: actionPlans?.filter(p => p.status === 'In Progress').length || 0,
    completed: actionPlans?.filter(p => p.status === 'Completed').length || 0,
    highPriority: actionPlans?.filter(p => p.priority === 'High').length || 0
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
        Error loading action plans: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Action Plans</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage improvement plans and track progress
          </p>
        </div>
        <Button
          onClick={() => navigate(`/action-plans/create${degreeId ? `?degree=${degreeId}` : ''}`)}
          icon={Plus}
        >
          Create Action Plan
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
              <p className="text-sm font-medium text-gray-500">Total Plans</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High Priority</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.highPriority}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search action plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <Button
            variant="outline"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
            <Select
              label="Priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={priorityOptions}
            />
          </div>
        )}
      </div>

      {/* Action Plans Grid */}
      {filteredActionPlans && filteredActionPlans.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredActionPlans.map(plan => (
            <ActionPlanCard
              key={plan.id}
              actionPlan={plan}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No action plans found"
          description={
            searchTerm || statusFilter || priorityFilter
              ? "Try adjusting your filters"
              : "Get started by creating your first action plan"
          }
          action={
            !searchTerm && !statusFilter && !priorityFilter && (
              <Button
                onClick={() => navigate(`/action-plans/create${degreeId ? `?degree=${degreeId}` : ''}`)}
                icon={Plus}
              >
                Create Action Plan
              </Button>
            )
          }
        />
      )}
    </div>
  );
};

export default ActionPlanList;
