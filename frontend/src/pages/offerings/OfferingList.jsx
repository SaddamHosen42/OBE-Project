import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiBook, FiCalendar, FiUsers } from 'react-icons/fi';
import DataTable from '../../components/data/DataTable';
import SearchBar from '../../components/data/SearchBar';
import ExportButton from '../../components/data/ExportButton';
import offeringService from '../../services/offeringService';
import courseService from '../../services/courseService';
import sessionService from '../../services/sessionService';

const OfferingList = () => {
  const navigate = useNavigate();
  const [offerings, setOfferings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offeringToDelete, setOfferingToDelete] = useState(null);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSession, setSelectedSession] = useState('');

  // Fetch courses and sessions for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [courseResponse, sessionResponse] = await Promise.all([
          courseService.getAllCourses({ limit: 1000 }),
          sessionService.getAllSessions({ limit: 100 }),
        ]);
        if (courseResponse.success) setCourses(courseResponse.data);
        if (sessionResponse.success) setSessions(sessionResponse.data);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };
    fetchFilterData();
  }, []);

  // Fetch offerings
  const fetchOfferings = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (selectedCourse) params.courseId = selectedCourse;
      if (selectedSession) params.sessionId = selectedSession;
      
      const response = await offeringService.getAllOfferings(params);
      
      if (response.success) {
        setOfferings(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      }
    } catch (err) {
      console.error('Error fetching offerings:', err);
      setError(err.message || 'Failed to load course offerings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferings();
  }, [currentPage, itemsPerPage, searchQuery, selectedCourse, selectedSession]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle delete
  const handleDeleteClick = (offering) => {
    setOfferingToDelete(offering);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!offeringToDelete) return;
    
    try {
      const response = await offeringService.deleteOffering(offeringToDelete.id);
      
      if (response.success) {
        fetchOfferings();
        setShowDeleteModal(false);
        setOfferingToDelete(null);
        alert('Course offering deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting offering:', err);
      alert(err.message || 'Failed to delete course offering');
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
      key: 'course',
      label: 'Course',
      sortable: true,
      render: (offering) => (
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <FiBook className="text-white" size={20} />
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{offering.course_code}</div>
            <div className="text-sm text-gray-500 line-clamp-1">{offering.course_title}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'section',
      label: 'Section',
      sortable: true,
      render: (offering) => (
        <span className="badge badge-neutral badge-lg">
          {offering.section}
        </span>
      ),
    },
    {
      key: 'session',
      label: 'Session',
      sortable: true,
      render: (offering) => offering.session_name ? (
        <div className="flex items-center space-x-2">
          <FiCalendar size={16} className="text-blue-600" />
          <span className="text-gray-700">{offering.session_name}</span>
        </div>
      ) : (
        <span className="text-gray-400">N/A</span>
      ),
    },
    {
      key: 'semester',
      label: 'Semester',
      sortable: true,
      render: (offering) => offering.semester_name ? (
        <span className="badge badge-primary badge-outline">
          {offering.semester_name}
        </span>
      ) : (
        <span className="text-gray-400">N/A</span>
      ),
    },
    {
      key: 'teacher',
      label: 'Instructor',
      render: (offering) => offering.teacher_name || (
        <span className="text-gray-400">Not Assigned</span>
      ),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      sortable: true,
      render: (offering) => (
        <div className="flex items-center space-x-2">
          <FiUsers size={16} className="text-gray-500" />
          <span className="font-medium text-gray-700">{offering.capacity || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (offering) => {
        const statusColors = {
          'Active': 'badge-success',
          'Inactive': 'badge-error',
          'Completed': 'badge-neutral',
          'Scheduled': 'badge-info',
        };
        return (
          <span className={`badge ${statusColors[offering.status] || 'badge-ghost'}`}>
            {offering.status || 'N/A'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (offering) => (
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/offerings/${offering.id}`)}
            className="btn btn-ghost btn-sm"
            title="View Details"
          >
            <FiEye size={18} />
          </button>
          <button
            onClick={() => navigate(`/offerings/${offering.id}/edit`)}
            className="btn btn-ghost btn-sm"
            title="Edit"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => handleDeleteClick(offering)}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Offerings</h1>
          <p className="text-gray-600">Manage course offerings per semester</p>
        </div>
        <Link to="/offerings/create" className="btn btn-primary">
          <FiPlus size={20} />
          Add Offering
        </Link>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SearchBar
              placeholder="Search offerings..."
              onSearch={handleSearch}
              initialValue={searchQuery}
            />
            <div className="form-control">
              <select
                className="select select-bordered"
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.courseTitle}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <select
                className="select select-bordered"
                value={selectedSession}
                onChange={(e) => {
                  setSelectedSession(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Sessions</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>
            <ExportButton
              data={offerings}
              filename="course-offerings"
              columns={['course_code', 'course_title', 'section', 'session_name', 'semester_name', 'teacher_name', 'capacity']}
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
        data={offerings}
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
            <h3 className="font-bold text-lg">Delete Course Offering</h3>
            <p className="py-4">
              Are you sure you want to delete this offering for <strong>{offeringToDelete?.course_code}</strong>? 
              This action cannot be undone and will affect all related enrollments.
            </p>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setOfferingToDelete(null);
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

export default OfferingList;
