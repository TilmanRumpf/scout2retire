import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Heart, Building, FileText, Stethoscope, Lightbulb, Check } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/userpreferences/onboardingUtils';
import { saveUserPreferences } from '../../utils/userpreferences/userPreferences';
import { useOnboardingAutoSave } from '../../hooks/useOnboardingAutoSave';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import ProTip from '../../components/ProTip';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import { isIOS } from '../../utils/platformDetection';
import { SelectionCard, SelectionGrid, SelectionSection } from '../../components/onboarding/SelectionCard';
import { ADMIN_QUALITY_LEVELS } from '../../utils/config/userPreferenceOptions';

// Health Select Component - using centralized button standards
const HealthSelect = ({ value, onChange, name, label, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.id === value);
  
  // Use centralized dropdown classes (min-height for dropdowns)
  const buttonClasses = uiConfig.onboardingButton.getDropdownClasses(value && value !== '');
  
  return (
    <div className="relative">
      <label className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} block mb-1`}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
      >
        {/* Checkmark indicator - using centralized config */}
        {value && value !== '' && (
          <div className={uiConfig.onboardingButton.checkmark.position}>
            <div className={uiConfig.onboardingButton.checkmark.container}>
              <Check className={uiConfig.onboardingButton.checkmark.icon} />
            </div>
          </div>
        )}
        
        <div className="flex flex-col justify-center h-full">
          <div className={`${uiConfig.onboardingButton.typography.title.weight} ${
            value && value !== '' ? uiConfig.onboardingButton.typography.title.selectedColor : 'text-gray-500 dark:text-gray-400'
          } ${uiConfig.onboardingButton.typography.title.size} ${value && value !== '' ? 'pr-6' : ''}`}>
            {selectedOption ? selectedOption.label : 'None'}
          </div>
        </div>
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-gray-800 
            ${uiConfig.layout.radius.lg} border-2 border-gray-300 dark:border-gray-600 shadow-lg 
            max-h-60 overflow-y-auto`}>
            <button
              type="button"
              onClick={() => {
                onChange({ target: { value: '' } });
                setIsOpen(false);
              }}
              className={`w-full p-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/30 
                ${uiConfig.animation.transition} ${!value ? 'bg-gray-50 dark:bg-gray-700/30' : ''}`}
            >
              None
            </button>
            {options.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange({ target: { value: opt.id } });
                  setIsOpen(false);
                }}
                className={`w-full p-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/30 
                  ${uiConfig.animation.transition} ${value === opt.id ? 'bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-700 dark:text-scout-accent-300' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function OnboardingAdministration() {
  const [formData, setFormData] = useState({
    healthcare_quality: [],
    health_considerations: {
      healthcare_access: '',
      ongoing_treatment: '',
      environmental_health: ''
    },
    insurance_importance: [],
    safety_importance: [],
    emergency_services: [],
    political_stability: [],
    tax_preference: [],
    government_efficiency: [],
    visa_preference: [],
    stay_duration: [],
    residency_path: []
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const navigate = useNavigate();
  
  // Auto-hide navigation on scroll
  const { isVisible: isNavVisible } = useHideOnScroll();
  
  // Enable auto-save for this page
  const autoSave = useOnboardingAutoSave(formData, 'administration');

  // Load existing data if available
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const userResult = await getCurrentUser();
        if (!userResult.user) {
          navigate('/welcome');
          return;
        }
        
        const progressResult = await getOnboardingProgress(userResult.user.id);
        
        
        if (!progressResult.success) {
          console.error("Error loading existing data:", progressResult.error);
          setInitialLoading(false);
          return;
        }
        
        // Progress is now managed by OnboardingLayout
        
        // If administration data exists, load it
        if (progressResult.data && progressResult.data.administration) {
          
          // Handle both string and object data
          let adminData = progressResult.data.administration;
          if (typeof adminData === 'string') {
            try {
              adminData = JSON.parse(adminData);
            } catch (e) {
              console.error('Failed to parse administration data:', e);
            }
          }
          
          setFormData(prev => ({
            ...prev,
            ...adminData,
            // Ensure arrays are arrays
            healthcare_quality: Array.isArray(adminData.healthcare_quality) ? adminData.healthcare_quality : [],
            health_considerations: adminData.health_considerations || {
              healthcare_access: '',
              ongoing_treatment: '',
              environmental_health: ''
            },
            insurance_importance: Array.isArray(adminData.insurance_importance) ? adminData.insurance_importance : [],
            safety_importance: Array.isArray(adminData.safety_importance) ? adminData.safety_importance : [],
            emergency_services: Array.isArray(adminData.emergency_services) ? adminData.emergency_services : [],
            political_stability: Array.isArray(adminData.political_stability) ? adminData.political_stability : [],
            tax_preference: Array.isArray(adminData.tax_preference) ? adminData.tax_preference : [],
            government_efficiency: Array.isArray(adminData.government_efficiency) ? adminData.government_efficiency : [],
            visa_preference: Array.isArray(adminData.visa_preference) ? adminData.visa_preference : [],
            stay_duration: Array.isArray(adminData.stay_duration) ? adminData.stay_duration : [],
            residency_path: Array.isArray(adminData.residency_path) ? adminData.residency_path : []
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

  const handleToggle = (field, value) => {
    setFormData(prev => {
      const currentValues = prev[field] || [];
      const isSelected = currentValues.includes(value);
      
      return {
        ...prev,
        [field]: isSelected 
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      };
    });
  };

  const handleHealthChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      health_considerations: {
        ...prev.health_considerations,
        [field]: value
      }
    }));
  };


  const handleSaveAndExit = async () => {
    setLoading(true);
    await autoSave();
    setLoading(false);
    navigate('/onboarding/complete');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userResult = await getCurrentUser();
      if (!userResult.user) {
        navigate('/welcome');
        return;
      }
      
      
      // Create a clean data object
      const dataToSave = {
        healthcare_quality: formData.healthcare_quality || [],
        health_considerations: formData.health_considerations || {
          healthcare_access: '',
          ongoing_treatment: '',
          environmental_health: ''
        },
        insurance_importance: formData.insurance_importance || [],
        safety_importance: formData.safety_importance || [],
        emergency_services: formData.emergency_services || [],
        political_stability: formData.political_stability || [],
        tax_preference: formData.tax_preference || [],
        government_efficiency: formData.government_efficiency || [],
        visa_preference: formData.visa_preference || [],
        stay_duration: formData.stay_duration || [],
        residency_path: formData.residency_path || []
      };
      
      
      const { success, error } = await saveOnboardingStep(userResult.user.id, dataToSave, 'administration');
      
      
      if (!success) {
        toast.error(`Failed to save: ${error?.message || 'Unknown error'}`);
        return;
      }
      
      toast.success('Administration preferences saved!');
      
      // Also save to new user_preferences table
      try {
        const { success: prefSuccess, error: prefError } = await saveUserPreferences(
          userResult.user.id,
          'administration',
          dataToSave
        );
        if (prefSuccess) {
        } else {
          console.error('❌ Failed to save administration to user_preferences:', prefError);
        }
      } catch (err) {
        console.error('Error saving administration to user_preferences:', err);
      }
      
      // Add a small delay to ensure data is saved before navigation
      setTimeout(() => {
        navigate('/onboarding/costs');
      }, 100);
    } catch (err) {
      console.error('Administration - Save error:', err);
      toast.error('An unexpected error occurred');
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

  // DYNAMIC: Quality options from centralized config (RULE #2: NO HARDCODING)
  const qualityOptions = ADMIN_QUALITY_LEVELS;

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

  // Healthcare Access options
  const healthcareAccessOptions = [
    { id: 'full_access', label: 'Full access' },
    { id: 'hospital_specialists', label: 'Hospital & Specialists' },
    { id: 'hospital_general', label: 'Hospital & General medicine' },
    { id: 'general_practitioner', label: 'General practitioner' },
    { id: 'pharmacy_only', label: 'Basic pharmacy only' }
  ];

  // Ongoing Treatment options
  const ongoingTreatmentOptions = [
    { id: 'none', label: 'None' },
    { id: 'dialysis', label: 'Dialysis' },
    { id: 'cancer', label: 'Cancer care' },
    { id: 'cardiac', label: 'Cardiac care' },
    { id: 'diabetes', label: 'Diabetes care' }
  ];

  // Environmental Health options
  const environmentalHealthOptions = [
    { id: 'no_restrictions', label: 'No restrictions' },
    { id: 'air_quality', label: 'Air quality critical' },
    { id: 'low_humidity', label: 'Low humidity (<50%)' },
    { id: 'high_humidity_ok', label: 'High humidity OK (>60%)' },
    { id: 'pollen_sensitive', label: 'Pollen sensitive' },
    { id: 'very_sensitive', label: 'Very sensitive' }
  ];

  return (
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <form onSubmit={handleSubmit} className="py-6">
          {/* Pro Tip at top */}
          <div className={`bg-scout-accent/10 p-3 lg:p-4 ${uiConfig.layout.radius.lg} mb-4 lg:mb-6 flex items-start`}>
            <Lightbulb size={16} className="mr-2 text-orange-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
            <p className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.colors.body}`}>
              <span className={`${uiConfig.font.weight.medium}`}>Pro Tip:</span> These preferences help us identify locations with the right infrastructure and policies for your needs.
            </p>
          </div>
          
          {/* Health & Medical */}
          <SelectionSection icon={Heart} title="Healthcare Preferences">
            {/* Healthcare */}
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5`}>Healthcare</p>
            <SelectionGrid>
              {qualityOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.healthcare_quality.includes(option.value)}
                  onClick={() => handleToggle('healthcare_quality', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>

            {/* Health Considerations - using dropdowns */}
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5 mt-4`}>Health Considerations</p>
            <SelectionGrid>
              {/* Healthcare Access */}
              <HealthSelect
                value={formData.health_considerations.healthcare_access || ''}
                onChange={(e) => handleHealthChange('healthcare_access', e.target.value)}
                label="Healthcare Access"
                options={healthcareAccessOptions}
              />
              
              {/* Ongoing Treatment */}
              <HealthSelect
                value={formData.health_considerations.ongoing_treatment || ''}
                onChange={(e) => handleHealthChange('ongoing_treatment', e.target.value)}
                label="Ongoing Treatment"
                options={ongoingTreatmentOptions}
              />
              
              {/* Environmental Health */}
              <HealthSelect
                value={formData.health_considerations.environmental_health || ''}
                onChange={(e) => handleHealthChange('environmental_health', e.target.value)}
                label="Environmental Health"
                options={environmentalHealthOptions}
              />
            </SelectionGrid>

            {/* Health Insurance */}
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5 mt-4`}>Health Insurance</p>
            <SelectionGrid>
              {qualityOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.insurance_importance.includes(option.value)}
                  onClick={() => handleToggle('insurance_importance', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Safety & Security */}
          <SelectionSection icon={Shield} title="Safety & Security">
            {/* Safety */}
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5`}>Safety</p>
            <SelectionGrid>
              {qualityOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.safety_importance.includes(option.value)}
                  onClick={() => handleToggle('safety_importance', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>

            {/* Emergency Services */}
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5 mt-4`}>Emergency Services</p>
            <SelectionGrid>
              {qualityOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.emergency_services.includes(option.value)}
                  onClick={() => handleToggle('emergency_services', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>

            {/* Political Stability */}
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5 mt-4`}>Political Stability</p>
            <SelectionGrid>
              {qualityOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.political_stability.includes(option.value)}
                  onClick={() => handleToggle('political_stability', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Governance & Legal */}
          <SelectionSection icon={Building} title="Government & Taxes">
            {/* Tax System */}
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5`}>Tax System</p>
            <SelectionGrid>
              {qualityOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.tax_preference.includes(option.value)}
                  onClick={() => handleToggle('tax_preference', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>

            {/* Government Efficiency */}
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5 mt-4`}>Government Efficiency</p>
            <SelectionGrid>
              {qualityOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.government_efficiency.includes(option.value)}
                  onClick={() => handleToggle('government_efficiency', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Immigration & Residency */}
          <SelectionSection icon={FileText} title="Visa & Residency">
            {/* Visa Process */}
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5`}>Visa Process</p>
            <SelectionGrid>
              {qualityOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.visa_preference.includes(option.value)}
                  onClick={() => handleToggle('visa_preference', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>

            {/* Stay Duration */}
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5 mt-4`}>How long do you plan to stay?</p>
            <SelectionGrid>
              {stayDurationOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.stay_duration.includes(option.value)}
                  onClick={() => handleToggle('stay_duration', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>

            {/* Residency Path */}
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5 mt-4`}>Residency goals</p>
            <SelectionGrid>
              {residencyPathOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.residency_path.includes(option.value)}
                  onClick={() => handleToggle('residency_path', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Summary Section */}
          <div className={`mb-4 p-3 lg:p-4 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg} lg:rounded-xl`}>
            <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-1.5 ${uiConfig.font.size.sm}`}>
              Your Administrative Preferences:
            </h3>
            <div className={`space-y-0.5 ${uiConfig.font.size.xs} ${uiConfig.colors.body}`}>
              {formData.healthcare_quality.length > 0 && (
                <div><span className={`${uiConfig.font.weight.medium}`}>Healthcare:</span> {formData.healthcare_quality.join(', ')}</div>
              )}
              {(formData.health_considerations.healthcare_access || 
                formData.health_considerations.ongoing_treatment || 
                formData.health_considerations.environmental_health) && (
                <div>
                  <span className={`${uiConfig.font.weight.medium}`}>Health needs:</span> {
                    [
                      formData.health_considerations.healthcare_access && 
                        healthcareAccessOptions.find(o => o.id === formData.health_considerations.healthcare_access)?.label,
                      formData.health_considerations.ongoing_treatment && 
                        ongoingTreatmentOptions.find(o => o.id === formData.health_considerations.ongoing_treatment)?.label,
                      formData.health_considerations.environmental_health && 
                        environmentalHealthOptions.find(o => o.id === formData.health_considerations.environmental_health)?.label
                    ].filter(Boolean).join(', ')
                  }
                </div>
              )}
              {formData.insurance_importance.length > 0 && (
                <div><span className={`${uiConfig.font.weight.medium}`}>Insurance:</span> {formData.insurance_importance.join(', ')}</div>
              )}
              {formData.safety_importance.length > 0 && (
                <div><span className={`${uiConfig.font.weight.medium}`}>Safety:</span> {formData.safety_importance.join(', ')}</div>
              )}
              {formData.tax_preference.length > 0 && (
                <div><span className={`${uiConfig.font.weight.medium}`}>Tax system:</span> {formData.tax_preference.join(', ')}</div>
              )}
              {formData.stay_duration.length > 0 && (
                <div><span className={`${uiConfig.font.weight.medium}`}>Stay duration:</span> {formData.stay_duration.join(', ')}</div>
              )}
              {formData.residency_path.length > 0 && (
                <div><span className={`${uiConfig.font.weight.medium}`}>Goals:</span> {formData.residency_path.join(', ')}</div>
              )}
            </div>
          </div>

        </form>

        {/* Bottom Navigation - Using centralized config */}
        <div className={uiConfig.bottomNavigation.container.getContainerClasses(isIOS(), isNavVisible)}>
          <div className={uiConfig.bottomNavigation.container.innerContainer}>
            <div className={uiConfig.bottomNavigation.container.buttonLayout}>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  await autoSave();
                  setLoading(false);
                  navigate('/onboarding/hobbies');
                }}
                disabled={loading}
                className={uiConfig.components.buttonSecondary}
              >
                ← Back
              </button>
              <div className="flex-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSaveAndExit}
                  className={uiConfig.components.buttonSecondary}
                >
                  Save & Exit
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
  );
}
