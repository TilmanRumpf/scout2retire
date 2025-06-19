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
    className={`p-3 rounded-md border-2 transition-all text-center ${
      isSelected
        ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20'
        : 'border-gray-300 dark:border-gray-600 hover:border-scout-accent-200 dark:hover:border-scout-accent-400'
    }`}
  >
    <div className={`text-sm font-medium ${isSelected ? 'text-scout-accent-700 dark:text-scout-accent-300' : ''}`}>{label}</div>
    {description && <div className={`text-xs mt-1 ${isSelected ? 'text-scout-accent-600 dark:text-scout-accent-400' : 'text-gray-500 dark:text-gray-400'}`}>{description}</div>}
  </button>
);

export default function OnboardingAdministration() {
  const [formData, setFormData] = useState({
    health: {
      insurance_priority: [],
      healthcare_access: [],
      chronic_conditions: false,
      prescription_needs: false
    },
    safety: {
      crime_tolerance: [],
      political_stability: [],
      emergency_services: []
    },
    governance: {
      tax_complexity: [],
      bureaucracy_tolerance: []
    },
    immigration: {
      visa_complexity: [],
      residency_goal: [],
      documentation_comfort: []
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
        
        // If administration data exists, load it
        if (data && data.administration) {
          // Convert single values to arrays if needed
          const loadedData = data.administration;
          const convertedData = {
            health: {
              insurance_priority: Array.isArray(loadedData.health?.insurance_priority) 
                ? loadedData.health.insurance_priority 
                : (loadedData.health?.insurance_priority ? [loadedData.health.insurance_priority] : []),
              healthcare_access: Array.isArray(loadedData.health?.healthcare_access) 
                ? loadedData.health.healthcare_access 
                : (loadedData.health?.healthcare_access ? [loadedData.health.healthcare_access] : []),
              chronic_conditions: loadedData.health?.chronic_conditions || false,
              prescription_needs: loadedData.health?.prescription_needs || false
            },
            safety: {
              crime_tolerance: Array.isArray(loadedData.safety?.crime_tolerance) 
                ? loadedData.safety.crime_tolerance 
                : (loadedData.safety?.crime_tolerance ? [loadedData.safety.crime_tolerance] : []),
              political_stability: Array.isArray(loadedData.safety?.political_stability) 
                ? loadedData.safety.political_stability 
                : (loadedData.safety?.political_stability ? [loadedData.safety.political_stability] : []),
              emergency_services: Array.isArray(loadedData.safety?.emergency_services) 
                ? loadedData.safety.emergency_services 
                : (loadedData.safety?.emergency_services ? [loadedData.safety.emergency_services] : [])
            },
            governance: {
              tax_complexity: Array.isArray(loadedData.governance?.tax_complexity) 
                ? loadedData.governance.tax_complexity 
                : (loadedData.governance?.tax_complexity ? [loadedData.governance.tax_complexity] : []),
              bureaucracy_tolerance: Array.isArray(loadedData.governance?.bureaucracy_tolerance) 
                ? loadedData.governance.bureaucracy_tolerance 
                : (loadedData.governance?.bureaucracy_tolerance ? [loadedData.governance.bureaucracy_tolerance] : [])
            },
            immigration: {
              visa_complexity: Array.isArray(loadedData.immigration?.visa_complexity) 
                ? loadedData.immigration.visa_complexity 
                : (loadedData.immigration?.visa_complexity ? [loadedData.immigration.visa_complexity] : []),
              residency_goal: Array.isArray(loadedData.immigration?.residency_goal) 
                ? loadedData.immigration.residency_goal 
                : (loadedData.immigration?.residency_goal ? [loadedData.immigration.residency_goal] : []),
              documentation_comfort: Array.isArray(loadedData.immigration?.documentation_comfort) 
                ? loadedData.immigration.documentation_comfort 
                : (loadedData.immigration?.documentation_comfort ? [loadedData.immigration.documentation_comfort] : [])
            }
          };
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-scout-accent-600 font-semibold">Loading...</div>
      </div>
    );
  }

  // Option configurations
  const insuranceOptions = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Moderate' },
    { value: 'low', label: 'Low Priority' }
  ];

  const healthcareOptions = [
    { value: 'excellent', label: 'World-Class' },
    { value: 'good', label: 'Good Quality' },
    { value: 'basic', label: 'Basic Care' }
  ];

  const crimeToleranceOptions = [
    { value: 'low', label: 'Very Safe' },
    { value: 'medium', label: 'Moderate' },
    { value: 'high', label: 'Adaptable' }
  ];

  const politicalStabilityOptions = [
    { value: 'high', label: 'Very Important' },
    { value: 'medium', label: 'Moderate' },
    { value: 'low', label: 'Flexible' }
  ];

  const emergencyServicesOptions = [
    { value: 'excellent', label: 'World-Class' },
    { value: 'good', label: 'Good Quality' },
    { value: 'basic', label: 'Basic Services' }
  ];

  const taxComplexityOptions = [
    { value: 'simple', label: 'Simple' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'complex', label: 'Complex OK' }
  ];

  const bureaucracyOptions = [
    { value: 'low', label: 'Minimal' },
    { value: 'medium', label: 'Moderate' },
    { value: 'high', label: 'Patient' }
  ];

  const visaComplexityOptions = [
    { value: 'simple', label: 'Simple Only' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'complex', label: 'Complex OK' }
  ];

  const residencyGoalOptions = [
    { value: 'temporary', label: 'Temporary', description: '1-5 years' },
    { value: 'permanent', label: 'Permanent' },
    { value: 'citizenship', label: 'Citizenship' }
  ];

  const documentationOptions = [
    { value: 'high', label: 'Comfortable' },
    { value: 'medium', label: 'Moderate' },
    { value: 'low', label: 'Prefer Simple' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <OnboardingStepNavigation 
          currentStep="administration" 
          completedSteps={progress.completedSteps} 
          className="mb-4" 
        />
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4">
          {/* Header - mb-4 */}
          <div className="mb-4">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Administrative Preferences</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Select all options that apply to your preferences
            </p>
          </div>

          {/* Health & Medical - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Heart size={18} className="mr-1.5" />
              Health & Medical
            </label>
            
            {/* Insurance Priority */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Health insurance priority</p>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {insuranceOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.health.insurance_priority.includes(option.value)}
                  onClick={() => handleNestedToggle('health', 'insurance_priority', option.value)}
                />
              ))}
            </div>

            {/* Healthcare Access */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Healthcare quality requirements</p>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {healthcareOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.health.healthcare_access.includes(option.value)}
                  onClick={() => handleNestedToggle('health', 'healthcare_access', option.value)}
                />
              ))}
            </div>

            {/* Health Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="chronic_conditions"
                  type="checkbox"
                  checked={formData.health.chronic_conditions}
                  onChange={(e) => handleCheckboxChange('health', 'chronic_conditions', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer"
                  style={{ 
                    accentColor: '#8fbc8f',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    backgroundColor: formData.health.chronic_conditions ? '#8fbc8f' : 'transparent',
                    border: formData.health.chronic_conditions ? '1px solid #8fbc8f' : '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    backgroundImage: formData.health.chronic_conditions 
                      ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                      : 'none',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    transition: 'all 0.15s ease-in-out'
                  }}
                />
                <label htmlFor="chronic_conditions" className="ml-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  I have chronic conditions requiring ongoing care
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="prescription_needs"
                  type="checkbox"
                  checked={formData.health.prescription_needs}
                  onChange={(e) => handleCheckboxChange('health', 'prescription_needs', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer"
                  style={{ 
                    accentColor: '#8fbc8f',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    backgroundColor: formData.health.prescription_needs ? '#8fbc8f' : 'transparent',
                    border: formData.health.prescription_needs ? '1px solid #8fbc8f' : '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    backgroundImage: formData.health.prescription_needs 
                      ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                      : 'none',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    transition: 'all 0.15s ease-in-out'
                  }}
                />
                <label htmlFor="prescription_needs" className="ml-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  I require reliable prescription medication access
                </label>
              </div>
            </div>
          </div>

          {/* Safety & Security - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Shield size={18} className="mr-1.5" />
              Safety & Security
            </label>
            
            {/* Crime Tolerance */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Crime tolerance level</p>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {crimeToleranceOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.safety.crime_tolerance.includes(option.value)}
                  onClick={() => handleNestedToggle('safety', 'crime_tolerance', option.value)}
                />
              ))}
            </div>

            {/* Political Stability */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Political stability importance</p>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {politicalStabilityOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.safety.political_stability.includes(option.value)}
                  onClick={() => handleNestedToggle('safety', 'political_stability', option.value)}
                />
              ))}
            </div>

            {/* Emergency Services */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Emergency services quality</p>
            <div className="grid grid-cols-3 gap-1.5">
              {emergencyServicesOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.safety.emergency_services.includes(option.value)}
                  onClick={() => handleNestedToggle('safety', 'emergency_services', option.value)}
                />
              ))}
            </div>
          </div>

          {/* Governance & Legal - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Building size={18} className="mr-1.5" />
              Governance & Legal
            </label>
            
            {/* Tax Complexity */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Tax system complexity preference</p>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {taxComplexityOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.governance.tax_complexity.includes(option.value)}
                  onClick={() => handleNestedToggle('governance', 'tax_complexity', option.value)}
                />
              ))}
            </div>

            {/* Bureaucracy Tolerance */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Bureaucracy tolerance</p>
            <div className="grid grid-cols-3 gap-1.5">
              {bureaucracyOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.governance.bureaucracy_tolerance.includes(option.value)}
                  onClick={() => handleNestedToggle('governance', 'bureaucracy_tolerance', option.value)}
                />
              ))}
            </div>
          </div>

          {/* Immigration & Residency - mb-4 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <FileText size={18} className="mr-1.5" />
              Immigration & Residency
            </label>
            
            {/* Visa Complexity */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Visa process complexity tolerance</p>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {visaComplexityOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.immigration.visa_complexity.includes(option.value)}
                  onClick={() => handleNestedToggle('immigration', 'visa_complexity', option.value)}
                />
              ))}
            </div>

            {/* Residency Goal */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Residency goal</p>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {residencyGoalOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  isSelected={formData.immigration.residency_goal.includes(option.value)}
                  onClick={() => handleNestedToggle('immigration', 'residency_goal', option.value)}
                />
              ))}
            </div>

            {/* Documentation Comfort */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Documentation comfort level</p>
            <div className="grid grid-cols-3 gap-1.5">
              {documentationOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.immigration.documentation_comfort.includes(option.value)}
                  onClick={() => handleNestedToggle('immigration', 'documentation_comfort', option.value)}
                />
              ))}
            </div>
          </div>

          {/* Summary Section - mb-4 */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Summary:</span>
              <div className="mt-1 text-xs space-y-1">
                {formData.health.healthcare_access.length > 0 && (
                  <div>• Healthcare: {formData.health.healthcare_access.join(', ')}</div>
                )}
                {formData.health.insurance_priority.length > 0 && (
                  <div>• Insurance: {formData.health.insurance_priority.join(', ')}</div>
                )}
                {formData.safety.crime_tolerance.length > 0 && (
                  <div>• Crime tolerance: {formData.safety.crime_tolerance.join(', ')}</div>
                )}
                {formData.safety.political_stability.length > 0 && (
                  <div>• Political stability: {formData.safety.political_stability.join(', ')}</div>
                )}
                {formData.governance.tax_complexity.length > 0 && (
                  <div>• Tax system: {formData.governance.tax_complexity.join(', ')}</div>
                )}
                {formData.governance.bureaucracy_tolerance.length > 0 && (
                  <div>• Bureaucracy: {formData.governance.bureaucracy_tolerance.join(', ')}</div>
                )}
                {formData.immigration.residency_goal.length > 0 && (
                  <div>• Residency goals: {formData.immigration.residency_goal.join(', ')}</div>
                )}
                {(formData.health.chronic_conditions || formData.health.prescription_needs) && (
                  <div>• Special needs: {[
                    formData.health.chronic_conditions && 'chronic care',
                    formData.health.prescription_needs && 'prescriptions'
                  ].filter(Boolean).join(', ')}</div>
                )}
              </div>
            </div>
          </div>

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
                  <span className="font-medium">Pro Tip:</span> Select multiple options to keep your choices flexible. This helps us find locations that match various combinations of your preferences.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/onboarding/hobbies')}
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