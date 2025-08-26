import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Globe, PawPrint, Lightbulb, Check } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/userpreferences/onboardingUtils';
import { saveUserPreferences } from '../../utils/userpreferences/userPreferences';
import { useOnboardingAutoSave } from '../../hooks/useOnboardingAutoSave';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import ProTip from '../../components/ProTip';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import { SelectionCard, SelectionGrid, SelectionSection } from '../../components/onboarding/SelectionCard';
import { CustomDropdown } from '../../components/CustomDropdown';
import { isIOS } from '../../utils/platformDetection';

// Date Select Component - using centralized button standards
const DateSelect = ({ value, onChange, name, label, options, getOptionLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => 
    typeof opt === 'object' ? opt.value === value : opt === value
  );
  
  const displayLabel = selectedOption ? 
    (getOptionLabel ? getOptionLabel(selectedOption) : 
     (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)) : 
    label;
  
  // Use centralized button classes
  const buttonClasses = `${uiConfig.onboardingButton.getButtonClasses(!!value, false)} flex items-center`;
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
      >
        {/* Selection indicator - using centralized config */}
        {value && (
          <div className={uiConfig.onboardingButton.checkmark.position}>
            <div className={uiConfig.onboardingButton.checkmark.container}>
              <Check className={uiConfig.onboardingButton.checkmark.icon} />
            </div>
          </div>
        )}
        
        {/* Card content - using centralized typography */}
        <div className="flex flex-col justify-center h-full">
          <div className="flex items-center">
            <h3 className={`${uiConfig.onboardingButton.typography.title.weight} ${
              value ? uiConfig.onboardingButton.typography.title.selectedColor : uiConfig.onboardingButton.typography.title.unselectedColor
            } ${uiConfig.onboardingButton.typography.title.size} ${value ? 'pr-6' : ''}`}>
              {label}
            </h3>
          </div>
          {value && (
            <p className={`${uiConfig.onboardingButton.typography.subtitle.size} ${uiConfig.onboardingButton.typography.subtitle.selectedColor} ${uiConfig.onboardingButton.typography.subtitle.spacing}`}>
              {displayLabel}
            </p>
          )}
        </div>
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          {/* Mobile dropdown - full width */}
          <div className={`sm:hidden fixed left-0 right-0 bottom-0 z-50 bg-white dark:bg-gray-800 
            rounded-t-2xl border-t-2 border-gray-300 dark:border-gray-600 shadow-2xl 
            max-h-[50vh] overflow-y-auto animate-slide-up`}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="text-sm">Done</span>
                </button>
              </div>
            </div>
            {options.map((option, index) => {
              const optValue = typeof option === 'object' ? option.value : option;
              const optLabel = getOptionLabel ? getOptionLabel(option) : 
                             (typeof option === 'object' ? option.label : option);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onChange({ target: { name, value: optValue } });
                    setIsOpen(false);
                  }}
                  className={`w-full p-4 text-left text-base hover:bg-gray-50 dark:hover:bg-gray-700/30 
                    ${uiConfig.animation.transition} ${value === optValue ? 'bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-700 dark:text-scout-accent-300 font-medium' : ''}`}
                >
                  {optLabel}
                </button>
              );
            })}
          </div>
          {/* Desktop dropdown - current behavior */}
          <div className={`hidden sm:block absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-gray-800 
            ${uiConfig.layout.radius.lg} border-2 border-gray-300 dark:border-gray-600 shadow-lg 
            max-h-60 overflow-y-auto`}>
            {options.map((option, index) => {
              const optValue = typeof option === 'object' ? option.value : option;
              const optLabel = getOptionLabel ? getOptionLabel(option) : 
                             (typeof option === 'object' ? option.label : option);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onChange({ target: { name, value: optValue } });
                    setIsOpen(false);
                  }}
                  className={`w-full p-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/30 
                    ${uiConfig.animation.transition} ${value === optValue ? 'bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-700 dark:text-scout-accent-300' : ''}`}
                >
                  {optLabel}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default function OnboardingCurrentStatus() {
  const [touchedFields, setTouchedFields] = useState({});
  const [expandedCitizenship, setExpandedCitizenship] = useState(-1); // -1 none, 0 yours, 1 partner's, 2 children's
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const { isVisible: isNavVisible } = useHideOnScroll();
  const defaultYear = new Date().getFullYear() + 5;
  const [formData, setFormData] = useState({
    retirement_timeline: {
      status: '',
      target_year: new Date().getFullYear() + 5,
      target_month: 1,
      target_day: 1,
      flexibility: ''
    },
    family_situation: '',
    pet_owner: [],
    citizenship: {
      primary_citizenship: '',
      dual_citizenship: false,
      secondary_citizenship: ''
    },
    partner_citizenship: {
      primary_citizenship: '',
      dual_citizenship: false,
      secondary_citizenship: ''
    },
    children_citizenship: {
      primary_citizenship: '',
      dual_citizenship: false,
      secondary_citizenship: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const navigate = useNavigate();
  
  // Enable auto-save for this page
  const autoSave = useOnboardingAutoSave(formData, 'current_status');
  const currentYear = new Date().getFullYear();

  const countries = [
    { id: 'us', label: 'United States' },
    { id: 'uk', label: 'United Kingdom' },
    { id: 'ca', label: 'Canada' },
    { id: 'au', label: 'Australia' },
    { id: 'de', label: 'Germany' },
    { id: 'fr', label: 'France' },
    { id: 'es', label: 'Spain' },
    { id: 'it', label: 'Italy' },
    { id: 'pt', label: 'Portugal' },
    { id: 'nl', label: 'Netherlands' },
    { id: 'ch', label: 'Switzerland' },
    { id: 'se', label: 'Sweden' },
    { id: 'no', label: 'Norway' },
    { id: 'dk', label: 'Denmark' },
    { id: 'ie', label: 'Ireland' },
    { id: 'be', label: 'Belgium' },
    { id: 'at', label: 'Austria' },
    { id: 'other', label: 'Other' }
  ];

  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const userResult = await getCurrentUser();
        
        if (!userResult || !userResult.user || !userResult.user.id) {
          console.error('User or user ID not found:', userResult);
          navigate('/welcome');
          return;
        }
        
        const { success, data, progress: userProgress, error } = await getOnboardingProgress(userResult.user.id);
        if (!success) {
          console.error("Error loading existing data:", error);
          setInitialLoading(false);
          return;
        }
        
        // Progress is now managed by OnboardingLayout
        
        if (data && data.current_status) {
          setHasLoadedData(true);
          setFormData(prev => ({
            ...prev,
            retirement_timeline: data.current_status.retirement_timeline || prev.retirement_timeline,
            family_situation: data.current_status.family_situation || 'solo',  // Now it's a direct string
            pet_owner: data.current_status.pet_owner || [],
            citizenship: data.current_status.citizenship || prev.citizenship,
            partner_citizenship: data.current_status.partner_citizenship || prev.partner_citizenship,
            children_citizenship: data.current_status.children_citizenship || {
              primary_citizenship: '',
              dual_citizenship: false,
              secondary_citizenship: ''
            },
            partner_agreement: data.current_status.partner_agreement,
            bringing_children: data.current_status.bringing_children || false,
            current_location: data.current_status.current_location || '',
            moving_motivation: data.current_status.moving_motivation || ''
          }));
        }
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadExistingData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      if (child === 'dual_citizenship') {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: checked,
            secondary_citizenship: checked ? prev[parent].secondary_citizenship : ''
          }
        }));
      } else if ((parent === 'citizenship' || parent === 'partner_citizenship' || parent === 'children_citizenship') && child === 'primary_citizenship') {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
            secondary_citizenship: prev[parent].secondary_citizenship === value ? '' : prev[parent].secondary_citizenship
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Helper function to check if retirement date dropdowns should show active state
  const isRetirementDateActive = (field, value, defaultValue) => {
    return touchedFields[field] || value !== defaultValue || hasLoadedData;
  };

  // Helper function to check if citizenship dropdowns should show active state  
  const isCitizenshipActive = (value) => {
    // Always show active if there's any value selected
    return Boolean(value && value !== '');
  };

  const handleFamilyStatusChange = (status) => {
    setHasUnsavedChanges(true);
    setFormData(prev => ({
      ...prev,
      family_situation: status,
      partner_citizenship: (status === 'couple' || status === 'family') ? prev.partner_citizenship : {
        primary_citizenship: '',
        dual_citizenship: false,
        secondary_citizenship: ''
      },
      children_citizenship: status === 'family' ? prev.children_citizenship : {
        primary_citizenship: '',
        dual_citizenship: false,
        secondary_citizenship: ''
      }
    }));
  };

  const handleRetirementStatusChange = (status) => {
    setHasUnsavedChanges(true);
    setFormData(prev => ({
      ...prev,
      retirement_timeline: {
        ...prev.retirement_timeline,
        status
      }
    }));
  };

  const handlePetChange = (petType) => {
    setHasUnsavedChanges(true);
    setFormData(prev => ({
      ...prev,
      pet_owner: (prev.pet_owner || []).includes(petType)
        ? (prev.pet_owner || []).filter(p => p !== petType)
        : [...(prev.pet_owner || []), petType]
    }));
  };

  const handleSkip = async () => {
    setLoading(true);
    await autoSave();
    setHasUnsavedChanges(false);
    setLoading(false);
    navigate('/onboarding/region');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.citizenship.dual_citizenship && 
        formData.citizenship.secondary_citizenship === formData.citizenship.primary_citizenship) {
      toast.error('Secondary citizenship must be different from primary citizenship');
      return;
    }
    
    if ((formData.family_situation === 'couple' || formData.family_situation === 'family') &&
        formData.partner_citizenship.dual_citizenship && 
        formData.partner_citizenship.secondary_citizenship === formData.partner_citizenship.primary_citizenship) {
      toast.error("Partner's secondary citizenship must be different from their primary citizenship");
      return;
    }
    
    if (formData.family_situation === 'family' &&
        formData.children_citizenship.dual_citizenship && 
        formData.children_citizenship.secondary_citizenship === formData.children_citizenship.primary_citizenship) {
      toast.error("Children's secondary citizenship must be different from their primary citizenship");
      return;
    }
    
    setLoading(true);
    
    try {
      const userResult = await getCurrentUser();
      if (!userResult.user) {
        navigate('/welcome');
        return;
      }
      
      
      const cleanedFormData = {
        ...formData,
        family_situation: formData.family_situation,  // Keep as string, don't wrap in object
        citizenship: {
          ...formData.citizenship,
          secondary_citizenship: formData.citizenship.secondary_citizenship === formData.citizenship.primary_citizenship 
            ? '' 
            : formData.citizenship.secondary_citizenship
        },
        partner_citizenship: formData.family_situation === 'couple' || formData.family_situation === 'family' ? {
          ...formData.partner_citizenship,
          secondary_citizenship: formData.partner_citizenship.secondary_citizenship === formData.partner_citizenship.primary_citizenship 
            ? '' 
            : formData.partner_citizenship.secondary_citizenship
        } : undefined,
        children_citizenship: formData.family_situation === 'family' ? {
          ...formData.children_citizenship,
          secondary_citizenship: formData.children_citizenship.secondary_citizenship === formData.children_citizenship.primary_citizenship 
            ? '' 
            : formData.children_citizenship.secondary_citizenship
        } : undefined
      };
      
      const { success, error } = await saveOnboardingStep(
        userResult.user.id,
        cleanedFormData,
        'current_status'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Current status saved!');
      setHasUnsavedChanges(false);
      
      // Also save to new user_preferences table
      try {
        const { success: prefSuccess, error: prefError } = await saveUserPreferences(
          userResult.user.id,
          'current_status',
          {
            retirement_status: formData.retirement_timeline.status,
            target_retirement_year: formData.retirement_timeline.target_year,
            target_retirement_month: formData.retirement_timeline.target_month,
            target_retirement_day: formData.retirement_timeline.target_day,
            timeline_flexibility: formData.retirement_timeline.flexibility,
            primary_citizenship: formData.citizenship.primary_citizenship,
            secondary_citizenship: formData.citizenship.secondary_citizenship || null,
            visa_concerns: formData.citizenship.visa_concerns || false,
            family_status: formData.family_situation,  // Use direct string, not .status
            partner_agreement: formData.partner_agreement || null,
            bringing_children: formData.bringing_children || false,
            bringing_pets: formData.pet_owner && formData.pet_owner.length > 0,  // Convert array to boolean
            pet_types: formData.pet_owner || [],  // Save actual pet types
            current_location: formData.current_location || null,
            moving_motivation: formData.moving_motivation || null,
            // Add partner citizenship fields when applicable
            partner_primary_citizenship: (formData.family_situation === 'couple' || formData.family_situation === 'family') && formData.partner_citizenship
              ? formData.partner_citizenship.primary_citizenship 
              : null,
            partner_secondary_citizenship: (formData.family_situation === 'couple' || formData.family_situation === 'family') && formData.partner_citizenship
              ? formData.partner_citizenship.secondary_citizenship || null
              : null,
            // Add children citizenship fields when applicable
            children_primary_citizenship: formData.family_situation === 'family' && formData.children_citizenship
              ? formData.children_citizenship.primary_citizenship 
              : null,
            children_secondary_citizenship: formData.family_situation === 'family' && formData.children_citizenship
              ? formData.children_citizenship.secondary_citizenship || null
              : null
          }
        );

        if (prefSuccess) {
        } else {
          console.error('❌ Failed to save to user_preferences:', prefError);
        }
      } catch (err) {
        console.error('Error saving to user_preferences:', err);
      }
      
      // Add a small delay to ensure data is saved before navigation
      setTimeout(() => {
        navigate('/onboarding/region');
      }, 100);
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className={`min-h-[100svh] ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.success} ${uiConfig.font.weight.semibold}`}>Loading...</div>
      </div>
    );
  }

  const retirementYearOptions = [];
  for (let i = 0; i <= 30; i++) {
    retirementYearOptions.push(currentYear + i);
  }

  const isCouple = formData.family_situation === 'couple';

  return (
      
      <main className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <form onSubmit={handleSubmit} className="py-6">
          {/* Pro Tip at top */}
          <div className={`bg-scout-accent/10 p-3 lg:p-4 ${uiConfig.layout.radius.lg} mb-4 lg:mb-6 flex items-start`}>
            <Lightbulb size={16} className="mr-2 text-orange-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
            <p className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.colors.body}`}>
              <span className={`${uiConfig.font.weight.medium}`}>Pro Tip:</span> Your citizenship affects visa requirements, tax implications, and healthcare access in different countries.
            </p>
          </div>
          
          {/* Retirement Status */}
          <SelectionSection icon={Calendar} title="Retirement Timeline">
            <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3 lg:mb-4 -mt-2`}>
              Where are you in your retirement journey?
            </p>
            <SelectionGrid>
              <SelectionCard
                title="Planning"
                description="5+ years away"
                isSelected={formData.retirement_timeline.status === 'planning'}
                onClick={() => handleRetirementStatusChange('planning')}
              />
              <SelectionCard
                title="Retiring Soon"
                description="Within 5 years"
                isSelected={formData.retirement_timeline.status === 'retiring_soon'}
                onClick={() => handleRetirementStatusChange('retiring_soon')}
              />
              <SelectionCard
                title="Retired"
                description="Living the dream"
                isSelected={formData.retirement_timeline.status === 'already_retired'}
                onClick={() => handleRetirementStatusChange('already_retired')}
              />
            </SelectionGrid>
            
            {/* Target Date */}
            {formData.retirement_timeline.status !== 'already_retired' && (
              <>
                {formData.retirement_timeline.status === 'retiring_soon' && (
                  <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mt-3 mb-2`}>
                    Enter any date that works for you - even if it's coming up soon!
                  </p>
                )}
                <div className={`grid grid-cols-2 min-[428px]:grid-cols-3 gap-2 sm:gap-3 md:gap-4 ${formData.retirement_timeline.status === 'retiring_soon' ? '' : 'mt-3'}`}>
                <DateSelect
                  name="retirement_timeline.target_month"
                  value={formData.retirement_timeline.target_month}
                  onChange={handleInputChange}
                  label="Month"
                  options={[
                    { value: 1, label: 'January' },
                    { value: 2, label: 'February' },
                    { value: 3, label: 'March' },
                    { value: 4, label: 'April' },
                    { value: 5, label: 'May' },
                    { value: 6, label: 'June' },
                    { value: 7, label: 'July' },
                    { value: 8, label: 'August' },
                    { value: 9, label: 'September' },
                    { value: 10, label: 'October' },
                    { value: 11, label: 'November' },
                    { value: 12, label: 'December' }
                  ]}
                />
                <DateSelect
                  name="retirement_timeline.target_day"
                  value={formData.retirement_timeline.target_day}
                  onChange={handleInputChange}
                  label="Day"
                  options={Array.from({length: 31}, (_, i) => i + 1)}
                />
                <DateSelect
                  name="retirement_timeline.target_year"
                  value={formData.retirement_timeline.target_year}
                  onChange={handleInputChange}
                  label="Year"
                  options={retirementYearOptions}
                />
              </div>
              </>
            )}
          </SelectionSection>

          {/* Family Situation */}
          <SelectionSection icon={Users} title="Family Situation">
            <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3 lg:mb-4 -mt-2`}>
              Who's joining you on this adventure? *
            </p>
            <SelectionGrid>
              <SelectionCard
                title="Solo"
                description="Just me"
                isSelected={formData.family_situation === 'solo'}
                onClick={() => handleFamilyStatusChange('solo')}
              />
              <SelectionCard
                title="Couple"
                description="Me & partner"
                isSelected={formData.family_situation === 'couple'}
                onClick={() => handleFamilyStatusChange('couple')}
              />
              <SelectionCard
                title="Family"
                description="With dependents"
                isSelected={formData.family_situation === 'family'}
                onClick={() => handleFamilyStatusChange('family')}
              />
            </SelectionGrid>
          </SelectionSection>

          {/* Citizenship */}
          <SelectionSection icon={Globe} title="Citizenship">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              {/* Your Citizenship Card */}
              <div>
                <SelectionCard
                  title="You"
                  description={
                    formData.citizenship.primary_citizenship 
                      ? `${countries.find(c => c.id === formData.citizenship.primary_citizenship)?.label || formData.citizenship.primary_citizenship}${
                          formData.citizenship.dual_citizenship && formData.citizenship.secondary_citizenship 
                            ? ` + ${countries.find(c => c.id === formData.citizenship.secondary_citizenship)?.label || formData.citizenship.secondary_citizenship}`
                            : ''
                        }`
                      : "Select your citizenship"
                  }
                  isSelected={formData.citizenship.primary_citizenship !== ''}
                  onClick={() => setExpandedCitizenship(expandedCitizenship === 0 ? -1 : 0)}
                  showCheckmark={formData.citizenship.primary_citizenship !== ''}
                />
                
                {/* Your Citizenship Dropdown */}
                {expandedCitizenship === 0 && (
                  <div className={`mt-3 p-3 sm:p-4 ${uiConfig.layout.radius.lg} bg-white dark:bg-gray-800/30 border-2 border-scout-accent-200 dark:border-scout-accent-600 shadow-lg space-y-3 ${uiConfig.animation.transition}`}>
                    <div>
                      <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 block`}>
                        Primary Citizenship *
                      </label>
                      <CustomDropdown
                        value={formData.citizenship.primary_citizenship}
                        onChange={(value) => {
                          handleInputChange({ target: { name: 'citizenship.primary_citizenship', value } });
                        }}
                        options={[
                          { value: '', label: 'Select citizenship' },
                          ...countries.map(country => ({
                            value: country.id,
                            label: country.label
                          }))
                        ]}
                        placeholder="Select citizenship"
                        showSearch={true}
                      />
                    </div>
                    
                    {/* Dual Citizenship Checkbox */}
                    <div className="flex items-center">
                      <input
                        id="dual_citizenship"
                        name="citizenship.dual_citizenship"
                        type="checkbox"
                        checked={formData.citizenship.dual_citizenship}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer"
                        style={{ 
                          accentColor: '#8fbc8f',
                          WebkitAppearance: 'none',
                          appearance: 'none',
                          backgroundColor: formData.citizenship.dual_citizenship ? '#8fbc8f' : 'transparent',
                          border: formData.citizenship.dual_citizenship ? '1px solid #8fbc8f' : '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          backgroundImage: formData.citizenship.dual_citizenship 
                            ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                            : 'none',
                          backgroundSize: '100% 100%',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          transition: 'all 0.15s ease-in-out'
                        }}
                      />
                      <label htmlFor="dual_citizenship" className={`ml-2 ${uiConfig.font.size.sm} ${uiConfig.colors.body} cursor-pointer`}>
                        I have dual citizenship
                      </label>
                    </div>
                    
                    {/* Secondary Citizenship - cascading */}
                    {formData.citizenship.dual_citizenship && (
                      <div className={`${uiConfig.animation.transition}`}>
                        <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 block`}>
                          Secondary Citizenship
                        </label>
                        <CustomDropdown
                          value={formData.citizenship.secondary_citizenship}
                          onChange={(value) => {
                            if (value !== formData.citizenship.primary_citizenship) {
                              handleInputChange({ target: { name: 'citizenship.secondary_citizenship', value } });
                            }
                          }}
                          options={[
                            { value: '', label: 'Select citizenship' },
                            ...countries
                              .filter(country => country.id !== formData.citizenship.primary_citizenship)
                              .map(country => ({
                                value: country.id,
                                label: country.label
                              }))
                          ]}
                          placeholder="Select secondary citizenship"
                          showSearch={true}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Partner's Citizenship Card - only show for couple/family */}
              {(formData.family_situation === 'couple' || formData.family_situation === 'family') && (
                <div>
                  <SelectionCard
                    title="Partner"
                    description={
                      formData.partner_citizenship.primary_citizenship 
                        ? `${countries.find(c => c.id === formData.partner_citizenship.primary_citizenship)?.label || formData.partner_citizenship.primary_citizenship}${
                            formData.partner_citizenship.dual_citizenship && formData.partner_citizenship.secondary_citizenship 
                              ? ` + ${countries.find(c => c.id === formData.partner_citizenship.secondary_citizenship)?.label || formData.partner_citizenship.secondary_citizenship}`
                              : ''
                          }`
                        : "Select partner's citizenship"
                    }
                    isSelected={formData.partner_citizenship.primary_citizenship !== ''}
                    onClick={() => setExpandedCitizenship(expandedCitizenship === 1 ? -1 : 1)}
                    showCheckmark={formData.partner_citizenship.primary_citizenship !== ''}
                  />
                  
                  {/* Partner's Citizenship Dropdown */}
                  {expandedCitizenship === 1 && (
                    <div className={`mt-3 p-3 sm:p-4 ${uiConfig.layout.radius.lg} bg-white dark:bg-gray-800/30 border-2 border-scout-accent-200 dark:border-scout-accent-600 shadow-lg space-y-3 ${uiConfig.animation.transition}`}>
                      <div>
                        <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 block`}>
                          Partner's Primary Citizenship *
                        </label>
                        <CustomDropdown
                          value={formData.partner_citizenship.primary_citizenship}
                          onChange={(value) => {
                            handleInputChange({ target: { name: 'partner_citizenship.primary_citizenship', value } });
                          }}
                          options={[
                            { value: '', label: 'Select citizenship' },
                            ...countries.map(country => ({
                              value: country.id,
                              label: country.label
                            }))
                          ]}
                          placeholder="Select citizenship"
                          showSearch={true}
                        />
                      </div>
                      
                      {/* Dual Citizenship Checkbox */}
                      <div className="flex items-center">
                        <input
                          id="partner_dual_citizenship"
                          name="partner_citizenship.dual_citizenship"
                          type="checkbox"
                          checked={formData.partner_citizenship.dual_citizenship}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer"
                          style={{ 
                            accentColor: '#8fbc8f',
                            WebkitAppearance: 'none',
                            appearance: 'none',
                            backgroundColor: formData.partner_citizenship.dual_citizenship ? '#8fbc8f' : 'transparent',
                            border: formData.partner_citizenship.dual_citizenship ? '1px solid #8fbc8f' : '1px solid #d1d5db',
                            borderRadius: '0.25rem',
                            backgroundImage: formData.partner_citizenship.dual_citizenship 
                              ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                              : 'none',
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            transition: 'all 0.15s ease-in-out'
                          }}
                        />
                        <label htmlFor="partner_dual_citizenship" className={`ml-2 ${uiConfig.font.size.sm} ${uiConfig.colors.body} cursor-pointer`}>
                          Partner has dual citizenship
                        </label>
                      </div>
                      
                      {/* Secondary Citizenship - cascading */}
                      {formData.partner_citizenship.dual_citizenship && (
                        <div className={`${uiConfig.animation.transition}`}>
                          <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 block`}>
                            Partner's Secondary Citizenship
                          </label>
                          <CustomDropdown
                            value={formData.partner_citizenship.secondary_citizenship}
                            onChange={(value) => {
                              if (value !== formData.partner_citizenship.primary_citizenship) {
                                handleInputChange({ target: { name: 'partner_citizenship.secondary_citizenship', value } });
                              }
                            }}
                            options={[
                              { value: '', label: 'Select citizenship' },
                              ...countries
                                .filter(country => country.id !== formData.partner_citizenship.primary_citizenship)
                                .map(country => ({
                                  value: country.id,
                                  label: country.label
                                }))
                            ]}
                            placeholder="Select secondary citizenship"
                            showSearch={true}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Children's Citizenship Card - only show for family */}
              {formData.family_situation === 'family' && (
                <div>
                  <SelectionCard
                    title="Children"
                    description={
                      formData.children_citizenship.primary_citizenship 
                        ? `${countries.find(c => c.id === formData.children_citizenship.primary_citizenship)?.label || formData.children_citizenship.primary_citizenship}${
                            formData.children_citizenship.dual_citizenship && formData.children_citizenship.secondary_citizenship 
                              ? ` + ${countries.find(c => c.id === formData.children_citizenship.secondary_citizenship)?.label || formData.children_citizenship.secondary_citizenship}`
                              : ''
                          }`
                        : "Select children's citizenship"
                    }
                    isSelected={formData.children_citizenship.primary_citizenship !== ''}
                    onClick={() => setExpandedCitizenship(expandedCitizenship === 2 ? -1 : 2)}
                    showCheckmark={formData.children_citizenship.primary_citizenship !== ''}
                  />
                  
                  {/* Children's Citizenship Dropdown */}
                  {expandedCitizenship === 2 && (
                    <div className={`mt-3 p-3 sm:p-4 ${uiConfig.layout.radius.lg} bg-white dark:bg-gray-800/30 border-2 border-scout-accent-200 dark:border-scout-accent-600 shadow-lg space-y-3 ${uiConfig.animation.transition}`}>
                      <div>
                        <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 block`}>
                          Children's Primary Citizenship *
                        </label>
                        <CustomDropdown
                          value={formData.children_citizenship.primary_citizenship}
                          onChange={(value) => {
                            handleInputChange({ target: { name: 'children_citizenship.primary_citizenship', value } });
                          }}
                          options={[
                            { value: '', label: 'Select citizenship' },
                            ...countries.map(country => ({
                              value: country.id,
                              label: country.label
                            }))
                          ]}
                          placeholder="Select citizenship"
                          showSearch={true}
                        />
                      </div>
                      
                      {/* Dual Citizenship Checkbox */}
                      <div className="flex items-center">
                        <input
                          id="children_dual_citizenship"
                          name="children_citizenship.dual_citizenship"
                          type="checkbox"
                          checked={formData.children_citizenship.dual_citizenship}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer"
                          style={{ 
                            accentColor: '#8fbc8f',
                            WebkitAppearance: 'none',
                            appearance: 'none',
                            backgroundColor: formData.children_citizenship.dual_citizenship ? '#8fbc8f' : 'transparent',
                            border: formData.children_citizenship.dual_citizenship ? '1px solid #8fbc8f' : '1px solid #d1d5db',
                            borderRadius: '0.25rem',
                            backgroundImage: formData.children_citizenship.dual_citizenship 
                              ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                              : 'none',
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            transition: 'all 0.15s ease-in-out'
                          }}
                        />
                        <label htmlFor="children_dual_citizenship" className={`ml-2 ${uiConfig.font.size.sm} ${uiConfig.colors.body} cursor-pointer`}>
                          Children have dual citizenship
                        </label>
                      </div>
                      
                      {/* Secondary Citizenship - cascading */}
                      {formData.children_citizenship.dual_citizenship && (
                        <div className={`${uiConfig.animation.transition}`}>
                          <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 block`}>
                            Children's Secondary Citizenship
                          </label>
                          <CustomDropdown
                            value={formData.children_citizenship.secondary_citizenship}
                            onChange={(value) => {
                              if (value !== formData.children_citizenship.primary_citizenship) {
                                handleInputChange({ target: { name: 'children_citizenship.secondary_citizenship', value } });
                              }
                            }}
                            options={[
                              { value: '', label: 'Select citizenship' },
                              ...countries
                                .filter(country => country.id !== formData.children_citizenship.primary_citizenship)
                                .map(country => ({
                                  value: country.id,
                                  label: country.label
                                }))
                            ]}
                            placeholder="Select secondary citizenship"
                            showSearch={true}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </SelectionSection>

          {/* Pet Owner */}
          <SelectionSection icon={PawPrint} title="Pet Owner">
            <SelectionGrid>
              <SelectionCard
                title="Bringing"
                description="Cat"
                isSelected={formData.pet_owner?.includes('cat') || false}
                onClick={() => handlePetChange('cat')}
              />
              <SelectionCard
                title="Bringing"
                description="Dog"
                isSelected={formData.pet_owner?.includes('dog') || false}
                onClick={() => handlePetChange('dog')}
              />
              <SelectionCard
                title="Bringing"
                description="Other"
                isSelected={formData.pet_owner?.includes('other') || false}
                onClick={() => handlePetChange('other')}
              />
            </SelectionGrid>
          </SelectionSection>

          {/* Summary Section */}
          {(formData.retirement_timeline.status || formData.family_situation) && (
            <div className={`mb-4 p-3 lg:p-4 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg} lg:rounded-xl`}>
              <div className={`${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
                <span className={`${uiConfig.font.weight.medium}`}>Summary:</span>
                <div className={`mt-0.5 ${uiConfig.font.size.xs}`}>
                  {formData.retirement_timeline.status === 'planning' && 'Planning for retirement (5+ years)'}
                  {formData.retirement_timeline.status === 'retiring_soon' && 'Retiring within 5 years'}
                  {formData.retirement_timeline.status === 'already_retired' && 'Already retired'}
                  {formData.retirement_timeline.status !== 'already_retired' && 
                    ` on ${new Date(formData.retirement_timeline.target_year, formData.retirement_timeline.target_month - 1, formData.retirement_timeline.target_day).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                  {' • '}
                  {formData.family_situation === 'solo' && 'Solo'}
                  {formData.family_situation === 'couple' && 'Couple'}
                  {formData.family_situation === 'family' && 'Family'}
                  {formData.pet_owner?.length > 0 && ` with ${formData.pet_owner.join(', ')}`}
                  {' • '}
                  {countries.find(c => c.id === formData.citizenship.primary_citizenship)?.label || 'US'} citizen
                  {formData.citizenship.dual_citizenship && ` + ${countries.find(c => c.id === formData.citizenship.secondary_citizenship && c.id !== formData.citizenship.primary_citizenship)?.label || ''}`}
                  {(formData.family_situation === 'couple' || formData.family_situation === 'family') && (
                    <>
                      {' • Partner: '}
                      {countries.find(c => c.id === formData.partner_citizenship.primary_citizenship)?.label || 'US'} citizen
                      {formData.partner_citizenship.dual_citizenship && ` + ${countries.find(c => c.id === formData.partner_citizenship.secondary_citizenship && c.id !== formData.partner_citizenship.primary_citizenship)?.label || ''}`}
                    </>
                  )}
                  {formData.family_situation === 'family' && (
                    <>
                      {' • Children: '}
                      {countries.find(c => c.id === formData.children_citizenship.primary_citizenship)?.label || 'US'} citizen
                      {formData.children_citizenship.dual_citizenship && ` + ${countries.find(c => c.id === formData.children_citizenship.secondary_citizenship && c.id !== formData.children_citizenship.primary_citizenship)?.label || ''}`}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Bottom Navigation - Using centralized config */}
        <div className={uiConfig.bottomNavigation.container.getContainerClasses(isIOS(), isNavVisible)}>
          <div className={uiConfig.bottomNavigation.container.innerContainer}>
            <div className={uiConfig.bottomNavigation.container.buttonLayout}>
              <button
                type="button"
                onClick={() => navigate('/welcome')}
                disabled={loading}
                className={uiConfig.components.buttonSecondary}
              >
                ← Back
              </button>
              <div className="flex-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSkip}
                  className={uiConfig.components.buttonSecondary}
                >
                  Skip
                </button>
              </div>
              <div className="relative">
                {hasUnsavedChanges && !loading && (
                  <span className="absolute -top-1 -left-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                )}
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className={uiConfig.components.buttonPrimary}
                >
                  {loading ? 'Saving...' : hasUnsavedChanges ? 'Save & Next →' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
