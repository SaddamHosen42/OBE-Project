import React, { useState, useEffect } from 'react';
import RubricCriteriaForm from './RubricCriteriaForm';
import RubricLevelForm from './RubricLevelForm';
import RubricPreview from './RubricPreview';
import { 
  PlusIcon, 
  TrashIcon,
  EyeIcon,
  PencilSquareIcon 
} from '@heroicons/react/24/outline';

const RubricBuilder = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  loading = false,
  isEdit = false 
}) => {
  const [rubricName, setRubricName] = useState('');
  const [rubricType, setRubricType] = useState('analytical');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [criteria, setCriteria] = useState([]);
  const [levels, setLevels] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setRubricName(initialData.rubric_name || '');
      setRubricType(initialData.rubric_type || 'analytical');
      setDescription(initialData.description || '');
      setIsActive(initialData.is_active ?? true);
      setCriteria(initialData.criteria || []);
      setLevels(initialData.levels || []);
    }
  }, [initialData]);

  const addCriteria = () => {
    const newCriteria = {
      id: Date.now(),
      criterion_name: '',
      description: '',
      weight: 1,
      order_index: criteria.length
    };
    setCriteria([...criteria, newCriteria]);
  };

  const updateCriteria = (id, field, value) => {
    setCriteria(criteria.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const removeCriteria = (id) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const addLevel = () => {
    const newLevel = {
      id: Date.now(),
      level_name: '',
      description: '',
      points: 0,
      order_index: levels.length
    };
    setLevels([...levels, newLevel]);
  };

  const updateLevel = (id, field, value) => {
    setLevels(levels.map(l => 
      l.id === id ? { ...l, [field]: value } : l
    ));
  };

  const removeLevel = (id) => {
    setLevels(levels.filter(l => l.id !== id));
  };

  const validate = () => {
    const newErrors = {};

    if (!rubricName.trim()) {
      newErrors.rubricName = 'Rubric name is required';
    }

    if (criteria.length === 0) {
      newErrors.criteria = 'At least one criterion is required';
    }

    if (levels.length === 0) {
      newErrors.levels = 'At least one performance level is required';
    }

    criteria.forEach((c, index) => {
      if (!c.criterion_name.trim()) {
        newErrors[`criteria_${index}_name`] = 'Criterion name is required';
      }
    });

    levels.forEach((l, index) => {
      if (!l.level_name.trim()) {
        newErrors[`level_${index}_name`] = 'Level name is required';
      }
      if (l.points === null || l.points === undefined || l.points === '') {
        newErrors[`level_${index}_points`] = 'Points are required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const maxScore = Math.max(...levels.map(l => Number(l.points) || 0), 0);

    const rubricData = {
      rubric_name: rubricName,
      rubric_type: rubricType,
      description,
      is_active: isActive,
      max_score: maxScore,
      criteria: criteria.map((c, index) => ({
        ...c,
        order_index: index,
        weight: Number(c.weight) || 1
      })),
      levels: levels.map((l, index) => ({
        ...l,
        order_index: index,
        points: Number(l.points) || 0
      }))
    };

    onSubmit(rubricData);
  };

  const previewData = {
    rubric_name: rubricName,
    rubric_type: rubricType,
    description,
    is_active: isActive,
    criteria,
    levels,
    max_score: Math.max(...levels.map(l => Number(l.points) || 0), 0)
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Basic Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rubric Name *
            </label>
            <input
              type="text"
              value={rubricName}
              onChange={(e) => setRubricName(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.rubricName
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter rubric name"
            />
            {errors.rubricName && (
              <p className="mt-1 text-sm text-red-600">{errors.rubricName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rubric Type *
            </label>
            <select
              value={rubricType}
              onChange={(e) => setRubricType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="analytical">Analytical</option>
              <option value="holistic">Holistic</option>
              <option value="checklist">Checklist</option>
              <option value="single-point">Single Point</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter rubric description"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>
        </div>

        {/* Performance Levels */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Performance Levels
            </h2>
            <button
              type="button"
              onClick={addLevel}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Level
            </button>
          </div>

          {errors.levels && (
            <p className="text-sm text-red-600">{errors.levels}</p>
          )}

          <div className="space-y-4">
            {levels.map((level, index) => (
              <RubricLevelForm
                key={level.id}
                level={level}
                index={index}
                onUpdate={updateLevel}
                onRemove={removeCriteria}
                errors={errors}
              />
            ))}
          </div>

          {levels.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No performance levels added yet</p>
              <button
                type="button"
                onClick={addLevel}
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add First Level
              </button>
            </div>
          )}
        </div>

        {/* Criteria */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Assessment Criteria
            </h2>
            <button
              type="button"
              onClick={addCriteria}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Criteria
            </button>
          </div>

          {errors.criteria && (
            <p className="text-sm text-red-600">{errors.criteria}</p>
          )}

          <div className="space-y-4">
            {criteria.map((criterion, index) => (
              <RubricCriteriaForm
                key={criterion.id}
                criterion={criterion}
                index={index}
                onUpdate={updateCriteria}
                onRemove={removeCriteria}
                errors={errors}
              />
            ))}
          </div>

          {criteria.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No criteria added yet</p>
              <button
                type="button"
                onClick={addCriteria}
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add First Criteria
              </button>
            </div>
          )}
        </div>

        {/* Preview Toggle */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {showPreview ? (
              <>
                <PencilSquareIcon className="h-4 w-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <EyeIcon className="h-4 w-4 mr-2" />
                Show Preview
              </>
            )}
          </button>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Rubric Preview
            </h2>
            <RubricPreview rubric={previewData} />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 border-t pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Rubric' : 'Create Rubric'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RubricBuilder;
