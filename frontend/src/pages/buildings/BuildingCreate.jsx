import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Building2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import api from '../../services/api';

const BuildingCreate = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Building name is required';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Building code is required';
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
      await api.post('/buildings', formData);
      navigate('/buildings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create building');
      console.error('Error creating building:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-500" />
            Create New Building
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new building to the system
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/buildings')}
          icon={X}
        >
          Cancel
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Building Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                required
                placeholder="e.g., Main Academic Block"
              />
            </div>

            <div>
              <Input
                label="Building Code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                error={errors.code}
                required
                placeholder="e.g., MAB"
              />
            </div>
          </div>

          <div>
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              error={errors.address}
              placeholder="Building address (optional)"
            />
          </div>

          <div>
            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              error={errors.description}
              rows={4}
              placeholder="Enter building description (optional)"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/buildings')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            icon={Save}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Building'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BuildingCreate;
