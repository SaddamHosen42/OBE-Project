import React from 'react';
import { Target, Users, BookOpen, TrendingUp, Edit, Trash2, Eye, Brain } from 'lucide-react';
import Button from '../common/Button';

const PLOCard = ({ plo, onView, onEdit, onDelete }) => {
  const bloomLevels = {
    1: { name: 'Remember', color: 'bg-blue-100 text-blue-800' },
    2: { name: 'Understand', color: 'bg-green-100 text-green-800' },
    3: { name: 'Apply', color: 'bg-yellow-100 text-yellow-800' },
    4: { name: 'Analyze', color: 'bg-orange-100 text-orange-800' },
    5: { name: 'Evaluate', color: 'bg-red-100 text-red-800' },
    6: { name: 'Create', color: 'bg-purple-100 text-purple-800' }
  };

  const bloomLevel = bloomLevels[plo.bloom_level_id] || { name: 'Unknown', color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{plo.plo_code}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${bloomLevel.color}`}>
                <div className="flex items-center space-x-1">
                  <Brain className="h-3 w-3" />
                  <span>{bloomLevel.name}</span>
                </div>
              </span>
            </div>
            {plo.degree_name && (
              <p className="text-sm text-gray-500 mb-3">{plo.degree_code} - {plo.degree_name}</p>
            )}
            <p className="text-gray-700 mb-4">{plo.description}</p>
          </div>
          <div className="flex space-x-2">
            {onView && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(plo.plo_id)}
                icon={Eye}
                title="View Details"
              />
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(plo.plo_id)}
                icon={Edit}
                title="Edit PLO"
              />
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(plo.plo_id)}
                icon={Trash2}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete PLO"
              />
            )}
          </div>
        </div>

        {/* Mappings and Statistics */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            {/* PEO Mappings */}
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">PEO Mappings</p>
                <p className="text-sm font-semibold text-gray-900">
                  {plo.peo_mappings?.length || 0}
                </p>
              </div>
            </div>

            {/* CLO Mappings */}
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">CLO Mappings</p>
                <p className="text-sm font-semibold text-gray-900">
                  {plo.clo_mappings?.length || 0}
                </p>
              </div>
            </div>

            {/* Attainment */}
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Attainment</p>
                <p className="text-sm font-semibold text-gray-900">
                  {plo.attainment ? `${plo.attainment}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Display mapped PEOs if available */}
        {plo.peo_mappings && plo.peo_mappings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">Mapped PEOs:</p>
            <div className="flex flex-wrap gap-2">
              {plo.peo_mappings.map(peo => (
                <span
                  key={peo.peo_id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  title={peo.description}
                >
                  {peo.peo_code}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Display mapped CLOs if available */}
        {plo.clo_mappings && plo.clo_mappings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">Mapped CLOs:</p>
            <div className="flex flex-wrap gap-2">
              {plo.clo_mappings.slice(0, 10).map(clo => (
                <span
                  key={clo.clo_id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  title={clo.description}
                >
                  {clo.clo_code}
                </span>
              ))}
              {plo.clo_mappings.length > 10 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{plo.clo_mappings.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PLOCard;
