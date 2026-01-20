import React from 'react';

const RubricPreview = ({ rubric }) => {
  if (!rubric) {
    return (
      <div className="text-center py-8 text-gray-500">
        No rubric data to preview
      </div>
    );
  }

  const { rubric_name, rubric_type, description, criteria = [], levels = [] } = rubric;

  // Sort levels by points (descending)
  const sortedLevels = [...levels].sort((a, b) => (b.points || 0) - (a.points || 0));

  return (
    <div className="space-y-6">
      {/* Rubric Header */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900">{rubric_name || 'Untitled Rubric'}</h3>
        {description && (
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        )}
        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
          <span>Type: {rubric_type?.replace('-', ' ').toUpperCase()}</span>
          <span>Max Score: {rubric.max_score || 0}</span>
        </div>
      </div>

      {/* Rubric Table */}
      {criteria.length > 0 && levels.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Criteria
                </th>
                {sortedLevels.map((level, index) => (
                  <th
                    key={level.id || index}
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                  >
                    <div>{level.level_name}</div>
                    <div className="font-semibold text-blue-600">
                      {level.points} {level.points === 1 ? 'pt' : 'pts'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {criteria.map((criterion, index) => (
                <tr key={criterion.id || index}>
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="text-sm font-medium text-gray-900">
                      {criterion.criterion_name}
                    </div>
                    {criterion.description && (
                      <div className="mt-1 text-sm text-gray-500">
                        {criterion.description}
                      </div>
                    )}
                    {criterion.weight && criterion.weight !== 1 && (
                      <div className="mt-1 text-xs text-gray-400">
                        Weight: {criterion.weight}
                      </div>
                    )}
                  </td>
                  {sortedLevels.map((level, levelIndex) => (
                    <td
                      key={level.id || levelIndex}
                      className="px-6 py-4 text-sm text-gray-500 border-r border-gray-200 last:border-r-0"
                    >
                      {level.description || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {criteria.length === 0 && levels.length === 0
              ? 'Add criteria and performance levels to see the rubric preview'
              : criteria.length === 0
              ? 'Add criteria to see the rubric preview'
              : 'Add performance levels to see the rubric preview'}
          </p>
        </div>
      )}

      {/* Legend */}
      {criteria.length > 0 && levels.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Scoring Guide</h4>
          <div className="space-y-1">
            {sortedLevels.map((level, index) => (
              <div key={level.id || index} className="text-sm text-gray-600">
                <span className="font-medium">{level.level_name}:</span> {level.points} {level.points === 1 ? 'point' : 'points'}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total Criteria: <span className="font-medium">{criteria.length}</span>
            </p>
            <p className="text-sm text-gray-600">
              Maximum Possible Score: <span className="font-medium">{rubric.max_score || 0}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RubricPreview;
