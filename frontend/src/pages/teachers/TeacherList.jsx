import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiUsers, FiMail, FiPhone, FiBook } from 'react-icons/fi';
import DataTable from '../../components/data/DataTable';
import SearchBar from '../../components/data/SearchBar';
import FilterPanel from '../../components/data/FilterPanel';
import ExportButton from '../../components/data/ExportButton';
import teacherService from '../../services/teacherService';
import departmentService from '../../services/departmentService';

const TeacherList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  // Fetch departments for filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const deptResponse = await departmentService.getAllDepartments({ limit: 100 });
        
        if (deptResponse.success) setDepartments(deptResponse.data);
      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    };
    
    fetchFilters();
  }, []);

  // Fetch teachers
  const fetchTeachers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        withDetails: 'true',
      };
      
      if (searchQuery) params.search = searchQuery;
      if (departmentFilter) params.departmentId = departmentFilter;
      
      const response = await teacherService.getAllTeachers(params);
      
      if (response.success) {
        setTeachers(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError(err.message || 'Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [currentPage, itemsPerPage, searchQuery, departmentFilter]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (filters) => {
    setDepartmentFilter(filters.department || '');
    setCurrentPage(1);
  };

  // Handle delete
  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;
    
    try {
      const response = await teacherService.deleteTeacher(teacherToDelete.teacher_id);
      
      if (response.success) {
        fetchTeachers();
        setShowDeleteModal(false);
        setTeacherToDelete(null);
        alert('Teacher deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting teacher:', err);
      alert(err.message || 'Failed to delete teacher');
    }
  };

  // Table columns
  const columns = [
    {
      key: 'employee_id',
      label: 'Employee ID',
      sortable: true,
      render: (teacher) => (
        <Link 
          to={`/teachers/${teacher.teacher_id}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {teacher.employee_id}
        </Link>
      ),
    },
    {
      key: 'full_name',
      label: 'Full Name',
      sortable: true,
      render: (teacher) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FiUsers className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {teacher.user_name}
            </div>
            {teacher.user_email && (
              <div className="text-sm text-gray-500 flex items-center">
                <FiMail className="mr-1" /> {teacher.user_email}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'department_name',
      label: 'Department',
      sortable: true,
    },
    {
      key: 'designation_name',
      label: 'Designation',
      sortable: true,
      render: (teacher) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
          {teacher.designation_name || 'N/A'}
        </span>
      ),
    },
    {
      key: 'office_phone',
      label: 'Phone',
      sortable: true,
      render: (teacher) => (
        <div className="flex items-center text-sm text-gray-600">
          {teacher.office_phone && (
            <>
              <FiPhone className="mr-1" />
              <span>{teacher.office_phone}</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'hire_date',
      label: 'Hire Date',
      sortable: true,
      render: (teacher) => (
        teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString() : 'N/A'
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (teacher) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/teachers/${teacher.teacher_id}`)}
            className="text-blue-600 hover:text-blue-900"
            title="View"
          >
            <FiEye className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate(`/teachers/${teacher.teacher_id}/edit`)}
            className="text-green-600 hover:text-green-900"
            title="Edit"
          >
            <FiEdit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteClick(teacher)}
            className="text-red-600 hover:text-red-900"
            title="Delete"
          >
            <FiTrash2 className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  // Filter options
  const filterOptions = [
    {
      type: 'select',
      name: 'department',
      label: 'Department',
      options: [
        { value: '', label: 'All Departments' },
        ...departments.map(dept => ({
          value: dept.department_id.toString(),
          label: dept.name,
        })),
      ],
    },
  ];

  // Statistics
  const stats = [
    {
      label: 'Total Teachers',
      value: totalItems,
      icon: FiUsers,
      color: 'bg-blue-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600 mt-1">Manage teachers and faculty members</p>
        </div>
        <Link
          to="/teachers/create"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          Add Teacher
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by name, employee ID, email, or phone..."
            />
          </div>
          <div className="flex items-center space-x-4">
            <FilterPanel
              filters={filterOptions}
              onFilterChange={handleFilterChange}
            />
            <ExportButton
              data={teachers}
              filename="teachers"
              headers={['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Phone']}
            />
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <DataTable
          columns={columns}
          data={teachers}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete teacher "{teacherToDelete?.user_name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTeacherToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
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

export default TeacherList;
