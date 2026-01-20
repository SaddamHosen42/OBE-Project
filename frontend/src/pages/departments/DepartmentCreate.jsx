import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiLayers, FiArrowLeft } from 'react-icons/fi';
import FormInput from '../../components/form/FormInput';
import FormTextarea from '../../components/form/FormTextarea';
import FormDatePicker from '../../components/form/FormDatePicker';
import FormSelect from '../../components/form/FormSelect';
import departmentService from '../../services/departmentService';
import facultyService from '../../services/facultyService';

const DepartmentCreate = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    faculty_id: '',
    established_date: '',
    location: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    description: '',
  });
  
  const [faculties, setFaculties] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingFaculties, setIsFetchingFaculties] = useState(true);
  const [apiError, setApiError] = useState('');

  // Fetch faculties for dropdown
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await facultyService.getAllFaculties({ limit: 100 });
        if (response.success) {
          setFaculties(response.data);
        }
      } catch (error) {
        console.error('Error fetching faculties:', error);
      } finally {
        setIsFetchingFaculties(false);
      }
    };

    fetchFaculties();
  }, []);

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
      newErrors.name = 'Department name is required';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Department code is required';
    }

    if (!formData.faculty_id) {
      newErrors.faculty_id = 'Faculty is required';
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
      const response = await departmentService.createDepartment(formData);
      
      if (response.success) {
        // Navigate to department list
        navigate('/departments', { 
          state: { message: 'Department created successfully' } 
        });
      }
    } catch (error) {
      console.error('Error creating department:', error);
      setApiError(error.message || 'Failed to create department');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Department</h1>
          <p className="text-gray-600">Add a new department to the system</p>
        </div>
        <Link to="/departments" className="btn btn-ghost">
          <FiArrowLeft size={20} />
          Back to List
        </Link>
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      {/* Form */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department Name */}
              <FormInput
                label="Department Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                placeholder="e.g., Computer Science"
              />

              {/* Department Code */}
              <FormInput
                label="Department Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                error={errors.code}
                required
                placeholder="e.g., CS"
              />

              {/* Faculty */}
              <FormSelect
                label="Faculty"
                name="faculty_id"
                value={formData.faculty_id}
                onChange={handleChange}
                error={errors.faculty_id}
                required
                disabled={isFetchingFaculties}
              >
                <option value="">Select Faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </FormSelect>

              {/* Established Date */}
              <FormDatePicker
                label="Established Date"
                name="established_date"
                value={formData.established_date}
                onChange={handleChange}
                error={errors.established_date}
              />

              {/* Location */}
              <FormInput
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                error={errors.location}
                placeholder="e.g., Building A, 3rd Floor"
              />

              {/* Contact Email */}
              <FormInput
                label="Contact Email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
                error={errors.contact_email}
                placeholder="e.g., dept@university.edu"
              />

              {/* Contact Phone */}
              <FormInput
                label="Contact Phone"
                name="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={handleChange}
                error={errors.contact_phone}
                placeholder="e.g., +1234567890"
              />

              {/* Website */}
              <FormInput
                label="Website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                error={errors.website}
                placeholder="e.g., https://www.example.edu/dept"
              />
            </div>

            {/* Description */}
            <div className="mt-6">
              <FormTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
                rows={4}
                placeholder="Enter department description..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 mt-8">
              <Link to="/departments" className="btn btn-ghost">
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
                    <FiLayers size={20} />
                    Create Department
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

export default DepartmentCreate;
