import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiBook, FiArrowLeft, FiSave } from 'react-icons/fi';
import semesterService from '../../services/semesterService';
import sessionService from '../../services/sessionService';

const SemesterEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    academic_session_id: '',
    name: '',
    semester_number: '',
    start_date: '',
    end_date: '',
    is_active: false,
  });

  // Fetch academic sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await sessionService.getAllSessions({ limit: 100 });
        if (response.success) {
          setSessions(response.data);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchSessions();
  }, []);

  // Fetch semester data
  useEffect(() => {
    const fetchSemester = async () => {
      try {
        const response = await semesterService.getSemesterById(id);
        
        if (response.success) {
          const semester = response.data;
          setFormData({
            academic_session_id: semester.academic_session_id || '',
            name: semester.name || '',
            semester_number: semester.semester_number || '',
            start_date: semester.start_date ? semester.start_date.split('T')[0] : '',
            end_date: semester.end_date ? semester.end_date.split('T')[0] : '',
            is_active: semester.is_active || false,
          });
        }
      } catch (err) {
        console.error('Error fetching semester:', err);
        setError(err.message || 'Failed to load semester');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSemester();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.academic_session_id) {
      newErrors.academic_session_id = 'Academic session is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Semester name is required';
    }

    if (!formData.semester_number) {
      newErrors.semester_number = 'Semester number is required';
    } else if (formData.semester_number < 1 || formData.semester_number > 12) {
      newErrors.semester_number = 'Semester number must be between 1 and 12';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await semesterService.updateSemester(id, formData);

      if (response.success) {
        alert('Semester updated successfully!');
        navigate('/semesters');
      }
    } catch (err) {
      console.error('Error updating semester:', err);
      alert(err.message || 'Failed to update semester');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
        <Link to="/semesters" className="btn btn-ghost mt-4">
          <FiArrowLeft size={20} />
          Back to Semesters
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/semesters" className="btn btn-ghost btn-sm mb-4">
          <FiArrowLeft size={20} />
          Back to Semesters
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FiBook className="text-purple-600" />
          Edit Semester
        </h1>
        <p className="text-gray-600 mt-2">Update semester information</p>
      </div>

      {/* Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Academic Session */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Academic Session <span className="text-error">*</span>
                </span>
              </label>
              <select
                name="academic_session_id"
                value={formData.academic_session_id}
                onChange={handleChange}
                className={`select select-bordered w-full ${errors.academic_session_id ? 'select-error' : ''}`}
                disabled={isLoadingSessions}
              >
                <option value="">Select Academic Session</option>
                {sessions.map(session => (
                  <option key={session.id} value={session.id}>
                    {session.session_name}
                  </option>
                ))}
              </select>
              {errors.academic_session_id && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.academic_session_id}</span>
                </label>
              )}
            </div>

            {/* Semester Name and Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Semester Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Semester Name <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Fall 2024, Spring 2025"
                  className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.name}</span>
                  </label>
                )}
              </div>

              {/* Semester Number */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Semester Number <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="number"
                  name="semester_number"
                  value={formData.semester_number}
                  onChange={handleChange}
                  placeholder="1-12"
                  min="1"
                  max="12"
                  className={`input input-bordered w-full ${errors.semester_number ? 'input-error' : ''}`}
                />
                {errors.semester_number && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.semester_number}</span>
                  </label>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Start Date <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.start_date ? 'input-error' : ''}`}
                />
                {errors.start_date && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.start_date}</span>
                  </label>
                )}
              </div>

              {/* End Date */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    End Date <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={`input input-bordered w-full ${errors.end_date ? 'input-error' : ''}`}
                />
                {errors.end_date && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.end_date}</span>
                  </label>
                )}
              </div>
            </div>

            {/* Is Active */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <div>
                  <span className="label-text font-semibold">Set as Active Semester</span>
                  <p className="text-sm text-gray-500">
                    Make this the current active semester
                  </p>
                </div>
              </label>
            </div>

            {/* Form Actions */}
            <div className="divider"></div>
            <div className="flex justify-end gap-4">
              <Link to="/semesters">
                <button type="button" className="btn btn-ghost">
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <FiSave size={20} />
                    Update Semester
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SemesterEdit;
