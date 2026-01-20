import { Link } from 'react-router-dom';
import { 
  Eye, 
  Edit2, 
  Trash2, 
  Copy, 
  BarChart3, 
  Calendar,
  Users,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const SurveyCard = ({ survey, onDelete, onDuplicate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'draft':
        return <Clock className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isActive = () => {
    const now = new Date();
    const startDate = new Date(survey.start_date);
    const endDate = new Date(survey.end_date);
    return survey.status === 'active' && now >= startDate && now <= endDate;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
                {getStatusIcon(survey.status)}
                <span className="ml-1 capitalize">{survey.status}</span>
              </span>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                {survey.survey_type?.replace('_', ' ')}
              </span>
            </div>
            
            <Link 
              to={`/surveys/${survey.survey_id}/analytics`}
              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {survey.title}
            </Link>
            
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {survey.description}
            </p>
          </div>
        </div>

        {/* Survey Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900 text-xs">Start</div>
              <div>{formatDate(survey.start_date)}</div>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900 text-xs">End</div>
              <div>{formatDate(survey.end_date)}</div>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900 text-xs">Audience</div>
              <div className="capitalize">{survey.target_audience}</div>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <BarChart3 className="h-4 w-4 mr-2 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900 text-xs">Responses</div>
              <div>{survey.response_count || 0}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {survey.is_anonymous && (
              <span className="text-xs text-gray-500 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                Anonymous
              </span>
            )}
            {survey.allow_multiple_responses && (
              <span className="text-xs text-gray-500">
                • Multiple responses allowed
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              to={`/surveys/${survey.survey_id}/analytics`}
              className="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="View Analytics"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </Link>
            
            {isActive() && (
              <Link
                to={`/surveys/${survey.survey_id}/respond`}
                className="inline-flex items-center px-3 py-1.5 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                title="Take Survey"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Link>
            )}
            
            <Link
              to={`/surveys/${survey.survey_id}/edit`}
              className="p-1.5 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Edit Survey"
            >
              <Edit2 className="h-4 w-4" />
            </Link>
            
            <button
              onClick={() => onDuplicate(survey.survey_id)}
              className="p-1.5 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Duplicate Survey"
            >
              <Copy className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => onDelete(survey.survey_id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete Survey"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyCard;
