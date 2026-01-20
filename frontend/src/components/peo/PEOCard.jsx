import React from 'react';
import { Award, Users, BookOpen, TrendingUp, Edit, Trash2, Eye, Link } from 'lucide-react';
import Button from '../common/Button';

const PEOCard = ({ peo, onView, onEdit, onDelete }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800'
  };

  const statusLabels = {
    active: 'Active',
    under_review: 'Under Review',
    archived: 'Archived'
  };

  const statusColor = statusColors[peo.status] || 'bg-gray-100 text-gray-800';
  const statusLabel = statusLabels[peo.status] || peo.status;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Award className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{peo.peo_code}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
            {peo.degree_name && (
              <p className="text-sm text-gray-500 mb-3">{peo.degree_code} - {peo.degree_name}</p>
            )}
            <p className="text-gray-700 mb-4">{peo.description}</p>
          </div>
          <div className="flex space-x-2">
            {onView && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(peo.peo_id)}
                icon={Eye}
                title="View Details"
              />
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(peo.peo_id)}
                icon={Edit}
                title="Edit PEO"
              />
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(peo.peo_id)}
                icon={Trash2}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete PEO"
              />
            )}
          </div>
        </div>

        {/* Mappings and Statistics */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            {/* PLO Mappings */}
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">PLO Mappings</p>
                <p className="text-sm font-semibold text-gray-900">
                  {peo.plo_mappings?.length || 0}
                </p>
              </div>
            </div>

            {/* Related Courses */}
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Related Courses</p>
                <p className="text-sm font-semibold text-gray-900">
                  {peo.course_count || 0}
                </p>
              </div>
            </div>

            {/* Attainment Rate */}
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Attainment Rate</p>
                <p className="text-sm font-semibold text-gray-900">
                  {peo.attainment_rate ? `${peo.attainment_rate}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PLO Mapping Preview */}
        {peo.plo_mappings && peo.plo_mappings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Link className="h-4 w-4 text-gray-500" />
              <p className="text-xs font-medium text-gray-500">Mapped PLOs:</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {peo.plo_mappings.slice(0, 5).map((mapping, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium"
                >
                  {mapping.plo_code || `PLO-${index + 1}`}
                </span>
              ))}
              {peo.plo_mappings.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                  +{peo.plo_mappings.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sequence Number */}
        {peo.sequence_number && (
          <div className="mt-3 text-xs text-gray-500">
            Sequence: {peo.sequence_number}
          </div>
        )}
      </div>
    </div>
  );
};

export default PEOCard;
