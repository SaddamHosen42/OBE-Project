import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import FormInput from '../../components/form/FormInput';
import FormSelect from '../../components/form/FormSelect';
import FormDatePicker from '../../components/form/FormDatePicker';
import userService from '../../services/userService';

const UserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: '',
    phone: '',
    dob: '',
    nationality: '',
    nid_no: '',
    blood_group: '',
    profile_image: '',
    password: '', // Optional for update
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [apiError, setApiError] = useState('');

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userService.getUserById(id);
        
        if (response.success) {
          const user = response.data;
          setFormData({
            name: user.name || '',
            email: user.email || '',
            username: user.username || '',
            role: user.role || '',
            phone: user.phone || '',
            dob: user.dob || '',
            nationality: user.nationality || '',
            nid_no: user.nid_no || '',
            blood_group: user.blood_group || '',
            profile_image: user.profile_image || '',
            password: '',
            confirmPassword: '',
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setApiError(error.message || 'Failed to load user data');
      } finally {
        setIsFetching(false);
      }
    };
    
    if (id) {
      fetchUser();
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
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    // Password validation (only if provided)
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
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
      // Prepare data (remove confirmPassword and password if empty)
      const { confirmPassword, password, ...userData } = formData;
      
      // Only include password if it's being changed
      if (password && password.trim()) {
        userData.password = password;
      }
      
      const response = await userService.updateUser(id, userData);
      
      if (response.success) {
        // Navigate to user list
        navigate('/users', { 
          state: { message: 'User updated successfully' } 
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setApiError(error.message || 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  // Role options
  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'student', label: 'Student' },
    { value: 'staff', label: 'Staff' },
  ];

  // Blood group options
  const bloodGroupOptions = [
    { value: '', label: 'Select Blood Group' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
  ];

  // Loading state
  if (isFetching) {
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
            <FiSave className="mr-3 text-blue-600" size={36} />
            Edit User
          </h1>
          <p className="text-gray-600 mt-2">Update user information</p>
        </div>
        <Link to="/users" className="btn btn-ghost">
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
                label="Full Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                error={errors.name}
                required
              />
              
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                error={errors.email}
                required
              />
              
              <FormInput
                label="Username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                error={errors.username}
                required
              />
              
              <FormSelect
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={roleOptions}
                error={errors.role}
                required
              />
            </div>
          </div>

          {/* Change Password (Optional) */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Change Password (Optional)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Leave blank if you don't want to change the password
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="New Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                error={errors.password}
                helperText="Minimum 8 characters"
              />
              
              <FormInput
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                error={errors.confirmPassword}
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
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                error={errors.phone}
              />
              
              <FormInput
                label="Profile Image URL"
                name="profile_image"
                type="url"
                value={formData.profile_image}
                onChange={handleChange}
                placeholder="Enter image URL (optional)"
                error={errors.profile_image}
              />
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormDatePicker
                label="Date of Birth"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                error={errors.dob}
              />
              
              <FormInput
                label="Nationality"
                name="nationality"
                type="text"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="Enter nationality"
                error={errors.nationality}
              />
              
              <FormInput
                label="National ID Number"
                name="nid_no"
                type="text"
                value={formData.nid_no}
                onChange={handleChange}
                placeholder="Enter NID number"
                error={errors.nid_no}
              />
              
              <FormSelect
                label="Blood Group"
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                options={bloodGroupOptions}
                error={errors.blood_group}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Link to="/users" className="btn btn-ghost">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEdit;
