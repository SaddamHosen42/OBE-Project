import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiLayers, FiCalendar, FiMapPin, FiMail, FiPhone, FiGlobe, FiBook } from 'react-icons/fi';
import departmentService from '../../services/departmentService';

const DepartmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [department, setDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch department details
  useEffect(() => {
    const fetchDepartment = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await departmentService.getDepartmentById(id);
        
        if (response.success) {
          setDepartment(response.data);
        }
      } catch (err) {
        console.error('Error fetching department:', err);
        setError(err.message || 'Failed to load department details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchDepartment();
    }
  }, [id]);

  // Handle delete
  const handleDelete = async () => {
    try {
      const response = await departmentService.deleteDepartment(id);
      
      if (response.success) {
        navigate('/departments', {
          state: { message: 'Department deleted successfully' }
        });
      }
    } catch (err) {
      console.error('Error deleting department:', err);
      alert(err.message || 'Failed to delete department');
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
        <Link to="/departments" className="btn btn-ghost mt-4">
          <FiArrowLeft size={20} />
          Back to List
        </Link>
      </div>
    );
  }

  // No department found
  if (!department) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Department not found</span>
        </div>
        <Link to="/departments" className="btn btn-ghost mt-4">
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
          <Link to="/departments" className="btn btn-ghost">
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{department.name}</h1>
            <p className="text-gray-600 mt-1">Department Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/departments/${id}/edit`}
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
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department Name */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Department Name</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <FiLayers className="text-blue-600" size={20} />
                    <p className="text-gray-900 text-lg">{department.name}</p>
                  </div>
                </div>

                {/* Department Code */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Department Code</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-gray-900 text-lg font-mono">{department.code}</p>
                  </div>
                </div>

                {/* Faculty */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Faculty</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <FiBook className="text-purple-600" size={20} />
                    <p className="text-gray-900">
                      {department.faculty_name || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Established Date */}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Established Date</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <FiCalendar className="text-green-600" size={20} />
                    <p className="text-gray-900">
                      {department.established_date
                        ? new Date(department.established_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Location */}
                {department.location && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Location</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <FiMapPin className="text-red-600" size={20} />
                      <p className="text-gray-900">{department.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {department.description && (
                <div className="mt-6">
                  <label className="text-sm font-semibold text-gray-600">Description</label>
                  <p className="text-gray-700 mt-2 leading-relaxed whitespace-pre-line">
                    {department.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div>
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Contact Information</h2>
              
              <div className="space-y-4">
                {/* Email */}
                {department.contact_email ? (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <FiMail className="text-blue-600" size={18} />
                      <a
                        href={`mailto:${department.contact_email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {department.contact_email}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <p className="text-gray-400 mt-1">Not provided</p>
                  </div>
                )}

                {/* Phone */}
                {department.contact_phone ? (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Phone</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <FiPhone className="text-green-600" size={18} />
                      <a
                        href={`tel:${department.contact_phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {department.contact_phone}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Phone</label>
                    <p className="text-gray-400 mt-1">Not provided</p>
                  </div>
                )}

                {/* Website */}
                {department.website ? (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Website</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <FiGlobe className="text-purple-600" size={18} />
                      <a
                        href={department.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Website</label>
                    <p className="text-gray-400 mt-1">Not provided</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="card bg-base-100 shadow-md mt-6">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Metadata</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Department ID</label>
                  <p className="text-gray-900 font-mono">{department.id}</p>
                </div>
                
                {department.created_at && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Created At</label>
                    <p className="text-gray-900">
                      {new Date(department.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
                
                {department.updated_at && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Last Updated</label>
                    <p className="text-gray-900">
                      {new Date(department.updated_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">
              Are you sure you want to delete the department{' '}
              <span className="font-semibold">{department.name}</span>?
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

export default DepartmentView;
