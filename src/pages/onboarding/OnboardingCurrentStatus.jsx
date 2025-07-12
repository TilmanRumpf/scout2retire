import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Globe, PawPrint, Lightbulb } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import { saveUserPreferences } from '../../utils/userPreferences';
import { useOnboardingAutoSave } from '../../hooks/useOnboardingAutoSave';
import ProTip from '../../components/ProTip';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';

// Option Button Component - Responsive for mobile and desktop
const OptionButton = ({ label, description, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`${uiConfig.components.buttonSizes.default} lg:py-3 lg:px-4 xl:py-4 xl:px-5 ${uiConfig.layout.radius.md} lg:rounded-lg border-2 ${uiConfig.animation.transition} text-center ${
      isSelected
        ? uiConfig.components.buttonVariants.selected
        : uiConfig.components.buttonVariants.unselected
    }`}
  >
    <div className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${isSelected ? 'text-white' : uiConfig.colors.body}`}>{label}</div>
    {description && <div className={`${uiConfig.font.size.xs} lg:text-sm mt-0.5 lg:mt-1 ${isSelected ? 'text-white' : uiConfig.colors.hint}`}>{description}</div>}
  </button>
);

export default function OnboardingCurrentStatus() {
  const [touchedFields, setTouchedFields] = useState({});
  const [hasLoadedData, setHasLoadedData] = useState(false);
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
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
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
        console.log('getCurrentUser result:', userResult);
        
        if (!userResult || !userResult.user || !userResult.user.id) {
          console.error('User or user ID not found:', userResult);
          navigate('/welcome');
          return;
        }
        
        console.log('User ID being passed to getOnboardingProgress:', userResult.user.id);
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
            family_situation: typeof data.current_status.family_situation === 'string'
              ? data.current_status.family_situation
              : (data.current_status.family_situation?.status || 'solo'),
            pet_owner: data.current_status.pet_owner || [],
            citizenship: data.current_status.citizenship || prev.citizenship,
            partner_citizenship: data.current_status.partner_citizenship || prev.partner_citizenship
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
      } else if ((parent === 'citizenship' || parent === 'partner_citizenship') && child === 'primary_citizenship') {
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
    setFormData(prev => ({
      ...prev,
      family_situation: status,
      partner_citizenship: status === 'couple' ? prev.partner_citizenship : {
        primary_citizenship: '',
        dual_citizenship: false,
        secondary_citizenship: ''
      }
    }));
  };

  const handleRetirementStatusChange = (status) => {
    setFormData(prev => ({
      ...prev,
      retirement_timeline: {
        ...prev.retirement_timeline,
        status
      }
    }));
  };

  const handlePetChange = (petType) => {
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
    
    if (formData.family_situation === 'couple' &&
        formData.partner_citizenship.dual_citizenship && 
        formData.partner_citizenship.secondary_citizenship === formData.partner_citizenship.primary_citizenship) {
      toast.error("Partner's secondary citizenship must be different from their primary citizenship");
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
        family_situation: {
          status: formData.family_situation
        },
        citizenship: {
          ...formData.citizenship,
          secondary_citizenship: formData.citizenship.secondary_citizenship === formData.citizenship.primary_citizenship 
            ? '' 
            : formData.citizenship.secondary_citizenship
        },
        partner_citizenship: formData.family_situation === 'couple' ? {
          ...formData.partner_citizenship,
          secondary_citizenship: formData.partner_citizenship.secondary_citizenship === formData.partner_citizenship.primary_citizenship 
            ? '' 
            : formData.partner_citizenship.secondary_citizenship
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
      
      // Also save to new user_preferences table
      try {
        const { success: prefSuccess, error: prefError } = await saveUserPreferences(
          userResult.user.id,
          'current_status',
          {
            retirement_status: formData.retirement_timeline.status,
            target_retirement_year: formData.retirement_timeline.target_year,
            timeline_flexibility: formData.retirement_timeline.flexibility,
            primary_citizenship: formData.citizenship.primary_citizenship,
            secondary_citizenship: formData.citizenship.secondary_citizenship || null,
            visa_concerns: formData.citizenship.visa_concerns || false,
            family_status: formData.family_situation.status,
            partner_agreement: formData.family_situation.partner_agreement || null,
            bringing_children: formData.family_situation.bringing_children || false,
            bringing_pets: formData.family_situation.bringing_pets || false,
            current_location: formData.current_location || null,
            moving_motivation: formData.moving_motivation || null
          }
        );

        if (prefSuccess) {
          console.log('✅ Saved to user_preferences table');
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
    <>
      
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
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <Calendar size={16} className="mr-1.5 lg:mr-2" />
              Retirement Timeline
            </label>
            <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3 lg:mb-4`}>
              Where are you in your retirement journey?
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
              <OptionButton
                label="Planning"
                description="5+ years away"
                isSelected={formData.retirement_timeline.status === 'planning'}
                onClick={() => handleRetirementStatusChange('planning')}
              />
              <OptionButton
                label="Retiring Soon"
                description="Within 5 years"
                isSelected={formData.retirement_timeline.status === 'retiring_soon'}
                onClick={() => handleRetirementStatusChange('retiring_soon')}
              />
              <OptionButton
                label="Retired"
                description="Living the dream"
                isSelected={formData.retirement_timeline.status === 'already_retired'}
                onClick={() => handleRetirementStatusChange('already_retired')}
              />
            </div>
          </div>

          {/* Target Date */}
          {formData.retirement_timeline.status !== 'already_retired' && (
            <div className="mb-4">
              <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 block`}>
                Target Retirement Date
              </label>
              <div className="grid grid-cols-3 gap-2 lg:gap-3 xl:gap-4">
                <select
                  name="retirement_timeline.target_month"
                  value={formData.retirement_timeline.target_month}
                  onChange={handleInputChange}
                  className={isRetirementDateActive('retirement_timeline.target_month', formData.retirement_timeline.target_month, 1) ? uiConfig.components.selectActive : uiConfig.components.select}
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
                <select
                  name="retirement_timeline.target_day"
                  value={formData.retirement_timeline.target_day}
                  onChange={handleInputChange}
                  className={isRetirementDateActive('retirement_timeline.target_day', formData.retirement_timeline.target_day, 1) ? uiConfig.components.selectActive : uiConfig.components.select}
                >
                  {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <select
                  name="retirement_timeline.target_year"
                  value={formData.retirement_timeline.target_year}
                  onChange={handleInputChange}
                  className={isRetirementDateActive('retirement_timeline.target_year', formData.retirement_timeline.target_year, defaultYear) ? uiConfig.components.selectActive : uiConfig.components.select}
                >
                  {retirementYearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Family Situation */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <Users size={16} className="mr-1.5 lg:mr-2" />
              Family Situation
            </label>
            <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3 lg:mb-4`}>
              Who's joining you on this adventure? *
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
              <OptionButton
                label="Solo"
                description="Just me"
                isSelected={formData.family_situation === 'solo'}
                onClick={() => handleFamilyStatusChange('solo')}
              />
              <OptionButton
                label="Couple"
                description="Me & partner"
                isSelected={formData.family_situation === 'couple'}
                onClick={() => handleFamilyStatusChange('couple')}
              />
              <OptionButton
                label="Family"
                description="With dependents"
                isSelected={formData.family_situation === 'family'}
                onClick={() => handleFamilyStatusChange('family')}
              />
            </div>
          </div>

          {/* Citizenship */}
          <div className="mb-4 lg:mb-6" key={`citizenship-section-${formData.family_situation}`}>
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <Globe size={16} className="mr-1.5 lg:mr-2" />
              Citizenship
            </label>
            
            {isCouple ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 xl:gap-6">
                  <div>
                    <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5`}>
                      Your Citizenship *
                    </p>
                    <select
                      name="citizenship.primary_citizenship"
                      value={formData.citizenship.primary_citizenship}
                      onChange={handleInputChange}
                      className={isCitizenshipActive(formData.citizenship.primary_citizenship) ? uiConfig.components.selectActive : uiConfig.components.select}
                    >
                      <option value="">Select citizenship</option>
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    
                    <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5 mt-3`}>
                      Dual Citizenship
                      <input
                        id="dual_citizenship"
                        name="citizenship.dual_citizenship"
                        type="checkbox"
                        checked={formData.citizenship.dual_citizenship}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer ml-2"
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
                    </p>
                    
                    {formData.citizenship.dual_citizenship && (
                      <select
                        name="citizenship.secondary_citizenship"
                        value={formData.citizenship.secondary_citizenship === formData.citizenship.primary_citizenship ? '' : formData.citizenship.secondary_citizenship}
                        onChange={(e) => {
                          if (e.target.value !== formData.citizenship.primary_citizenship) {
                            handleInputChange(e);
                          }
                        }}
                        className={isCitizenshipActive(formData.citizenship.secondary_citizenship) ? uiConfig.components.selectActive : uiConfig.components.select}
                      >
                        <option value="">Select citizenship</option>
                        {countries
                          .filter(country => country.id !== formData.citizenship.primary_citizenship)
                          .map(country => (
                            <option key={`secondary-${country.id}`} value={country.id}>
                              {country.label}
                            </option>
                          ))}
                        <option value="other">Other</option>
                      </select>
                    )}
                  </div>
                  
                  <div>
                    <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5`}>
                      Partner's Citizenship *
                    </p>
                    <select
                      key={`partner-primary-${formData.family_situation}`}
                      name="partner_citizenship.primary_citizenship"
                      value={formData.partner_citizenship.primary_citizenship}
                      onChange={handleInputChange}
                      className={isCitizenshipActive(formData.partner_citizenship.primary_citizenship) ? uiConfig.components.selectActive : uiConfig.components.select}
                    >
                      <option value="">Select citizenship</option>
                      {countries.map(country => (
                        <option key={`partner-${country.id}`} value={country.id}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    
                    <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5 mt-3`}>
                      Dual Citizenship
                      <input
                        id="partner_dual_citizenship"
                        name="partner_citizenship.dual_citizenship"
                        type="checkbox"
                        checked={formData.partner_citizenship.dual_citizenship}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer ml-2"
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
                    </p>
                    
                    {formData.partner_citizenship.dual_citizenship && (
                      <select
                        key={`partner-secondary-${formData.family_situation}`}
                        name="partner_citizenship.secondary_citizenship"
                        value={formData.partner_citizenship.secondary_citizenship === formData.partner_citizenship.primary_citizenship ? '' : formData.partner_citizenship.secondary_citizenship}
                        onChange={(e) => {
                          if (e.target.value !== formData.partner_citizenship.primary_citizenship) {
                            handleInputChange(e);
                          }
                        }}
                        className={isCitizenshipActive(formData.partner_citizenship.secondary_citizenship) ? uiConfig.components.selectActive : uiConfig.components.select}
                      >
                        <option value="">Select citizenship</option>
                        {countries
                          .filter(country => country.id !== formData.partner_citizenship.primary_citizenship)
                          .map(country => (
                            <option key={`partner-secondary-${country.id}`} value={country.id}>
                              {country.label}
                            </option>
                          ))}
                        <option value="other">Other</option>
                      </select>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5`}>
                  Your Citizenship *
                </p>
                <select
                  name="citizenship.primary_citizenship"
                  value={formData.citizenship.primary_citizenship}
                  onChange={handleInputChange}
                  className={isCitizenshipActive(formData.citizenship.primary_citizenship) ? uiConfig.components.selectActive : uiConfig.components.select}
                >
                  <option value="">Select citizenship</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.label}
                    </option>
                  ))}
                </select>
                
                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5 mt-3`}>
                  Dual Citizenship
                  <input
                    id="dual_citizenship_single"
                    name="citizenship.dual_citizenship"
                    type="checkbox"
                    checked={formData.citizenship.dual_citizenship}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer ml-2"
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
                </p>
                
                {formData.citizenship.dual_citizenship && (
                  <div className="mt-2">
                    <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 flex items-center`}>
                      <Globe size={16} className="mr-1.5" />
                      Secondary Citizenship
                    </label>
                    {formData.citizenship.secondary_citizenship === formData.citizenship.primary_citizenship && (
                      <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.error} mb-1.5`}>
                        Secondary citizenship cannot be the same as primary. Please select a different country.
                      </p>
                    )}
                    <select
                      name="citizenship.secondary_citizenship"
                      value={
                        formData.citizenship.secondary_citizenship === formData.citizenship.primary_citizenship 
                          ? '' 
                          : formData.citizenship.secondary_citizenship
                      }
                      onChange={(e) => {
                        if (e.target.value !== formData.citizenship.primary_citizenship) {
                          handleInputChange(e);
                        }
                      }}
                      className={isCitizenshipActive(formData.citizenship.secondary_citizenship) ? uiConfig.components.selectActive : uiConfig.components.select}
                    >
                      <option value="">Select citizenship</option>
                      {countries
                        .filter(country => country.id !== formData.citizenship.primary_citizenship)
                        .map(country => (
                          <option key={`secondary-${country.id}`} value={country.id}>
                            {country.label}
                          </option>
                        ))}
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pet Owner */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <PawPrint size={16} className="mr-1.5 lg:mr-2" />
              Pet Owner
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
              <OptionButton
                label="Cat"
                isSelected={formData.pet_owner?.includes('cat') || false}
                onClick={() => handlePetChange('cat')}
              />
              <OptionButton
                label="Dog"
                isSelected={formData.pet_owner?.includes('dog') || false}
                onClick={() => handlePetChange('dog')}
              />
              <OptionButton
                label="Other"
                isSelected={formData.pet_owner?.includes('other') || false}
                onClick={() => handlePetChange('other')}
              />
            </div>
          </div>

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
                  {formData.family_situation === 'couple' && (
                    <>
                      {' • Partner: '}
                      {countries.find(c => c.id === formData.partner_citizenship.primary_citizenship)?.label || 'US'} citizen
                      {formData.partner_citizenship.dual_citizenship && ` + ${countries.find(c => c.id === formData.partner_citizenship.secondary_citizenship && c.id !== formData.partner_citizenship.primary_citizenship)?.label || ''}`}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Bottom Navigation - Fixed on mobile, sticky on desktop */}
        <div className={`fixed sm:sticky bottom-0 left-0 right-0 sm:relative ${uiConfig.colors.card} border-t ${uiConfig.colors.borderLight} p-4 sm:p-0 sm:border-0 sm:bg-transparent sm:mt-6 lg:mt-8`}>
          <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto">
            <div className="flex items-center">
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  await autoSave();
                  setLoading(false);
                  navigate('/welcome');
                }}
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
              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className={uiConfig.components.buttonPrimary}
              >
                {loading ? 'Saving...' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}