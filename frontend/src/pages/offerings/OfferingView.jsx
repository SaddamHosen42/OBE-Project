import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiBook, FiCalendar, FiUsers, FiMapPin, FiClock } from 'react-icons/fi';
import offeringService from '../../services/offeringService';

const OfferingView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [offering, setOffering] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch offering details
  useEffect(() => {
    const fetchOffering = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await offeringService.getOfferingById(id);
        
        if (response.success) {
          setOffering(response.data);
        }
      } catch (err) {
        console.error('Error fetching offering:', err);
        setError(err.message || 'Failed to load offering details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchOffering();
    }
  }, [id]);

  // Handle delete
  const handleDelete = async () => {
    try {
      const response = await offeringService.deleteOffering(id);
      
      if (response.success) {
        navigate('/offerings', {
          state: { message: 'Course offering deleted successfully' }
        });
      }
    } catch (err) {
      console.error('Error deleting offering:', err);
      alert(err.message || 'Failed to delete course offering');
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
        <Link to="/offerings" className="btn btn-ghost mt-4">
          <FiArrowLeft size={20} />
          Back to List
        </Link>
      </div>
    );
  }

  // No offering found
  if (!offering) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Course offering not found</span>
        </div>
        <Link to="/offerings" className="btn btn-ghost mt-4">
          <FiArrowLeft size={20} />
          Back to List
        </Link>
      </div>
    );
  }

  const statusColors = {
    'Active': 'badge-success',
    'Inactive': 'badge-error',
    'Completed': 'badge-neutral',
    'Scheduled': 'badge-info',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to="/offerings" className="btn btn-ghost">
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {offering.course_code} - Section {offering.section}
            </h1>
            <p className="text-gray-600 mt-1">{offering.course_title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/offerings/${id}/edit`}
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
              <h2 className="card-title text-xl mb-4">Offering Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Code */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Course</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <FiBook className="text-green-600" size={20} />
                    <p className="text-gray-900 text-lg">{offering.course_code}</p>
                  </div>
                </div>

                {/* Section */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Section</label>
                  <div className="mt-1">
                    <span className="badge badge-neutral badge-lg">{offering.section}</span>
                  </div>
                </div>

                {/* Session */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Academic Session</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <FiCalendar className="text-blue-600" size={20} />
                    <p className="text-gray-900 text-lg">{offering.session_name || 'N/A'}</p>
                  </div>
                </div>

                {/* Semester */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Semester</label>
                  <div className="mt-1">
                    <span className="badge badge-primary badge-lg">{offering.semester_name || 'N/A'}</span>
                  </div>
                </div>

                {/* Instructor */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Instructor</label>
                  <p className="text-gray-900 text-lg mt-1">{offering.teacher_name || 'Not Assigned'}</p>
                </div>

                {/* Capacity */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Capacity</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <FiUsers className="text-purple-600" size={20} />
                    <p className="text-gray-900 text-lg">{offering.capacity || 'N/A'}</p>
                  </div>
                </div>

                {/* Room */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Room</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <FiMapPin className="text-red-600" size={20} />
                    <p className="text-gray-900 text-lg">{offering.room || 'N/A'}</p>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Schedule</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <FiClock className="text-indigo-600" size={20} />
                    <p className="text-gray-900 text-lg">{offering.schedule || 'N/A'}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-600">Status</label>
                  <div className="mt-1">
                    <span className={`badge ${statusColors[offering.status] || 'badge-ghost'} badge-lg`}>
                      {offering.status || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Start Date */}
                {offering.startDate && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Start Date</label>
                    <p className="text-gray-900 text-lg mt-1">
                      {new Date(offering.startDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* End Date */}
                {offering.endDate && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">End Date</label>
                    <p className="text-gray-900 text-lg mt-1">
                      {new Date(offering.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes Card */}
          {offering.notes && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{offering.notes}</p>
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
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-semibold text-gray-900">{offering.capacity || 'N/A'}</span>
                </div>
                <div className="divider my-1"></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`badge ${statusColors[offering.status] || 'badge-ghost'}`}>
                    {offering.status || 'N/A'}
                  </span>
                </div>
                <div className="divider my-1"></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Section</span>
                  <span className="font-semibold text-gray-900">{offering.section}</span>
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
                    {offering.createdAt ? new Date(offering.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="divider my-1"></div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Last Updated</label>
                  <p className="text-gray-700 text-sm mt-1">
                    {offering.updatedAt ? new Date(offering.updatedAt).toLocaleDateString() : 'N/A'}
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
                <Link to={`/offerings/${id}/edit`} className="btn btn-primary btn-block">
                  <FiEdit size={18} />
                  Edit Offering
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-error btn-block"
                >
                  <FiTrash2 size={18} />
                  Delete Offering
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
            <h3 className="font-bold text-lg">Delete Course Offering</h3>
            <p className="py-4">
              Are you sure you want to delete this offering for <strong>{offering.course_code}</strong>? 
              This action cannot be undone and will affect all related enrollments and assessments.
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

export default OfferingView;
