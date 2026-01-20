import React from 'react';
import { Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

const OutcomeForm = ({ outcome, index, onChange, onRemove }) => {
  const outcomeTypeOptions = [
    { value: 'PLO', label: 'Program Learning Outcome (PLO)' },
    { value: 'CLO', label: 'Course Learning Outcome (CLO)' },
    { value: 'PEO', label: 'Program Educational Objective (PEO)' }
  ];

  const handleChange = (field, value) => {
    onChange(index, field, value);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Outcome {index + 1}
        </h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onRemove(index)}
          icon={Trash2}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Remove
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Select
            label="Outcome Type"
            value={outcome.outcome_type}
            onChange={(e) => handleChange('outcome_type', e.target.value)}
            options={outcomeTypeOptions}
            required
          />
        </div>

        <Input
          label="Outcome ID"
          value={outcome.outcome_id}
          onChange={(e) => handleChange('outcome_id', e.target.value)}
          placeholder="e.g., PLO1, CLO2"
          required
        />

        <Input
          label="Current Attainment (%)"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={outcome.current_attainment}
          onChange={(e) => handleChange('current_attainment', e.target.value)}
          placeholder="e.g., 65.5"
        />

        <Input
          label="Expected Attainment (%)"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={outcome.expected_attainment}
          onChange={(e) => handleChange('expected_attainment', e.target.value)}
          placeholder="e.g., 75.0"
        />

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Improvement
          </label>
          <textarea
            value={outcome.target_improvement}
            onChange={(e) => handleChange('target_improvement', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the specific improvements targeted for this outcome..."
          />
        </div>
      </div>

      {/* Improvement Indicator */}
      {outcome.current_attainment && outcome.expected_attainment && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Expected Improvement:</span>
            <span className={`font-semibold ${
              parseFloat(outcome.expected_attainment) > parseFloat(outcome.current_attainment)
                ? 'text-green-600'
                : parseFloat(outcome.expected_attainment) === parseFloat(outcome.current_attainment)
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {(parseFloat(outcome.expected_attainment) - parseFloat(outcome.current_attainment)).toFixed(2)}%
              {parseFloat(outcome.expected_attainment) > parseFloat(outcome.current_attainment) && ' ↑'}
              {parseFloat(outcome.expected_attainment) < parseFloat(outcome.current_attainment) && ' ↓'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutcomeForm;
