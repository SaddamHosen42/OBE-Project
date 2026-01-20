import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiCalendar, FiEdit, FiSave, FiX } from 'react-icons/fi';
import FormInput from '../../components/form/FormInput';
import FormDatePicker from '../../components/form/FormDatePicker';
import FormSelect from '../../components/form/FormSelect';
import useAuthStore from '../../store/authStore';
import userService from '../../services/userService';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    dob: '',
    nationality: '',
    nid_no: '',
    blood_group: '',
    profile_image: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load current user data
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        dob: currentUser.dob || '',
        nationality: currentUser.nationality || '',
        nid_no: currentUser.nid_no || '',
        blood_group: currentUser.blood_group || '',
        profile_image: currentUser.profile_image || '',
      });
    }
  }, [currentUser]);

  // Handle profile data change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    if (apiError) {
      setApiError('');
    }
  };

  // Handle password data change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    if (apiError) {
      setApiError('');
    }
  };

  // Validate profile form
  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    
    if (!passwordData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');
    
    if (!validateProfileForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await userService.updateProfile(profileData);
      
      if (response.success) {
        // Update user in auth store
        setUser(response.data);
        
        setSuccessMessage('Profile updated successfully');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setApiError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await userService.updateProfile({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      
      if (response.success) {
        setSuccessMessage('Password changed successfully');
        setIsChangingPassword(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setApiError(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-warning">
          <span>Please log in to view your profile</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FiUser className="mr-3 text-blue-600" size={36} />
          My Profile
        </h1>
        <p className="text-gray-600 mt-2">Manage your account information</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* API Error */}
      {apiError && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        {/* Profile Header */}
        <div className="bg-linear-to-r from-blue-500 to-indigo-600 p-8 rounded-t-lg">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden">
              {currentUser.profile_image ? (
                <img src={currentUser.profile_image} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-blue-600">
                  {currentUser.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{currentUser.name}</h2>
              <p className="text-blue-100 flex items-center mt-1">
                <FiMail size={16} className="mr-2" />
                {currentUser.email}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                {currentUser.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-sm btn-outline btn-primary"
              >
                <FiEdit size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Full Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  error={errors.name}
                  required
                />
                
                <FormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  error={errors.phone}
                />
                
                <FormDatePicker
                  label="Date of Birth"
                  name="dob"
                  value={profileData.dob}
                  onChange={handleProfileChange}
                  error={errors.dob}
                />
                
                <FormInput
                  label="Nationality"
                  name="nationality"
                  value={profileData.nationality}
                  onChange={handleProfileChange}
                  error={errors.nationality}
                />
                
                <FormInput
                  label="National ID Number"
                  name="nid_no"
                  value={profileData.nid_no}
                  onChange={handleProfileChange}
                  error={errors.nid_no}
                />
                
                <FormSelect
                  label="Blood Group"
                  name="blood_group"
                  value={profileData.blood_group}
                  onChange={handleProfileChange}
                  options={bloodGroupOptions}
                  error={errors.blood_group}
                />
                
                <div className="md:col-span-2">
                  <FormInput
                    label="Profile Image URL"
                    name="profile_image"
                    type="url"
                    value={profileData.profile_image}
                    onChange={handleProfileChange}
                    error={errors.profile_image}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setErrors({});
                    setApiError('');
                  }}
                  className="btn btn-ghost"
                >
                  <FiX size={20} />
                  Cancel
                </button>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Username</label>
                <p className="text-gray-900 font-medium">@{currentUser.username}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900 font-medium">{currentUser.phone || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900 font-medium">{currentUser.dob || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Nationality</label>
                <p className="text-gray-900 font-medium">{currentUser.nationality || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">National ID</label>
                <p className="text-gray-900 font-medium">{currentUser.nid_no || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Blood Group</label>
                <p className="text-gray-900 font-medium">{currentUser.blood_group || 'Not provided'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Security</h3>
            <p className="text-sm text-gray-600 mt-1">Change your password</p>
          </div>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="btn btn-sm btn-outline btn-secondary"
            >
              Change Password
            </button>
          )}
        </div>

        {isChangingPassword && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <FormInput
              label="Current Password"
              name="current_password"
              type="password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              error={errors.current_password}
              required
            />
            
            <FormInput
              label="New Password"
              name="new_password"
              type="password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              error={errors.new_password}
              helperText="Minimum 8 characters"
              required
            />
            
            <FormInput
              label="Confirm New Password"
              name="confirm_password"
              type="password"
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
              error={errors.confirm_password}
              required
            />

            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                  });
                  setErrors({});
                  setApiError('');
                }}
                className="btn btn-ghost"
              >
                <FiX size={20} />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiSave size={20} />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
