import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiAward, FiArrowLeft } from 'react-icons/fi';
import FormInput from '../../components/form/FormInput';
import FormSelect from '../../components/form/FormSelect';
import FormTextarea from '../../components/form/FormTextarea';
import degreeService from '../../services/degreeService';
import departmentService from '../../services/departmentService';

const DegreeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    level: 'Undergraduate',
    duration_years: 4,
    total_credits: '',
    department_id: '',
    description: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDegree, setIsFetchingDegree] = useState(true);
  const [apiError, setApiError] = useState('');
  const [departments, setDepartments] = useState([]);

  // Fetch departments for dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentService.getAllDepartments({ limit: 1000 });
        if (response.success) {
          setDepartments(response.data);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    
    fetchDepartments();
  }, []);

  // Fetch degree details
  useEffect(() => {
    const fetchDegree = async () => {
      setIsFetchingDegree(true);
      setApiError('');
      
      try {
        const response = await degreeService.getDegreeById(id);
        
        if (response.success) {
          const degree = response.data;
          setFormData({
            name: degree.name || '',
            code: degree.code || '',
            level: degree.level || 'Undergraduate',
            duration_years: degree.duration_years || 4,
            total_credits: degree.total_credits || '',
            department_id: degree.department_id || '',
            description: degree.description || '',
          });
        }
      } catch (err) {
        console.error('Error fetching degree:', err);
        setApiError(err.message || 'Failed to load degree details');
      } finally {
        setIsFetchingDegree(false);
      }
    };
    
    if (id) {
      fetchDegree();
    }
  }, [id]);

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
      newErrors.name = 'Degree name is required';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Degree code is required';
    }
    
    if (!formData.level) {
      newErrors.level = 'Degree level is required';
    }
    
    if (!formData.duration_years || formData.duration_years < 1) {
      newErrors.duration_years = 'Duration must be at least 1 year';
    }
    
    if (!formData.department_id) {
      newErrors.department_id = 'Department is required';
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
      const response = await degreeService.updateDegree(id, formData);
      
      if (response.success) {
        // Navigate to degree list
        navigate('/degrees', { 
          state: { message: 'Degree updated successfully' } 
        });
      }
    } catch (error) {
      console.error('Error updating degree:', error);
      setApiError(error.message || 'Failed to update degree');
    } finally {
      setIsLoading(false);
    }
  };

  const levelOptions = [
    { value: 'Undergraduate', label: 'Undergraduate' },
    { value: 'Graduate', label: 'Graduate' },
    { value: 'Postgraduate', label: 'Postgraduate' },
    { value: 'Doctoral', label: 'Doctoral' },
  ];

  const departmentOptions = departments.map(dept => ({
    value: dept.id,
    label: dept.name
  }));

  // Loading state
  if (isFetchingDegree) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
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
            Edit Degree
          </h1>
          <p className="text-gray-600 mt-2">Update degree program information</p>
        </div>
        <Link to="/degrees" className="btn btn-ghost">
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
                label="Degree Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter degree name"
                error={errors.name}
                required
              />
              
              <FormInput
                label="Degree Code"
                name="code"
                type="text"
                value={formData.code}
                onChange={handleChange}
                placeholder="Enter degree code (e.g., BSCS, MSIT)"
                error={errors.code}
                required
              />
              
              <FormSelect
                label="Level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                options={levelOptions}
                error={errors.level}
                required
              />
              
              <FormSelect
                label="Department"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                options={departmentOptions}
                error={errors.department_id}
                placeholder="Select Department"
                required
              />
            </div>
          </div>

          {/* Program Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Program Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Duration (Years)"
                name="duration_years"
                type="number"
                value={formData.duration_years}
                onChange={handleChange}
                placeholder="Enter duration in years"
                error={errors.duration_years}
                min="1"
                required
              />
              
              <FormInput
                label="Total Credits"
                name="total_credits"
                type="number"
                value={formData.total_credits}
                onChange={handleChange}
                placeholder="Enter total credits"
                error={errors.total_credits}
              />
              
              <div className="md:col-span-2">
                <FormTextarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter degree description"
                  error={errors.description}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Link to="/degrees" className="btn btn-ghost">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating...
                </>
              ) : (
                'Update Degree'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DegreeEdit;
