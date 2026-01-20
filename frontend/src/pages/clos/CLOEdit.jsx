import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, BookOpen, Trash2 } from 'lucide-react';
import { useCLO } from '../../hooks/useCLO';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import CLOBloomSelector from '../../components/clo/CLOBloomSelector';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const CLOEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { clo, loading: cloLoading, error: cloError, updateCLO, deleteCLO } = useCLO(id);
  
  const [formData, setFormData] = useState({
    course_offering_id: '',
    clo_code: '',
    description: '',
    bloom_level_id: '',
    plo_mappings: []
  });

  const [courseOfferings, setCourseOfferings] = useState([]);
  const [plos, setPlos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (clo) {
      setFormData({
        course_offering_id: clo.course_offering_id || '',
        clo_code: clo.clo_code || '',
        description: clo.description || '',
        bloom_level_id: clo.bloom_level_id || '',
        plo_mappings: clo.plo_mappings?.map(mapping => mapping.plo_id) || []
      });
    }
  }, [clo]);

  useEffect(() => {
    fetchCourseOfferings();
    fetchPLOs();
  }, []);

  const fetchCourseOfferings = async () => {
    try {
      const response = await api.get('/course-offerings');
      setCourseOfferings(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch course offerings:', err);
    }
  };

  const fetchPLOs = async () => {
    try {
      const response = await api.get('/plos');
      setPlos(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch PLOs:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.course_offering_id) {
      newErrors.course_offering_id = 'Course offering is required';
    }
    if (!formData.clo_code.trim()) {
      newErrors.clo_code = 'CLO code is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.bloom_level_id) {
      newErrors.bloom_level_id = 'Bloom taxonomy level is required';
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
      await updateCLO(formData);
      navigate(`/clos/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update CLO');
      console.error('Failed to update CLO:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this CLO? This action cannot be undone.')) {
      try {
        await deleteCLO();
        navigate('/clos');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete CLO');
        console.error('Failed to delete CLO:', err);
      }
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

  const handleBloomLevelChange = (bloomLevelId) => {
    setFormData(prev => ({
      ...prev,
      bloom_level_id: bloomLevelId
    }));
    if (errors.bloom_level_id) {
      setErrors(prev => ({
        ...prev,
        bloom_level_id: ''
      }));
    }
  };

  const handlePLOMappingToggle = (ploId) => {
    setFormData(prev => ({
      ...prev,
      plo_mappings: prev.plo_mappings.includes(ploId)
        ? prev.plo_mappings.filter(id => id !== ploId)
        : [...prev.plo_mappings, ploId]
    }));
  };

  if (cloLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (cloError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading CLO: {cloError}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Course Learning Outcome</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update the learning outcome details
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleDelete}
          icon={Trash2}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Course Offering Selection */}
          <Select
            label="Course Offering"
            name="course_offering_id"
            value={formData.course_offering_id}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select a course offering' },
              ...courseOfferings.map(co => ({
                value: co.course_offering_id,
                label: `${co.course_code} - ${co.course_name} (${co.semester_name})`
              }))
            ]}
            error={errors.course_offering_id}
            required
          />

          {/* CLO Code */}
          <Input
            label="CLO Code"
            name="clo_code"
            value={formData.clo_code}
            onChange={handleChange}
            placeholder="e.g., CLO1, CLO2"
            error={errors.clo_code}
            required
            helperText="Unique identifier for this CLO (e.g., CLO1, CLO2)"
          />

          {/* Description */}
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter the learning outcome description"
            rows={4}
            error={errors.description}
            required
            helperText="Clear and measurable statement of what students should achieve"
          />

          {/* Bloom Taxonomy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bloom Taxonomy Level <span className="text-red-500">*</span>
            </label>
            <CLOBloomSelector
              selectedLevel={formData.bloom_level_id}
              onLevelChange={handleBloomLevelChange}
              error={errors.bloom_level_id}
            />
            {errors.bloom_level_id && (
              <p className="mt-1 text-sm text-red-600">{errors.bloom_level_id}</p>
            )}
          </div>

          {/* PLO Mappings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Map to Program Learning Outcomes (Optional)
            </label>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
              {plos.length > 0 ? (
                plos.map(plo => (
                  <label
                    key={plo.plo_id}
                    className="flex items-start space-x-3 p-3 bg-white rounded border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.plo_mappings.includes(plo.plo_id)}
                      onChange={() => handlePLOMappingToggle(plo.plo_id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{plo.plo_code}</div>
                      <div className="text-sm text-gray-600">{plo.description}</div>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No PLOs available. Create PLOs first to map them to CLOs.
                </p>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Select the PLOs that this CLO contributes to
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/clos/${id}`)}
            icon={X}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            icon={Save}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CLOEdit;
