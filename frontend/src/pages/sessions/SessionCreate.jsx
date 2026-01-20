import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiCalendar, FiArrowLeft, FiSave } from 'react-icons/fi';
import sessionService from '../../services/sessionService';

const SessionCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    session_name: '',
    start_date: '',
    end_date: '',
    is_active: false,
  });

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

    if (!formData.session_name.trim()) {
      newErrors.session_name = 'Session name is required';
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
      const response = await sessionService.createSession(formData);

      if (response.success) {
        alert('Academic session created successfully!');
        navigate('/sessions');
      }
    } catch (err) {
      console.error('Error creating session:', err);
      alert(err.message || 'Failed to create academic session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/sessions" className="btn btn-ghost btn-sm mb-4">
          <FiArrowLeft size={20} />
          Back to Sessions
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FiCalendar className="text-indigo-600" />
          Create Academic Session
        </h1>
        <p className="text-gray-600 mt-2">Add a new academic session/year</p>
      </div>

      {/* Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Session Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                name="session_name"
                value={formData.session_name}
                onChange={handleChange}
                placeholder="e.g., 2024-2025, Fall 2024"
                className={`input input-bordered w-full ${errors.session_name ? 'input-error' : ''}`}
              />
              {errors.session_name && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.session_name}</span>
                </label>
              )}
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
                  <span className="label-text font-semibold">Set as Active Session</span>
                  <p className="text-sm text-gray-500">
                    Make this the current active academic session
                  </p>
                </div>
              </label>
            </div>

            {/* Form Actions */}
            <div className="divider"></div>
            <div className="flex justify-end gap-4">
              <Link to="/sessions">
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
                    Create Session
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

export default SessionCreate;
