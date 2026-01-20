import React from 'react';
import { ClipboardList, Calendar, BarChart3, Edit, Trash2, Eye, Target } from 'lucide-react';
import Button from '../common/Button';

const AssessmentCard = ({ assessment, onView, onEdit, onDelete, onMapCLOs }) => {
  const categoryColors = {
    Formative: 'bg-green-100 text-green-800',
    Summative: 'bg-purple-100 text-purple-800'
  };

  const categoryColor = categoryColors[assessment.category] || 'bg-gray-100 text-gray-800';

  const scheduledDate = assessment.scheduled_date 
    ? new Date(assessment.scheduled_date)
    : null;

  const isUpcoming = scheduledDate && scheduledDate > new Date();
  const isPast = scheduledDate && scheduledDate < new Date();

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`p-2 rounded-lg ${
              assessment.category === 'Formative' ? 'bg-green-500' : 'bg-purple-500'
            }`}>
              <ClipboardList className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {assessment.assessment_name}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryColor}`}>
                  {assessment.category}
                </span>
                {isUpcoming && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    Upcoming
                  </span>
                )}
              </div>
              {assessment.course_name && (
                <p className="text-sm text-gray-500">
                  {assessment.course_code} - {assessment.course_name}
                </p>
              )}
              {assessment.type_name && (
                <p className="text-sm text-gray-600 mt-1">{assessment.type_name}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {onView && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(assessment.assessment_component_id)}
                icon={Eye}
                title="View Details"
              />
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(assessment.assessment_component_id)}
                icon={Edit}
                title="Edit Assessment"
              />
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(assessment.assessment_component_id)}
                icon={Trash2}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete Assessment"
              />
            )}
          </div>
        </div>

        {/* Description */}
        {assessment.description && (
          <p className="text-gray-700 mb-4 leading-relaxed line-clamp-2">
            {assessment.description}
          </p>
        )}

        {/* Stats and Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Total Marks */}
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Marks</p>
              <p className="text-sm font-semibold text-gray-900">
                {assessment.total_marks}
              </p>
            </div>
          </div>

          {/* Weightage */}
          <div className="flex items-center space-x-2">
            <div className="bg-purple-100 p-2 rounded">
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Weightage</p>
              <p className="text-sm font-semibold text-gray-900">
                {assessment.weightage}%
              </p>
            </div>
          </div>

          {/* Scheduled Date */}
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded ${
              isUpcoming ? 'bg-blue-100' : isPast ? 'bg-gray-100' : 'bg-gray-50'
            }`}>
              <Calendar className={`h-4 w-4 ${
                isUpcoming ? 'text-blue-600' : isPast ? 'text-gray-400' : 'text-gray-300'
              }`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Scheduled</p>
              <p className="text-sm font-semibold text-gray-900">
                {scheduledDate 
                  ? scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Not set'}
              </p>
            </div>
          </div>

          {/* CLO Mappings */}
          <div className="flex items-center space-x-2">
            <div className="bg-green-100 p-2 rounded">
              <Target className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">CLO Mappings</p>
              <p className="text-sm font-semibold text-gray-900">
                {assessment.clo_count || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        {onMapCLOs && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMapCLOs(assessment.assessment_component_id)}
              icon={Target}
              className="w-full"
            >
              Manage CLO Mappings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentCard;
