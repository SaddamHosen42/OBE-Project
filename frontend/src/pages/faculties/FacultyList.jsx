import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiBook, FiMapPin } from 'react-icons/fi';
import DataTable from '../../components/data/DataTable';
import SearchBar from '../../components/data/SearchBar';
import ExportButton from '../../components/data/ExportButton';
import facultyService from '../../services/facultyService';

const FacultyList = () => {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);

  // Fetch faculties
  const fetchFaculties = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      
      const response = await facultyService.getAllFaculties(params);
      
      if (response.success) {
        setFaculties(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      }
    } catch (err) {
      console.error('Error fetching faculties:', err);
      setError(err.message || 'Failed to load faculties');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, [currentPage, itemsPerPage, searchQuery]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle delete
  const handleDeleteClick = (faculty) => {
    setFacultyToDelete(faculty);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!facultyToDelete) return;
    
    try {
      const response = await facultyService.deleteFaculty(facultyToDelete.id);
      
      if (response.success) {
        // Refresh the list
        fetchFaculties();
        setShowDeleteModal(false);
        setFacultyToDelete(null);
        
        // Show success message
        alert('Faculty deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting faculty:', err);
      alert(err.message || 'Failed to delete faculty');
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
      label: 'Faculty Name',
      sortable: true,
      render: (faculty) => (
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <FiBook className="text-white" size={20} />
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{faculty.name}</div>
            <div className="text-sm text-gray-500">{faculty.code}</div>
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
      key: 'established_date',
      label: 'Established',
      sortable: true,
      render: (faculty) => faculty.established_date ? (
        <span className="text-gray-700">
          {new Date(faculty.established_date).toLocaleDateString()}
        </span>
      ) : (
        <span className="text-gray-400">N/A</span>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (faculty) => faculty.location ? (
        <div className="flex items-center space-x-2 text-gray-700">
          <FiMapPin size={16} />
          <span>{faculty.location}</span>
        </div>
      ) : (
        <span className="text-gray-400">N/A</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (faculty) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/faculties/${faculty.id}`)}
            className="btn btn-sm btn-ghost text-blue-600"
            title="View Details"
          >
            <FiEye size={18} />
          </button>
          <button
            onClick={() => navigate(`/faculties/${faculty.id}/edit`)}
            className="btn btn-sm btn-ghost text-green-600"
            title="Edit Faculty"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => handleDeleteClick(faculty)}
            className="btn btn-sm btn-ghost text-red-600"
            title="Delete Faculty"
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
            <FiBook className="mr-3 text-purple-600" size={36} />
            Faculty Management
          </h1>
          <p className="text-gray-600 mt-2">Manage all faculties in the institution</p>
        </div>
        <Link to="/faculties/create" className="btn btn-primary">
          <FiPlus size={20} />
          Add New Faculty
        </Link>
      </div>

      {/* Search and Export */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search by faculty name or code..."
            />
          </div>
          <div className="flex items-center space-x-4">
            <ExportButton
              data={faculties}
              filename="faculties"
              headers={['ID', 'Name', 'Code', 'Established Date', 'Location']}
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

      {/* Faculties Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          columns={columns}
          data={faculties}
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
              Are you sure you want to delete faculty <strong>{facultyToDelete?.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setFacultyToDelete(null);
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

export default FacultyList;
