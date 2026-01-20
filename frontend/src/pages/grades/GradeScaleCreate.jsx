import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Award } from 'lucide-react';
import { useGradeScales } from '../../hooks/useGradeScales';
import GradePointForm from '../../components/grades/GradePointForm';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';

const GradeScaleCreate = () => {
  const navigate = useNavigate();
  const { createGradeScale } = useGradeScales();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: false
  });
  
  const [gradePoints, setGradePoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Grade scale name is required';
    }
    
    if (gradePoints.length === 0) {
      newErrors.gradePoints = 'At least one grade point is required';
    } else {
      // Validate each grade point
      gradePoints.forEach((gp, index) => {
        if (!gp.grade.trim()) {
          newErrors[`gradePoints.${index}.grade`] = 'Grade is required';
        }
        
        if (gp.min_marks === '' || gp.min_marks === null) {
          newErrors[`gradePoints.${index}.min_marks`] = 'Min marks is required';
        } else if (parseFloat(gp.min_marks) < 0 || parseFloat(gp.min_marks) > 100) {
          newErrors[`gradePoints.${index}.min_marks`] = 'Min marks must be between 0 and 100';
        }
        
        if (gp.max_marks === '' || gp.max_marks === null) {
          newErrors[`gradePoints.${index}.max_marks`] = 'Max marks is required';
        } else if (parseFloat(gp.max_marks) < 0 || parseFloat(gp.max_marks) > 100) {
          newErrors[`gradePoints.${index}.max_marks`] = 'Max marks must be between 0 and 100';
        }
        
        if (gp.min_marks !== '' && gp.max_marks !== '' && 
            parseFloat(gp.min_marks) > parseFloat(gp.max_marks)) {
          newErrors[`gradePoints.${index}.min_marks`] = 'Min marks cannot be greater than max marks';
        }
        
        if (gp.grade_point === '' || gp.grade_point === null) {
          newErrors[`gradePoints.${index}.grade_point`] = 'Grade point is required';
        } else if (parseFloat(gp.grade_point) < 0) {
          newErrors[`gradePoints.${index}.grade_point`] = 'Grade point cannot be negative';
        }
      });

      // Check for overlapping ranges
      for (let i = 0; i < gradePoints.length; i++) {
        for (let j = i + 1; j < gradePoints.length; j++) {
          const gp1 = gradePoints[i];
          const gp2 = gradePoints[j];
          
          if (gp1.min_marks !== '' && gp1.max_marks !== '' && 
              gp2.min_marks !== '' && gp2.max_marks !== '') {
            const min1 = parseFloat(gp1.min_marks);
            const max1 = parseFloat(gp1.max_marks);
            const min2 = parseFloat(gp2.min_marks);
            const max2 = parseFloat(gp2.max_marks);
            
            if ((min1 <= max2 && max1 >= min2)) {
              if (!newErrors.gradePoints) {
                newErrors.gradePoints = 'Grade point ranges cannot overlap';
              }
            }
          }
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const dataToSubmit = {
        ...formData,
        grade_points: gradePoints.map(gp => ({
          ...gp,
          min_marks: parseFloat(gp.min_marks),
          max_marks: parseFloat(gp.max_marks),
          grade_point: parseFloat(gp.grade_point)
        }))
      };
      
      await createGradeScale(dataToSubmit);
      navigate('/grades');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create grade scale');
      console.error('Error creating grade scale:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="bg-blue-500 rounded-lg p-2">
          <Award className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Grade Scale</h1>
          <p className="mt-1 text-sm text-gray-500">
            Define a new grading scale with grade points
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Grade Scale Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Standard 4.0 Scale"
              error={errors.name}
              required
            />

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe this grading scale..."
              rows={3}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Set as active grade scale (will deactivate other scales)
              </label>
            </div>
          </div>
        </div>

        {/* Grade Points */}
        <div className="bg-white rounded-lg shadow p-6">
          <GradePointForm
            gradePoints={gradePoints}
            setGradePoints={setGradePoints}
            errors={errors}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 bg-white rounded-lg shadow p-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/grades')}
            icon={X}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            icon={Save}
          >
            {loading ? 'Creating...' : 'Create Grade Scale'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GradeScaleCreate;
