import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';

/**
 * useLogin Hook
 * Handles user login functionality
 * @returns {Object} Login state and methods
 */
const useLogin = () => {
  const navigate = useNavigate();
  const { login: loginStore, setLoading, setError } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setErrorState] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Login user with credentials
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.identifier - Email or username
   * @param {string} credentials.password - Password
   * @param {boolean} credentials.rememberMe - Remember me option
   * @param {Object} options - Additional options
   * @param {string} options.redirectTo - Path to redirect after login
   * @param {Function} options.onSuccess - Callback on successful login
   * @param {Function} options.onError - Callback on login error
   */
  const login = useCallback(async (credentials, options = {}) => {
    const {
      redirectTo = '/dashboard',
      onSuccess,
      onError,
    } = options;

    try {
      setIsLoading(true);
      setErrorState(null);
      setLoading(true);
      setError(null);

      // Call login API
      const response = await authService.login({
        identifier: credentials.identifier,
        password: credentials.password,
      });

      if (response.success) {
        const { user, token } = response.data;
        
        // Store in auth store
        loginStore(user, token);
        
        // Handle remember me
        if (credentials.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

        setSuccess(true);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        // Redirect to specified path
        setTimeout(() => {
          navigate(redirectTo);
        }, 100);

        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Login failed';
        setErrorState(errorMessage);
        setError(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }

        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during login';
      
      setErrorState(errorMessage);
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }

      console.error('Login error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [navigate, loginStore, setLoading, setError]);

  /**
   * Login with email
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Remember me option
   * @param {Object} options - Additional options
   */
  const loginWithEmail = useCallback(async (email, password, rememberMe = false, options = {}) => {
    return login({ identifier: email, password, rememberMe }, options);
  }, [login]);

  /**
   * Login with username
   * @param {string} username - Username
   * @param {string} password - User password
   * @param {boolean} rememberMe - Remember me option
   * @param {Object} options - Additional options
   */
  const loginWithUsername = useCallback(async (username, password, rememberMe = false, options = {}) => {
    return login({ identifier: username, password, rememberMe }, options);
  }, [login]);

  /**
   * Clear login error
   */
  const clearError = useCallback(() => {
    setErrorState(null);
    setError(null);
  }, [setError]);

  /**
   * Reset login state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setErrorState(null);
    setSuccess(false);
  }, []);

  return {
    // State
    isLoading,
    error,
    success,
    
    // Methods
    login,
    loginWithEmail,
    loginWithUsername,
    clearError,
    reset,
  };
};

export default useLogin;
