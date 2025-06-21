// src/pages/Login.jsx
// Fixed 10JUN25: Updated navigation to use /onboarding/progress
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../utils/authUtils';
import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  // Basic email format validation
  const validateEmail = (email) => {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!trimmedEmail) {
      return { valid: false, error: 'Email is required' };
    }
    
    if (!emailRegex.test(trimmedEmail)) {
      return { valid: false, error: 'Please enter a valid email format' };
    }
    
    return { valid: true, sanitized: trimmedEmail };
  };

  // Basic password validation
  const validatePassword = (password) => {
    // Remove any whitespace
    const cleanPassword = password.trim();
    
    if (!cleanPassword) {
      return { valid: false, error: 'Password is required' };
    }
    
    if (cleanPassword.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' };
    }
    
    return { valid: true, sanitized: cleanPassword };
  };

  // Basic input sanitization to prevent XSS
  const sanitizeInput = (input) => {
    return input
      .replace(/[<>]/g, '') // Remove < and > to prevent script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (emailError) {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear error when user starts typing
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error);
      return;
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.error);
      return;
    }
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(emailValidation.sanitized);
    const sanitizedPassword = sanitizeInput(passwordValidation.sanitized);
    
    setLoading(true);
    
    try {
      const { success, user, session, error } = await signIn(sanitizedEmail, sanitizedPassword);
      
      if (success && user) {
        toast.success('Logged in successfully!');
        
        // Fetch user profile to check onboarding status
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();
        
        if (userError) {
          console.error("Error fetching user data:", userError);
          // Fixed 10JUN25: Changed from /onboarding/status to /onboarding/progress
          navigate('/onboarding/progress'); // Default to onboarding if profile can't be fetched
          return;
        }
        
        // Redirect based on onboarding status
        if (userData.onboarding_completed) {
          navigate('/daily');
        } else {
          // Fixed 10JUN25: Changed from /onboarding/status to /onboarding/progress
          navigate('/onboarding/progress');
        }
      } else {
        toast.error(error?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error('An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-green-600 hover:text-green-500">
            Create one
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    emailError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                />
                {emailError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{emailError}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    passwordError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/reset-password" className="font-medium text-green-600 hover:text-green-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}