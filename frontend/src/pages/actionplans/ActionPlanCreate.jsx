import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Target, ArrowLeft, Save, Plus, Trash2, Calendar } from 'lucide-react';
import { useActionPlans } from '../../hooks/useActionPlans';
import { useDegrees } from '../../hooks/useDegrees';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import OutcomeForm from '../../components/actionplan/OutcomeForm';

const ActionPlanCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const degreeIdParam = searchParams.get('degree');
  
  const { createActionPlan } = useActionPlans();
  const { degrees } = useDegrees();
  
  const [formData, setFormData] = useState({
    degree_id: degreeIdParam || '',
    title: '',
    description: '',
    status: 'Draft',
    priority: 'Medium',
    start_date: '',
    end_date: '',
    responsible_person: ''
  });
  
  const [outcomes, setOutcomes] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleAddOutcome = () => {
    setOutcomes(prev => [
      ...prev,
      {
        id: Date.now(), // Temporary ID for UI
        outcome_type: 'PLO',
        outcome_id: '',
        target_improvement: '',
        current_attainment: '',
        expected_attainment: ''
      }
    ]);
  };

  const handleOutcomeChange = (index, field, value) => {
    setOutcomes(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleRemoveOutcome = (index) => {
    setOutcomes(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.degree_id) {
      newErrors.degree_id = 'Degree is required';
    }
    
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    try {
      // Prepare outcomes data (remove temporary IDs)
      const outcomesData = outcomes.map(({ id, ...outcome }) => outcome);
      
      await createActionPlan({
        ...formData,
        outcomes: outcomesData
      });
      
      navigate(`/action-plans${degreeIdParam ? `?degree=${degreeIdParam}` : ''}`);
    } catch (error) {
      console.error('Error creating action plan:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to create action plan'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          icon={ArrowLeft}
        >
          Back
        </Button>
        <div className="flex items-center space-x-3">
          <Target className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Create Action Plan</h1>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Select
                label="Degree Program"
                name="degree_id"
                value={formData.degree_id}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select degree...' },
                  ...(degrees?.map(degree => ({
                    value: degree.id,
                    label: `${degree.degree_code} - ${degree.degree_name}`
                  })) || [])
                ]}
                error={errors.degree_id}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                placeholder="Enter action plan title"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the action plan and its objectives..."
              />
            </div>

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
              required
            />

            <Select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={priorityOptions}
              required
            />

            <Input
              label="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              icon={Calendar}
            />

            <Input
              label="End Date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              error={errors.end_date}
              icon={Calendar}
            />

            <div className="md:col-span-2">
              <Input
                label="Responsible Person"
                name="responsible_person"
                value={formData.responsible_person}
                onChange={handleChange}
                placeholder="Enter name or role of responsible person"
              />
            </div>
          </div>
        </div>

        {/* Outcomes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Learning Outcomes</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOutcome}
              icon={Plus}
            >
              Add Outcome
            </Button>
          </div>

          {outcomes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No outcomes added yet. Click "Add Outcome" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {outcomes.map((outcome, index) => (
                <OutcomeForm
                  key={outcome.id}
                  outcome={outcome}
                  index={index}
                  onChange={handleOutcomeChange}
                  onRemove={handleRemoveOutcome}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            icon={Save}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Action Plan'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ActionPlanCreate;
