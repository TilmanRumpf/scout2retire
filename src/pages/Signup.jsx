import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../utils/authUtils';
import toast from 'react-hot-toast';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Error states
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const navigate = useNavigate();

  // Basic email format validation (same as Login)
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

  // Enhanced password validation with strength indicator
  const validatePassword = (password) => {
    const cleanPassword = password.trim();
    
    if (!cleanPassword) {
      return { valid: false, error: 'Password is required', strength: 0 };
    }
    
    if (cleanPassword.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters', strength: 1 };
    }
    
    // Calculate password strength
    let strength = 2; // Basic (8+ chars)
    
    // Check for uppercase letter
    if (/[A-Z]/.test(cleanPassword)) strength++;
    
    // Check for number
    if (/[0-9]/.test(cleanPassword)) strength++;
    
    // Check for special character
    if (/[^A-Za-z0-9]/.test(cleanPassword)) strength++;
    
    return { valid: true, sanitized: cleanPassword, strength: Math.min(strength, 5) };
  };

  // Full name validation
  const validateFullName = (name) => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return { valid: false, error: 'Full name is required' };
    }
    
    if (trimmedName.length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters' };
    }
    
    if (trimmedName.length > 100) {
      return { valid: false, error: 'Name must be less than 100 characters' };
    }
    
    // Only allow letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
      return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    
    return { valid: true, sanitized: trimmedName };
  };

  // Basic input sanitization to prevent XSS (same as Login)
  const sanitizeInput = (input) => {
    return input
      .replace(/[<>]/g, '') // Remove < and > to prevent script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  };

  // Get password strength label and color
  const getPasswordStrength = (strength) => {
    const strengthLevels = [
      { label: '', color: '' },
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-green-500' }
    ];
    return strengthLevels[strength] || strengthLevels[0];
  };

  // Input handlers with real-time validation
  const handleFullNameChange = (e) => {
    const value = e.target.value;
    setFullName(value);
    if (fullNameError) setFullNameError('');
  };

  const handleFullNameBlur = () => {
    if (fullName) {
      const validation = validateFullName(fullName);
      if (!validation.valid) {
        setFullNameError(validation.error);
      }
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) setEmailError('');
  };

  const handleEmailBlur = () => {
    if (email) {
      const validation = validateEmail(email);
      if (!validation.valid) {
        setEmailError(validation.error);
      }
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear error only if password meets minimum requirements
    if (value.length >= 8 && passwordError) {
      setPasswordError('');
    }
    
    // Check confirm password match in real-time
    if (confirmPassword && value === confirmPassword) {
      setConfirmPasswordError('');
    } else if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    // Real-time password match validation
    if (value && password && value !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else if (value && password && value === password) {
      setConfirmPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate full name
    const nameValidation = validateFullName(fullName);
    if (!nameValidation.valid) {
      setFullNameError(nameValidation.error);
      return;
    }
    
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
    
    // Validate password confirmation
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return;
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }
    
    // Sanitize inputs
    const sanitizedName = sanitizeInput(nameValidation.sanitized);
    const sanitizedEmail = sanitizeInput(emailValidation.sanitized);
    const sanitizedPassword = sanitizeInput(passwordValidation.sanitized);
    
    setLoading(true);
    
    try {
      const currentYear = new Date().getFullYear();
      const retirementYear = currentYear + 5; // Default to 5 years from now
      
      const { success, reason, error, user } = await signUp(
        sanitizedEmail,
        sanitizedPassword,
        sanitizedName,
        'usa', // Default nationality
        retirementYear
      );
      
      if (success) {
        toast.success('Account created successfully!');
        navigate('/onboarding/status');
      } else if (reason === 'already_exists') {
        toast.error('This email is already registered. Please log in instead.');
      } else {
        toast.error(`Signup failed: ${error?.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error(`An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate password strength for display
  const passwordStrength = password ? validatePassword(password).strength || 0 : 0;
  const strengthInfo = getPasswordStrength(passwordStrength);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-800 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 hover:text-green-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={handleFullNameChange}
                  onBlur={handleFullNameBlur}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    fullNameError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                />
                {fullNameError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fullNameError}</p>
                )}
              </div>
            </div>

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
                  onBlur={handleEmailBlur}
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
                  autoComplete="new-password"
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
                {password && !passwordError && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength <= 2 ? 'text-red-600 dark:text-red-400' :
                        passwordStrength === 3 ? 'text-yellow-600 dark:text-yellow-400' :
                        passwordStrength === 4 ? 'text-blue-600 dark:text-blue-400' :
                        'text-green-600 dark:text-green-400'
                      }`}>
                        {strengthInfo.label}
                      </span>
                    </div>
                    <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Tip: Use uppercase, numbers, and special characters for a stronger password
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    confirmPasswordError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                />
                {confirmPasswordError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{confirmPasswordError}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}