import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Award, ArrowLeft, Save } from 'lucide-react';
import { usePEO } from '../../hooks/usePEOs';
import { useDegrees } from '../../hooks/useDegrees';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PEOEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { peo, loading: peoLoading, updatePEO } = usePEO(id);
  const { degrees } = useDegrees();
  
  const [formData, setFormData] = useState({
    peo_code: '',
    description: '',
    degree_id: '',
    status: 'active',
    sequence_number: 1
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (peo) {
      setFormData({
        peo_code: peo.peo_code || '',
        description: peo.description || '',
        degree_id: peo.degree_id || '',
        status: peo.status || 'active',
        sequence_number: peo.sequence_number || 1
      });
    }
  }, [peo]);

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'archived', label: 'Archived' }
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

  const validate = () => {
    const newErrors = {};
    
    if (!formData.peo_code.trim()) {
      newErrors.peo_code = 'PEO code is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.degree_id) {
      newErrors.degree_id = 'Degree is required';
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
      await updatePEO(id, {
        ...formData,
        sequence_number: parseInt(formData.sequence_number)
      });
      navigate(`/peos/${id}`);
    } catch (error) {
      console.error('Error updating PEO:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to update PEO'
      });
    } finally {
      setLoading(false);
    }
  };

  if (peoLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          icon={ArrowLeft}
        >
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Program Educational Objective</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update PEO information
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Award className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">PEO Information</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="PEO Code"
              name="peo_code"
              value={formData.peo_code}
              onChange={handleChange}
              placeholder="e.g., PEO-1"
              required
              error={errors.peo_code}
            />

            <Select
              label="Degree Program"
              name="degree_id"
              value={formData.degree_id}
              onChange={handleChange}
              required
              error={errors.degree_id}
              options={[
                { value: '', label: 'Select Degree' },
                ...(degrees?.map(degree => ({
                  value: degree.degree_id,
                  label: `${degree.degree_code} - ${degree.degree_name}`
                })) || [])
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe the educational objective..."
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
            />

            <Input
              label="Sequence Number"
              type="number"
              name="sequence_number"
              value={formData.sequence_number}
              onChange={handleChange}
              min="1"
              placeholder="e.g., 1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              icon={Save}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update PEO'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PEOEdit;
