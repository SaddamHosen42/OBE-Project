import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, X, DoorOpen, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const RoomManage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const floorId = searchParams.get('floor');
  
  const [floor, setFloor] = useState(null);
  const [building, setBuilding] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({
    room_number: '',
    room_type: 'lecture_hall',
    capacity: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const roomTypes = [
    { value: 'lecture_hall', label: 'Lecture Hall' },
    { value: 'lab', label: 'Laboratory' },
    { value: 'office', label: 'Office' },
    { value: 'library', label: 'Library' },
    { value: 'auditorium', label: 'Auditorium' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (floorId) {
      fetchFloorAndRooms();
    } else {
      setError('No floor selected');
      setLoading(false);
    }
  }, [floorId]);

  const fetchFloorAndRooms = async () => {
    try {
      setLoading(true);
      
      // Fetch floor details
      const floorResponse = await api.get(`/floors/${floorId}`);
      setFloor(floorResponse.data.data);
      
      // Fetch building details
      const buildingResponse = await api.get(`/buildings/${floorResponse.data.data.building_id}`);
      setBuilding(buildingResponse.data.data);
      
      // Fetch rooms
      const roomsResponse = await api.get(`/floors/${floorId}/rooms`);
      setRooms(roomsResponse.data.data || []);
      
      setError('');
    } catch (err) {
      console.error('Failed to fetch floor:', err);
      setError(err.response?.data?.message || 'Failed to load floor');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async () => {
    if (!newRoom.room_number.trim() || !newRoom.room_type) {
      setErrors({
        room_number: !newRoom.room_number.trim() ? 'Room number is required' : '',
        room_type: !newRoom.room_type ? 'Room type is required' : ''
      });
      return;
    }

    try {
      setSaving(true);
      await api.post('/rooms', {
        ...newRoom,
        floor_id: floorId,
        capacity: newRoom.capacity ? parseInt(newRoom.capacity) : null
      });
      
      // Reset form
      setNewRoom({
        room_number: '',
        room_type: 'lecture_hall',
        capacity: '',
        description: ''
      });
      setErrors({});
      
      // Refresh rooms
      await fetchFloorAndRooms();
    } catch (err) {
      console.error('Failed to add room:', err);
      setError(err.response?.data?.message || 'Failed to add room');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      await api.delete(`/rooms/${roomId}`);
      await fetchFloorAndRooms();
    } catch (err) {
      console.error('Failed to delete room:', err);
      alert(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoom(prev => ({
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

  const getRoomTypeLabel = (type) => {
    const roomType = roomTypes.find(rt => rt.value === type);
    return roomType ? roomType.label : type;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!floor || !building) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Floor not found'}
        </div>
        <Button onClick={() => navigate('/rooms')}>
          Back to Rooms
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
              onClick={() => navigate('/rooms')}
            >
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <DoorOpen className="h-8 w-8 text-blue-500" />
            Manage Rooms
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Building: {building.code} - {building.name} | Floor: {floor.name}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Add New Room */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-500" />
          Add New Room
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Room Number"
              name="room_number"
              value={newRoom.room_number}
              onChange={handleInputChange}
              error={errors.room_number}
              placeholder="e.g., 101"
              required
            />
          </div>

          <div>
            <Select
              label="Room Type"
              name="room_type"
              value={newRoom.room_type}
              onChange={handleInputChange}
              error={errors.room_type}
              options={roomTypes}
              required
            />
          </div>

          <div>
            <Input
              label="Capacity"
              name="capacity"
              type="number"
              value={newRoom.capacity}
              onChange={handleInputChange}
              placeholder="e.g., 50"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleAddRoom}
              icon={Plus}
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Adding...' : 'Add Room'}
            </Button>
          </div>
        </div>

        <div>
          <Textarea
            label="Description"
            name="description"
            value={newRoom.description}
            onChange={handleInputChange}
            rows={2}
            placeholder="Room description (optional)"
          />
        </div>
      </div>

      {/* Existing Rooms */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Existing Rooms ({rooms.length})
        </h2>

        {rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <DoorOpen className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p>No rooms added yet</p>
            <p className="text-sm">Add your first room using the form above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms
              .sort((a, b) => {
                // Try to sort numerically if possible
                const aNum = parseInt(a.room_number);
                const bNum = parseInt(b.room_number);
                if (!isNaN(aNum) && !isNaN(bNum)) {
                  return aNum - bNum;
                }
                return a.room_number.localeCompare(b.room_number);
              })
              .map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center min-w-[3rem] px-3 h-10 bg-blue-500 text-white rounded-lg font-bold">
                        {room.room_number}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{getRoomTypeLabel(room.room_type)}</p>
                          {room.capacity && (
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              Capacity: {room.capacity}
                            </span>
                          )}
                        </div>
                        {room.description && (
                          <p className="text-sm text-gray-500">{room.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteRoom(room.id)}
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
          onClick={() => navigate('/rooms')}
        >
          Done
        </Button>
      </div>
    </div>
  );
};

export default RoomManage;
