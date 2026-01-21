import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiAward, FiMapPin } from 'react-icons/fi';
import DataTable from '../../components/data/DataTable';
import SearchBar from '../../components/data/SearchBar';
import ExportButton from '../../components/data/ExportButton';
import degreeService from '../../services/degreeService';

const DegreeList = () => {
  const navigate = useNavigate();
  const [degrees, setDegrees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [degreeToDelete, setDegreeToDelete] = useState(null);

  // Fetch degrees
  const fetchDegrees = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      
      const response = await degreeService.getAllDegrees(params);
      
      if (response.success) {
        setDegrees(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      }
    } catch (err) {
      console.error('Error fetching degrees:', err);
      setError(err.message || 'Failed to load degrees');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    fetchDegrees();
  }, [currentPage, itemsPerPage, searchQuery, fetchDegrees]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle delete
  const handleDeleteClick = (degree) => {
    setDegreeToDelete(degree);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!degreeToDelete) return;
    
    try {
      const response = await degreeService.deleteDegree(degreeToDelete.id);
      
      if (response.success) {
        // Refresh the list
        fetchDegrees();
        setShowDeleteModal(false);
        setDegreeToDelete(null);
        
        // Show success message
        alert('Degree deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting degree:', err);
      alert(err.message || 'Failed to delete degree');
    }
  };

  // Table columns
  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Degree Name',
      sortable: true,
      render: (degree) => (
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <FiAward className="text-white" size={20} />
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{degree.name}</div>
            <div className="text-sm text-gray-500">{degree.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Code',
      sortable: true,
    },
    {
      key: 'level',
      label: 'Level',
      sortable: true,
      render: (degree) => (
        <span className="badge badge-primary">
          {degree.level}
        </span>
      ),
    },
    {
      key: 'duration_years',
      label: 'Duration',
      render: (degree) => (
        <span className="text-gray-700">
          {degree.duration_years} {degree.duration_years === 1 ? 'Year' : 'Years'}
        </span>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (degree) => degree.department_name ? (
        <span className="text-gray-700">{degree.department_name}</span>
      ) : (
        <span className="text-gray-400">N/A</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (degree) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/degrees/${degree.id}`)}
            className="btn btn-sm btn-ghost text-blue-600"
            title="View Details"
          >
            <FiEye size={18} />
          </button>
          <button
            onClick={() => navigate(`/degrees/${degree.id}/edit`)}
            className="btn btn-sm btn-ghost text-green-600"
            title="Edit Degree"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => handleDeleteClick(degree)}
            className="btn btn-sm btn-ghost text-red-600"
            title="Delete Degree"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FiAward className="mr-3 text-blue-600" size={36} />
            Degree Management
          </h1>
          <p className="text-gray-600 mt-2">Manage all degree programs in the institution</p>
        </div>
        <Link to="/degrees/create" className="btn btn-primary">
          <FiPlus size={20} />
          Add New Degree
        </Link>
      </div>

      {/* Search and Export */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search by degree name or code..."
            />
          </div>
          <div className="flex items-center space-x-4">
            <ExportButton
              data={degrees}
              filename="degrees"
              headers={['ID', 'Name', 'Code', 'Level', 'Duration', 'Department']}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Degrees Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          columns={columns}
          data={degrees}
          isLoading={isLoading}
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage,
            onPageChange: setCurrentPage,
            onItemsPerPageChange: setItemsPerPage,
          }}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Delete</h3>
            <p className="py-4">
              Are you sure you want to delete degree <strong>{degreeToDelete?.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDegreeToDelete(null);
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DegreeList;
