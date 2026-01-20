import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiCalendar, FiArrowLeft, FiSave } from 'react-icons/fi';
import api from '../../services/api';

const ReviewCycleCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [degrees, setDegrees] = useState([]);
  const [isLoadingDegrees, setIsLoadingDegrees] = useState(true);
  
  const [formData, setFormData] = useState({
    degree_id: '',
    cycle_name: '',
    start_date: '',
    end_date: '',
    review_type: 'annual',
    status: 'planned',
    description: '',
    summary_report: '',
  });

  // Fetch degrees for dropdown
  useEffect(() => {
    const fetchDegrees = async () => {
      try {
        const response = await api.get('/degrees', { params: { limit: 1000 } });
        if (response.data.success) {
          setDegrees(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching degrees:', err);
      } finally {
        setIsLoadingDegrees(false);
      }
    };

    fetchDegrees();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.degree_id) {
      newErrors.degree_id = 'Degree is required';
    }

    if (!formData.cycle_name.trim()) {
      newErrors.cycle_name = 'Cycle name is required';
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

    if (!formData.review_type) {
      newErrors.review_type = 'Review type is required';
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
    setError('');

    try {
      const response = await api.post('/obe-review-cycles', formData);

      if (response.data.success) {
        navigate('/review-cycles', {
          state: { message: 'Review cycle created successfully' }
        });
      }
    } catch (err) {
      console.error('Error creating review cycle:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create review cycle');
      
      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/review-cycles"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiCalendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Review Cycle</h1>
                <p className="text-sm text-gray-600">Set up a new OBE review cycle</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Degree Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree Program <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="degree_id"
                    value={formData.degree_id}
                    onChange={handleChange}
                    disabled={isLoadingDegrees}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.degree_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a degree program</option>
                    {degrees.map((degree) => (
                      <option key={degree.id} value={degree.id}>
                        {degree.degree_name} - {degree.department_name}
                      </option>
                    ))}
                  </select>
                  {errors.degree_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.degree_id}</p>
                  )}
                </div>

                {/* Cycle Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cycle Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cycle_name"
                    value={formData.cycle_name}
                    onChange={handleChange}
                    placeholder="e.g., Annual Review 2024-2025"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cycle_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.cycle_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.cycle_name}</p>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.start_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.end_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                  )}
                </div>

                {/* Review Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="review_type"
                    value={formData.review_type}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.review_type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="annual">Annual</option>
                    <option value="mid_cycle">Mid-Cycle</option>
                    <option value="comprehensive">Comprehensive</option>
                    <option value="continuous">Continuous</option>
                  </select>
                  {errors.review_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.review_type}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Provide a brief description of this review cycle..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Summary Report */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary Report
                  </label>
                  <textarea
                    name="summary_report"
                    value={formData.summary_report}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Enter summary report details (optional)..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This can be added or updated later
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex items-center justify-end gap-3">
            <Link
              to="/review-cycles"
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 mr-2" />
                  Create Review Cycle
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Review Type Descriptions:</h3>
          <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
            <li><strong>Annual:</strong> Yearly comprehensive review of the program</li>
            <li><strong>Mid-Cycle:</strong> Interim review conducted between major cycles</li>
            <li><strong>Comprehensive:</strong> In-depth review covering all aspects</li>
            <li><strong>Continuous:</strong> Ongoing review process throughout the period</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReviewCycleCreate;
