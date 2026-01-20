import { CheckSquare, Circle, ChevronDown, Type, AlignLeft, Star, ThumbsUp } from 'lucide-react';

// Question type metadata and configurations
export const QUESTION_TYPES = {
  multiple_choice: {
    id: 'multiple_choice',
    label: 'Multiple Choice',
    description: 'Single answer selection',
    icon: Circle,
    requiresOptions: true,
    allowsMultiple: false
  },
  checkbox: {
    id: 'checkbox',
    label: 'Checkboxes',
    description: 'Multiple answer selection',
    icon: CheckSquare,
    requiresOptions: true,
    allowsMultiple: true
  },
  dropdown: {
    id: 'dropdown',
    label: 'Dropdown',
    description: 'Select from dropdown list',
    icon: ChevronDown,
    requiresOptions: true,
    allowsMultiple: false
  },
  short_text: {
    id: 'short_text',
    label: 'Short Text',
    description: 'Single line text input',
    icon: Type,
    requiresOptions: false,
    allowsMultiple: false
  },
  long_text: {
    id: 'long_text',
    label: 'Long Text',
    description: 'Multi-line text input',
    icon: AlignLeft,
    requiresOptions: false,
    allowsMultiple: false
  },
  rating: {
    id: 'rating',
    label: 'Rating Scale',
    description: 'Numeric rating scale',
    icon: Star,
    requiresOptions: false,
    allowsMultiple: false,
    hasScale: true
  },
  likert_scale: {
    id: 'likert_scale',
    label: 'Likert Scale',
    description: 'Agreement scale',
    icon: ThumbsUp,
    requiresOptions: false,
    allowsMultiple: false,
    hasScale: true,
    defaultOptions: [
      'Strongly Disagree',
      'Disagree',
      'Neutral',
      'Agree',
      'Strongly Agree'
    ]
  },
  yes_no: {
    id: 'yes_no',
    label: 'Yes/No',
    description: 'Binary choice',
    icon: CheckSquare,
    requiresOptions: false,
    allowsMultiple: false,
    defaultOptions: ['Yes', 'No']
  }
};

// Component to render question input based on type
export const QuestionInput = ({ question, value, onChange, error }) => {
  const renderInput = () => {
    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name={`question_${question.question_id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      onChange([...currentValues, option]);
                    } else {
                      onChange(currentValues.filter(v => v !== option));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an option...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'short_text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your answer..."
          />
        );

      case 'long_text':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your answer..."
          />
        );

      case 'rating':
        const minValue = question.min_value || 1;
        const maxValue = question.max_value || 5;
        const ratingOptions = [];
        for (let i = minValue; i <= maxValue; i++) {
          ratingOptions.push(i);
        }
        
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{question.min_label || minValue}</span>
              <span className="text-sm text-gray-600">{question.max_label || maxValue}</span>
            </div>
            <div className="flex justify-between gap-2">
              {ratingOptions.map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => onChange(rating)}
                  className={`flex-1 py-3 px-4 border-2 rounded-lg font-medium transition-all ${
                    value === rating
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        );

      case 'likert_scale':
        const likertOptions = question.options || QUESTION_TYPES.likert_scale.defaultOptions;
        
        return (
          <div className="space-y-2">
            {likertOptions.map((option, index) => (
              <label
                key={index}
                className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name={`question_${question.question_id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'yes_no':
        const yesNoOptions = question.options || QUESTION_TYPES.yes_no.defaultOptions;
        
        return (
          <div className="flex gap-4">
            {yesNoOptions.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onChange(option)}
                className={`flex-1 py-3 px-6 border-2 rounded-lg font-medium transition-all ${
                  value === option
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your answer..."
          />
        );
    }
  };

  return (
    <div>
      {renderInput()}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Helper function to get question type metadata
export const getQuestionTypeInfo = (typeId) => {
  return QUESTION_TYPES[typeId] || QUESTION_TYPES.short_text;
};

// Helper function to validate response based on question type
export const validateResponse = (question, value) => {
  if (question.is_required) {
    if (!value || 
        (typeof value === 'string' && !value.trim()) ||
        (Array.isArray(value) && value.length === 0)) {
      return 'This question is required';
    }
  }
  
  return null;
};

export default QuestionInput;
