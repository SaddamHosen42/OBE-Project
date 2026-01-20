import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiLayers, FiMapPin } from 'react-icons/fi';
import DataTable from '../../components/data/DataTable';
import SearchBar from '../../components/data/SearchBar';
import ExportButton from '../../components/data/ExportButton';
import departmentService from '../../services/departmentService';

const DepartmentList = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  // Fetch departments
  const fetchDepartments = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      
      const response = await departmentService.getAllDepartments(params);
      
      if (response.success) {
        setDepartments(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(err.message || 'Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [currentPage, itemsPerPage, searchQuery]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle delete
  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;
    
    try {
      const response = await departmentService.deleteDepartment(departmentToDelete.id);
      
      if (response.success) {
        // Refresh the list
        fetchDepartments();
        setShowDeleteModal(false);
        setDepartmentToDelete(null);
        
        // Show success message
        alert('Department deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting department:', err);
      alert(err.message || 'Failed to delete department');
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
      label: 'Department Name',
      sortable: true,
      render: (department) => (
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <FiLayers className="text-white" size={20} />
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{department.name}</div>
            <div className="text-sm text-gray-500">{department.code}</div>
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
      key: 'faculty_name',
      label: 'Faculty',
      sortable: true,
      render: (department) => department.faculty_name ? (
        <span className="badge badge-primary badge-outline">
          {department.faculty_name}
        </span>
      ) : (
        <span className="text-gray-400">N/A</span>
      ),
    },
    {
      key: 'established_date',
      label: 'Established',
      sortable: true,
      render: (department) => department.established_date ? (
        <span className="text-gray-700">
          {new Date(department.established_date).toLocaleDateString()}
        </span>
      ) : (
        <span className="text-gray-400">N/A</span>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (department) => department.location ? (
        <div className="flex items-center space-x-2 text-gray-700">
          <FiMapPin size={16} />
          <span>{department.location}</span>
        </div>
      ) : (
        <span className="text-gray-400">N/A</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (department) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/departments/${department.id}`)}
            className="btn btn-sm btn-ghost text-blue-600"
            title="View Details"
          >
            <FiEye size={18} />
          </button>
          <button
            onClick={() => navigate(`/departments/${department.id}/edit`)}
            className="btn btn-sm btn-ghost text-green-600"
            title="Edit Department"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => handleDeleteClick(department)}
            className="btn btn-sm btn-ghost text-red-600"
            title="Delete Department"
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Departments</h1>
          <p className="text-gray-600">Manage all academic departments in the system</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/departments/create" className="btn btn-primary">
            <FiPlus size={20} />
            Add Department
          </Link>
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

      {/* Filters & Search */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Search departments..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <ExportButton 
                data={departments}
                filename="departments"
                title="Export Departments"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={departments}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">
              Are you sure you want to delete the department{' '}
              <span className="font-semibold">{departmentToDelete?.name}</span>?
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDepartmentToDelete(null);
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

export default DepartmentList;
