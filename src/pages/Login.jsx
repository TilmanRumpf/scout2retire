// src/pages/Login.jsx
// Fixed 10JUN25: Updated navigation to use /onboarding/progress
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../utils/authUtils';
import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(true); // Default to checked
  const navigate = useNavigate();
  
  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('scout2retire_last_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

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
      const { success, user, error } = await signIn(sanitizedEmail, sanitizedPassword);
      
      if (success && user) {
        toast.success('Logged in successfully!');
        
        // Save email if Remember Me is checked
        if (rememberMe) {
          localStorage.setItem('scout2retire_last_email', sanitizedEmail);
        } else {
          localStorage.removeItem('scout2retire_last_email');
        }
        
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
    <div className={`min-h-screen ${uiConfig.colors.page} flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${uiConfig.colors.heading}`}>
          Sign in to your account
        </h2>
        <p className={`mt-2 text-center text-sm ${uiConfig.colors.hint}`}>
          Don't have an account?{' '}
          <Link to="/signup" className={`font-medium ${uiConfig.colors.accent} hover:opacity-80`}>
            Create one
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`${uiConfig.colors.card} py-8 px-4 shadow sm:rounded-lg sm:px-10`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className={uiConfig.components.label}>
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="your@email.com"
                  className={`${uiConfig.components.input} ${
                    emailError ? uiConfig.colors.borderDanger : ''
                  }`}
                />
                {emailError && (
                  <p className={`mt-2 text-sm ${uiConfig.colors.error}`}>{emailError}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className={uiConfig.components.label}>
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password webauthn"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className={`${uiConfig.components.input} ${
                    passwordError ? uiConfig.colors.borderDanger : ''
                  }`}
                />
                {passwordError && (
                  <p className={`mt-2 text-sm ${uiConfig.colors.error}`}>{passwordError}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-scout-accent-600 focus:ring-scout-accent-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/reset-password" className={`font-medium ${uiConfig.colors.accent} hover:opacity-80`}>
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${uiConfig.components.buttonPrimary} disabled:opacity-50`}
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