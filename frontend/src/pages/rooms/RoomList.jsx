import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, DoorOpen, Building2, Layers } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';

const RoomList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const floorId = searchParams.get('floor');
  
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedFloor, setSelectedFloor] = useState(floorId || '');

  useEffect(() => {
    fetchBuildings();
  }, []);

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

  const fetchBuildings = async () => {
    try {
      const response = await api.get('/buildings', {
        params: { limit: 1000 }
      });
      setBuildings(response.data.data || []);
      
      // If we have a floor ID from URL, find its building
      if (floorId) {
        const floorResponse = await api.get(`/floors/${floorId}`);
        const floor = floorResponse.data.data;
        setSelectedBuilding(floor.building_id.toString());
        setSelectedFloor(floorId);
      }
    } catch (err) {
      console.error('Failed to fetch buildings:', err);
      setError('Failed to load buildings');
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
      setLoading(true);
      const response = await api.get(`/floors/${selectedFloor}/rooms`);
      setRooms(response.data.data || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setError(err.response?.data?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleBuildingChange = (e) => {
    const newBuildingId = e.target.value;
    setSelectedBuilding(newBuildingId);
    setSelectedFloor('');
    setRooms([]);
  };

  const handleFloorChange = (e) => {
    const newFloorId = e.target.value;
    setSelectedFloor(newFloorId);
    navigate(`/rooms?floor=${newFloorId}`);
  };

  const filteredRooms = rooms.filter(room => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      room.room_number.toLowerCase().includes(searchLower) ||
      room.room_type?.toLowerCase().includes(searchLower)
    );
  });

  const selectedFloorData = floors.find(f => f.id.toString() === selectedFloor);
  const selectedBuildingData = buildings.find(b => b.id.toString() === selectedBuilding);

  const getRoomTypeColor = (type) => {
    const colors = {
      'lecture_hall': 'bg-blue-100 text-blue-800',
      'lab': 'bg-green-100 text-green-800',
      'office': 'bg-yellow-100 text-yellow-800',
      'library': 'bg-purple-100 text-purple-800',
      'auditorium': 'bg-red-100 text-red-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors['other'];
  };

  const getRoomTypeLabel = (type) => {
    const labels = {
      'lecture_hall': 'Lecture Hall',
      'lab': 'Laboratory',
      'office': 'Office',
      'library': 'Library',
      'auditorium': 'Auditorium',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage rooms in buildings
          </p>
        </div>
        <Button
          onClick={() => navigate(`/rooms/manage?floor=${selectedFloor}`)}
          icon={Plus}
          disabled={!selectedFloor}
        >
          Manage Rooms
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Select
              label="Select Building"
              value={selectedBuilding}
              onChange={handleBuildingChange}
              options={[
                { value: '', label: 'Select a building...' },
                ...buildings.map(b => ({
                  value: b.id.toString(),
                  label: `${b.code} - ${b.name}`
                }))
              ]}
            />
          </div>
          <div>
            <Select
              label="Select Floor"
              value={selectedFloor}
              onChange={handleFloorChange}
              disabled={!selectedBuilding}
              options={[
                { value: '', label: 'Select a floor...' },
                ...floors.map(f => ({
                  value: f.id.toString(),
                  label: `Floor ${f.floor_number} - ${f.name}`
                }))
              ]}
            />
          </div>
          <div>
            <Input
              label="Search Rooms"
              icon={Search}
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {selectedFloorData && selectedBuildingData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Building</p>
                <p className="text-lg font-semibold text-gray-900">{selectedBuildingData.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Floor</p>
                <p className="text-lg font-semibold text-gray-900">{selectedFloorData.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <DoorOpen className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                <p className="text-2xl font-semibold text-gray-900">{rooms.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Rooms List */}
      {!selectedFloor ? (
        <EmptyState
          icon={DoorOpen}
          title="No floor selected"
          description="Select a building and floor to view rooms"
        />
      ) : filteredRooms.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="No rooms found"
          description="Get started by adding rooms to this floor"
          action={{
            label: 'Manage Rooms',
            onClick: () => navigate(`/rooms/manage?floor=${selectedFloor}`)
          }}
        />
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{room.room_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoomTypeColor(room.room_type)}`}>
                      {getRoomTypeLabel(room.room_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{room.capacity || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{room.description || 'N/A'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoomList;
