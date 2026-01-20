import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, X, ClipboardList } from 'lucide-react';
import { useAssessments } from '../../hooks/useAssessments';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import AssessmentTypeSelector from '../../components/assessment/AssessmentTypeSelector';
import api from '../../services/api';

const AssessmentCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseOfferingId = searchParams.get('courseOffering');
  
  const { createAssessment } = useAssessments();
  
  const [formData, setFormData] = useState({
    course_offering_id: courseOfferingId || '',
    assessment_type_id: '',
    assessment_name: '',
    total_marks: '',
    weightage: '',
    description: '',
    scheduled_date: ''
  });

  const [courseOfferings, setCourseOfferings] = useState([]);
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCourseOfferings();
    fetchAssessmentTypes();
  }, []);

  const fetchCourseOfferings = async () => {
    try {
      const response = await api.get('/course-offerings');
      setCourseOfferings(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch course offerings:', err);
    }
  };

  const fetchAssessmentTypes = async () => {
    try {
      const response = await api.get('/assessments/types');
      setAssessmentTypes(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch assessment types:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.course_offering_id) {
      newErrors.course_offering_id = 'Course offering is required';
    }
    if (!formData.assessment_type_id) {
      newErrors.assessment_type_id = 'Assessment type is required';
    }
    if (!formData.assessment_name.trim()) {
      newErrors.assessment_name = 'Assessment name is required';
    }
    if (!formData.total_marks || formData.total_marks <= 0) {
      newErrors.total_marks = 'Total marks must be greater than 0';
    }
    if (!formData.weightage || formData.weightage < 0 || formData.weightage > 100) {
      newErrors.weightage = 'Weightage must be between 0 and 100';
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
      await createAssessment(formData);
      navigate(courseOfferingId ? `/assessments?courseOffering=${courseOfferingId}` : '/assessments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assessment');
      console.error('Failed to create assessment:', err);
    } finally {
      setLoading(false);
    }
  };

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
        [name]: ''
      }));
    }
  };

  const handleAssessmentTypeChange = (typeId) => {
    setFormData(prev => ({
      ...prev,
      assessment_type_id: typeId
    }));
    if (errors.assessment_type_id) {
      setErrors(prev => ({
        ...prev,
        assessment_type_id: ''
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Assessment</h1>
            <p className="mt-1 text-sm text-gray-500">
              Define a new assessment component
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Course Offering */}
          <Select
            label="Course Offering"
            name="course_offering_id"
            value={formData.course_offering_id}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select course offering' },
              ...courseOfferings.map(co => ({
                value: co.course_offering_id,
                label: `${co.course_code} - ${co.course_name} (${co.semester_name}, ${co.academic_year})`
              }))
            ]}
            error={errors.course_offering_id}
            required
          />

          {/* Assessment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment Type <span className="text-red-500">*</span>
            </label>
            <AssessmentTypeSelector
              types={assessmentTypes}
              selectedTypeId={formData.assessment_type_id}
              onSelect={handleAssessmentTypeChange}
              error={errors.assessment_type_id}
            />
            {errors.assessment_type_id && (
              <p className="mt-1 text-sm text-red-600">{errors.assessment_type_id}</p>
            )}
          </div>

          {/* Assessment Name */}
          <Input
            label="Assessment Name"
            name="assessment_name"
            value={formData.assessment_name}
            onChange={handleChange}
            placeholder="e.g., Midterm Exam, Quiz 1, Assignment 2"
            error={errors.assessment_name}
            required
          />

          {/* Marks and Weightage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Total Marks"
              name="total_marks"
              type="number"
              value={formData.total_marks}
              onChange={handleChange}
              placeholder="100"
              error={errors.total_marks}
              required
              min="0"
              step="0.01"
            />

            <Input
              label="Weightage (%)"
              name="weightage"
              type="number"
              value={formData.weightage}
              onChange={handleChange}
              placeholder="30"
              error={errors.weightage}
              required
              min="0"
              max="100"
              step="0.01"
            />
          </div>

          {/* Scheduled Date */}
          <Input
            label="Scheduled Date"
            name="scheduled_date"
            type="date"
            value={formData.scheduled_date}
            onChange={handleChange}
            error={errors.scheduled_date}
          />

          {/* Description */}
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter assessment description or instructions..."
            rows={4}
            error={errors.description}
          />
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            icon={X}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            icon={Save}
          >
            Create Assessment
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentCreate;
