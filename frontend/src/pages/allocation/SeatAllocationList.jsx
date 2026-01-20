import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Building, DoorOpen, Trash2, Edit, MapPin } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';

const SeatAllocationList = () => {
  const navigate = useNavigate();
  
  const [allocations, setAllocations] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statistics, setStatistics] = useState([]);

  useEffect(() => {
    fetchBuildings();
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchAllocations();
  }, [currentPage, searchTerm, selectedBuilding]);

  const fetchBuildings = async () => {
    try {
      const response = await api.get('/buildings', {
        params: { limit: 1000 }
      });
      setBuildings(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch buildings:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/seat-allocations/statistics/buildings');
      setStatistics(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await api.get('/seat-allocations', { params });
      let allocationData = response.data.data || [];
      
      // Filter by building if selected
      if (selectedBuilding) {
        allocationData = allocationData.filter(
          allocation => allocation.building_code === selectedBuilding
        );
      }
      
      setAllocations(allocationData);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalItems(response.data.pagination?.totalItems || 0);
      setError('');
    } catch (err) {
      console.error('Failed to fetch allocations:', err);
      setError(err.response?.data?.message || 'Failed to load seat allocations');
    } finally {
      setLoading(false);
    }
  };

  const handleDeallocate = async (allocationId) => {
    if (!window.confirm('Are you sure you want to deallocate this seat?')) {
      return;
    }

    try {
      await api.delete(`/seat-allocations/${allocationId}`);
      fetchAllocations();
      fetchStatistics();
    } catch (err) {
      console.error('Failed to deallocate seat:', err);
      alert(err.response?.data?.message || 'Failed to deallocate seat');
    }
  };

  const filteredAllocations = allocations.filter(allocation => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      allocation.registration_number?.toLowerCase().includes(searchLower) ||
      allocation.student_name?.toLowerCase().includes(searchLower) ||
      allocation.room_number?.toLowerCase().includes(searchLower) ||
      allocation.building_name?.toLowerCase().includes(searchLower)
    );
  });

  if (loading && allocations.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Seat Allocations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage student seat allocations across buildings and rooms
          </p>
        </div>
        <Button
          onClick={() => navigate('/allocations/manage')}
          icon={Plus}
        >
          Manage Allocations
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statistics.slice(0, 3).map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{stat.building_name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.allocated_seats}/{stat.total_capacity}
                    </p>
                    <span className="text-sm text-gray-500">
                      {Math.round((stat.allocated_seats / stat.total_capacity) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Search"
              icon={Search}
              placeholder="Search by student, room, or building..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Select
              label="Filter by Building"
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              options={[
                { value: '', label: 'All Buildings' },
                ...buildings.map(b => ({
                  value: b.code,
                  label: `${b.code} - ${b.name}`
                }))
              ]}
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Allocations Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredAllocations.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Seat Allocations"
            description="No seat allocations found. Click 'Manage Allocations' to allocate seats."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Building
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Floor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allocated On
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAllocations.map((allocation) => (
                    <tr key={allocation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {allocation.student_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {allocation.student_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{allocation.registration_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{allocation.building_name}</div>
                        <div className="text-sm text-gray-500">{allocation.building_code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Floor {allocation.floor_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DoorOpen className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Room {allocation.room_number}
                            </div>
                            <div className="text-sm text-gray-500">
                              {allocation.room_type?.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(allocation.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/allocations/manage?student=${allocation.student_id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit Allocation"
                        >
                          <Edit className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeallocate(allocation.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Deallocate"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="secondary"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="secondary"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                      {' '}({totalItems} total allocations)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, idx) => (
                        <button
                          key={idx + 1}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === idx + 1
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SeatAllocationList;
