import PropTypes from 'prop-types';
import { CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';

export default function SurveyAttainmentTable({
  data,
  threshold = 70,
  outcomeType = 'PLO',
  className = ''
}) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-8 text-center ${className}`}>
        <p className="text-gray-500">No survey attainment data available</p>
      </div>
    );
  }

  const getStatusBadge = (attainment) => {
    if (attainment >= threshold) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Achieved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <XCircle className="w-3 h-3 mr-1" />
        Below Target
      </span>
    );
  };

  const getAttainmentColor = (attainment) => {
    if (attainment >= threshold) return 'text-green-600';
    if (attainment >= threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {outcomeType}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Survey
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responses
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Score
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attainment
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr 
                key={index}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-indigo-600">
                        {row.outcome_label || `${outcomeType}-${row.outcome_id}`}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {row.outcome_description || 'No description'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {row.survey_title || 'Unknown Survey'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {row.survey_type && `Type: ${row.survey_type}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-900 font-medium">
                    {row.response_count || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-900 font-medium">
                    {row.average_score ? row.average_score.toFixed(2) : '0.00'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className={`text-lg font-bold ${getAttainmentColor(row.attainment_percentage || 0)}`}>
                    {row.attainment_percentage ? row.attainment_percentage.toFixed(1) : '0.0'}%
                  </div>
                  {row.trend && (
                    <div className="flex items-center justify-center mt-1">
                      {row.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-xs text-gray-500 ml-1">
                        {row.trend_value && `${Math.abs(row.trend_value).toFixed(1)}%`}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(row.attainment_percentage || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Total {outcomeType}s: <span className="font-semibold text-gray-900">{data.length}</span>
          </div>
          <div className="text-gray-600">
            Achieved Target: 
            <span className="font-semibold text-green-600 ml-1">
              {data.filter(row => (row.attainment_percentage || 0) >= threshold).length}
            </span>
          </div>
          <div className="text-gray-600">
            Below Target: 
            <span className="font-semibold text-yellow-600 ml-1">
              {data.filter(row => (row.attainment_percentage || 0) < threshold).length}
            </span>
          </div>
          <div className="text-gray-600">
            Avg Attainment: 
            <span className={`font-semibold ml-1 ${
              data.reduce((sum, row) => sum + (row.attainment_percentage || 0), 0) / data.length >= threshold 
                ? 'text-green-600' 
                : 'text-yellow-600'
            }`}>
              {(data.reduce((sum, row) => sum + (row.attainment_percentage || 0), 0) / data.length).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

SurveyAttainmentTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      outcome_id: PropTypes.number,
      outcome_label: PropTypes.string,
      outcome_description: PropTypes.string,
      survey_title: PropTypes.string,
      survey_type: PropTypes.string,
      response_count: PropTypes.number,
      average_score: PropTypes.number,
      attainment_percentage: PropTypes.number,
      trend: PropTypes.oneOf(['up', 'down']),
      trend_value: PropTypes.number
    })
  ).isRequired,
  threshold: PropTypes.number,
  outcomeType: PropTypes.oneOf(['PLO', 'CLO']),
  className: PropTypes.string
};
