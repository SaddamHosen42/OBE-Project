import React from 'react';
import { Target, Calendar, User, Edit, Trash2, Eye, TrendingUp } from 'lucide-react';
import Button from '../common/Button';
import StatusBadge from './StatusBadge';

const ActionPlanCard = ({ actionPlan, onView, onEdit, onDelete }) => {
  const priorityColors = {
    High: 'bg-red-100 text-red-800 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-green-100 text-green-800 border-green-200'
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const priorityColor = priorityColors[actionPlan.priority] || priorityColors.Medium;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Target className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {actionPlan.title}
              </h3>
            </div>
            {actionPlan.degree_name && (
              <p className="text-sm text-gray-500 mb-2">
                {actionPlan.degree_code} - {actionPlan.degree_name}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {actionPlan.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {actionPlan.description}
          </p>
        )}

        {/* Status and Priority */}
        <div className="flex items-center space-x-2 mb-4">
          <StatusBadge status={actionPlan.status} />
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColor}`}>
            {actionPlan.priority}
          </span>
        </div>

        {/* Dates and Responsible Person */}
        <div className="space-y-2 mb-4 text-sm">
          {(actionPlan.start_date || actionPlan.end_date) && (
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                {formatDate(actionPlan.start_date)} → {formatDate(actionPlan.end_date)}
              </span>
            </div>
          )}
          {actionPlan.responsible_person && (
            <div className="flex items-center text-gray-600">
              <User className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{actionPlan.responsible_person}</span>
            </div>
          )}
        </div>

        {/* Outcomes Count */}
        {actionPlan.outcomes_count !== undefined && (
          <div className="mb-4 pt-4 border-t border-gray-200">
            <div className="flex items-center text-gray-600">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-sm">
                <span className="font-semibold text-gray-900">{actionPlan.outcomes_count}</span>
                {' '}Learning Outcome{actionPlan.outcomes_count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          {onView && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(actionPlan.id)}
              icon={Eye}
              className="flex-1"
            >
              View
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(actionPlan.id)}
              icon={Edit}
              className="flex-1"
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(actionPlan.id)}
              icon={Trash2}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete Action Plan"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionPlanCard;
