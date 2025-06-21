import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../utils/authUtils';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';

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
      { label: 'Very Weak', color: uiConfig.progress.low },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: uiConfig.progress.medium },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: uiConfig.progress.high }
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
    <div className={`min-h-screen ${uiConfig.colors.page} flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className={`text-center text-3xl font-bold ${uiConfig.colors.heading}`}>
          Create your account
        </h2>
        <p className={`mt-2 text-center text-sm ${uiConfig.colors.hint}`}>
          Already have an account?{' '}
          <Link to="/login" className={`${uiConfig.colors.accent} hover:opacity-80`}>
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`${uiConfig.colors.card} py-8 px-4 shadow sm:rounded-lg sm:px-10`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className={uiConfig.components.label}>
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
                  className={`${uiConfig.components.input} ${
                    fullNameError ? uiConfig.colors.borderDanger : ''
                  }`}
                />
                {fullNameError && (
                  <p className={`mt-2 text-sm ${uiConfig.colors.error}`}>{fullNameError}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className={uiConfig.components.label}>
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className={`${uiConfig.components.input} ${
                    passwordError ? uiConfig.colors.borderDanger : ''
                  }`}
                />
                {passwordError && (
                  <p className={`mt-2 text-sm ${uiConfig.colors.error}`}>{passwordError}</p>
                )}
                {password && !passwordError && (
                  <div className={`mt-2 p-3 ${uiConfig.colors.input} rounded-md`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className={uiConfig.colors.hint}>Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength <= 2 ? uiConfig.colors.error :
                        passwordStrength === 3 ? uiConfig.financial.highlight :
                        passwordStrength === 4 ? uiConfig.notifications.info :
                        uiConfig.colors.success
                      }`}>
                        {strengthInfo.label}
                      </span>
                    </div>
                    <div className={`mt-2 h-3 ${uiConfig.progress.track} rounded-full overflow-hidden`}>
                      <div
                        className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <p className={`mt-2 text-xs ${uiConfig.colors.muted}`}>
                      Tip: Use uppercase, numbers, and special characters for a stronger password
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={uiConfig.components.label}>
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
                  className={`${uiConfig.components.input} ${
                    confirmPasswordError ? uiConfig.colors.borderDanger : ''
                  }`}
                />
                {confirmPasswordError && (
                  <p className={`mt-2 text-sm ${uiConfig.colors.error}`}>{confirmPasswordError}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${uiConfig.components.buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
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