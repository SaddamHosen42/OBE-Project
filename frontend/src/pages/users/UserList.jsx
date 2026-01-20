import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiUsers, FiMail, FiPhone } from 'react-icons/fi';
import DataTable from '../../components/data/DataTable';
import SearchBar from '../../components/data/SearchBar';
import FilterPanel from '../../components/data/FilterPanel';
import ExportButton from '../../components/data/ExportButton';
import userService from '../../services/userService';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (roleFilter) params.role = roleFilter;
      
      const response = await userService.getAllUsers(params);
      
      if (response.success) {
        setUsers(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, searchQuery, roleFilter]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle filter change
  const handleFilterChange = (filters) => {
    setRoleFilter(filters.role || '');
    setCurrentPage(1); // Reset to first page on filter
  };

  // Handle delete
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await userService.deleteUser(userToDelete.id);
      
      if (response.success) {
        // Refresh the list
        fetchUsers();
        setShowDeleteModal(false);
        setUserToDelete(null);
        
        // Show success message
        alert('User deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.message || 'Failed to delete user');
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
      label: 'Name',
      sortable: true,
      render: (user) => (
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              {user.profile_image ? (
                <img src={user.profile_image} alt={user.name} />
              ) : (
                <span className="text-white font-semibold">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">@{user.username}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (user) => (
        <div className="flex items-center space-x-2 text-gray-700">
          <FiMail size={16} />
          <span>{user.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user) => {
        const roleColors = {
          admin: 'badge-error',
          teacher: 'badge-primary',
          student: 'badge-success',
          staff: 'badge-warning',
        };
        return (
          <span className={`badge ${roleColors[user.role] || 'badge-ghost'}`}>
            {user.role?.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (user) => user.phone ? (
        <div className="flex items-center space-x-2 text-gray-700">
          <FiPhone size={16} />
          <span>{user.phone}</span>
        </div>
      ) : (
        <span className="text-gray-400">N/A</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (user) => (
        <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>
          {user.status || 'active'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/users/${user.id}`)}
            className="btn btn-sm btn-ghost text-blue-600"
            title="View Details"
          >
            <FiEye size={18} />
          </button>
          <button
            onClick={() => navigate(`/users/${user.id}/edit`)}
            className="btn btn-sm btn-ghost text-green-600"
            title="Edit User"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => handleDeleteClick(user)}
            className="btn btn-sm btn-ghost text-red-600"
            title="Delete User"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  // Filter options
  const filterOptions = [
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: '', label: 'All Roles' },
        { value: 'admin', label: 'Admin' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'student', label: 'Student' },
        { value: 'staff', label: 'Staff' },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FiUsers className="mr-3 text-blue-600" size={36} />
            User Management
          </h1>
          <p className="text-gray-600 mt-2">Manage all system users</p>
        </div>
        <Link to="/users/create" className="btn btn-primary">
          <FiPlus size={20} />
          Add New User
        </Link>
      </div>

      {/* Search, Filter, and Export */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search by name, email, or username..."
            />
          </div>
          <div className="flex items-center space-x-4">
            <FilterPanel
              filters={filterOptions}
              onFilterChange={handleFilterChange}
            />
            <ExportButton
              data={users}
              filename="users"
              headers={['ID', 'Name', 'Email', 'Username', 'Role', 'Phone']}
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

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          columns={columns}
          data={users}
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
              Are you sure you want to delete user <strong>{userToDelete?.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
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

export default UserList;
