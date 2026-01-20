import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiBook, FiCalendar, FiMapPin, FiMail, FiPhone, FiGlobe } from 'react-icons/fi';
import facultyService from '../../services/facultyService';

const FacultyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [faculty, setFaculty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch faculty details
  useEffect(() => {
    const fetchFaculty = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await facultyService.getFacultyById(id);
        
        if (response.success) {
          setFaculty(response.data);
        }
      } catch (err) {
        console.error('Error fetching faculty:', err);
        setError(err.message || 'Failed to load faculty details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchFaculty();
    }
  }, [id]);

  // Handle delete
  const handleDelete = async () => {
    try {
      const response = await facultyService.deleteFaculty(id);
      
      if (response.success) {
        navigate('/faculties', {
          state: { message: 'Faculty deleted successfully' }
        });
      }
    } catch (err) {
      console.error('Error deleting faculty:', err);
      alert(err.message || 'Failed to delete faculty');
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
        <Link to="/faculties" className="btn btn-ghost mt-4">
          <FiArrowLeft size={20} />
          Back to List
        </Link>
      </div>
    );
  }

  // No faculty found
  if (!faculty) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Faculty not found</span>
        </div>
        <Link to="/faculties" className="btn btn-ghost mt-4">
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FiBook className="mr-3 text-purple-600" size={36} />
            Faculty Details
          </h1>
          <p className="text-gray-600 mt-2">View faculty information</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/faculties" className="btn btn-ghost">
            <FiArrowLeft size={20} />
            Back to List
          </Link>
          <Link to={`/faculties/${id}/edit`} className="btn btn-primary">
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

      {/* Faculty Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
              <FiBook className="text-purple-600" size={40} />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{faculty.name}</h2>
              <p className="text-purple-100 text-lg">{faculty.code}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiBook className="mr-2 text-purple-600" />
                Basic Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-gray-600 font-medium w-40">Faculty Name:</span>
                  <span className="text-gray-900 flex-1">{faculty.name}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-600 font-medium w-40">Faculty Code:</span>
                  <span className="text-gray-900 flex-1">{faculty.code}</span>
                </div>
                {faculty.established_date && (
                  <div className="flex items-start">
                    <span className="text-gray-600 font-medium w-40 flex items-center">
                      <FiCalendar className="mr-2" size={16} />
                      Established:
                    </span>
                    <span className="text-gray-900 flex-1">
                      {new Date(faculty.established_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {faculty.location && (
                  <div className="flex items-start">
                    <span className="text-gray-600 font-medium w-40 flex items-center">
                      <FiMapPin className="mr-2" size={16} />
                      Location:
                    </span>
                    <span className="text-gray-900 flex-1">{faculty.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiMail className="mr-2 text-purple-600" />
                Contact Information
              </h3>
              <div className="space-y-3">
                {faculty.contact_email && (
                  <div className="flex items-start">
                    <span className="text-gray-600 font-medium w-40 flex items-center">
                      <FiMail className="mr-2" size={16} />
                      Email:
                    </span>
                    <a 
                      href={`mailto:${faculty.contact_email}`} 
                      className="text-blue-600 hover:underline flex-1"
                    >
                      {faculty.contact_email}
                    </a>
                  </div>
                )}
                {faculty.contact_phone && (
                  <div className="flex items-start">
                    <span className="text-gray-600 font-medium w-40 flex items-center">
                      <FiPhone className="mr-2" size={16} />
                      Phone:
                    </span>
                    <a 
                      href={`tel:${faculty.contact_phone}`} 
                      className="text-blue-600 hover:underline flex-1"
                    >
                      {faculty.contact_phone}
                    </a>
                  </div>
                )}
                {faculty.website && (
                  <div className="flex items-start">
                    <span className="text-gray-600 font-medium w-40 flex items-center">
                      <FiGlobe className="mr-2" size={16} />
                      Website:
                    </span>
                    <a 
                      href={faculty.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex-1"
                    >
                      {faculty.website}
                    </a>
                  </div>
                )}
                {!faculty.contact_email && !faculty.contact_phone && !faculty.website && (
                  <p className="text-gray-500 italic">No contact information available</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {faculty.description && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {faculty.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">Created:</span>
                <span className="text-gray-900">
                  {faculty.created_at ? new Date(faculty.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">Last Updated:</span>
                <span className="text-gray-900">
                  {faculty.updated_at ? new Date(faculty.updated_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Delete</h3>
            <p className="py-4">
              Are you sure you want to delete faculty <strong>{faculty.name}</strong>?
              This action cannot be undone and may affect related records.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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

export default FacultyView;
