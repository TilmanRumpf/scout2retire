import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Globe, PawPrint } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import OnboardingStepNavigation from '../../components/OnboardingStepNavigation';
import toast from 'react-hot-toast';

// Option Button Component - 10JUN25
const OptionButton = ({ label, description, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-3 rounded-md border-2 transition-all text-center ${
      isSelected
        ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20 ring-2 ring-scout-accent-300 ring-offset-1'
        : 'border-gray-300 dark:border-gray-600 hover:border-scout-accent-200 dark:hover:border-scout-accent-400'
    }`}
  >
    <div className={`text-sm font-medium ${isSelected ? 'text-scout-accent-700 dark:text-scout-accent-300' : ''}`}>{label}</div>
    {description && <div className={`text-xs mt-1 ${isSelected ? 'text-scout-accent-600 dark:text-scout-accent-400' : 'text-gray-500 dark:text-gray-400'}`}>{description}</div>}
  </button>
);

export default function OnboardingCurrentStatus() {
  const [formData, setFormData] = useState({
    retirement_timeline: {
      status: 'planning',
      target_year: new Date().getFullYear() + 5,
      flexibility: 'somewhat_flexible'
    },
    family_situation: 'solo', // Simple string instead of object
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

  // Country list - Professional format without flags
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

  // Load existing data if available
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
        
        // If current status data exists, load it
        if (data && data.current_status) {
          setFormData(prev => ({
            ...prev,
            retirement_timeline: data.current_status.retirement_timeline || prev.retirement_timeline,
            // Handle family_situation - could be string or object
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
      
      // Special handling for dual citizenship checkbox
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
        // When primary citizenship changes, clear secondary if it's the same
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
      // Reset partner citizenship when switching away from couple
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate citizenship data
    if (formData.citizenship.dual_citizenship && 
        formData.citizenship.secondary_citizenship === formData.citizenship.primary_citizenship) {
      toast.error('Secondary citizenship must be different from primary citizenship');
      return;
    }
    
    // Validate partner citizenship if couple
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
      
      // Clean the form data before saving
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-scout-accent-600 font-semibold">Loading...</div>
      </div>
    );
  }

  // Generate retirement year options (current year to +30 years)
  const retirementYearOptions = [];
  for (let i = 0; i <= 30; i++) {
    retirementYearOptions.push(currentYear + i);
  }

  // Check if couple is selected
  const isCouple = formData.family_situation === 'couple';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <OnboardingStepNavigation 
          currentStep="current_status" 
          completedSteps={progress.completedSteps} 
          className="mb-4" 
        />
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4">
          {/* Header - mb-4 */}
          <div className="mb-4">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Current Status</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Tell us about your retirement timeline and family situation
            </p>
          </div>

          {/* Retirement Status - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Calendar size={18} className="mr-1.5" />
              Retirement Timeline
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
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

          {/* Target Year (if not already retired) - mb-4 */}
          {formData.retirement_timeline.status !== 'already_retired' && (
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Target Retirement Year
              </label>
              <select
                name="retirement_timeline.target_year"
                value={formData.retirement_timeline.target_year}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                {retirementYearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {/* Family Situation - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Users size={18} className="mr-1.5" />
              Family Situation
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
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

          {/* Citizenship - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Globe size={18} className="mr-1.5" />
              Citizenship
            </label>
            
            {isCouple ? (
              <>
                {/* Couple Layout - Two columns */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Your Citizenship */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Your citizenship *
                    </p>
                    <select
                      name="citizenship.primary_citizenship"
                      value={formData.citizenship.primary_citizenship}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    >
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    
                    {/* Your Dual Citizenship */}
                    <div className="mt-2 flex items-center">
                      <input
                        id="dual_citizenship"
                        name="citizenship.dual_citizenship"
                        type="checkbox"
                        checked={formData.citizenship.dual_citizenship}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-2 focus:ring-scout-accent-300 focus:ring-offset-0 cursor-pointer"
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
                      <label htmlFor="dual_citizenship" className="ml-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                        Dual citizenship
                      </label>
                    </div>
                    
                    {/* Your Secondary */}
                    {formData.citizenship.dual_citizenship && (
                      <select
                        name="citizenship.secondary_citizenship"
                        value={formData.citizenship.secondary_citizenship === formData.citizenship.primary_citizenship ? '' : formData.citizenship.secondary_citizenship}
                        onChange={(e) => {
                          if (e.target.value !== formData.citizenship.primary_citizenship) {
                            handleInputChange(e);
                          }
                        }}
                        className="w-full mt-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                  
                  {/* Partner's Citizenship */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Partner's citizenship *
                    </p>
                    <select
                      name="partner_citizenship.primary_citizenship"
                      value={formData.partner_citizenship.primary_citizenship}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    >
                      {countries.map(country => (
                        <option key={`partner-${country.id}`} value={country.id}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    
                    {/* Partner's Dual Citizenship */}
                    <div className="mt-2 flex items-center">
                      <input
                        id="partner_dual_citizenship"
                        name="partner_citizenship.dual_citizenship"
                        type="checkbox"
                        checked={formData.partner_citizenship.dual_citizenship}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-2 focus:ring-scout-accent-300 focus:ring-offset-0 cursor-pointer"
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
                      <label htmlFor="partner_dual_citizenship" className="ml-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                        Dual citizenship
                      </label>
                    </div>
                    
                    {/* Partner's Secondary */}
                    {formData.partner_citizenship.dual_citizenship && (
                      <select
                        name="partner_citizenship.secondary_citizenship"
                        value={formData.partner_citizenship.secondary_citizenship === formData.partner_citizenship.primary_citizenship ? '' : formData.partner_citizenship.secondary_citizenship}
                        onChange={(e) => {
                          if (e.target.value !== formData.partner_citizenship.primary_citizenship) {
                            handleInputChange(e);
                          }
                        }}
                        className="w-full mt-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                {/* Solo/Family Layout - Single column */}
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Primary citizenship *
                </p>
                <select
                  name="citizenship.primary_citizenship"
                  value={formData.citizenship.primary_citizenship}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.label}
                    </option>
                  ))}
                </select>
                
                {/* Dual Citizenship Checkbox - White checkmark via browser default */}
                <div className="mt-2 flex items-center">
                  <input
                    id="dual_citizenship"
                    name="citizenship.dual_citizenship"
                    type="checkbox"
                    checked={formData.citizenship.dual_citizenship}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-2 focus:ring-scout-accent-300 focus:ring-offset-0 cursor-pointer"
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
                
                {/* Secondary Citizenship Dropdown */}
                {formData.citizenship.dual_citizenship && (
                  <div className="mt-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Globe size={18} className="mr-1.5" />
                      Secondary Citizenship
                    </label>
                    {formData.citizenship.secondary_citizenship === formData.citizenship.primary_citizenship && (
                      <p className="text-xs text-red-600 dark:text-red-400 mb-2">
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
                      className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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

          {/* Pet Owner - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <PawPrint size={18} className="mr-1.5" />
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

          {/* Summary Section - mb-4 */}
          {(formData.retirement_timeline.status || formData.family_situation) && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Summary:</span>
                <div className="mt-1 text-xs">
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
          <div className="mb-4 p-3 bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg">
            <div className="flex items-start">
              <div className="mr-2">
                <svg className="h-5 w-5 text-scout-accent-600 dark:text-scout-accent-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Pro Tip:</span> Your citizenship affects visa requirements, tax implications, and healthcare access in different countries. We'll use this to provide personalized recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/welcome')}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm bg-scout-accent-300 hover:bg-scout-accent-400 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}