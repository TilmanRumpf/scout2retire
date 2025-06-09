import { useState, useEffect } from 'react';
// 08JUN25: Import uiConfig for consistent design system
import { uiConfig } from '../../styles/uiConfig';

// 08JUN25: Updated field requirements - Current Country now mandatory, Planned Relocation Date now optional
// Maintained all existing functionality while updating validation logic
export default function OnboardingStep1({ onNext, onPrevious, formData: parentFormData, setFormData: setParentFormData }) {
  // 08JUN25: Preserved original prop verification logging
  console.log('OnboardingCurrentStatus received props:', { onNext, onPrevious });

  // 08JUN25: Preserved original form state structure
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

  // 08JUN25: Preserved all original state management
  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  // 08JUN25: Preserved original useEffect - location detection disabled
  useEffect(() => {
    // Location detection disabled to prevent 404 errors
    setLocationLoading(false);
  }, []);

  // 08JUN25: Preserved original input change handler
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

  // 08JUN25: Preserved original blur handler
  const handleInputBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field);
  };

  // 08JUN25: Updated field validation logic - Current Country now mandatory, Planned Relocation Date now optional
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
      case 'currentCountry':
        // 08JUN25: Added validation for Current Country (now mandatory)
        if (!formData.currentCountry) {
          newErrors.currentCountry = 'Current country is required';
        } else {
          newErrors.currentCountry = '';
        }
        break;
      // 08JUN25: Removed plannedRelocationDate validation (now optional)
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  // 08JUN25: Updated form validation logic - Current Country now mandatory, Planned Relocation Date now optional
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.primaryCitizenship) {
      newErrors.primaryCitizenship = 'Primary citizenship is required';
    }
    
    // 08JUN25: Added Current Country validation (now mandatory)
    if (!formData.currentCountry) {
      newErrors.currentCountry = 'Current country is required';
    }
    
    // 08JUN25: Removed Planned Relocation Date validation (now optional)
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 08JUN25: Updated validation summary to reflect new field requirements
  const getValidationSummary = () => {
    const missingFields = [];
    if (!formData.primaryCitizenship) missingFields.push('Primary Citizenship');
    if (!formData.currentCountry) missingFields.push('Current Country');
    // 08JUN25: Removed Planned Relocation Date from required fields
    return missingFields;
  };

  // 08JUN25: Updated next handler with new validation requirements
  const handleNext = () => {
    console.log('=== NEXT BUTTON CLICKED ===');
    console.log('Form Data:', formData);
    console.log('Validation Summary:', getValidationSummary());
    
    const isValid = validateForm();
    console.log('Form is valid:', isValid);
    
    if (!isValid) {
      console.log('Form validation failed, showing errors');
      setShowValidationSummary(true);
      // 08JUN25: Updated touched fields to include currentCountry, removed plannedRelocationDate
      setTouched({
        primaryCitizenship: true,
        currentCountry: true
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

  // 08JUN25: Preserved original back handler
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
    // 08JUN25: Mobile-first page background using uiConfig.colors.page
    <div className={`min-h-screen ${uiConfig.colors.page}`}>
      {/* 08JUN25: Header with mobile-first responsive design */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.shadow.sm}`}>
        <div className={`${uiConfig.layout.width.containerNarrow} px-4 sm:px-6 py-4 sm:py-6`}>
          <div className="mb-4">
            {/* 08JUN25: Mobile-first heading using uiConfig typography */}
            <h1 className={`${uiConfig.font.size.xl} sm:${uiConfig.font.size['2xl']} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading}`}>
              Getting to Know You
            </h1>
            {/* 08JUN25: Mobile-first layout for step info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 space-y-1 sm:space-y-0">
              <p className={`${uiConfig.font.size.sm} sm:${uiConfig.font.size.base} ${uiConfig.colors.body}`}>
                Step 1 of 6: Current Status
              </p>
              <span className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.hint}`}>
                17% Complete
              </span>
            </div>
          </div>
          
          {/* 08JUN25: Progress bar with uiConfig styling */}
          <div className={`w-full ${uiConfig.progress.track} ${uiConfig.layout.radius.full} h-2`}>
            <div 
              className={`${uiConfig.progress.fill} h-2 ${uiConfig.layout.radius.full} ${uiConfig.animation.transition}`} 
              style={{ width: '17%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* 08JUN25: Mobile-first main content area */}
      <div className={`${uiConfig.layout.width.containerNarrow} px-4 sm:px-6 py-6 sm:py-8`}>
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.xl} ${uiConfig.layout.shadow.sm} ${uiConfig.colors.borderLight} border p-4 sm:p-6 lg:p-8`}>
          
          {/* 08JUN25: Mobile-optimized icon and description section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-scout-accent-100 dark:bg-scout-accent-900/20 ${uiConfig.layout.radius.full} mb-3 sm:mb-4`}>
              <svg className={`${uiConfig.icons.size.lg} sm:${uiConfig.icons.size.xl} text-scout-accent-600 dark:text-scout-accent-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className={`${uiConfig.colors.body} ${uiConfig.font.size.base} sm:${uiConfig.font.size.lg} px-2`}>
              Tell us about your current situation to help us find the perfect retirement destination.
            </p>
          </div>

          {/* 08JUN25: Mobile-optimized validation summary using uiConfig notification styling */}
          {showValidationSummary && getValidationSummary().length > 0 && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 ${uiConfig.notifications.error} border ${uiConfig.layout.radius.lg}`}>
              <div className="flex items-start">
                <svg className={`${uiConfig.icons.size.md} text-red-400 mt-0.5 mr-3 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} mb-1`}>
                    Please complete the following required fields:
                  </h3>
                  <ul className={`${uiConfig.font.size.sm} list-disc list-inside space-y-1`}>
                    {getValidationSummary().map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 08JUN25: Mobile-first form fields with enhanced spacing */}
          <div className="space-y-4 sm:space-y-6">
            
            {/* 08JUN25: Mobile-first grid - stacked on mobile, side-by-side on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                  Current City
                </label>
                <input
                  type="text"
                  placeholder="e.g., New York"
                  value={formData.currentCity}
                  onChange={(e) => handleInputChange('currentCity', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.colors.input} ${uiConfig.colors.heading} placeholder-gray-500 dark:placeholder-gray-400 ${uiConfig.animation.transition}`}
                />
              </div>
              
              <div>
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                  Primary Citizenship *
                </label>
                <select
                  value={formData.primaryCitizenship}
                  onChange={(e) => handleInputChange('primaryCitizenship', e.target.value)}
                  onBlur={() => handleInputBlur('primaryCitizenship')}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base} border ${uiConfig.layout.radius.lg} ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.colors.input} ${uiConfig.colors.heading} ${uiConfig.animation.transition} ${
                    errors.primaryCitizenship && touched.primaryCitizenship
                      ? uiConfig.validation.invalid
                      : uiConfig.validation.neutral
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
                  <p className={`mt-1 ${uiConfig.font.size.sm} ${uiConfig.colors.error}`}>
                    {errors.primaryCitizenship}
                  </p>
                )}
              </div>
            </div>

            {/* 08JUN25: Row 2 with responsive grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="e.g., 10001"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.colors.input} ${uiConfig.colors.heading} placeholder-gray-500 dark:placeholder-gray-400 ${uiConfig.animation.transition}`}
                />
              </div>
              
              <div>
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                  Secondary Citizenship
                </label>
                <select
                  value={formData.secondaryCitizenship}
                  onChange={(e) => handleInputChange('secondaryCitizenship', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.colors.input} ${uiConfig.colors.heading} ${uiConfig.animation.transition}`}
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

            {/* 08JUN25: Row 3 with responsive grid - Updated Current Country to mandatory, Planned Relocation Date to optional */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                  Current Country *
                </label>
                <input
                  type="text"
                  placeholder="e.g., United States"
                  value={formData.currentCountry}
                  onChange={(e) => handleInputChange('currentCountry', e.target.value)}
                  onBlur={() => handleInputBlur('currentCountry')}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base} border ${uiConfig.layout.radius.lg} ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.colors.input} ${uiConfig.colors.heading} placeholder-gray-500 dark:placeholder-gray-400 ${uiConfig.animation.transition} ${
                    errors.currentCountry && touched.currentCountry
                      ? uiConfig.validation.invalid
                      : uiConfig.validation.neutral
                  }`}
                />
                {errors.currentCountry && touched.currentCountry && (
                  <p className={`mt-1 ${uiConfig.font.size.sm} ${uiConfig.colors.error}`}>
                    {errors.currentCountry}
                  </p>
                )}
              </div>
              
              <div>
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                  Planned Relocation Date
                </label>
                <input
                  type="date"
                  value={formData.plannedRelocationDate}
                  onChange={(e) => handleInputChange('plannedRelocationDate', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.colors.input} ${uiConfig.colors.heading} ${uiConfig.animation.transition}`}
                />
              </div>
            </div>

            {/* 08JUN25: Partner section with mobile-optimized spacing */}
            <div className={`border-t ${uiConfig.colors.borderLight} pt-4 sm:pt-6`}>
              <div className="mb-4 sm:mb-6">
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                  Do you have a partner that will be relocating with you?
                </label>
                <select
                  value={formData.hasPartner}
                  onChange={(e) => handleInputChange('hasPartner', e.target.value)}
                  className={`w-full lg:w-2/3 xl:w-1/2 px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.colors.input} ${uiConfig.colors.heading} ${uiConfig.animation.transition}`}
                >
                  <option value="">Answer Optional</option>
                  <option value="yes">Yes</option>
                  <option value="not_sure">Not Sure</option>
                  <option value="not_applicable">Not Applicable</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {/* 08JUN25: Pet section with mobile-first grid */}
            <div className={`border-t ${uiConfig.colors.borderLight} pt-4 sm:pt-6`}>
              <div className="mb-4">
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-3 sm:mb-4`}>
                  Do you have pets that will be relocating with you?
                </label>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                    First Pet
                  </label>
                  <select
                    value={formData.firstPet}
                    onChange={(e) => handleInputChange('firstPet', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.colors.input} ${uiConfig.colors.heading} ${uiConfig.animation.transition}`}
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
                  <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                    Second Pet
                  </label>
                  <select
                    value={formData.secondPet}
                    onChange={(e) => handleInputChange('secondPet', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.colors.input} ${uiConfig.colors.heading} ${uiConfig.animation.transition}`}
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

        {/* 08JUN25: Mobile-optimized navigation with FIXED button styling - removed always-disabled classes */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 sm:mt-8 space-y-4 sm:space-y-0">
          <button
            onClick={handleBack}
            className={`flex items-center justify-center sm:justify-start px-4 sm:px-6 py-3 ${uiConfig.colors.hint} hover:${uiConfig.colors.heading} ${uiConfig.animation.transition} order-2 sm:order-1`}
          >
            <svg className={`${uiConfig.icons.size.md} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Login
          </button>
          
          <div className="text-center sm:text-right order-1 sm:order-2">
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-2`}>
              * Required fields
            </p>
            <button
              onClick={handleNext}
              className={`w-full sm:w-auto px-6 sm:px-8 py-3 ${uiConfig.colors.btnPrimary} ${uiConfig.font.weight.medium} ${uiConfig.layout.radius.lg} ${uiConfig.animation.transition} ${uiConfig.colors.focusRing} focus:ring-offset-2`}
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}