import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Target, ArrowLeft, Save, Plus, Trash2, Calendar } from 'lucide-react';
import { useActionPlan } from '../../hooks/useActionPlans';
import { useDegrees } from '../../hooks/useDegrees';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OutcomeForm from '../../components/actionplan/OutcomeForm';

const ActionPlanEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { actionPlan, loading: planLoading, updateActionPlan } = useActionPlan(id);
  const { degrees } = useDegrees();
  
  const [formData, setFormData] = useState({
    degree_id: '',
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

  useEffect(() => {
    if (actionPlan) {
      setFormData({
        degree_id: actionPlan.degree_id || '',
        title: actionPlan.title || '',
        description: actionPlan.description || '',
        status: actionPlan.status || 'Draft',
        priority: actionPlan.priority || 'Medium',
        start_date: actionPlan.start_date ? actionPlan.start_date.split('T')[0] : '',
        end_date: actionPlan.end_date ? actionPlan.end_date.split('T')[0] : '',
        responsible_person: actionPlan.responsible_person || ''
      });
      
      // Load outcomes if available
      if (actionPlan.outcomes) {
        setOutcomes(actionPlan.outcomes.map(outcome => ({
          ...outcome,
          id: outcome.id || Date.now() + Math.random()
        })));
      }
    }
  }, [actionPlan]);

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
        id: Date.now(),
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
      // Prepare outcomes data
      const outcomesData = outcomes.map(outcome => {
        const { id, ...outcomeData } = outcome;
        // Include id only if it's a real database ID (not temporary)
        return typeof id === 'number' && id < 1000000000000
          ? { id, ...outcomeData }
          : outcomeData;
      });
      
      await updateActionPlan(id, {
        ...formData,
        outcomes: outcomesData
      });
      
      navigate(`/action-plans/${id}`);
    } catch (error) {
      console.error('Error updating action plan:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to update action plan'
      });
    } finally {
      setLoading(false);
    }
  };

  if (planLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!actionPlan) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Action plan not found
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Action Plan</h1>
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
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ActionPlanEdit;
