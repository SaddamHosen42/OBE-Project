import React from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import { Target, Award, TrendingUp } from 'lucide-react';

const ThresholdForm = ({ formData, errors, onChange, degrees }) => {
  const thresholdTypeOptions = [
    { 
      value: 'CLO', 
      label: 'CLO - Course Learning Outcomes',
      description: 'Thresholds for individual course outcome attainment'
    },
    { 
      value: 'PLO', 
      label: 'PLO - Program Learning Outcomes',
      description: 'Thresholds for program-level outcome attainment'
    },
    { 
      value: 'PEO', 
      label: 'PEO - Program Educational Objectives',
      description: 'Thresholds for educational objective attainment'
    }
  ];

  const degreeOptions = [
    { value: '', label: 'Select a degree...' },
    ...(degrees?.map(degree => ({
      value: degree.id,
      label: `${degree.name} (${degree.degree_code || ''})`
    })) || [])
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'CLO':
        return <Target className="w-5 h-5 text-blue-500" />;
      case 'PLO':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'PEO':
        return <Award className="w-5 h-5 text-purple-500" />;
      default:
        return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  const selectedTypeOption = thresholdTypeOptions.find(
    opt => opt.value === formData.threshold_type
  );

  return (
    <div className="space-y-6">
      {/* Degree Selection */}
      <div>
        <Select
          label="Degree Program"
          name="degree_id"
          value={formData.degree_id}
          onChange={onChange}
          options={degreeOptions}
          error={errors.degree_id}
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Select the degree program this threshold applies to
        </p>
      </div>

      {/* Threshold Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Threshold Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3">
          {thresholdTypeOptions.map((option) => (
            <label
              key={option.value}
              className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.threshold_type === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="threshold_type"
                value={option.value}
                checked={formData.threshold_type === option.value}
                onChange={onChange}
                className="mt-0.5"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  {getTypeIcon(option.value)}
                  <span className="font-medium text-gray-900">{option.label}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
        {errors.threshold_type && (
          <p className="mt-1 text-sm text-red-600">{errors.threshold_type}</p>
        )}
      </div>

      {/* Level Name */}
      <div>
        <Input
          label="Level Name"
          name="level_name"
          type="text"
          value={formData.level_name}
          onChange={onChange}
          error={errors.level_name}
          required
          placeholder="e.g., Exceeded, Met, Partially Met, Not Met"
        />
        <p className="mt-1 text-sm text-gray-500">
          Name of the attainment level (e.g., "Exceeded", "Met", "Not Met")
        </p>
      </div>

      {/* Percentage Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label="Minimum Percentage"
            name="min_percentage"
            type="number"
            value={formData.min_percentage}
            onChange={onChange}
            error={errors.min_percentage}
            required
            min="0"
            max="100"
            step="0.01"
          />
          <p className="mt-1 text-sm text-gray-500">
            Minimum % for this level
          </p>
        </div>
        <div>
          <Input
            label="Maximum Percentage"
            name="max_percentage"
            type="number"
            value={formData.max_percentage}
            onChange={onChange}
            error={errors.max_percentage}
            required
            min="0"
            max="100"
            step="0.01"
          />
          <p className="mt-1 text-sm text-gray-500">
            Maximum % for this level
          </p>
        </div>
      </div>

      {/* Visual Range Indicator */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">Threshold Range</p>
        <div className="relative h-8 bg-white rounded-lg border border-gray-300 overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium"
            style={{
              left: `${formData.min_percentage}%`,
              width: `${formData.max_percentage - formData.min_percentage}%`
            }}
          >
            {formData.min_percentage}% - {formData.max_percentage}%
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Is Attained Checkbox */}
      <div>
        <label className="flex items-start">
          <input
            type="checkbox"
            name="is_attained"
            checked={formData.is_attained}
            onChange={onChange}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-700">
              Mark as Attained
            </span>
            <p className="text-sm text-gray-500">
              Check this if scores in this range should be considered as having achieved the outcome
            </p>
          </div>
        </label>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">About Thresholds</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Define multiple levels to categorize attainment (e.g., Exceeded, Met, Not Met)</li>
          <li>Ensure percentage ranges do not overlap</li>
          <li>Use the "Mark as Attained" checkbox to indicate which levels represent successful attainment</li>
          <li>Configure separate thresholds for CLOs, PLOs, and PEOs as needed</li>
        </ul>
      </div>
    </div>
  );
};

export default ThresholdForm;
