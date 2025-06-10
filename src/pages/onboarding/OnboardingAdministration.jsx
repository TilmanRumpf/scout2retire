import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import { BaseStepNavigation, BaseBottomNavigation, ButtonVariant } from '../../components/BaseStepNavigation';
import { uiConfig } from '../../styles/uiConfig';
import toast from 'react-hot-toast';

export default function OnboardingAdministration() {
  const [formData, setFormData] = useState({
    health: {
      insurance_priority: 'high', // high, medium, low
      healthcare_access: 'excellent', // excellent, good, basic
      chronic_conditions: false,
      prescription_needs: false
    },
    safety: {
      crime_tolerance: 'low', // low, medium, high  
      political_stability: 'high', // high, medium, low
      emergency_services: 'excellent' // excellent, good, basic
    },
    governance: {
      tax_complexity: 'simple', // simple, moderate, complex
      bureaucracy_tolerance: 'low', // low, medium, high
      legal_system: 'no_preference' // common_law, civil_law, no_preference
    },
    immigration: {
      visa_complexity: 'simple', // simple, moderate, complex
      residency_goal: 'temporary', // temporary, permanent, citizenship
      documentation_comfort: 'high' // high, medium, low
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState({ completedSteps: {} });
  const navigate = useNavigate();

  // Load existing data on component mount - Added 09JUN25
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        
        const { success, data, progress: userProgress } = await getOnboardingProgress(user.id);
        if (success) {
          setProgress(userProgress);
          if (data && data.administration) {
            setFormData(data.administration);
          }
        }
      } catch (err) {
        console.error('Error loading existing administration data:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadExistingData();
  }, [navigate]);

  // Handle nested object updates - Added 09JUN25
  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleBack = () => {
    navigate('/onboarding/hobbies');
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
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent} ${uiConfig.font.weight.semibold}`}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} p-4`}>
      <div className={uiConfig.layout.width.containerNarrow}>
        {/* Header - Updated 09JUN25: Match screenshot design */}
        <div className="text-center mb-8">
          <h1 className={`${uiConfig.font.size['3xl']} ${uiConfig.font.weight.light} ${uiConfig.colors.hint} mb-2`}>
            Scout2Retire
          </h1>
          <p className={`${uiConfig.colors.hint} mb-2`}>
            Help us find your perfect retirement destination by completing this short survey
          </p>
        </div>

        {/* Top Step Navigation - Updated 09JUN25: Using new BaseStepNavigation */}
        <BaseStepNavigation 
          variant="onboarding" 
          currentStep="administration" 
          completedSteps={progress.completedSteps} 
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className={`${uiConfig.font.size['2xl']} ${uiConfig.font.weight.light} ${uiConfig.colors.body} mb-6`}>
              Administrative aspects important to you:
            </h2>

            {/* Health Section - Updated 09JUN25: Improved styling with ButtonVariant */}
            <div className={uiConfig.components.formGroup}>
              <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-4`}>
                Health & Medical Considerations
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className={uiConfig.components.label}>
                    Health Insurance Priority
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'high', label: 'High Priority' },
                      { value: 'medium', label: 'Moderate' },
                      { value: 'low', label: 'Low Priority' }
                    ].map((option) => (
                      <ButtonVariant
                        key={option.value}
                        selected={formData.health.insurance_priority === option.value}
                        onClick={() => handleNestedChange('health', 'insurance_priority', option.value)}
                      >
                        {option.label}
                      </ButtonVariant>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={uiConfig.components.label}>
                    Healthcare Access Requirements
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'excellent', label: 'World-Class' },
                      { value: 'good', label: 'Good Quality' },
                      { value: 'basic', label: 'Basic Care' }
                    ].map((option) => (
                      <ButtonVariant
                        key={option.value}
                        selected={formData.health.healthcare_access === option.value}
                        onClick={() => handleNestedChange('health', 'healthcare_access', option.value)}
                      >
                        {option.label}
                      </ButtonVariant>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="chronic_conditions"
                      type="checkbox"
                      checked={formData.health.chronic_conditions}
                      onChange={(e) => handleNestedChange('health', 'chronic_conditions', e.target.checked)}
                      className={uiConfig.components.checkbox}
                    />
                    <label htmlFor="chronic_conditions" className={`ml-3 ${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
                      I have chronic health conditions requiring ongoing care
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="prescription_needs"
                      type="checkbox"
                      checked={formData.health.prescription_needs}
                      onChange={(e) => handleNestedChange('health', 'prescription_needs', e.target.checked)}
                      className={uiConfig.components.checkbox}
                    />
                    <label htmlFor="prescription_needs" className={`ml-3 ${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
                      I require reliable access to prescription medications
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Section - Updated 09JUN25: Improved styling */}
            <div className={uiConfig.components.formGroup}>
              <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-4`}>
                Safety & Security Considerations
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className={uiConfig.components.label}>
                    Crime Tolerance Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'low', label: 'Very Safe' },
                      { value: 'medium', label: 'Moderate' },
                      { value: 'high', label: 'Adaptable' }
                    ].map((option) => (
                      <ButtonVariant
                        key={option.value}
                        selected={formData.safety.crime_tolerance === option.value}
                        onClick={() => handleNestedChange('safety', 'crime_tolerance', option.value)}
                      >
                        {option.label}
                      </ButtonVariant>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={uiConfig.components.label}>
                    Political Stability Importance
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'high', label: 'Very Important' },
                      { value: 'medium', label: 'Moderate' },
                      { value: 'low', label: 'Flexible' }
                    ].map((option) => (
                      <ButtonVariant
                        key={option.value}
                        selected={formData.safety.political_stability === option.value}
                        onClick={() => handleNestedChange('safety', 'political_stability', option.value)}
                      >
                        {option.label}
                      </ButtonVariant>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={uiConfig.components.label}>
                    Emergency Services Quality
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'excellent', label: 'World-Class' },
                      { value: 'good', label: 'Good Quality' },
                      { value: 'basic', label: 'Basic Services' }
                    ].map((option) => (
                      <ButtonVariant
                        key={option.value}
                        selected={formData.safety.emergency_services === option.value}
                        onClick={() => handleNestedChange('safety', 'emergency_services', option.value)}
                      >
                        {option.label}
                      </ButtonVariant>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Governance Section - Updated 09JUN25: Improved styling */}
            <div className={uiConfig.components.formGroup}>
              <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-4`}>
                Governance & Legal Considerations
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className={uiConfig.components.label}>
                    Tax System Complexity Preference
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'simple', label: 'Simple' },
                      { value: 'moderate', label: 'Moderate' },
                      { value: 'complex', label: 'Complex OK' }
                    ].map((option) => (
                      <ButtonVariant
                        key={option.value}
                        selected={formData.governance.tax_complexity === option.value}
                        onClick={() => handleNestedChange('governance', 'tax_complexity', option.value)}
                      >
                        {option.label}
                      </ButtonVariant>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={uiConfig.components.label}>
                    Bureaucracy Tolerance
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'low', label: 'Minimal' },
                      { value: 'medium', label: 'Moderate' },
                      { value: 'high', label: 'Patient' }
                    ].map((option) => (
                      <ButtonVariant
                        key={option.value}
                        selected={formData.governance.bureaucracy_tolerance === option.value}
                        onClick={() => handleNestedChange('governance', 'bureaucracy_tolerance', option.value)}
                      >
                        {option.label}
                      </ButtonVariant>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={uiConfig.components.label}>
                    Legal System Preference
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: 'common_law', label: 'Common Law (US/UK style)' },
                      { value: 'civil_law', label: 'Civil Law (European style)' },
                      { value: 'no_preference', label: 'No Preference' }
                    ].map((option) => (
                      <ButtonVariant
                        key={option.value}
                        selected={formData.governance.legal_system === option.value}
                        onClick={() => handleNestedChange('governance', 'legal_system', option.value)}
                      >
                        {option.label}
                      </ButtonVariant>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Immigration Section - Updated 09JUN25: Improved styling */}
            <div className={uiConfig.components.formGroup}>
              <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-4`}>
                Immigration & Residency Considerations
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className={uiConfig.components.label}>
                    Visa Process Complexity Tolerance
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'simple', label: 'Simple Only' },
                      { value: 'moderate', label: 'Moderate' },
                      { value: 'complex', label: 'Complex OK' }
                    ].map((option) => (
                      <ButtonVariant
                        key={option.value}
                        selected={formData.immigration.visa_complexity === option.value}
                        onClick={() => handleNestedChange('immigration', 'visa_complexity', option.value)}
                      >
                        {option.label}
                      </ButtonVariant>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={uiConfig.components.label}>
                    Residency Goal
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: 'temporary', label: 'Temporary Residence (1-5 years)' },
                      { value: 'permanent', label: 'Permanent Residence' },
                      { value: 'citizenship', label: 'Eventual Citizenship' }
                    ].map((option) => (
                      <ButtonVariant
                        key={option.value}
                        selected={formData.immigration.residency_goal === option.value}
                        onClick={() => handleNestedChange('immigration', 'residency_goal', option.value)}
                      >
                        {option.label}
                      </ButtonVariant>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={uiConfig.components.label}>
                    Documentation Comfort Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'high', label: 'Very Comfortable' },
                      { value: 'medium', label: 'Moderate' },
                      { value: 'low', label: 'Prefer Simple' }
                    ].map((option) => (
                      <ButtonVariant
                        key={option.value}
                        selected={formData.immigration.documentation_comfort === option.value}
                        onClick={() => handleNestedChange('immigration', 'documentation_comfort', option.value)}
                      >
                        {option.label}
                      </ButtonVariant>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation - Updated 09JUN25: Using new BaseBottomNavigation */}
          <BaseBottomNavigation
            onBack={handleBack}
            onNext={handleSubmit}
            nextLabel="Next"
            loading={loading}
          />
        </form>
      </div>
    </div>
  );
}