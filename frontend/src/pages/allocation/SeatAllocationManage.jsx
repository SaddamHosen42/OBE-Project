import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, X, Users, Building, DoorOpen, ArrowLeft, MapPin, Layers } from 'lucide-react';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const SeatAllocationManage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentIdFromUrl = searchParams.get('student');
  
  const [students, setStudents] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  
  const [selectedStudent, setSelectedStudent] = useState(studentIdFromUrl || '');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [currentAllocation, setCurrentAllocation] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [roomOccupancy, setRoomOccupancy] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentAllocation();
    }
  }, [selectedStudent]);

  useEffect(() => {
    if (selectedBuilding) {
      fetchFloors();
    }
  }, [selectedBuilding]);

  useEffect(() => {
    if (selectedFloor) {
      fetchRooms();
    }
  }, [selectedFloor]);

  useEffect(() => {
    if (selectedRoom) {
      fetchRoomOccupancy();
    }
  }, [selectedRoom]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [studentsResponse, buildingsResponse, availableRoomsResponse] = await Promise.all([
        api.get('/students', { params: { limit: 1000 } }),
        api.get('/buildings', { params: { limit: 1000 } }),
        api.get('/seat-allocations/available-rooms')
      ]);
      
      setStudents(studentsResponse.data.data || []);
      setBuildings(buildingsResponse.data.data || []);
      setAvailableRooms(availableRoomsResponse.data.data || []);
      
      // If student ID is provided, fetch their allocation
      if (studentIdFromUrl) {
        await fetchStudentAllocation();
      }
      
      setError('');
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAllocation = async () => {
    if (!selectedStudent) return;
    
    try {
      const response = await api.get(`/seat-allocations/student/${selectedStudent}`);
      const allocation = response.data.data;
      
      if (allocation) {
        setCurrentAllocation(allocation);
        setSelectedRoom(allocation.room_id.toString());
        
        // Fetch the building and floor for this room
        const roomResponse = await api.get(`/rooms/${allocation.room_id}`);
        const room = roomResponse.data.data;
        
        const floorResponse = await api.get(`/floors/${room.floor_id}`);
        const floor = floorResponse.data.data;
        
        setSelectedBuilding(floor.building_id.toString());
        setSelectedFloor(room.floor_id.toString());
      } else {
        setCurrentAllocation(null);
        setSelectedRoom('');
        setSelectedBuilding('');
        setSelectedFloor('');
      }
    } catch (err) {
      // Student doesn't have allocation yet
      if (err.response?.status === 404) {
        setCurrentAllocation(null);
      } else {
        console.error('Failed to fetch student allocation:', err);
      }
    }
  };

  const fetchFloors = async () => {
    if (!selectedBuilding) return;
    
    try {
      const response = await api.get(`/buildings/${selectedBuilding}/floors`);
      setFloors(response.data.data || []);
      
      // Auto-select first floor if not already selected
      if (!selectedFloor && response.data.data?.length > 0) {
        setSelectedFloor(response.data.data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to fetch floors:', err);
      setError('Failed to load floors');
    }
  };

  const fetchRooms = async () => {
    if (!selectedFloor) return;
    
    try {
      const response = await api.get(`/floors/${selectedFloor}/rooms`);
      setRooms(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setError('Failed to load rooms');
    }
  };

  const fetchRoomOccupancy = async () => {
    if (!selectedRoom) return;
    
    try {
      const response = await api.get(`/seat-allocations/room/${selectedRoom}/occupancy`);
      setRoomOccupancy(response.data.data);
    } catch (err) {
      console.error('Failed to fetch room occupancy:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedStudent) {
      newErrors.student = 'Please select a student';
    }
    
    if (!selectedRoom) {
      newErrors.room = 'Please select a room';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAllocate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      if (currentAllocation) {
        // Reallocate to new room
        await api.put(`/seat-allocations/reallocate/${selectedStudent}`, {
          new_room_id: selectedRoom
        });
      } else {
        // New allocation
        await api.post('/seat-allocations/allocate', {
          student_id: selectedStudent,
          room_id: selectedRoom
        });
      }
      
      // Show success message and navigate back
      alert(currentAllocation ? 'Seat reallocated successfully!' : 'Seat allocated successfully!');
      navigate('/allocations');
    } catch (err) {
      console.error('Failed to allocate seat:', err);
      setError(err.response?.data?.message || 'Failed to allocate seat');
    } finally {
      setSaving(false);
    }
  };

  const handleDeallocate = async () => {
    if (!currentAllocation) return;
    
    if (!window.confirm('Are you sure you want to deallocate this seat?')) {
      return;
    }

    try {
      setSaving(true);
      await api.delete(`/seat-allocations/student/${selectedStudent}`);
      alert('Seat deallocated successfully!');
      navigate('/allocations');
    } catch (err) {
      console.error('Failed to deallocate seat:', err);
      setError(err.response?.data?.message || 'Failed to deallocate seat');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const selectedStudentData = students.find(s => s.id.toString() === selectedStudent);
  const selectedBuildingData = buildings.find(b => b.id.toString() === selectedBuilding);
  const selectedFloorData = floors.find(f => f.id.toString() === selectedFloor);
  const selectedRoomData = rooms.find(r => r.id.toString() === selectedRoom);

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
              onClick={() => navigate('/allocations')}
            >
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-8 w-8 text-blue-500" />
            {currentAllocation ? 'Reallocate Seat' : 'Allocate Seat'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {currentAllocation ? 'Change student seat allocation' : 'Assign a seat to a student'}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Current Allocation Info */}
      {currentAllocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Current Allocation</h3>
          <div className="text-sm text-blue-800">
            <p><strong>Building:</strong> {currentAllocation.building_name} ({currentAllocation.building_code})</p>
            <p><strong>Floor:</strong> Floor {currentAllocation.floor_number}</p>
            <p><strong>Room:</strong> {currentAllocation.room_number} - {currentAllocation.room_type?.replace('_', ' ')}</p>
          </div>
        </div>
      )}

      {/* Allocation Form */}
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentAllocation ? 'New' : 'Select'} Allocation Details
        </h2>

        <div className="space-y-4">
          {/* Student Selection */}
          <div>
            <Select
              label="Student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              error={errors.student}
              disabled={!!studentIdFromUrl}
              options={[
                { value: '', label: 'Select a student...' },
                ...students.map(s => ({
                  value: s.id.toString(),
                  label: `${s.registration_number} - ${s.name}`
                }))
              ]}
              required
            />
          </div>

          {/* Building Selection */}
          <div>
            <Select
              label="Building"
              icon={Building}
              value={selectedBuilding}
              onChange={(e) => {
                setSelectedBuilding(e.target.value);
                setSelectedFloor('');
                setSelectedRoom('');
                setRoomOccupancy(null);
              }}
              options={[
                { value: '', label: 'Select a building...' },
                ...buildings.map(b => ({
                  value: b.id.toString(),
                  label: `${b.code} - ${b.name}`
                }))
              ]}
            />
          </div>

          {/* Floor Selection */}
          {selectedBuilding && (
            <div>
              <Select
                label="Floor"
                icon={Layers}
                value={selectedFloor}
                onChange={(e) => {
                  setSelectedFloor(e.target.value);
                  setSelectedRoom('');
                  setRoomOccupancy(null);
                }}
                options={[
                  { value: '', label: 'Select a floor...' },
                  ...floors.map(f => ({
                    value: f.id.toString(),
                    label: `Floor ${f.floor_number} - ${f.name}`
                  }))
                ]}
              />
            </div>
          )}

          {/* Room Selection */}
          {selectedFloor && (
            <div>
              <Select
                label="Room"
                icon={DoorOpen}
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                error={errors.room}
                options={[
                  { value: '', label: 'Select a room...' },
                  ...rooms.map(r => ({
                    value: r.id.toString(),
                    label: `Room ${r.room_number} - ${r.room_type?.replace('_', ' ')} (Capacity: ${r.capacity || 'N/A'})`
                  }))
                ]}
                required
              />
            </div>
          )}

          {/* Room Occupancy Info */}
          {roomOccupancy && (
            <div className={`rounded-lg p-4 ${
              roomOccupancy.available_seats > 0 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                roomOccupancy.available_seats > 0 
                  ? 'text-green-900' 
                  : 'text-red-900'
              }`}>
                Room Occupancy
              </h4>
              <div className={`text-sm ${
                roomOccupancy.available_seats > 0 
                  ? 'text-green-800' 
                  : 'text-red-800'
              }`}>
                <p><strong>Current Occupancy:</strong> {roomOccupancy.current_occupancy} / {roomOccupancy.capacity}</p>
                <p><strong>Available Seats:</strong> {roomOccupancy.available_seats}</p>
                <p><strong>Occupancy Rate:</strong> {roomOccupancy.occupancy_rate}%</p>
              </div>
              {roomOccupancy.available_seats === 0 && (
                <p className="text-sm text-red-700 mt-2 font-medium">
                  This room is at full capacity. Please select another room.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Selected Info Summary */}
        {selectedStudentData && selectedRoomData && (
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Allocation Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Student:</p>
                <p className="font-medium">{selectedStudentData.name}</p>
                <p className="text-gray-600">{selectedStudentData.registration_number}</p>
              </div>
              <div>
                <p className="text-gray-500">Location:</p>
                <p className="font-medium">
                  {selectedBuildingData?.name} - Floor {selectedFloorData?.floor_number}
                </p>
                <p className="text-gray-600">
                  Room {selectedRoomData.room_number} ({selectedRoomData.room_type?.replace('_', ' ')})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleAllocate}
            disabled={saving || (roomOccupancy && roomOccupancy.available_seats === 0)}
            className="flex-1"
          >
            {saving ? 'Processing...' : (currentAllocation ? 'Reallocate Seat' : 'Allocate Seat')}
          </Button>
          
          {currentAllocation && (
            <Button
              onClick={handleDeallocate}
              disabled={saving}
              variant="danger"
              className="flex-1"
            >
              {saving ? 'Processing...' : 'Deallocate Seat'}
            </Button>
          )}
          
          <Button
            onClick={() => navigate('/allocations')}
            variant="secondary"
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Available Rooms List */}
      {availableRooms.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRooms.slice(0, 6).map((room) => (
              <div key={room.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      Room {room.room_number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {room.building_name} - Floor {room.floor_number}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {room.room_type?.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {room.available_seats}/{room.capacity}
                    </p>
                    <p className="text-xs text-gray-500">available</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatAllocationManage;
