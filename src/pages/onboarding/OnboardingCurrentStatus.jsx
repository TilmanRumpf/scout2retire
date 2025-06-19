import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Globe, PawPrint } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import OnboardingStepNavigation from '../../components/OnboardingStepNavigation';
import toast from 'react-hot-toast';

// Option Button Component - Optimized for mobile
const OptionButton = ({ label, description, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 sm:p-2.5 rounded-md border-2 transition-all text-center min-h-[44px] ${
      isSelected
        ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20'
        : 'border-gray-300 dark:border-gray-600 hover:border-scout-accent-200 dark:hover:border-scout-accent-400'
    }`}
  >
    <div className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-scout-accent-700 dark:text-scout-accent-300' : ''}`}>{label}</div>
    {description && <div className={`text-[10px] sm:text-xs mt-0.5 ${isSelected ? 'text-scout-accent-600 dark:text-scout-accent-400' : 'text-gray-500 dark:text-gray-400'}`}>{description}</div>}
  </button>
);

export default function OnboardingCurrentStatus() {
  const [formData, setFormData] = useState({
    retirement_timeline: {
      status: 'planning',
      target_year: new Date().getFullYear() + 5,
      flexibility: 'somewhat_flexible'
    },
    family_situation: 'solo',
    pet_owner: [],
    citizenship: {
      primary_citizenship: 'us',
      dual_citizenship: false,
      secondary_citizenship: ''
    },
    partner_citizenship: {
      primary_citizenship: 'us',
      dual_citizenship: false,
      secondary_citizenship: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState({ completedSteps: {} });
  const navigate = useNavigate();
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
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        
        const { success, data, progress: userProgress, error } = await getOnboardingProgress(user.id);
        if (!success) {
          console.error("Error loading existing data:", error);
          setInitialLoading(false);
          return;
        }
        
        setProgress(userProgress);
        
        if (data && data.current_status) {
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

  const handleFamilyStatusChange = (status) => {
    setFormData(prev => ({
      ...prev,
      family_situation: status,
      partner_citizenship: status === 'couple' ? prev.partner_citizenship : {
        primary_citizenship: 'us',
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

  const handleSkip = () => {
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
      const { user } = await getCurrentUser();
      if (!user) {
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
        user.id,
        cleanedFormData,
        'current_status'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Current status saved!');
      navigate('/onboarding/region');
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[100svh] bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-scout-accent-600 font-semibold">Loading...</div>
      </div>
    );
  }

  const retirementYearOptions = [];
  for (let i = 0; i <= 30; i++) {
    retirementYearOptions.push(currentYear + i);
  }

  const isCouple = formData.family_situation === 'couple';

  return (
    <div className="min-h-[100svh] bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-4">
      <div className="max-w-md mx-auto p-4 sm:p-4">
        <OnboardingStepNavigation 
          currentStep="current_status" 
          completedSteps={progress.completedSteps} 
          className="mb-3" 
        />
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5">
          {/* Header */}
          <div className="mb-3">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Current Status</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Tell us about your retirement timeline and family situation
            </p>
          </div>

          {/* Retirement Status */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Calendar size={16} className="mr-1.5" />
              Retirement Timeline
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Where are you in your retirement journey? *
            </p>
            <div className="grid grid-cols-3 gap-1.5">
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

          {/* Target Year */}
          {formData.retirement_timeline.status !== 'already_retired' && (
            <div className="mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Target Retirement Year
              </label>
              <select
                name="retirement_timeline.target_year"
                value={formData.retirement_timeline.target_year}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white h-[44px]"
              >
                {retirementYearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {/* Family Situation */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Users size={16} className="mr-1.5" />
              Family Situation
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Who's joining you on this adventure? *
            </p>
            <div className="grid grid-cols-3 gap-1.5">
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
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Globe size={16} className="mr-1.5" />
              Citizenship
            </label>
            
            {isCouple ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                      Your citizenship *
                    </p>
                    <select
                      name="citizenship.primary_citizenship"
                      value={formData.citizenship.primary_citizenship}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white h-[44px]"
                    >
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    
                    <div className="mt-1.5 flex items-center">
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
                      <label htmlFor="dual_citizenship" className="ml-1.5 text-[11px] text-gray-700 dark:text-gray-300 cursor-pointer">
                        Dual citizenship
                      </label>
                    </div>
                    
                    {formData.citizenship.dual_citizenship && (
                      <select
                        name="citizenship.secondary_citizenship"
                        value={formData.citizenship.secondary_citizenship === formData.citizenship.primary_citizenship ? '' : formData.citizenship.secondary_citizenship}
                        onChange={(e) => {
                          if (e.target.value !== formData.citizenship.primary_citizenship) {
                            handleInputChange(e);
                          }
                        }}
                        className="w-full mt-1.5 px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white h-[44px]"
                      >
                        <option value="">Select secondary</option>
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
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                      Partner's citizenship *
                    </p>
                    <select
                      name="partner_citizenship.primary_citizenship"
                      value={formData.partner_citizenship.primary_citizenship}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white h-[44px]"
                    >
                      {countries.map(country => (
                        <option key={`partner-${country.id}`} value={country.id}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    
                    <div className="mt-1.5 flex items-center">
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
                      <label htmlFor="partner_dual_citizenship" className="ml-1.5 text-[11px] text-gray-700 dark:text-gray-300 cursor-pointer">
                        Dual citizenship
                      </label>
                    </div>
                    
                    {formData.partner_citizenship.dual_citizenship && (
                      <select
                        name="partner_citizenship.secondary_citizenship"
                        value={formData.partner_citizenship.secondary_citizenship === formData.partner_citizenship.primary_citizenship ? '' : formData.partner_citizenship.secondary_citizenship}
                        onChange={(e) => {
                          if (e.target.value !== formData.partner_citizenship.primary_citizenship) {
                            handleInputChange(e);
                          }
                        }}
                        className="w-full mt-1.5 px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white h-[44px]"
                      >
                        <option value="">Select secondary</option>
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
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Primary citizenship *
                </p>
                <select
                  name="citizenship.primary_citizenship"
                  value={formData.citizenship.primary_citizenship}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white h-[44px]"
                >
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.label}
                    </option>
                  ))}
                </select>
                
                <div className="mt-2 flex items-center">
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
                  <label htmlFor="dual_citizenship" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    I have dual/multiple citizenship
                  </label>
                </div>
                
                {formData.citizenship.dual_citizenship && (
                  <div className="mt-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
                      <Globe size={16} className="mr-1.5" />
                      Secondary Citizenship
                    </label>
                    {formData.citizenship.secondary_citizenship === formData.citizenship.primary_citizenship && (
                      <p className="text-xs text-red-600 dark:text-red-400 mb-1.5">
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white h-[44px]"
                    >
                      <option value="">Select secondary citizenship</option>
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
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <PawPrint size={16} className="mr-1.5" />
              Pet Owner
            </label>
            <div className="grid grid-cols-3 gap-1.5">
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
            <div className="mb-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Summary:</span>
                <div className="mt-0.5 text-xs">
                  {formData.retirement_timeline.status === 'planning' && 'Planning for retirement (5+ years)'}
                  {formData.retirement_timeline.status === 'retiring_soon' && 'Retiring within 5 years'}
                  {formData.retirement_timeline.status === 'already_retired' && 'Already retired'}
                  {formData.retirement_timeline.status !== 'already_retired' && 
                    ` in ${formData.retirement_timeline.target_year}`}
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

          {/* Pro Tip */}
          <div className="mb-3 p-2.5 bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg">
            <div className="flex items-start">
              <div className="mr-2">
                <svg className="h-4 w-4 text-scout-accent-600 dark:text-scout-accent-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Pro Tip:</span> Your citizenship affects visa requirements, tax implications, and healthcare access in different countries.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Bottom Navigation - Fixed on mobile, sticky on desktop */}
        <div className="fixed sm:sticky bottom-0 left-0 right-0 sm:relative bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sm:p-0 sm:border-0 sm:bg-transparent sm:mt-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-3 shadow-lg sm:shadow-none">
              <div className="flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/welcome')}
                  className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium transition-colors min-h-[44px]"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors min-h-[44px]"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 text-sm bg-scout-accent-300 hover:bg-scout-accent-400 text-white font-medium rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  {loading ? 'Saving...' : 'Continue →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}