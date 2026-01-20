import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import FormInput from '../../components/form/FormInput';
import authService from '../../services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    // Check if token exists in URL
    if (!token) {
      setIsTokenValid(false);
      setApiError('Invalid or missing reset token');
    }
  }, [token]);

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

  const validateForm = () => {
    const newErrors = {};
    
    // Password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter';
    } else if (!/\d/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one special character';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authService.resetPassword({
        token,
        newPassword: formData.newPassword,
      });
      
      if (response.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.status === 400 && error.message.includes('expired')) {
        setApiError('Reset link has expired. Please request a new one.');
        setIsTokenValid(false);
      } else if (error.status === 400 && error.message.includes('invalid')) {
        setApiError('Invalid reset token. Please request a new one.');
        setIsTokenValid(false);
      } else {
        setApiError(error.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
          <p className="text-gray-600">
            Your password has been successfully reset.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            You can now log in with your new password. Redirecting to login page...
          </p>
        </div>

        <Link to="/login" className="btn btn-primary w-full">
          Go to Login
        </Link>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600">
            {apiError || 'This password reset link is invalid or has expired.'}
          </p>
        </div>

        <div className="space-y-3">
          <Link to="/forgot-password" className="btn btn-primary w-full">
            Request New Reset Link
          </Link>
          
          <Link to="/login" className="btn btn-ghost w-full">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
        <p className="text-gray-600 mt-2">
          Please enter your new password
        </p>
      </div>

      {apiError && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="New Password"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="Enter your new password"
          error={errors.newPassword}
          required
          autoFocus
        />

        <FormInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your new password"
          error={errors.confirmPassword}
          required
        />

        {/* Password Requirements */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Password Requirements:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className={formData.newPassword.length >= 8 ? 'text-green-600' : ''}>
              ✓ At least 8 characters
            </li>
            <li className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : ''}>
              ✓ One uppercase letter
            </li>
            <li className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : ''}>
              ✓ One lowercase letter
            </li>
            <li className={/\d/.test(formData.newPassword) ? 'text-green-600' : ''}>
              ✓ One number
            </li>
            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'text-green-600' : ''}>
              ✓ One special character (!@#$%^&*)
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner"></span>
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link 
          to="/login" 
          className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
