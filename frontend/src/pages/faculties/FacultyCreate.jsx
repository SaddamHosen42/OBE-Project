import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiBookOpen, FiArrowLeft } from 'react-icons/fi';
import FormInput from '../../components/form/FormInput';
import FormTextarea from '../../components/form/FormTextarea';
import FormDatePicker from '../../components/form/FormDatePicker';
import facultyService from '../../services/facultyService';

const FacultyCreate = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    established_date: '',
    location: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    description: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // Clear API error when user starts typing
    if (apiError) {
      setApiError('');
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Faculty name is required';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Faculty code is required';
    }
    
    // Email validation (if provided)
    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await facultyService.createFaculty(formData);
      
      if (response.success) {
        // Navigate to faculty list
        navigate('/faculties', { 
          state: { message: 'Faculty created successfully' } 
        });
      }
    } catch (error) {
      console.error('Error creating faculty:', error);
      setApiError(error.message || 'Failed to create faculty');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FiBookOpen className="mr-3 text-purple-600" size={36} />
            Create New Faculty
          </h1>
          <p className="text-gray-600 mt-2">Add a new faculty to the institution</p>
        </div>
        <Link to="/faculties" className="btn btn-ghost">
          <FiArrowLeft size={20} />
          Back to List
        </Link>
      </div>

      {/* API Error Alert */}
      {apiError && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Faculty Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter faculty name"
                error={errors.name}
                required
              />
              
              <FormInput
                label="Faculty Code"
                name="code"
                type="text"
                value={formData.code}
                onChange={handleChange}
                placeholder="Enter faculty code (e.g., FSE, FBA)"
                error={errors.code}
                required
              />
              
              <FormDatePicker
                label="Established Date"
                name="established_date"
                value={formData.established_date}
                onChange={handleChange}
                error={errors.established_date}
              />
              
              <FormInput
                label="Location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                error={errors.location}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Contact Email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="Enter contact email"
                error={errors.contact_email}
              />
              
              <FormInput
                label="Contact Phone"
                name="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="Enter contact phone"
                error={errors.contact_phone}
              />
              
              <div className="md:col-span-2">
                <FormInput
                  label="Website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Enter website URL"
                  error={errors.website}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Description
            </h2>
            <FormTextarea
              label="Faculty Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter faculty description"
              error={errors.description}
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Link to="/faculties" className="btn btn-ghost">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <FiBookOpen size={20} />
                  Create Faculty
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyCreate;
