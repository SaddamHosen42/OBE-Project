import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Layers, Building2, DoorOpen } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';

const FloorList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const buildingId = searchParams.get('building');
  
  const [floors, setFloors] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState(buildingId || '');

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      fetchFloors();
    }
  }, [selectedBuilding]);

  const fetchBuildings = async () => {
    try {
      const response = await api.get('/buildings', {
        params: { limit: 1000 }
      });
      setBuildings(response.data.data || []);
      if (buildingId) {
        setSelectedBuilding(buildingId);
      } else if (response.data.data?.length > 0) {
        setSelectedBuilding(response.data.data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to fetch buildings:', err);
      setError('Failed to load buildings');
    }
  };

  const fetchFloors = async () => {
    if (!selectedBuilding) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/buildings/${selectedBuilding}/floors`);
      setFloors(response.data.data || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch floors:', err);
      setError(err.response?.data?.message || 'Failed to load floors');
    } finally {
      setLoading(false);
    }
  };

  const handleBuildingChange = (e) => {
    const newBuildingId = e.target.value;
    setSelectedBuilding(newBuildingId);
    navigate(`/floors?building=${newBuildingId}`);
  };

  const filteredFloors = floors.filter(floor => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      floor.name.toLowerCase().includes(searchLower) ||
      floor.floor_number?.toString().includes(searchLower)
    );
  });

  const selectedBuildingData = buildings.find(b => b.id.toString() === selectedBuilding);

  if (loading && floors.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Floors</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage floors in buildings
          </p>
        </div>
        <Button
          onClick={() => navigate(`/floors/manage?building=${selectedBuilding}`)}
          icon={Plus}
          disabled={!selectedBuilding}
        >
          Manage Floors
        </Button>
      </div>

      {/* Building Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
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
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search floors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {selectedBuildingData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Current Building</p>
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
                <p className="text-sm font-medium text-gray-500">Total Floors</p>
                <p className="text-2xl font-semibold text-gray-900">{floors.length}</p>
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
                <p className="text-2xl font-semibold text-gray-900">
                  {floors.reduce((sum, f) => sum + (parseInt(f.room_count) || 0), 0)}
                </p>
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

      {/* Floors List */}
      {!selectedBuilding ? (
        <EmptyState
          icon={Layers}
          title="No building selected"
          description="Select a building to view its floors"
        />
      ) : filteredFloors.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No floors found"
          description="Get started by adding floors to this building"
          action={{
            label: 'Manage Floors',
            onClick: () => navigate(`/floors/manage?building=${selectedBuilding}`)
          }}
        />
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Floor Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Floor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rooms
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFloors.map((floor) => (
                <tr key={floor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{floor.floor_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{floor.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{floor.description || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {floor.room_count || 0} rooms
                    </span>
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

export default FloorList;
