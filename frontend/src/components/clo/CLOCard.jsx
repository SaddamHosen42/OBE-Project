import React from 'react';
import { BookOpen, Target, TrendingUp, Edit, Trash2, Eye, Brain } from 'lucide-react';
import Button from '../common/Button';

const CLOCard = ({ clo, onView, onEdit, onDelete }) => {
  const bloomLevels = {
    1: { name: 'Remember', color: 'bg-blue-100 text-blue-800' },
    2: { name: 'Understand', color: 'bg-green-100 text-green-800' },
    3: { name: 'Apply', color: 'bg-yellow-100 text-yellow-800' },
    4: { name: 'Analyze', color: 'bg-orange-100 text-orange-800' },
    5: { name: 'Evaluate', color: 'bg-red-100 text-red-800' },
    6: { name: 'Create', color: 'bg-purple-100 text-purple-800' }
  };

  const bloomLevel = bloomLevels[clo.bloom_level_id] || { name: 'Unknown', color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="bg-blue-500 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">{clo.clo_code}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${bloomLevel.color}`}>
                  <div className="flex items-center space-x-1">
                    <Brain className="h-3 w-3" />
                    <span>{bloomLevel.name}</span>
                  </div>
                </span>
              </div>
              {clo.course_name && (
                <p className="text-sm text-gray-500">{clo.course_code} - {clo.course_name}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {onView && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(clo.clo_id)}
                icon={Eye}
                title="View Details"
              />
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(clo.clo_id)}
                icon={Edit}
                title="Edit CLO"
              />
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(clo.clo_id)}
                icon={Trash2}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete CLO"
              />
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 leading-relaxed">{clo.description}</p>

        {/* Stats and Mappings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* PLO Mappings */}
          <div className="flex items-center space-x-2">
            <div className="bg-purple-100 p-2 rounded">
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Mapped PLOs</p>
              <p className="text-sm font-semibold text-gray-900">
                {clo.plo_mappings?.length || 0}
              </p>
            </div>
          </div>

          {/* Assessment Count */}
          <div className="flex items-center space-x-2">
            <div className="bg-green-100 p-2 rounded">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Assessments</p>
              <p className="text-sm font-semibold text-gray-900">
                {clo.assessment_count || 0}
              </p>
            </div>
          </div>

          {/* Attainment Status */}
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded ${
              clo.attainment_status === 'Achieved' 
                ? 'bg-green-100' 
                : clo.attainment_status === 'Partial' 
                ? 'bg-yellow-100' 
                : 'bg-gray-100'
            }`}>
              <TrendingUp className={`h-4 w-4 ${
                clo.attainment_status === 'Achieved' 
                  ? 'text-green-600' 
                  : clo.attainment_status === 'Partial' 
                  ? 'text-yellow-600' 
                  : 'text-gray-600'
              }`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Attainment</p>
              <p className="text-sm font-semibold text-gray-900">
                {clo.attainment_percentage !== null && clo.attainment_percentage !== undefined
                  ? `${clo.attainment_percentage}%`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* PLO Tags */}
        {clo.plo_mappings && clo.plo_mappings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Mapped to:</p>
            <div className="flex flex-wrap gap-2">
              {clo.plo_mappings.map((mapping) => (
                <span
                  key={mapping.plo_id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {mapping.plo_code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CLOCard;
