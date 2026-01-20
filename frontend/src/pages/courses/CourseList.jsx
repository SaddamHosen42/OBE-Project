import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiBook, FiClock } from 'react-icons/fi';
import DataTable from '../../components/data/DataTable';
import SearchBar from '../../components/data/SearchBar';
import ExportButton from '../../components/data/ExportButton';
import courseService from '../../services/courseService';
import departmentService from '../../services/departmentService';

const CourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Fetch departments for filter
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentService.getAllDepartments({ limit: 100 });
        if (response.success) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch courses
  const fetchCourses = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (selectedDepartment) params.departmentId = selectedDepartment;
      
      const response = await courseService.getAllCourses(params);
      
      if (response.success) {
        setCourses(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage, itemsPerPage, searchQuery, selectedDepartment]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle delete
  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    
    try {
      const response = await courseService.deleteCourse(courseToDelete.id);
      
      if (response.success) {
        // Refresh the list
        fetchCourses();
        setShowDeleteModal(false);
        setCourseToDelete(null);
        
        // Show success message
        alert('Course deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      alert(err.message || 'Failed to delete course');
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
      key: 'courseCode',
      label: 'Course',
      sortable: true,
      render: (course) => (
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <FiBook className="text-white" size={20} />
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{course.courseCode}</div>
            <div className="text-sm text-gray-500 line-clamp-1">{course.courseTitle}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'creditHours',
      label: 'Credits',
      sortable: true,
      render: (course) => (
        <div className="flex items-center space-x-2">
          <FiClock size={16} className="text-gray-500" />
          <span className="font-medium text-gray-700">{course.creditHours}</span>
        </div>
      ),
    },
    {
      key: 'department_name',
      label: 'Department',
      sortable: true,
      render: (course) => course.department_name ? (
        <span className="badge badge-primary badge-outline">
          {course.department_name}
        </span>
      ) : (
        <span className="text-gray-400">N/A</span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (course) => {
        const typeColors = {
          'Core': 'badge-success',
          'Elective': 'badge-info',
          'Lab': 'badge-warning',
          'Project': 'badge-secondary',
        };
        return (
          <span className={`badge ${typeColors[course.type] || 'badge-ghost'}`}>
            {course.type || 'N/A'}
          </span>
        );
      },
    },
    {
      key: 'level',
      label: 'Level',
      sortable: true,
      render: (course) => course.level ? (
        <span className="badge badge-neutral badge-outline">
          Level {course.level}
        </span>
      ) : (
        <span className="text-gray-400">N/A</span>
      ),
    },
    {
      key: 'semester',
      label: 'Semester',
      sortable: true,
      render: (course) => course.semester ? (
        <span className="text-gray-700">Sem {course.semester}</span>
      ) : (
        <span className="text-gray-400">N/A</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (course) => (
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/courses/${course.id}`)}
            className="btn btn-ghost btn-sm"
            title="View Details"
          >
            <FiEye size={18} />
          </button>
          <button
            onClick={() => navigate(`/courses/${course.id}/edit`)}
            className="btn btn-ghost btn-sm"
            title="Edit"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => handleDeleteClick(course)}
            className="btn btn-ghost btn-sm text-error"
            title="Delete"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
          <p className="text-gray-600">Manage course catalog</p>
        </div>
        <Link to="/courses/create" className="btn btn-primary">
          <FiPlus size={20} />
          Add Course
        </Link>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchBar
              placeholder="Search by code or title..."
              onSearch={handleSearch}
              initialValue={searchQuery}
            />
            <div className="form-control">
              <select
                className="select select-bordered"
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <ExportButton
              data={courses}
              filename="courses"
              columns={['courseCode', 'courseTitle', 'creditHours', 'department_name', 'type', 'level']}
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={courses}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Course</h3>
            <p className="py-4">
              Are you sure you want to delete <strong>{courseToDelete?.courseCode}</strong>? 
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCourseToDelete(null);
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn btn-error">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;
