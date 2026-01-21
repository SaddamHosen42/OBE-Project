import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiUsers, FiMail, FiPhone, FiBook } from 'react-icons/fi';
import DataTable from '../../components/data/DataTable';
import SearchBar from '../../components/data/SearchBar';
import FilterPanel from '../../components/data/FilterPanel';
import ExportButton from '../../components/data/ExportButton';
import studentService from '../../services/studentService';
import departmentService from '../../services/departmentService';
import degreeService from '../../services/degreeService';

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');
  const [academicStatusFilter, setAcademicStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Fetch departments and degrees for filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [deptResponse, degreeResponse] = await Promise.all([
          departmentService.getAllDepartments({ limit: 100 }),
          degreeService.getAllDegrees({ limit: 100 })
        ]);
        
        if (deptResponse.success) setDepartments(deptResponse.data);
        if (degreeResponse.success) setDegrees(degreeResponse.data);
      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    };
    
    fetchFilters();
  }, []);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (departmentFilter) params.departmentId = departmentFilter;
      if (degreeFilter) params.degreeId = degreeFilter;
      if (academicStatusFilter) params.academicStatus = academicStatusFilter;
      
      const response = await studentService.getAllStudents(params);
      
      if (response.success) {
        setStudents(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, departmentFilter, degreeFilter, academicStatusFilter]);

  useEffect(() => {
    fetchStudents();
  }, [currentPage, itemsPerPage, searchQuery, departmentFilter, degreeFilter, academicStatusFilter, fetchStudents]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (filters) => {
    setDepartmentFilter(filters.department || '');
    setDegreeFilter(filters.degree || '');
    setAcademicStatusFilter(filters.academicStatus || '');
    setCurrentPage(1);
  };

  // Handle delete
  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    
    try {
      const response = await studentService.deleteStudent(studentToDelete.student_id);
      
      if (response.success) {
        fetchStudents();
        setShowDeleteModal(false);
        setStudentToDelete(null);
        alert('Student deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      alert(err.message || 'Failed to delete student');
    }
  };

  // Table columns
  const columns = [
    {
      key: 'student_id_number',
      label: 'Student ID',
      sortable: true,
      render: (student) => (
        <Link 
          to={`/students/${student.student_id}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {student.student_id_number}
        </Link>
      ),
    },
    {
      key: 'full_name',
      label: 'Full Name',
      sortable: true,
      render: (student) => (
        <div className="flex items-center">
          <div className="shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FiUsers className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {student.first_name} {student.last_name}
            </div>
            {student.email && (
              <div className="text-sm text-gray-500 flex items-center">
                <FiMail className="mr-1" /> {student.email}
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
      key: 'degree_code',
      label: 'Degree',
      sortable: true,
      render: (student) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {student.degree_code}
        </span>
      ),
    },
    {
      key: 'batch_year',
      label: 'Batch',
      sortable: true,
    },
    {
      key: 'cgpa',
      label: 'CGPA',
      sortable: true,
      render: (student) => (
        <span className="text-sm font-medium text-gray-900">
          {student.cgpa ? student.cgpa.toFixed(2) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'academic_status',
      label: 'Status',
      sortable: true,
      render: (student) => {
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          graduated: 'bg-blue-100 text-blue-800',
          suspended: 'bg-red-100 text-red-800',
          on_leave: 'bg-yellow-100 text-yellow-800',
          withdrawn: 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[student.academic_status] || 'bg-gray-100 text-gray-800'}`}>
            {student.academic_status?.replace('_', ' ').toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (student) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/students/${student.student_id}`)}
            className="text-blue-600 hover:text-blue-900"
            title="View"
          >
            <FiEye className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate(`/students/${student.student_id}/edit`)}
            className="text-green-600 hover:text-green-900"
            title="Edit"
          >
            <FiEdit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteClick(student)}
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
        ...departments.map(dept => ({ value: dept.department_id, label: dept.department_name }))
      ],
    },
    {
      type: 'select',
      name: 'degree',
      label: 'Degree',
      options: [
        { value: '', label: 'All Degrees' },
        ...degrees.map(degree => ({ value: degree.degree_id, label: `${degree.degree_code} - ${degree.degree_name}` }))
      ],
    },
    {
      type: 'select',
      name: 'academicStatus',
      label: 'Academic Status',
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'graduated', label: 'Graduated' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'on_leave', label: 'On Leave' },
        { value: 'withdrawn', label: 'Withdrawn' },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FiUsers className="mr-3" />
            Students
          </h1>
          <p className="text-gray-600 mt-1">Manage student records and information</p>
        </div>
        <Link
          to="/students/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <FiPlus className="mr-2" />
          Add Student
        </Link>
      </div>

      {/* Search, Filter, and Export */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              placeholder="Search by name, student ID, or email..."
              onSearch={handleSearch}
            />
          </div>
          <div className="flex justify-end">
            <ExportButton
              data={students}
              filename="students"
              headers={['Student ID', 'Name', 'Email', 'Department', 'Degree', 'Batch', 'CGPA', 'Status']}
            />
          </div>
        </div>
        <div className="mt-4">
          <FilterPanel
            filters={filterOptions}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md">
        <DataTable
          columns={columns}
          data={students}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete student <strong>{studentToDelete?.first_name} {studentToDelete?.last_name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

export default StudentList;
