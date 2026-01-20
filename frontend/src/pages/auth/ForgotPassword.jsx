import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../../components/form/FormInput';
import authService from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate email
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600">
            We've sent a password reset link to{' '}
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Please check your email and click on the reset link to create a new password.
            The link will expire in 1 hour.
          </p>
        </div>

        <div className="space-y-3">
          <Link to="/login" className="btn btn-primary w-full">
            Back to Login
          </Link>
          
          <button
            onClick={() => {
              setIsSuccess(false);
              setEmail('');
            }}
            className="btn btn-ghost w-full"
          >
            Try Another Email
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>
            Didn't receive the email?{' '}
            <button
              onClick={() => {
                setIsSuccess(false);
                handleSubmit({ preventDefault: () => {} });
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
            >
              Resend
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
        <p className="text-gray-600 mt-2">
          No worries, we'll send you reset instructions
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={email}
          onChange={handleChange}
          placeholder="Enter your email address"
          error={error}
          required
          autoFocus
        />

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner"></span>
              Sending...
            </>
          ) : (
            'Send Reset Link'
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

      {/* Info Box */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> For security reasons, we don't disclose whether an email exists in our system.
          If you don't receive an email within a few minutes, please check your spam folder or contact support.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
