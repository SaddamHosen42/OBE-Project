import React from 'react';
import { FileQuestion, Edit, Trash2, Eye, BookOpen, Target } from 'lucide-react';
import Button from '../common/Button';
import BloomLevelBadge from './BloomLevelBadge';

const QuestionCard = ({ question, onView, onEdit, onDelete }) => {
  const questionTypes = {
    'MCQ': { name: 'Multiple Choice', color: 'bg-blue-50 border-blue-200' },
    'Short Answer': { name: 'Short Answer', color: 'bg-green-50 border-green-200' },
    'Long Answer': { name: 'Long Answer', color: 'bg-purple-50 border-purple-200' },
    'True/False': { name: 'True/False', color: 'bg-yellow-50 border-yellow-200' },
    'Fill in the Blank': { name: 'Fill in the Blank', color: 'bg-orange-50 border-orange-200' }
  };

  const difficultyColors = {
    'Easy': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Hard': 'bg-red-100 text-red-800'
  };

  const questionType = questionTypes[question.question_type] || { 
    name: question.question_type, 
    color: 'bg-gray-50 border-gray-200' 
  };

  return (
    <div className={`bg-white rounded-lg border-2 ${questionType.color} hover:shadow-lg transition-shadow`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="bg-blue-500 p-2 rounded-lg">
              <FileQuestion className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  Q{question.question_number || question.question_id}
                </h3>
                <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                  {questionType.name}
                </span>
                {question.difficulty_level && (
                  <span className={`px-2 py-1 text-xs font-medium rounded ${difficultyColors[question.difficulty_level] || 'bg-gray-100 text-gray-800'}`}>
                    {question.difficulty_level}
                  </span>
                )}
                {question.bloom_level_id && (
                  <BloomLevelBadge level={question.bloom_level_id} />
                )}
              </div>
              {question.assessment_name && (
                <p className="text-xs text-gray-500 mb-2">
                  Assessment: {question.assessment_name}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {onView && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(question.question_id)}
                icon={Eye}
                title="View Details"
              />
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(question.question_id)}
                icon={Edit}
                title="Edit Question"
              />
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => onDelete(question)}
                icon={Trash2}
                title="Delete Question"
              />
            )}
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-3">
            {question.question_text}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>Marks: {question.total_marks || 'N/A'}</span>
            </div>
            {question.clo_count && (
              <div className="flex items-center space-x-1">
                <BookOpen className="h-4 w-4" />
                <span>{question.clo_count} CLO{question.clo_count !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          {question.created_at && (
            <div className="text-xs text-gray-400">
              Created: {new Date(question.created_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
