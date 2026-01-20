import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Building2, Layers, Plus } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const BuildingEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    description: ''
  });
  
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchBuilding();
  }, [id]);

  const fetchBuilding = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/buildings/${id}`);
      const building = response.data.data;
      
      setFormData({
        name: building.name || '',
        code: building.code || '',
        address: building.address || '',
        description: building.description || ''
      });
      
      setFloors(building.floors || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch building:', err);
      setError(err.response?.data?.message || 'Failed to load building');
    } finally {
      setLoading(false);
    }
  };

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
    
    setSaving(true);
    setError('');
    
    try {
      await api.put(`/buildings/${id}`, formData);
      navigate('/buildings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update building');
      console.error('Error updating building:', err);
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-500" />
            Edit Building
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Update building information
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

        {/* Floors Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-500" />
              Floors ({floors.length})
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => navigate(`/floors/manage?building=${id}`)}
            >
              Manage Floors
            </Button>
          </div>

          {floors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Layers className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>No floors added yet</p>
              <p className="text-sm">Click "Manage Floors" to add floors to this building</p>
            </div>
          ) : (
            <div className="space-y-2">
              {floors.map((floor) => (
                <div
                  key={floor.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{floor.name}</p>
                    <p className="text-sm text-gray-500">
                      Floor Number: {floor.floor_number}
                      {floor.room_count > 0 && ` • ${floor.room_count} rooms`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BuildingEdit;
