// src/pages/onboarding/OnboardingCurrentStatus.jsx
// Updated 10JUN25: Fixed data persistence and proper integration
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import OnboardingStepNavigation from '../../components/OnboardingStepNavigation';
import { ChevronRight, ChevronLeft, User, Users, Home, Globe2, Calendar, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';

export default function OnboardingCurrentStatus() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState({});
  
  // Updated form structure to match your requirements
  const [formData, setFormData] = useState({
    retirement_timeline: {
      status: '',
      target_year: currentYear + 5
    },
    family_situation: {
      status: '',
      dependents: 0
    },
    citizenship: {
      primary_citizenship: '',
      dual_citizenship: false,
      other_citizenships: []
    }
  });

  // Load existing data on mount
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        
        // Fetch existing onboarding data
        const { success, progress, data } = await getOnboardingProgress(user.id);
        
        if (success) {
          setCompletedSteps(progress.completedSteps);
          
          // If current_status data exists, populate the form
          if (data?.current_status) {
            setFormData(prevData => ({
              ...prevData,
              ...data.current_status
            }));
          }
        }
      } catch (err) {
        console.error("Error loading existing data:", err);
        toast.error('Failed to load your saved data');
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadExistingData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;
    
    // Handle nested object updates
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
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
      family_situation: {
        ...prev.family_situation,
        status
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

  const isFormValid = () => {
    return formData.retirement_timeline.status && 
           formData.family_situation.status && 
           formData.citizenship.primary_citizenship;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Please complete all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        navigate('/welcome');
        return;
      }
      
      // Save using the utility function
      const { success, error } = await saveOnboardingStep(
        user.id,
        formData,
        'current_status'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
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
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className="animate-pulse text-scout-accent-600 font-semibold">Loading...</div>
      </div>
    );
  }

  // Generate retirement year options
  const retirementYearOptions = [];
  for (let i = 0; i <= 30; i++) {
    retirementYearOptions.push(currentYear + i);
  }

  // Country list for citizenship
  const countries = [
    'US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR', 'ES', 'IT', 'PT', 
    'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'IE', 'JP',
    'KR', 'SG', 'HK', 'IN', 'BR', 'MX', 'AR', 'CL', 'CO', 'ZA'
  ].sort();

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} p-4 pb-20`}>
      <div className={`${uiConfig.layout.width.containerNarrow}`}>
        {/* Navigation */}
        <OnboardingStepNavigation 
          currentStep="current_status"
          completedSteps={completedSteps}
        />

        {/* Title Section */}
        <div className="mb-6 text-center">
          <h1 className={`${uiConfig.font.size['2xl']} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading} mb-2`}>
            Your Current Situation
          </h1>
          <p className={`${uiConfig.colors.body}`}>
            Tell us about your current situation to personalize your retirement journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Retirement Timeline Section */}
          <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} ${uiConfig.layout.spacing.card}`}>
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-scout-accent-600 mr-2" />
              <h2 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>
                Retirement Timeline
              </h2>
            </div>
            
            <div className="space-y-4">
              <label className={uiConfig.components.label}>
                Where are you in your retirement journey? *
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleRetirementStatusChange('planning')}
                  className={`${
                    formData.retirement_timeline.status === 'planning'
                      ? uiConfig.components.buttonVariants.selected
                      : uiConfig.components.buttonVariants.unselected
                  }`}
                >
                  <Calendar className="h-4 w-4 mb-1" />
                  <span className="block">Planning</span>
                  <span className="text-xs opacity-75">5+ years away</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleRetirementStatusChange('retiring_soon')}
                  className={`${
                    formData.retirement_timeline.status === 'retiring_soon'
                      ? uiConfig.components.buttonVariants.selected
                      : uiConfig.components.buttonVariants.unselected
                  }`}
                >
                  <Calendar className="h-4 w-4 mb-1" />
                  <span className="block">Retiring Soon</span>
                  <span className="text-xs opacity-75">Within 5 years</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleRetirementStatusChange('already_retired')}
                  className={`${
                    formData.retirement_timeline.status === 'already_retired'
                      ? uiConfig.components.buttonVariants.selected
                      : uiConfig.components.buttonVariants.unselected
                  }`}
                >
                  <Home className="h-4 w-4 mb-1" />
                  <span className="block">Retired</span>
                  <span className="text-xs opacity-75">Living the dream</span>
                </button>
              </div>
              
              {formData.retirement_timeline.status !== 'already_retired' && formData.retirement_timeline.status && (
                <div className="mt-4">
                  <label htmlFor="target_year" className={uiConfig.components.label}>
                    Target retirement year
                  </label>
                  <select
                    id="target_year"
                    name="retirement_timeline.target_year"
                    value={formData.retirement_timeline.target_year}
                    onChange={handleInputChange}
                    className={uiConfig.components.select}
                  >
                    {retirementYearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Family Situation Section */}
          <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} ${uiConfig.layout.spacing.card}`}>
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-scout-accent-600 mr-2" />
              <h2 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>
                Family Situation
              </h2>
            </div>
            
            <div className="space-y-4">
              <label className={uiConfig.components.label}>
                Who's joining you on this adventure? *
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleFamilyStatusChange('solo')}
                  className={`${
                    formData.family_situation.status === 'solo'
                      ? uiConfig.components.buttonVariants.selected
                      : uiConfig.components.buttonVariants.unselected
                  }`}
                >
                  <User className="h-4 w-4 mb-1" />
                  <span className="block">Solo</span>
                  <span className="text-xs opacity-75">Just me</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleFamilyStatusChange('couple')}
                  className={`${
                    formData.family_situation.status === 'couple'
                      ? uiConfig.components.buttonVariants.selected
                      : uiConfig.components.buttonVariants.unselected
                  }`}
                >
                  <Users className="h-4 w-4 mb-1" />
                  <span className="block">Couple</span>
                  <span className="text-xs opacity-75">Me & partner</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleFamilyStatusChange('family')}
                  className={`${
                    formData.family_situation.status === 'family'
                      ? uiConfig.components.buttonVariants.selected
                      : uiConfig.components.buttonVariants.unselected
                  }`}
                >
                  <Home className="h-4 w-4 mb-1" />
                  <span className="block">Family</span>
                  <span className="text-xs opacity-75">With dependents</span>
                </button>
              </div>
              
              {formData.family_situation.status === 'family' && (
                <div className="mt-4">
                  <label htmlFor="dependents" className={uiConfig.components.label}>
                    Number of dependents
                  </label>
                  <input
                    type="number"
                    id="dependents"
                    name="family_situation.dependents"
                    min="0"
                    max="10"
                    value={formData.family_situation.dependents}
                    onChange={handleInputChange}
                    className={uiConfig.components.input}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Citizenship Section */}
          <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} ${uiConfig.layout.spacing.card}`}>
            <div className="flex items-center mb-4">
              <Globe2 className="h-5 w-5 text-scout-accent-600 mr-2" />
              <h2 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>
                Citizenship
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="primary_citizenship" className={uiConfig.components.labelRequired}>
                  Primary citizenship
                </label>
                <select
                  id="primary_citizenship"
                  name="citizenship.primary_citizenship"
                  value={formData.citizenship.primary_citizenship}
                  onChange={handleInputChange}
                  className={uiConfig.components.select}
                  required
                >
                  <option value="">Select your citizenship</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dual_citizenship"
                  name="citizenship.dual_citizenship"
                  checked={formData.citizenship.dual_citizenship}
                  onChange={handleInputChange}
                  className={uiConfig.components.checkbox}
                />
                <label htmlFor="dual_citizenship" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  I have dual/multiple citizenship
                </label>
              </div>
            </div>
          </div>

          {/* Professional tip */}
          <div className="bg-scout-accent-50 dark:bg-scout-accent-900/20 border border-scout-accent-200 dark:border-scout-accent-800 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-scout-accent-600 dark:text-scout-accent-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-scout-accent-700 dark:text-scout-accent-300">
                <p className="font-medium mb-1">Pro Tip:</p>
                <p>Your citizenship affects visa requirements, tax implications, and healthcare access in different countries. We'll use this to provide personalized recommendations.</p>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate('/onboarding/progress')}
              className={uiConfig.bottomNavigation.styles.backButton}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </button>
            
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className={`${uiConfig.bottomNavigation.styles.nextButton} ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}