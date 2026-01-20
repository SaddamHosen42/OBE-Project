import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiUsers, FiBook, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import DataTable from '../../components/data/DataTable';
import SearchBar from '../../components/data/SearchBar';
import FilterPanel from '../../components/data/FilterPanel';
import ExportButton from '../../components/data/ExportButton';
import enrollmentService from '../../services/enrollmentService';
import courseService from '../../services/courseService';
import offeringService from '../../services/offeringService';

const EnrollmentList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [offeringFilter, setOfferingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);

  // Get filter values from URL params
  const studentId = searchParams.get('studentId');
  const courseOfferingId = searchParams.get('offeringId');

  // Fetch courses and offerings for filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [courseResponse, offeringResponse] = await Promise.all([
          courseService.getAllCourses({ limit: 100 }),
          offeringService.getAllOfferings({ limit: 100 })
        ]);
        
        if (courseResponse.success) setCourses(courseResponse.data);
        if (offeringResponse.success) setOfferings(offeringResponse.data);
      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    };
    
    fetchFilters();
  }, []);

  // Fetch enrollments
  const fetchEnrollments = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let response;
      
      if (studentId) {
        // Fetch enrollments for a specific student
        response = await enrollmentService.getByStudent(studentId, {
          status: statusFilter || undefined,
          orderBy: 'enrollment_date',
          order: 'DESC'
        });
      } else if (courseOfferingId) {
        // Fetch enrollments for a specific course offering
        response = await enrollmentService.getByOffering(courseOfferingId, {
          status: statusFilter || undefined,
          orderBy: 'enrollment_date',
          order: 'ASC'
        });
      } else {
        // For now, we'll show a message to select a filter
        // You could implement a general enrollments endpoint if needed
        setEnrollments([]);
        setTotalPages(1);
        setTotalItems(0);
        setIsLoading(false);
        return;
      }
      
      if (response.success) {
        setEnrollments(response.data);
        setTotalItems(response.count || response.data.length);
        // Since backend doesn't return pagination for these endpoints,
        // we'll handle pagination on the frontend
        const totalPages = Math.ceil((response.count || response.data.length) / itemsPerPage);
        setTotalPages(totalPages);
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError(err.message || 'Failed to load enrollments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [studentId, courseOfferingId, statusFilter, itemsPerPage]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (filters) => {
    setCourseFilter(filters.course || '');
    setOfferingFilter(filters.offering || '');
    setStatusFilter(filters.status || '');
    setCurrentPage(1);
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await enrollmentService.deleteEnrollment(id);
      if (response.success) {
        setShowDeleteModal(false);
        setEnrollmentToDelete(null);
        fetchEnrollments();
      }
    } catch (err) {
      console.error('Error deleting enrollment:', err);
      setError(err.message || 'Failed to delete enrollment');
    }
  };

  // Handle drop enrollment
  const handleDrop = async (id) => {
    try {
      if (window.confirm('Are you sure you want to drop this enrollment?')) {
        const response = await enrollmentService.dropEnrollment(id);
        if (response.success) {
          fetchEnrollments();
        }
      }
    } catch (err) {
      console.error('Error dropping enrollment:', err);
      setError(err.message || 'Failed to drop enrollment');
    }
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await enrollmentService.updateStatus(id, newStatus);
      if (response.success) {
        fetchEnrollments();
      }
    } catch (err) {
      console.error('Error updating enrollment status:', err);
      setError(err.message || 'Failed to update enrollment status');
    }
  };

  // Paginate enrollments on frontend
  const paginatedEnrollments = enrollments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Define table columns
  const columns = [
    {
      key: 'enrollment_id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'student_name',
      label: 'Student',
      sortable: true,
      render: (row) => (
        <div className="flex items-center">
          <FiUsers className="mr-2 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">{row.student_name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{row.student_sid || row.student_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'course_name',
      label: 'Course',
      sortable: true,
      render: (row) => (
        <div className="flex items-center">
          <FiBook className="mr-2 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">{row.course_code || 'N/A'}</div>
            <div className="text-sm text-gray-500">{row.course_name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'semester',
      label: 'Semester',
      sortable: true,
      render: (row) => (
        <div className="flex items-center">
          <FiCalendar className="mr-2 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">{row.semester_name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{row.academic_session_name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'enrollment_date',
      label: 'Enrollment Date',
      sortable: true,
      render: (row) => new Date(row.enrollment_date).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const statusColors = {
          'active': 'bg-green-100 text-green-800',
          'dropped': 'bg-red-100 text-red-800',
          'completed': 'bg-blue-100 text-blue-800',
          'withdrawn': 'bg-yellow-100 text-yellow-800',
        };
        
        const statusIcons = {
          'active': <FiCheckCircle className="inline mr-1" />,
          'dropped': <FiXCircle className="inline mr-1" />,
          'completed': <FiCheckCircle className="inline mr-1" />,
          'withdrawn': <FiXCircle className="inline mr-1" />,
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[row.status] || 'bg-gray-100 text-gray-800'}`}>
            {statusIcons[row.status]}
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/enrollments/${row.enrollment_id}`)}
            className="text-blue-600 hover:text-blue-900"
            title="View"
          >
            <FiEye className="w-5 h-5" />
          </button>
          {row.status === 'active' && (
            <>
              <button
                onClick={() => navigate(`/enrollments/${row.enrollment_id}/edit`)}
                className="text-green-600 hover:text-green-900"
                title="Edit"
              >
                <FiEdit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDrop(row.enrollment_id)}
                className="text-yellow-600 hover:text-yellow-900"
                title="Drop"
              >
                <FiXCircle className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={() => {
              setEnrollmentToDelete(row);
              setShowDeleteModal(true);
            }}
            className="text-red-600 hover:text-red-900"
            title="Delete"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  // Filter options
  const filterOptions = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'dropped', label: 'Dropped' },
        { value: 'withdrawn', label: 'Withdrawn' },
      ],
    },
  ];

  if (!studentId) {
    filterOptions.push({
      id: 'offering',
      label: 'Course Offering',
      type: 'select',
      options: [
        { value: '', label: 'All Offerings' },
        ...offerings.map(offering => ({
          value: offering.course_offering_id,
          label: `${offering.course_code} - ${offering.semester_name}`,
        })),
      ],
    });
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enrollments</h1>
            <p className="mt-2 text-sm text-gray-700">
              {studentId ? 'Student enrollments' : courseOfferingId ? 'Course offering enrollments' : 'Manage course enrollments'}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/enrollments/bulk"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiUsers className="mr-2" />
              Bulk Enroll
            </Link>
            <Link
              to="/enrollments/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <FiPlus className="mr-2" />
              New Enrollment
            </Link>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search enrollments..."
            className="max-w-md"
          />
        </div>
        <div className="flex items-center space-x-3">
          <FilterPanel
            filters={filterOptions}
            onFilterChange={handleFilterChange}
          />
          <ExportButton
            data={enrollments}
            filename="enrollments"
            columns={columns}
          />
        </div>
      </div>

      {/* Info Message */}
      {!studentId && !courseOfferingId && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
          Please select a student or course offering to view enrollments.
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedEnrollments}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        emptyMessage="No enrollments found"
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mt-4">
                Delete Enrollment
              </h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Are you sure you want to delete this enrollment? This action cannot be undone.
              </p>
              {enrollmentToDelete && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm">
                    <strong>Student:</strong> {enrollmentToDelete.student_name}
                  </p>
                  <p className="text-sm">
                    <strong>Course:</strong> {enrollmentToDelete.course_code}
                  </p>
                </div>
              )}
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setEnrollmentToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(enrollmentToDelete.enrollment_id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentList;
