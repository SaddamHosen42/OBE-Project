import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const QuestionBuilder = ({ question, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    is_required: true,
    options: [''],
    min_value: 1,
    max_value: 5,
    min_label: 'Strongly Disagree',
    max_label: 'Strongly Agree'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text || '',
        question_type: question.question_type || 'multiple_choice',
        is_required: question.is_required !== false,
        options: question.options || [''],
        min_value: question.min_value || 1,
        max_value: question.max_value || 5,
        min_label: question.min_label || 'Strongly Disagree',
        max_label: question.max_label || 'Strongly Agree'
      });
    }
  }, [question]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index) => {
    if (formData.options.length > 1) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const requiresOptions = () => {
    return ['multiple_choice', 'checkbox', 'dropdown'].includes(formData.question_type);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.question_text.trim()) {
      newErrors.question_text = 'Question text is required';
    }

    if (requiresOptions()) {
      const validOptions = formData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        newErrors.options = 'At least 2 options are required';
      }
    }

    if (formData.question_type === 'rating') {
      if (formData.min_value >= formData.max_value) {
        newErrors.max_value = 'Max value must be greater than min value';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const questionData = {
      ...formData,
      options: requiresOptions() 
        ? formData.options.filter(opt => opt.trim())
        : undefined
    };

    onSave(questionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {question ? 'Edit Question' : 'Add Question'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text *
            </label>
            <textarea
              name="question_text"
              value={formData.question_text}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.question_text ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your question"
            />
            {errors.question_text && (
              <p className="mt-1 text-sm text-red-600">{errors.question_text}</p>
            )}
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Type *
            </label>
            <select
              name="question_type"
              value={formData.question_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="multiple_choice">Multiple Choice (Single Answer)</option>
              <option value="checkbox">Checkboxes (Multiple Answers)</option>
              <option value="dropdown">Dropdown</option>
              <option value="short_text">Short Text</option>
              <option value="long_text">Long Text (Paragraph)</option>
              <option value="rating">Rating Scale</option>
              <option value="likert_scale">Likert Scale</option>
              <option value="yes_no">Yes/No</option>
            </select>
          </div>

          {/* Options for Multiple Choice, Checkbox, Dropdown */}
          {requiresOptions() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options *
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Option ${index + 1}`}
                    />
                    {formData.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.options && (
                <p className="mt-1 text-sm text-red-600">{errors.options}</p>
              )}
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </button>
            </div>
          )}

          {/* Rating Scale Settings */}
          {formData.question_type === 'rating' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Value
                  </label>
                  <input
                    type="number"
                    name="min_value"
                    value={formData.min_value}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Value
                  </label>
                  <input
                    type="number"
                    name="max_value"
                    value={formData.max_value}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.max_value ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.max_value && (
                    <p className="mt-1 text-sm text-red-600">{errors.max_value}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Label
                  </label>
                  <input
                    type="text"
                    name="min_label"
                    value={formData.min_label}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Poor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Label
                  </label>
                  <input
                    type="text"
                    name="max_label"
                    value={formData.max_label}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Excellent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Required */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Required Question
              </label>
              <p className="text-sm text-gray-500">
                Respondents must answer this question
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_required"
                checked={formData.is_required}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {question ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionBuilder;
