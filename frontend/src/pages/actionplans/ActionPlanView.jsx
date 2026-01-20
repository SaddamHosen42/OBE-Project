import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Target, ArrowLeft, Edit, Calendar, User, AlertCircle, 
  CheckCircle, Clock, TrendingUp, Package 
} from 'lucide-react';
import { useActionPlan } from '../../hooks/useActionPlans';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/actionplan/StatusBadge';
import ActionPlanTimeline from '../../components/actionplan/ActionPlanTimeline';

const ActionPlanView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { actionPlan, loading, error } = useActionPlan(id);

  const priorityColors = {
    High: 'bg-red-100 text-red-800 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-green-100 text-green-800 border-green-200'
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !actionPlan) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'Action plan not found'}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            icon={ArrowLeft}
          >
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{actionPlan.title}</h1>
              {actionPlan.degree_name && (
                <p className="text-sm text-gray-500 mt-1">
                  {actionPlan.degree_code} - {actionPlan.degree_name}
                </p>
              )}
            </div>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/action-plans/${id}/edit`)}
          icon={Edit}
        >
          Edit Plan
        </Button>
      </div>

      {/* Status and Priority Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <div className="mt-2">
                <StatusBadge status={actionPlan.status} />
              </div>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Priority</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-2 ${priorityColors[actionPlan.priority] || priorityColors.Medium}`}>
                {actionPlan.priority}
              </span>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Start Date</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {formatDate(actionPlan.start_date)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">End Date</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {formatDate(actionPlan.end_date)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Description */}
      {actionPlan.description && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{actionPlan.description}</p>
        </div>
      )}

      {/* Responsible Person */}
      {actionPlan.responsible_person && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Responsible Person</p>
              <p className="text-lg font-semibold text-gray-900">{actionPlan.responsible_person}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {actionPlan.start_date && actionPlan.end_date && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
          <ActionPlanTimeline
            startDate={actionPlan.start_date}
            endDate={actionPlan.end_date}
            status={actionPlan.status}
          />
        </div>
      )}

      {/* Learning Outcomes */}
      {actionPlan.outcomes && actionPlan.outcomes.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Learning Outcomes</h2>
          </div>
          <div className="space-y-4">
            {actionPlan.outcomes.map((outcome, index) => (
              <div 
                key={outcome.id || index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Outcome Type</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{outcome.outcome_type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Outcome ID</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{outcome.outcome_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Current Attainment</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {outcome.current_attainment ? `${outcome.current_attainment}%` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Expected Attainment</p>
                    <p className="mt-1 text-sm font-semibold text-blue-600">
                      {outcome.expected_attainment ? `${outcome.expected_attainment}%` : 'N/A'}
                    </p>
                  </div>
                </div>
                {outcome.target_improvement && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase">Target Improvement</p>
                    <p className="mt-1 text-sm text-gray-700">{outcome.target_improvement}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-500">Created:</span>
            <span className="ml-2 text-gray-900">
              {new Date(actionPlan.created_at).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-500">Last Updated:</span>
            <span className="ml-2 text-gray-900">
              {new Date(actionPlan.updated_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPlanView;
