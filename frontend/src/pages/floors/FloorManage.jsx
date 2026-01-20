import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, X, Layers, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const FloorManage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const buildingId = searchParams.get('building');
  
  const [building, setBuilding] = useState(null);
  const [floors, setFloors] = useState([]);
  const [newFloor, setNewFloor] = useState({
    floor_number: '',
    name: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (buildingId) {
      fetchBuildingAndFloors();
    } else {
      setError('No building selected');
      setLoading(false);
    }
  }, [buildingId]);

  const fetchBuildingAndFloors = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/buildings/${buildingId}`);
      setBuilding(response.data.data);
      setFloors(response.data.data.floors || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch building:', err);
      setError(err.response?.data?.message || 'Failed to load building');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFloor = async () => {
    if (!newFloor.floor_number || !newFloor.name.trim()) {
      setErrors({
        floor_number: !newFloor.floor_number ? 'Floor number is required' : '',
        name: !newFloor.name.trim() ? 'Floor name is required' : ''
      });
      return;
    }

    try {
      setSaving(true);
      await api.post('/floors', {
        ...newFloor,
        building_id: buildingId
      });
      
      // Reset form
      setNewFloor({
        floor_number: '',
        name: '',
        description: ''
      });
      setErrors({});
      
      // Refresh floors
      await fetchBuildingAndFloors();
    } catch (err) {
      console.error('Failed to add floor:', err);
      setError(err.response?.data?.message || 'Failed to add floor');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFloor = async (floorId) => {
    if (!window.confirm('Are you sure you want to delete this floor? This will also delete all associated rooms.')) {
      return;
    }

    try {
      await api.delete(`/floors/${floorId}`);
      await fetchBuildingAndFloors();
    } catch (err) {
      console.error('Failed to delete floor:', err);
      alert(err.response?.data?.message || 'Failed to delete floor');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFloor(prev => ({
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

  if (!building) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Building not found'}
        </div>
        <Button onClick={() => navigate('/buildings')}>
          Back to Buildings
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate('/buildings')}
            >
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="h-8 w-8 text-blue-500" />
            Manage Floors
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Building: {building.code} - {building.name}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Add New Floor */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-500" />
          Add New Floor
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              label="Floor Number"
              name="floor_number"
              type="number"
              value={newFloor.floor_number}
              onChange={handleInputChange}
              error={errors.floor_number}
              placeholder="e.g., 1"
              required
            />
          </div>

          <div>
            <Input
              label="Floor Name"
              name="name"
              value={newFloor.name}
              onChange={handleInputChange}
              error={errors.name}
              placeholder="e.g., Ground Floor"
              required
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleAddFloor}
              icon={Plus}
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Adding...' : 'Add Floor'}
            </Button>
          </div>
        </div>

        <div>
          <Textarea
            label="Description"
            name="description"
            value={newFloor.description}
            onChange={handleInputChange}
            rows={2}
            placeholder="Floor description (optional)"
          />
        </div>
      </div>

      {/* Existing Floors */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Existing Floors ({floors.length})
        </h2>

        {floors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Layers className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p>No floors added yet</p>
            <p className="text-sm">Add your first floor using the form above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {floors
              .sort((a, b) => a.floor_number - b.floor_number)
              .map((floor) => (
                <div
                  key={floor.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full font-bold">
                        {floor.floor_number}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{floor.name}</p>
                        {floor.description && (
                          <p className="text-sm text-gray-500">{floor.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {floor.room_count || 0} room(s)
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/rooms?floor=${floor.id}`)}
                    >
                      Manage Rooms
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteFloor(floor.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('/buildings')}
        >
          Done
        </Button>
      </div>
    </div>
  );
};

export default FloorManage;
