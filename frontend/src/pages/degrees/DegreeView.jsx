import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiAward, FiCalendar, FiBook, FiClock, FiFileText } from 'react-icons/fi';
import degreeService from '../../services/degreeService';

const DegreeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [degree, setDegree] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch degree details
  useEffect(() => {
    const fetchDegree = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await degreeService.getDegreeById(id);
        
        if (response.success) {
          setDegree(response.data);
        }
      } catch (err) {
        console.error('Error fetching degree:', err);
        setError(err.message || 'Failed to load degree details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchDegree();
    }
  }, [id]);

  // Handle delete
  const handleDelete = async () => {
    try {
      const response = await degreeService.deleteDegree(id);
      
      if (response.success) {
        navigate('/degrees', {
          state: { message: 'Degree deleted successfully' }
        });
      }
    } catch (err) {
      console.error('Error deleting degree:', err);
      alert(err.message || 'Failed to delete degree');
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
        <Link to="/degrees" className="btn btn-ghost mt-4">
          <FiArrowLeft size={20} />
          Back to List
        </Link>
      </div>
    );
  }

  // No degree found
  if (!degree) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Degree not found</span>
        </div>
        <Link to="/degrees" className="btn btn-ghost mt-4">
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
            <FiAward className="mr-3 text-blue-600" size={36} />
            Degree Details
          </h1>
          <p className="text-gray-600 mt-2">View degree program information</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/degrees" className="btn btn-ghost">
            <FiArrowLeft size={20} />
            Back to List
          </Link>
          <Link to={`/degrees/${id}/edit`} className="btn btn-primary">
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

      {/* Degree Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
              <FiAward className="text-blue-600" size={40} />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{degree.name}</h2>
              <p className="text-blue-100 text-lg">{degree.code}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <FiBook className="text-blue-500 mt-1 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Degree Code</p>
                    <p className="font-medium text-gray-900">{degree.code}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FiCalendar className="text-blue-500 mt-1 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Level</p>
                    <p className="font-medium text-gray-900">
                      <span className="badge badge-primary">{degree.level}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FiClock className="text-blue-500 mt-1 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900">
                      {degree.duration_years} {degree.duration_years === 1 ? 'Year' : 'Years'}
                    </p>
                  </div>
                </div>

                {degree.total_credits && (
                  <div className="flex items-start">
                    <FiFileText className="text-blue-500 mt-1 mr-3" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Total Credits</p>
                      <p className="font-medium text-gray-900">{degree.total_credits}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Department Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Department Information
              </h3>
              
              <div className="space-y-4">
                {degree.department_name ? (
                  <div className="flex items-start">
                    <FiBook className="text-blue-500 mt-1 mr-3" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium text-gray-900">{degree.department_name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No department information available</div>
                )}
              </div>
            </div>

            {/* Description */}
            {degree.description && (
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {degree.description}
                </p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {degree.created_at ? new Date(degree.created_at).toLocaleString() : 'N/A'}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {degree.updated_at ? new Date(degree.updated_at).toLocaleString() : 'N/A'}
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
              Are you sure you want to delete the degree <strong>{degree.name}</strong>?
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

export default DegreeView;
