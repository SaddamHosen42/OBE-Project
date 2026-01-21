import { useMemo } from 'react';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

const ResponseChart = ({ question, responses }) => {
  // Calculate statistics for the question
  const stats = useMemo(() => {
    if (!responses || responses.length === 0) {
      return null;
    }

    const questionResponses = responses
      .map(r => r.answers?.find(a => a.question_id === question.question_id))
      .filter(a => a && a.response_value);

    if (questionResponses.length === 0) {
      return null;
    }

    const responseValues = questionResponses.map(r => r.response_value);

    switch (question.question_type) {
      case 'multiple_choice':
      case 'dropdown':
      case 'yes_no':
      case 'likert_scale': {
        // Count occurrences of each option
        const counts = {};
        responseValues.forEach(value => {
          counts[value] = (counts[value] || 0) + 1;
        });

        const options = question.options || Object.keys(counts);
        const data = options.map(option => ({
          label: option,
          count: counts[option] || 0,
          percentage: ((counts[option] || 0) / responseValues.length) * 100
        }));

        return {
          type: 'categorical',
          data,
          total: responseValues.length
        };
      }

      case 'checkbox': {
        // Handle multiple selections
        const counts = {};
        responseValues.forEach(value => {
          const selections = Array.isArray(value) ? value : [value];
          selections.forEach(selection => {
            counts[selection] = (counts[selection] || 0) + 1;
          });
        });

        const options = question.options || Object.keys(counts);
        const data = options.map(option => ({
          label: option,
          count: counts[option] || 0,
          percentage: ((counts[option] || 0) / responseValues.length) * 100
        }));

        return {
          type: 'categorical',
          data,
          total: responseValues.length
        };
      }

      case 'rating': {
        // Calculate rating statistics
        const ratings = responseValues.map(v => Number(v)).filter(v => !isNaN(v));
        const sum = ratings.reduce((acc, val) => acc + val, 0);
        const average = sum / ratings.length;
        
        const minValue = question.min_value || 1;
        const maxValue = question.max_value || 5;
        const ratingCounts = {};
        
        for (let i = minValue; i <= maxValue; i++) {
          ratingCounts[i] = 0;
        }
        
        ratings.forEach(rating => {
          ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
        });

        const data = Object.keys(ratingCounts).map(rating => ({
          label: rating,
          count: ratingCounts[rating],
          percentage: (ratingCounts[rating] / ratings.length) * 100
        }));

        return {
          type: 'rating',
          data,
          total: ratings.length,
          average: average.toFixed(2),
          min: Math.min(...ratings),
          max: Math.max(...ratings)
        };
      }

      case 'short_text':
      case 'long_text': {
        // Display text responses as a list
        return {
          type: 'text',
          responses: responseValues,
          total: responseValues.length
        };
      }

      default:
        return null;
    }
  }, [question, responses]);

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>No responses yet for this question</p>
      </div>
    );
  }

  // Render categorical data (bar chart)
  if (stats.type === 'categorical') {
    const maxCount = Math.max(...stats.data.map(d => d.count));

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          Total Responses: <span className="font-semibold">{stats.total}</span>
        </div>
        
        {stats.data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-900">{item.label}</span>
              <span className="text-gray-600">
                {item.count} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              >
                {item.count > 0 && (
                  <span className="text-white text-xs font-medium">{item.count}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render rating data
  if (stats.type === 'rating') {
    const maxCount = Math.max(...stats.data.map(d => d.count));

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Average</div>
            <div className="text-2xl font-bold text-blue-600">{stats.average}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Highest</div>
            <div className="text-2xl font-bold text-green-600">{stats.max}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Lowest</div>
            <div className="text-2xl font-bold text-orange-600">{stats.min}</div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Total Responses: <span className="font-semibold">{stats.total}</span>
        </div>

        {stats.data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-900">Rating {item.label}</span>
              <span className="text-gray-600">
                {item.count} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              >
                {item.count > 0 && (
                  <span className="text-white text-xs font-medium">{item.count}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render text responses
  if (stats.type === 'text') {
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          Total Responses: <span className="font-semibold">{stats.total}</span>
        </div>
        
        <div className="max-h-96 overflow-y-auto space-y-3">
          {stats.responses.map((response, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Response #{index + 1}</div>
              <p className="text-gray-900">{response}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default ResponseChart;
