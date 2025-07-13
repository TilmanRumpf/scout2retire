import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../utils/authUtils';
import { checkUsernameAvailability } from '../utils/userSearchUtils';
import toast from 'react-hot-toast';
import { uiConfig } from '../styles/uiConfig';
import { Camera, Upload, Check, X, AlertCircle } from 'lucide-react';
import InitialsAvatar from '../components/InitialsAvatar';
import supabase from '../utils/supabaseClient';

export default function SignupEnhanced() {
  // Basic fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // New fields
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [useInitialsAvatar, setUseInitialsAvatar] = useState(true);
  const [initialsColorIndex, setInitialsColorIndex] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Error states
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  
  const navigate = useNavigate();

  // Username validation and availability check
  const validateUsername = async (value) => {
    const trimmed = value.trim().toLowerCase();
    
    if (!trimmed) {
      setUsernameError('');
      setUsernameAvailable(null);
      return;
    }
    
    if (trimmed.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setUsernameAvailable(false);
      return;
    }
    
    if (trimmed.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      setUsernameAvailable(false);
      return;
    }
    
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      setUsernameAvailable(false);
      return;
    }
    
    // Check availability
    setCheckingUsername(true);
    setUsernameError('');
    
    try {
      const available = await checkUsernameAvailability(trimmed);
      setUsernameAvailable(available);
      if (!available) {
        setUsernameError('This username is already taken');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError('Error checking username availability');
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
    if (usernameError) setUsernameError('');
    setUsernameAvailable(null);
  };

  const handleUsernameBlur = () => {
    if (username) {
      validateUsername(username);
    }
  };

  // Avatar handling
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setAvatarFile(file);
    setUseInitialsAvatar(false);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setUseInitialsAvatar(true);
  };

  const handleNextColor = () => {
    setInitialsColorIndex((prev) => (prev + 1) % 10);
  };

  // Email validation
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

  // Password validation
  const validatePassword = (password) => {
    const cleanPassword = password.trim();
    
    if (!cleanPassword) {
      return { valid: false, error: 'Password is required', strength: 0 };
    }
    
    if (cleanPassword.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters', strength: 1 };
    }
    
    let strength = 2;
    if (/[A-Z]/.test(cleanPassword)) strength++;
    if (/[0-9]/.test(cleanPassword)) strength++;
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
    
    if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
      return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    
    return { valid: true, sanitized: trimmedName };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const nameValidation = validateFullName(fullName);
    if (!nameValidation.valid) {
      setFullNameError(nameValidation.error);
      return;
    }
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error);
      return;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.error);
      return;
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return;
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }
    
    // Validate username if provided
    if (username && !usernameAvailable) {
      setUsernameError('Please choose an available username');
      return;
    }
    
    
    setLoading(true);
    
    try {
      // Upload avatar if provided
      let avatarUrl = null;
      
      if (avatarFile) {
        // Create a temporary user ID for the avatar upload
        const tempUserId = crypto.randomUUID();
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${tempUserId}/avatar.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });
        
        if (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          toast.error('Failed to upload avatar, but continuing with signup');
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          avatarUrl = publicUrl;
        }
      } else if (useInitialsAvatar) {
        avatarUrl = `initials:${initialsColorIndex}`;
      }
      
      // Placeholder retirement date - actual date will be collected in onboarding
      const placeholderRetirementDate = new Date();
      placeholderRetirementDate.setFullYear(placeholderRetirementDate.getFullYear() + 5);
      
      // Enhanced signup with username and avatar
      // Format location from country, city, and postal code
      let formattedHometown = null;
      const trimmedCountry = country.trim();
      const trimmedCity = city.trim();
      const trimmedPostalCode = postalCode.trim();
      
      if (trimmedCity && trimmedPostalCode && trimmedCountry) {
        // City, postal code, and country provided
        formattedHometown = `${trimmedCity}, ${trimmedPostalCode}, ${trimmedCountry}`;
      } else if (trimmedCity && trimmedCountry) {
        // City and country provided (no postal code)
        formattedHometown = `${trimmedCity}, ${trimmedCountry}`;
      } else if (trimmedCountry) {
        // Only country provided
        formattedHometown = trimmedCountry;
      }
      
      const { success, reason, error, user, session } = await signUp(
        emailValidation.sanitized,
        passwordValidation.sanitized,
        nameValidation.sanitized,
        null, // Nationality will be properly collected in onboarding step 1
        placeholderRetirementDate.toISOString().split('T')[0], // Placeholder - real date collected in onboarding
        formattedHometown,
        username || null,
        avatarUrl
      );
      
      if (success) {
        // If we have a session, ensure it's properly set before navigating
        if (user && !session) {
          // Wait a moment for the session to be established
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Try to get the session one more time
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession) {
            // If still no session, try refreshing
            await supabase.auth.refreshSession();
          }
        }
        
        toast.success('Account created successfully!');
        
        // Small delay to ensure session is propagated through the app
        setTimeout(() => {
          navigate('/onboarding/current-status');
        }, 250);
      } else if (reason === 'already_exists') {
        toast.error('This email is already registered. Please log in instead.');
      } else if (reason === 'username_taken') {
        // Username was taken after auth user was created
        // Clear the username field and re-validate
        setUsername('');
        setUsernameAvailable(null);
        setUsernameError('This username is already taken. Please choose a different one.');
        // The auth user exists but has no profile - they'll need to try again with a different username
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

  const passwordStrength = password ? validatePassword(password).strength || 0 : 0;

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
            {/* Avatar Selection */}
            <div>
              <label className={`block text-center ${uiConfig.components.label} mb-4`}>
                Choose your avatar
              </label>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full overflow-hidden ${uiConfig.colors.card} border-4 border-gray-200 dark:border-gray-700`}>
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <InitialsAvatar 
                        fullName={fullName || 'Your Name'} 
                        size={96} 
                        colorIndex={initialsColorIndex} 
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`absolute bottom-0 right-0 p-1.5 rounded-full ${uiConfig.colors.card} border ${uiConfig.colors.borderLight} shadow-sm`}
                  >
                    <Camera size={16} />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {!avatarPreview && (
                    <button
                      type="button"
                      onClick={handleNextColor}
                      className={`text-xs px-3 py-1 rounded-md ${uiConfig.colors.card} border ${uiConfig.colors.borderLight}`}
                    >
                      Change Color
                    </button>
                  )}
                  
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className={`text-xs px-3 py-1 rounded-md ${uiConfig.colors.card} border ${uiConfig.colors.borderLight} text-red-600`}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name */}
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
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fullNameError) setFullNameError('');
                  }}
                  onBlur={() => {
                    if (fullName) {
                      const validation = validateFullName(fullName);
                      if (!validation.valid) {
                        setFullNameError(validation.error);
                      }
                    }
                  }}
                  className={`${uiConfig.components.input} ${
                    fullNameError ? uiConfig.colors.borderDanger : ''
                  }`}
                />
                {fullNameError && (
                  <p className={`mt-2 text-sm ${uiConfig.colors.error}`}>{fullNameError}</p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className={uiConfig.components.label}>
                Username <span className={`text-sm ${uiConfig.colors.hint} font-normal`}>(optional)</span>
              </label>
              <div className="mt-1">
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    onBlur={handleUsernameBlur}
                    placeholder="johndoe"
                    className={`${uiConfig.components.input} pr-10 ${
                      usernameError ? uiConfig.colors.borderDanger : 
                      usernameAvailable === true ? uiConfig.colors.borderSuccess : ''
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {checkingUsername && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100"></div>
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
                {usernameError && (
                  <p className={`mt-2 text-sm ${uiConfig.colors.error}`}>{usernameError}</p>
                )}
                <p className={`mt-1 text-xs ${uiConfig.colors.hint}`}>
                  Choose a unique username for your profile
                </p>
              </div>
            </div>

            {/* Email */}
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onBlur={() => {
                    if (email) {
                      const validation = validateEmail(email);
                      if (!validation.valid) {
                        setEmailError(validation.error);
                      }
                    }
                  }}
                  className={`${uiConfig.components.input} ${
                    emailError ? uiConfig.colors.borderDanger : ''
                  }`}
                />
                {emailError && (
                  <p className={`mt-2 text-sm ${uiConfig.colors.error}`}>{emailError}</p>
                )}
              </div>
            </div>

            {/* Current Location - Country/Region dropdown + City field */}
            <div>
              <label htmlFor="country" className={uiConfig.components.label}>
                Country/Region
              </label>
              <div className="mt-1">
                <select
                  id="country"
                  name="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  autoComplete="country-name"
                  className={uiConfig.components.input}
                >
                  <option value="">Select your country</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Mexico">Mexico</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="France">France</option>
                  <option value="Germany">Germany</option>
                  <option value="Spain">Spain</option>
                  <option value="Italy">Italy</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Australia">Australia</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="Japan">Japan</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Philippines">Philippines</option>
                  <option value="India">India</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                  <option value="Costa Rica">Costa Rica</option>
                  <option value="Panama">Panama</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Austria">Austria</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Norway">Norway</option>
                  <option value="Denmark">De