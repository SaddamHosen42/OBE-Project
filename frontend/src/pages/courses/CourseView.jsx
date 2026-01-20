import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiBook, FiCalendar, FiClock, FiLayers, FiFileText } from 'react-icons/fi';
import courseService from '../../services/courseService';

const CourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await courseService.getCourseById(id);
        
        if (response.success) {
          setCourse(response.data);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message || 'Failed to load course details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchCourse();
    }
  }, [id]);

  // Handle delete
  const handleDelete = async () => {
    try {
      const response = await courseService.deleteCourse(id);
      
      if (response.success) {
        navigate('/courses', {
          state: { message: 'Course deleted successfully' }
        });
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      alert(err.message || 'Failed to delete course');
      setShowDeleteModal(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
        <Link to="/courses" className="btn btn-ghost mt-4">
          <FiArrowLeft size={20} />
          Back to List
        </Link>
      </div>
    );
  }

  // No course found
  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Course not found</span>
        </div>
        <Link to="/courses" className="btn btn-ghost mt-4">
          <FiArrowLeft size={20} />
          Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to="/courses" className="btn btn-ghost">
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.courseCode}</h1>
            <p className="text-gray-600 mt-1">{course.courseTitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/courses/${id}/edit`}
            className="btn btn-primary"
          >
            <FiEdit size={20} />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-error"
          >
            <FiTrash2 size={20} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Code */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Course Code</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <FiBook className="text-purple-600" size={20} />
                    <p className="text-gray-900 text-lg">{course.courseCode}</p>
                  </div>
                </div>

                {/* Course Title */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Course Title</label>
                  <p className="text-gray-900 text-lg mt-1">{course.courseTitle}</p>
                </div>

                {/* Credit Hours */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Credit Hours</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <FiClock className="text-blue-600" size={20} />
                    <p className="text-gray-900 text-lg">{course.creditHours}</p>
                  </div>
                </div>

                {/* Contact Hours */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Contact Hours</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <FiClock className="text-green-600" size={20} />
                    <p className="text-gray-900 text-lg">{course.contactHours || 'N/A'}</p>
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Department</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <FiLayers className="text-indigo-600" size={20} />
                    <p className="text-gray-900 text-lg">{course.department_name || 'N/A'}</p>
                  </div>
                </div>

                {/* Degree */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Degree Program</label>
                  <p className="text-gray-900 text-lg mt-1">{course.degree_name || 'N/A'}</p>
                </div>

                {/* Type */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Type</label>
                  <div className="mt-1">
                    {course.type ? (
                      <span className="badge badge-primary badge-lg">{course.type}</span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </div>

                {/* Level */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Level</label>
                  <div className="mt-1">
                    {course.level ? (
                      <span className="badge badge-neutral badge-lg">Level {course.level}</span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </div>

                {/* Semester */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Semester</label>
                  <p className="text-gray-900 text-lg mt-1">{course.semester ? `Semester ${course.semester}` : 'N/A'}</p>
                </div>

                {/* Elective */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Course Nature</label>
                  <div className="mt-1">
                    {course.isElective ? (
                      <span className="badge badge-info badge-lg">Elective</span>
                    ) : (
                      <span className="badge badge-success badge-lg">Core</span>
                    )}
                  </div>
                </div>

                {/* Prerequisite */}
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-600">Prerequisite Course</label>
                  <p className="text-gray-900 text-lg mt-1">{course.prerequisite_course_code || 'None'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description Card */}
          {course.description && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 flex items-center">
                  <FiFileText className="text-gray-600" />
                  <span>Description</span>
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
              </div>
            </div>
          )}

          {/* Objectives Card */}
          {course.objectives && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Course Objectives</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{course.objectives}</p>
              </div>
            </div>
          )}

          {/* Outline Card */}
          {course.outlineContent && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Course Outline</h2>
                <div className="text-gray-700 whitespace-pre-wrap">{course.outlineContent}</div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Credit Hours</span>
                  <span className="font-semibold text-gray-900">{course.creditHours}</span>
                </div>
                <div className="divider my-1"></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Contact Hours</span>
                  <span className="font-semibold text-gray-900">{course.contactHours || 'N/A'}</span>
                </div>
                <div className="divider my-1"></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-semibold text-gray-900">{course.level || 'N/A'}</span>
                </div>
                <div className="divider my-1"></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Semester</span>
                  <span className="font-semibold text-gray-900">{course.semester || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Metadata</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Created</label>
                  <p className="text-gray-700 text-sm mt-1">
                    {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="divider my-1"></div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Last Updated</label>
                  <p className="text-gray-700 text-sm mt-1">
                    {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Actions</h2>
              <div className="space-y-2">
                <Link to={`/courses/${id}/edit`} className="btn btn-primary btn-block">
                  <FiEdit size={18} />
                  Edit Course
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-error btn-block"
                >
                  <FiTrash2 size={18} />
                  Delete Course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Course</h3>
            <p className="py-4">
              Are you sure you want to delete <strong>{course.courseCode}</strong>? 
              This action cannot be undone and will affect all related course offerings and enrollments.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="btn btn-error">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseView;
