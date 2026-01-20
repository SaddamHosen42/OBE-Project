import React, { useState, useEffect } from 'react';
import { FileQuestion, Save, X, Plus, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import Select from '../common/Select';

const QuestionForm = ({ 
  question = null, 
  assessmentComponentId = null,
  courseOfferingId = null,
  onSubmit, 
  onCancel,
  clos = [],
  bloomLevels = []
}) => {
  const [formData, setFormData] = useState({
    assessment_component_id: assessmentComponentId || '',
    course_offering_id: courseOfferingId || '',
    question_number: '',
    question_text: '',
    question_type: 'MCQ',
    difficulty_level: 'Medium',
    total_marks: '',
    bloom_level_id: '',
    options: ['', '', '', ''],
    correct_answer: '',
    solution_text: '',
    clo_mappings: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (question) {
      setFormData({
        assessment_component_id: question.assessment_component_id || '',
        course_offering_id: question.course_offering_id || '',
        question_number: question.question_number || '',
        question_text: question.question_text || '',
        question_type: question.question_type || 'MCQ',
        difficulty_level: question.difficulty_level || 'Medium',
        total_marks: question.total_marks || '',
        bloom_level_id: question.bloom_level_id || '',
        options: question.options || ['', '', '', ''],
        correct_answer: question.correct_answer || '',
        solution_text: question.solution_text || '',
        clo_mappings: question.clo_mappings || []
      });
    }
  }, [question]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const addCLOMapping = () => {
    setFormData(prev => ({
      ...prev,
      clo_mappings: [...prev.clo_mappings, { clo_id: '', weightage: '' }]
    }));
  };

  const removeCLOMapping = (index) => {
    setFormData(prev => ({
      ...prev,
      clo_mappings: prev.clo_mappings.filter((_, i) => i !== index)
    }));
  };

  const handleCLOMappingChange = (index, field, value) => {
    const newMappings = [...formData.clo_mappings];
    newMappings[index][field] = value;
    setFormData(prev => ({
      ...prev,
      clo_mappings: newMappings
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.question_text.trim()) {
      newErrors.question_text = 'Question text is required';
    }

    if (!formData.question_type) {
      newErrors.question_type = 'Question type is required';
    }

    if (!formData.total_marks || formData.total_marks <= 0) {
      newErrors.total_marks = 'Valid marks are required';
    }

    // Validate MCQ options
    if (formData.question_type === 'MCQ') {
      const filledOptions = formData.options.filter(opt => opt.trim());
      if (filledOptions.length < 2) {
        newErrors.options = 'At least 2 options are required for MCQ';
      }
      if (!formData.correct_answer.trim()) {
        newErrors.correct_answer = 'Correct answer is required for MCQ';
      }
    }

    // Validate CLO mappings
    formData.clo_mappings.forEach((mapping, index) => {
      if (!mapping.clo_id) {
        newErrors[`clo_mapping_${index}_clo`] = 'CLO is required';
      }
      if (!mapping.weightage || mapping.weightage <= 0 || mapping.weightage > 100) {
        newErrors[`clo_mapping_${index}_weightage`] = 'Valid weightage (1-100) is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Clean up options for non-MCQ questions
      const submitData = {
        ...formData,
        options: formData.question_type === 'MCQ' ? formData.options.filter(opt => opt.trim()) : null,
        correct_answer: formData.question_type === 'MCQ' ? formData.correct_answer : null
      };
      onSubmit(submitData);
    }
  };

  const questionTypes = [
    { value: 'MCQ', label: 'Multiple Choice' },
    { value: 'Short Answer', label: 'Short Answer' },
    { value: 'Long Answer', label: 'Long Answer' },
    { value: 'True/False', label: 'True/False' },
    { value: 'Fill in the Blank', label: 'Fill in the Blank' }
  ];

  const difficultyLevels = [
    { value: 'Easy', label: 'Easy' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Hard', label: 'Hard' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <div className="bg-blue-500 p-3 rounded-lg">
          <FileQuestion className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {question ? 'Edit Question' : 'Create New Question'}
          </h2>
          <p className="text-sm text-gray-500">
            Fill in the question details and map to CLOs
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Question Number"
          name="question_number"
          type="number"
          value={formData.question_number}
          onChange={handleChange}
          placeholder="e.g., 1"
          error={errors.question_number}
        />

        <Select
          label="Question Type"
          name="question_type"
          value={formData.question_type}
          onChange={handleChange}
          options={questionTypes}
          error={errors.question_type}
          required
        />

        <Select
          label="Difficulty Level"
          name="difficulty_level"
          value={formData.difficulty_level}
          onChange={handleChange}
          options={difficultyLevels}
        />

        <Input
          label="Total Marks"
          name="total_marks"
          type="number"
          step="0.5"
          value={formData.total_marks}
          onChange={handleChange}
          placeholder="e.g., 5"
          error={errors.total_marks}
          required
        />

        {bloomLevels.length > 0 && (
          <Select
            label="Bloom's Taxonomy Level"
            name="bloom_level_id"
            value={formData.bloom_level_id}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select Bloom Level' },
              ...bloomLevels.map(level => ({
                value: level.bloom_level_id,
                label: `${level.level_number}. ${level.level_name}`
              }))
            ]}
          />
        )}
      </div>

      {/* Question Text */}
      <TextArea
        label="Question Text"
        name="question_text"
        value={formData.question_text}
        onChange={handleChange}
        placeholder="Enter the question text..."
        rows={4}
        error={errors.question_text}
        required
      />

      {/* MCQ Options */}
      {formData.question_type === 'MCQ' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Answer Options
            </label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addOption}
              icon={Plus}
            >
              Add Option
            </Button>
          </div>
          
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              {formData.options.length > 2 && (
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => removeOption(index)}
                  icon={Trash2}
                  title="Remove Option"
                />
              )}
            </div>
          ))}
          {errors.options && (
            <p className="text-sm text-red-600">{errors.options}</p>
          )}

          <Input
            label="Correct Answer"
            name="correct_answer"
            value={formData.correct_answer}
            onChange={handleChange}
            placeholder="Enter the correct answer exactly as it appears in options"
            error={errors.correct_answer}
          />
        </div>
      )}

      {/* Solution Text */}
      <TextArea
        label="Solution/Explanation (Optional)"
        name="solution_text"
        value={formData.solution_text}
        onChange={handleChange}
        placeholder="Enter the solution or explanation..."
        rows={3}
      />

      {/* CLO Mappings */}
      {clos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              CLO Mappings
            </label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addCLOMapping}
              icon={Plus}
            >
              Add CLO
            </Button>
          </div>

          {formData.clo_mappings.map((mapping, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Select
                value={mapping.clo_id}
                onChange={(e) => handleCLOMappingChange(index, 'clo_id', e.target.value)}
                options={[
                  { value: '', label: 'Select CLO' },
                  ...clos.map(clo => ({
                    value: clo.clo_id,
                    label: `${clo.clo_code} - ${clo.description?.substring(0, 50)}...`
                  }))
                ]}
                className="flex-1"
                error={errors[`clo_mapping_${index}_clo`]}
              />
              <Input
                type="number"
                min="1"
                max="100"
                value={mapping.weightage}
                onChange={(e) => handleCLOMappingChange(index, 'weightage', e.target.value)}
                placeholder="Weightage %"
                className="w-32"
                error={errors[`clo_mapping_${index}_weightage`]}
              />
              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={() => removeCLOMapping(index)}
                icon={Trash2}
                title="Remove CLO Mapping"
              />
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          icon={X}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          icon={Save}
        >
          {question ? 'Update Question' : 'Create Question'}
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;
