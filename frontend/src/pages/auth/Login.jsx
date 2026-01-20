import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../../components/form/FormInput';
import FormCheckbox from '../../components/form/FormCheckbox';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
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
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const response = await authService.login({
        identifier: formData.identifier,
        password: formData.password,
      });
      
      if (response.success) {
        // Store user data and token in auth store
        login(response.data.user, response.data.token);
        
        // Store refresh token if remember me is checked
        if (formData.rememberMe && response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Email or Username"
          name="identifier"
          type="text"
          value={formData.identifier}
          onChange={handleChange}
          placeholder="Enter your email or username"
          error={errors.identifier}
          required
          autoFocus
        />

        <FormInput
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          error={errors.password}
          required
        />

        <div className="flex items-center justify-between">
          <FormCheckbox
            label="Remember me"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />

          <Link 
            to="/forgot-password" 
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner"></span>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Development Mode Indicator */}
      {import.meta.env.DEV && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800 font-mono">
            <strong>Dev Mode:</strong> Use any registered credentials to login
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
