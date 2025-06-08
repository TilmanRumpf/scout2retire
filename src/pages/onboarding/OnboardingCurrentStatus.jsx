import { useState, useEffect } from 'react';

export default function OnboardingStep1({ onNext, onPrevious, formData: parentFormData, setFormData: setParentFormData }) {
  // Add console.log to verify props
  console.log('OnboardingCurrentStatus received props:', { onNext, onPrevious });

  const [formData, setFormData] = useState({
    currentCity: '',
    postalCode: '',
    currentCountry: '',
    primaryCitizenship: '',
    secondaryCitizenship: '',
    plannedRelocationDate: '',
    hasPartner: '',
    firstPet: '',
    secondPet: ''
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  // Get user's location on component mount - DISABLED for now
  useEffect(() => {
    // Location detection disabled to prevent 404 errors
    setLocationLoading(false);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Hide validation summary when user makes changes
    if (showValidationSummary) {
      setShowValidationSummary(false);
    }
  };

  const handleInputBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field);
  };

  const validateField = (field) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'primaryCitizenship':
        if (!formData.primaryCitizenship) {
          newErrors.primaryCitizenship = 'Primary citizenship is required';
        } else {
          newErrors.primaryCitizenship = '';
        }
        break;
      case 'plannedRelocationDate':
        if (!formData.plannedRelocationDate) {
          newErrors.plannedRelocationDate = 'Planned relocation date is required';
        } else {
          newErrors.plannedRelocationDate = '';
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.primaryCitizenship) {
      newErrors.primaryCitizenship = 'Primary citizenship is required';
    }
    
    if (!formData.plannedRelocationDate) {
      newErrors.plannedRelocationDate = 'Planned relocation date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getValidationSummary = () => {
    const missingFields = [];
    if (!formData.primaryCitizenship) missingFields.push('Primary Citizenship');
    if (!formData.plannedRelocationDate) missingFields.push('Planned Relocation Date');
    return missingFields;
  };

  const handleNext = () => {
    console.log('=== NEXT BUTTON CLICKED ===');
    console.log('Form Data:', formData);
    console.log('Validation Summary:', getValidationSummary());
    
    const isValid = validateForm();
    console.log('Form is valid:', isValid);
    
    if (!isValid) {
      console.log('Form validation failed, showing errors');
      setShowValidationSummary(true);
      // Mark all required fields as touched to show errors
      setTouched({
        primaryCitizenship: true,
        plannedRelocationDate: true
      });
      return;
    }
    
    console.log('Form validation passed! Calling onNext...');
    
    // Save form data to parent if available
    if (setParentFormData && typeof setParentFormData === 'function') {
      setParentFormData(prev => ({
        ...prev,
        currentStatus: formData
      }));
    }
    
    // Call the navigation function
    if (onNext && typeof onNext === 'function') {
      console.log('Calling onNext function...');
      onNext();
    } else {
      console.error('onNext function not available!', onNext);
      alert('Form is valid! Ready to proceed to Step 2');
    }
  };

  const handleBack = () => {
    console.log('Back button clicked');
    if (onPrevious && typeof onPrevious === 'function') {
      console.log('Calling onPrevious function...');
      onPrevious();
    } else {
      console.log('onPrevious not available, fallback behavior');
      // TODO: Navigate back to login
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Getting to Know You
            </h1>
            <div className="flex items-center justify-between mt-2">
              <p className="text-gray-600 dark:text-gray-400">
                Step 1 of 6: Current Status
              </p>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                17% Complete
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '17%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          
          {/* Icon and Description */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Tell us about your current situation to help us find the perfect retirement destination.
            </p>
          </div>

          {/* Validation Summary */}
          {showValidationSummary && getValidationSummary().length > 0 && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                    Please complete the following required fields:
                  </h3>
                  <ul className="text-sm text-red-700 dark:text-red-400 list-disc list-inside">
                    {getValidationSummary().map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-6">
            
            {/* Row 1: Current City & Primary Citizenship */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current City
                </label>
                <input
                  type="text"
                  placeholder="e.g., New York"
                  value={formData.currentCity}
                  onChange={(e) => handleInputChange('currentCity', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Citizenship *
                </label>
                <select
                  value={formData.primaryCitizenship}
                  onChange={(e) => handleInputChange('primaryCitizenship', e.target.value)}
                  onBlur={() => handleInputBlur('primaryCitizenship')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.primaryCitizenship && touched.primaryCitizenship
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select citizenship</option>
                  <option value="united_states">United States</option>
                  <option value="canada">Canada</option>
                  <option value="united_kingdom">United Kingdom</option>
                  <option value="germany">Germany</option>
                  <option value="france">France</option>
                  <option value="spain">Spain</option>
                  <option value="italy">Italy</option>
                  <option value="australia">Australia</option>
                  <option value="new_zealand">New Zealand</option>
                  <option value="other">Other</option>
                </select>
                {errors.primaryCitizenship && touched.primaryCitizenship && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.primaryCitizenship}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Postal Code & Secondary Citizenship */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="e.g., 10001"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Citizenship
                </label>
                <select
                  value={formData.secondaryCitizenship}
                  onChange={(e) => handleInputChange('secondaryCitizenship', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select if applicable</option>
                  <option value="united_states">United States</option>
                  <option value="canada">Canada</option>
                  <option value="united_kingdom">United Kingdom</option>
                  <option value="germany">Germany</option>
                  <option value="france">France</option>
                  <option value="spain">Spain</option>
                  <option value="italy">Italy</option>
                  <option value="australia">Australia</option>
                  <option value="new_zealand">New Zealand</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Row 3: Current Country & Planned Relocation Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Country
                </label>
                <input
                  type="text"
                  placeholder="e.g., United States"
                  value={formData.currentCountry}
                  onChange={(e) => handleInputChange('currentCountry', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Planned Relocation Date *
                </label>
                <input
                  type="date"
                  value={formData.plannedRelocationDate}
                  onChange={(e) => handleInputChange('plannedRelocationDate', e.target.value)}
                  onBlur={() => handleInputBlur('plannedRelocationDate')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.plannedRelocationDate && touched.plannedRelocationDate
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.plannedRelocationDate && touched.plannedRelocationDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.plannedRelocationDate}
                  </p>
                )}
              </div>
            </div>

            {/* Partner Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Do you have a partner that will be relocating with you?
                </label>
                <select
                  value={formData.hasPartner}
                  onChange={(e) => handleInputChange('hasPartner', e.target.value)}
                  className="w-full md:w-1/2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Answer Optional</option>
                  <option value="yes">Yes</option>
                  <option value="not_sure">Not Sure</option>
                  <option value="not_applicable">Not Applicable</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {/* Pet Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Do you have pets that will be relocating with you?
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Pet
                  </label>
                  <select
                    value={formData.firstPet}
                    onChange={(e) => handleInputChange('firstPet', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Answer Optional</option>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="horse">Horse</option>
                    <option value="bird">Bird</option>
                    <option value="reptile">Reptile</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Second Pet
                  </label>
                  <select
                    value={formData.secondPet}
                    onChange={(e) => handleInputChange('secondPet', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Answer Optional</option>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="horse">Horse</option>
                    <option value="bird">Bird</option>
                    <option value="reptile">Reptile</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleBack}
            className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Login
          </button>
          
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              * Required fields
            </p>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}