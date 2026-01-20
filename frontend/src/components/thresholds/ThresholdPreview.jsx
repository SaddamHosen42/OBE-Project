import React from 'react';
import { Target, Award, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

const ThresholdPreview = ({ threshold, degrees }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'CLO':
        return <Target className="w-6 h-6 text-blue-500" />;
      case 'PLO':
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case 'PEO':
        return <Award className="w-6 h-6 text-purple-500" />;
      default:
        return <Target className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'CLO':
        return 'blue';
      case 'PLO':
        return 'green';
      case 'PEO':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'CLO':
        return 'Course Learning Outcome';
      case 'PLO':
        return 'Program Learning Outcome';
      case 'PEO':
        return 'Program Educational Objective';
      default:
        return type;
    }
  };

  const selectedDegree = degrees?.find(d => d.id === parseInt(threshold.degree_id));
  const color = getTypeColor(threshold.threshold_type);
  const rangeWidth = threshold.max_percentage - threshold.min_percentage;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-6">
      {/* Header */}
      <div className={`bg-gradient-to-r from-${color}-600 to-${color}-700 px-6 py-4`}>
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg">
            {getTypeIcon(threshold.threshold_type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Threshold Preview</h3>
            <p className="text-sm text-white/80">Live preview of your threshold</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Degree Info */}
        {selectedDegree && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Degree Program
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {selectedDegree.name}
            </p>
            {selectedDegree.degree_code && (
              <p className="text-sm text-gray-600">
                Code: {selectedDegree.degree_code}
              </p>
            )}
          </div>
        )}

        {/* Threshold Type */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Threshold Type
          </p>
          <div className={`inline-flex items-center gap-2 px-3 py-1 bg-${color}-100 text-${color}-800 rounded-full`}>
            {getTypeIcon(threshold.threshold_type)}
            <span className="font-medium">{threshold.threshold_type}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {getTypeName(threshold.threshold_type)}
          </p>
        </div>

        {/* Level Name */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Level Name
          </p>
          <p className="text-xl font-bold text-gray-900">
            {threshold.level_name || 'Not specified'}
          </p>
        </div>

        {/* Percentage Range */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Percentage Range
          </p>
          <div className="space-y-3">
            {/* Visual Bar */}
            <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={`absolute h-full bg-gradient-to-r from-${color}-400 to-${color}-600 flex items-center justify-center`}
                style={{
                  left: `${threshold.min_percentage}%`,
                  width: `${rangeWidth}%`
                }}
              >
                <span className="text-white text-sm font-semibold">
                  {threshold.min_percentage}% - {threshold.max_percentage}%
                </span>
              </div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Minimum</p>
                <p className="text-2xl font-bold text-gray-900">
                  {threshold.min_percentage}%
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Maximum</p>
                <p className="text-2xl font-bold text-gray-900">
                  {threshold.max_percentage}%
                </p>
              </div>
            </div>

            {/* Range Width */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Range Width</p>
              <p className="text-lg font-semibold text-blue-900">
                {rangeWidth.toFixed(2)} percentage points
              </p>
            </div>
          </div>
        </div>

        {/* Attainment Status */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Attainment Status
          </p>
          <div className={`flex items-center gap-3 p-4 rounded-lg ${
            threshold.is_attained 
              ? 'bg-green-50 border-2 border-green-200' 
              : 'bg-red-50 border-2 border-red-200'
          }`}>
            {threshold.is_attained ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Attained</p>
                  <p className="text-sm text-green-700">
                    This level represents successful attainment
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Not Attained</p>
                  <p className="text-sm text-red-700">
                    This level does not represent successful attainment
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Example Usage */}
        <div className="border-t pt-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Example Usage
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              Students scoring between <strong>{threshold.min_percentage}%</strong> and{' '}
              <strong>{threshold.max_percentage}%</strong> will be classified as{' '}
              <strong>"{threshold.level_name || 'this level'}"</strong> for{' '}
              <strong>{threshold.threshold_type}</strong> evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThresholdPreview;
