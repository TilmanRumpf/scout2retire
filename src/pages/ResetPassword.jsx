import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  
  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const navigate = useNavigate();

  // Check if we have a recovery token in the URL (user came from email link)
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    
    if (type === 'recovery' && accessToken) {
      setIsRecoveryMode(true);
    }
  }, []);

  // Email validation (same as Login/Signup)
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

  // Password validation with strength indicator (same as Signup)
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
    
    if (/[A-Z]/.test(cleanPassword)) strength++;
    if (/[0-9]/.test(cleanPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(cleanPassword)) strength++;
    
    return { valid: true, sanitized: cleanPassword, strength: Math.min(strength, 5) };
  };

  // Basic input sanitization
  const sanitizeInput = (input) => {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  // Get password strength label and color
  const getPasswordStrength = (strength) => {
    const strengthLevels = [
      { label: '', color: '' },
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: uiConfig.progress.high }
    ];
    return strengthLevels[strength] || strengthLevels[0];
  };

  // Input handlers
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
    
    if (value.length >= 8 && passwordError) {
      setPasswordError('');
    }
    
    if (confirmPassword && value === confirmPassword) {
      setConfirmPasswordError('');
    } else if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (value && password && value !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else if (value && password && value === password) {
      setConfirmPasswordError('');
    }
  };

  // Handle sending reset email (Step 1)
  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error);
      return;
    }
    
    const sanitizedEmail = sanitizeInput(emailValidation.sanitized);
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        setEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle updating password (Step 2)
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
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
    
    const sanitizedPassword = sanitizeInput(passwordValidation.sanitized);
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: sanitizedPassword
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password updated successfully! Please log in with your new password.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Update password error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate password strength for display
  const passwordStrength = password ? validatePassword(password).strength || 0 : 0;
  const strengthInfo = getPasswordStrength(passwordStrength);

  // Render recovery mode (Step 2 - new password form)
  if (isRecoveryMode) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 ${uiConfig.colors.statusSuccess} rounded-full flex items-center justify-center`}>
              <Lock className={`w-8 h-8 ${uiConfig.colors.accent}`} />
            </div>
          </div>
          <h2 className={`text-center text-3xl font-bold ${uiConfig.colors.heading}`}>
            Set new password
          </h2>
          <p className={`mt-2 text-center text-sm ${uiConfig.colors.hint}`}>
            Please enter your new password below
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className={`${uiConfig.colors.card} py-8 px-4 shadow sm:rounded-lg sm:px-10`}>
            <form className="space-y-6" onSubmit={handleUpdatePassword}>
              <div>
                <label htmlFor="password" className={`${uiConfig.components.label}`}>
                  New Password
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
                      passwordError ? uiConfig.colors.borderDanger : uiConfig.colors.border
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none ${uiConfig.colors.focusRing} ${uiConfig.colors.input} ${uiConfig.colors.body} sm:text-sm`}
                  />
                  {passwordError && (
                    <p className={`mt-2 text-sm ${uiConfig.colors.error}`}>{passwordError}</p>
                  )}
                  {password && !passwordError && (
                    <div className={`mt-2 p-3 ${uiConfig.colors.page.replace('min-h-screen ', '')} rounded-md`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className={uiConfig.colors.hint}>Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength <= 2 ? uiConfig.colors.error :
                          passwordStrength === 3 ? 'text-yellow-600 dark:text-yellow-400' :
                          passwordStrength === 4 ? 'text-blue-600 dark:text-blue-400' :
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
                      <p className={`mt-2 text-xs ${uiConfig.colors.hint}`}>
                        Tip: Use uppercase, numbers, and special characters for a stronger password
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`${uiConfig.components.label}`}>
                  Confirm New Password
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
                      confirmPasswordError ? uiConfig.colors.borderDanger : uiConfig.colors.border
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none ${uiConfig.colors.focusRing} ${uiConfig.colors.input} ${uiConfig.colors.body} sm:text-sm`}
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
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${uiConfig.components.buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Updating password...' : 'Update password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Render email sent success state
  if (emailSent) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className={`${uiConfig.colors.card} py-8 px-4 shadow sm:rounded-lg sm:px-10`}>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 ${uiConfig.colors.statusSuccess} rounded-full flex items-center justify-center`}>
                  <Mail className={`w-8 h-8 ${uiConfig.colors.accent}`} />
                </div>
              </div>
              <h2 className={`text-2xl font-bold ${uiConfig.colors.heading} mb-4`}>
                Check your email
              </h2>
              <p className={`${uiConfig.colors.body} mb-6`}>
                We've sent password reset instructions to:
                <br />
                <span className={`font-medium ${uiConfig.colors.heading}`}>{email}</span>
              </p>
              <p className={`text-sm ${uiConfig.colors.hint} mb-8`}>
                Please check your inbox and follow the link to reset your password. 
                The link will expire in 1 hour.
              </p>
              <Link
                to="/login"
                className={`inline-flex items-center gap-2 ${uiConfig.colors.accent} hover:opacity-80 font-medium`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render initial email input form (Step 1)
  return (
    <div className={`min-h-screen ${uiConfig.colors.page} flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className={`text-center text-3xl font-bold ${uiConfig.colors.heading}`}>
          Reset your password
        </h2>
        <p className={`mt-2 text-center text-sm ${uiConfig.colors.hint}`}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`${uiConfig.colors.card} py-8 px-4 shadow sm:rounded-lg sm:px-10`}>
          <form className="space-y-6" onSubmit={handleSendResetEmail}>
            <div>
              <label htmlFor="email" className={`${uiConfig.components.label}`}>
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
                    emailError ? uiConfig.colors.borderDanger : uiConfig.colors.border
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none ${uiConfig.colors.focusRing} ${uiConfig.colors.input} ${uiConfig.colors.body} sm:text-sm`}
                  placeholder="Enter your email"
                />
                {emailError && (
                  <p className={`mt-2 text-sm ${uiConfig.colors.error}`}>{emailError}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${uiConfig.components.buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Sending...' : 'Send reset instructions'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className={`inline-flex items-center gap-2 text-sm ${uiConfig.colors.accent} hover:opacity-80 font-medium`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}