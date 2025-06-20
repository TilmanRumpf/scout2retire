import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Heart, Building, FileText } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import OnboardingStepNavigation from '../../components/OnboardingStepNavigation';
import toast from 'react-hot-toast';

// Option Button Component
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

export default function OnboardingAdministration() {
  const [formData, setFormData] = useState({
    health: {
      healthcare_quality: [],
      insurance_importance: [],
      special_medical_needs: false
    },
    safety: {
      safety_importance: [],
      emergency_services: [],
      political_stability: []
    },
    governance: {
      tax_preference: [],
      government_efficiency: []
    },
    immigration: {
      visa_preference: [],
      stay_duration: [],
      residency_path: []
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState({ completedSteps: {} });
  const navigate = useNavigate();

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
        
        // If administration data exists, load it with proper conversion
        if (data && data.administration) {
          const loadedData = data.administration;
          
          // Map old data structure to new simplified structure
          const convertedData = {
            health: {
              healthcare_quality: loadedData.health?.healthcare_access || [],
              insurance_importance: loadedData.health?.insurance_priority || [],
              special_medical_needs: loadedData.health?.chronic_conditions || loadedData.health?.prescription_needs || false
            },
            safety: {
              safety_importance: loadedData.safety?.crime_tolerance || [],
              emergency_services: loadedData.safety?.emergency_services || [],
              political_stability: loadedData.safety?.political_stability || []
            },
            governance: {
              tax_preference: loadedData.governance?.tax_complexity || [],
              government_efficiency: loadedData.governance?.bureaucracy_tolerance || []
            },
            immigration: {
              visa_preference: loadedData.immigration?.visa_complexity || [],
              stay_duration: loadedData.immigration?.residency_goal || [],
              residency_path: []
            }
          };
          
          // Ensure all fields are arrays
          Object.keys(convertedData).forEach(section => {
            Object.keys(convertedData[section]).forEach(field => {
              if (field !== 'special_medical_needs' && !Array.isArray(convertedData[section][field])) {
                convertedData[section][field] = convertedData[section][field] ? [convertedData[section][field]] : [];
              }
            });
          });
          
          setFormData(convertedData);
        }
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadExistingData();
  }, [navigate]);

  const handleNestedToggle = (section, field, value) => {
    setFormData(prev => {
      const currentValues = prev[section][field] || [];
      const isSelected = currentValues.includes(value);
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: isSelected 
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value]
        }
      };
    });
  };

  const handleCheckboxChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSkip = () => {
    navigate('/onboarding/costs');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        navigate('/welcome');
        return;
      }
      
      const { success, error } = await saveOnboardingStep(
        user.id,
        formData,
        'administration'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Administration preferences saved!');
      navigate('/onboarding/costs');
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

  // Standardized options for all quality selections
  const qualityOptions = [
    { value: 'excellent', label: 'Good' },
    { value: 'good', label: 'Functional' },
    { value: 'basic', label: 'Basic' }
  ];

  const stayDurationOptions = [
    { value: 'short', label: '1-2 Years' },
    { value: 'medium', label: '3-5 Years' },
    { value: 'long', label: '5+ Years' }
  ];

  const residencyPathOptions = [
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'residence', label: 'Residence' },
    { value: 'citizenship', label: 'Citizenship' }
  ];

  return (
    <div className="min-h-[100svh] bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-4">
      <div className="max-w-md mx-auto p-4 sm:p-4">
        <OnboardingStepNavigation 
          currentStep="administration" 
          completedSteps={progress.completedSteps} 
          className="mb-3" 
        />
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5">
          {/* Header */}
          <div className="mb-3">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Healthcare & Administration</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Tell us about your healthcare and administrative preferences
            </p>
          </div>

          {/* Health & Medical */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Heart size={16} className="mr-1.5" />
              Healthcare Preferences
            </label>
            
            {/* Healthcare Quality */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">Healthcare Quality</p>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {qualityOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.health.healthcare_quality.includes(option.value)}
                  onClick={() => handleNestedToggle('health', 'healthcare_quality', option.value)}
                />
              ))}
            </div>

            {/* Health Insurance */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">Health Insurance</p>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {qualityOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.health.insurance_importance.includes(option.value)}
                  onClick={() => handleNestedToggle('health', 'insurance_importance', option.value)}
                />
              ))}
            </div>

            {/* Special Medical Needs */}
            <div className="flex items-center">
              <input
                id="special_medical_needs"
                type="checkbox"
                checked={formData.health.special_medical_needs}
                onChange={(e) => handleCheckboxChange('health', 'special_medical_needs', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer"
                style={{ 
                  accentColor: '#8fbc8f',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  backgroundColor: formData.health.special_medical_needs ? '#8fbc8f' : 'transparent',
                  border: formData.health.special_medical_needs ? '1px solid #8fbc8f' : '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  backgroundImage: formData.health.special_medical_needs 
                    ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                    : 'none',
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  transition: 'all 0.15s ease-in-out'
                }}
              />
              <label htmlFor="special_medical_needs" className="ml-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                I have special medical needs or require regular prescriptions
              </label>
            </div>
          </div>

          {/* Safety & Security */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Shield size={16} className="mr-1.5" />
              Safety & Security
            </label>
            
            {/* Quality of Safety */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">Quality of Safety</p>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {qualityOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.safety.safety_importance.includes(option.value)}
                  onClick={() => handleNestedToggle('safety', 'safety_importance', option.value)}
                />
              ))}
            </div>

            {/* Emergency Services */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">Emergency Services</p>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {qualityOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.safety.emergency_services.includes(option.value)}
                  onClick={() => handleNestedToggle('safety', 'emergency_services', option.value)}
                />
              ))}
            </div>

            {/* Political Stability Rating */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">Political Stability Rating</p>
            <div className="grid grid-cols-3 gap-1.5">
              {qualityOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.safety.political_stability.includes(option.value)}
                  onClick={() => handleNestedToggle('safety', 'political_stability', option.value)}
                />
              ))}
            </div>
          </div>

          {/* Governance & Legal */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Building size={16} className="mr-1.5" />
              Government & Taxes
            </label>
            
            {/* Tax System Quality */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">Tax System Quality</p>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {qualityOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.governance.tax_preference.includes(option.value)}
                  onClick={() => handleNestedToggle('governance', 'tax_preference', option.value)}
                />
              ))}
            </div>

            {/* Government Efficiency */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">Government Efficiency</p>
            <div className="grid grid-cols-3 gap-1.5">
              {qualityOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.governance.government_efficiency.includes(option.value)}
                  onClick={() => handleNestedToggle('governance', 'government_efficiency', option.value)}
                />
              ))}
            </div>
          </div>

          {/* Immigration & Residency */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <FileText size={16} className="mr-1.5" />
              Visa & Residency
            </label>
            
            {/* Visa Process */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">Visa Process</p>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {qualityOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.immigration.visa_preference.includes(option.value)}
                  onClick={() => handleNestedToggle('immigration', 'visa_preference', option.value)}
                />
              ))}
            </div>

            {/* Stay Duration */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">How long do you plan to stay?</p>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {stayDurationOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.immigration.stay_duration.includes(option.value)}
                  onClick={() => handleNestedToggle('immigration', 'stay_duration', option.value)}
                />
              ))}
            </div>

            {/* Residency Path */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">Residency goals</p>
            <div className="grid grid-cols-3 gap-1.5">
              {residencyPathOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.immigration.residency_path.includes(option.value)}
                  onClick={() => handleNestedToggle('immigration', 'residency_path', option.value)}
                />
              ))}
            </div>
          </div>

          {/* Summary Section */}
          <div className="mb-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="font-medium text-gray-800 dark:text-white mb-1.5 text-sm">
              Your Administrative Preferences:
            </h3>
            <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
              {formData.health.healthcare_quality.length > 0 && (
                <div><span className="font-medium">Healthcare:</span> {formData.health.healthcare_quality.join(', ')}</div>
              )}
              {formData.health.insurance_importance.length > 0 && (
                <div><span className="font-medium">Insurance:</span> {formData.health.insurance_importance.join(', ')}</div>
              )}
              {formData.safety.safety_importance.length > 0 && (
                <div><span className="font-medium">Safety:</span> {formData.safety.safety_importance.join(', ')}</div>
              )}
              {formData.governance.tax_preference.length > 0 && (
                <div><span className="font-medium">Tax system:</span> {formData.governance.tax_preference.join(', ')}</div>
              )}
              {formData.immigration.stay_duration.length > 0 && (
                <div><span className="font-medium">Stay duration:</span> {formData.immigration.stay_duration.join(', ')}</div>
              )}
              {formData.immigration.residency_path.length > 0 && (
                <div><span className="font-medium">Goals:</span> {formData.immigration.residency_path.join(', ')}</div>
              )}
              {formData.health.special_medical_needs && (
                <div><span className="font-medium">Special needs:</span> Medical care required</div>
              )}
            </div>
          </div>

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
                  <span className="font-medium">Pro Tip:</span> These preferences help us identify locations with the right infrastructure and policies for your needs.
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
                  onClick={() => navigate('/onboarding/hobbies')}
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
                  {loading ? 'Saving...' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}