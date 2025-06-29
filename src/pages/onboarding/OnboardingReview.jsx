import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { getOnboardingProgress, completeOnboarding } from '../../utils/onboardingUtils';
import OnboardingProgressiveNav from '../../components/OnboardingProgressiveNav';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';

export default function OnboardingReview() {
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState({ completedSteps: {} });
  const navigate = useNavigate();

  // Load all onboarding data
  useEffect(() => {
    const loadOnboardingData = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        
        const { success, data, progress: userProgress, error } = await getOnboardingProgress(user.id);
        if (!success) {
          console.error("Error loading onboarding data:", error);
          setInitialLoading(false);
          return;
        }
        
        setOnboardingData(data);
        setProgress(userProgress);
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadOnboardingData();
  }, [navigate]);

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        navigate('/welcome');
        return;
      }
      
      const { success, error } = await completeOnboarding(user.id);
      
      if (!success) {
        toast.error(`Failed to complete onboarding: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Onboarding completed! Let\'s find your perfect matches...');
      navigate('/onboarding/complete');
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
      setLoading(false);
    }
  };

  // Helper function to format section data for display
  const formatSectionData = (section, data) => {
    if (!data) return 'Not provided';
    
    switch (section) {
      case 'current_status':
        return (
          <div className={`space-y-1 ${uiConfig.font.size.xs}`}>
            <p>
              <span className={`${uiConfig.font.weight.medium}`}>Status:</span>{' '}
              {data.retirement_timeline?.status === 'planning' && 'Planning for retirement'}
              {data.retirement_timeline?.status === 'retiring_soon' && 'Retiring soon'}
              {data.retirement_timeline?.status === 'already_retired' && 'Already retired'}
            </p>
            {data.retirement_timeline?.target_year && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Target Date:</span>{' '}
                {new Date(
                  data.retirement_timeline.target_year,
                  data.retirement_timeline.target_month - 1 || 0,
                  data.retirement_timeline.target_day || 1
                ).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            <p>
              <span className={`${uiConfig.font.weight.medium}`}>Family:</span>{' '}
              {data.family_situation?.status || data.family_situation || 'Not specified'}
            </p>
            <p>
              <span className={`${uiConfig.font.weight.medium}`}>Citizenship:</span>{' '}
              {data.citizenship?.primary_citizenship?.toUpperCase() || 'Not specified'}
            </p>
          </div>
        );
        
      case 'region_preferences':
        return (
          <div className={`space-y-1 ${uiConfig.font.size.xs}`}>
            {data.regions && data.regions.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Regions:</span>{' '}
                {data.regions.join(', ')}
              </p>
            )}
            {data.countries && data.countries.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Countries:</span>{' '}
                {data.countries.join(', ')}
              </p>
            )}
            {data.geographic_features && data.geographic_features.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Features:</span>{' '}
                {data.geographic_features.join(', ')}
              </p>
            )}
            {data.vegetation_types && data.vegetation_types.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Vegetation:</span>{' '}
                {data.vegetation_types.join(', ')}
              </p>
            )}
          </div>
        );
        
      case 'climate_preferences':
        return (
          <div className={`space-y-1 ${uiConfig.font.size.xs}`}>
            {data.summer_climate_preference && data.summer_climate_preference.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Summer:</span>{' '}
                {data.summer_climate_preference.join(', ')}
              </p>
            )}
            {data.winter_climate_preference && data.winter_climate_preference.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Winter:</span>{' '}
                {data.winter_climate_preference.join(', ')}
              </p>
            )}
            {data.humidity_level && data.humidity_level.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Humidity:</span>{' '}
                {data.humidity_level.join(', ')}
              </p>
            )}
            {data.sunshine && data.sunshine.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Sunshine:</span>{' '}
                {data.sunshine.join(', ')}
              </p>
            )}
          </div>
        );
        
      case 'culture_preferences':
        return (
          <div className={`space-y-1 ${uiConfig.font.size.xs}`}>
            {data.expat_community_preference && data.expat_community_preference.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Expat Community:</span>{' '}
                {data.expat_community_preference.join(', ')}
              </p>
            )}
            {data.lifestyle_preferences?.pace_of_life && data.lifestyle_preferences.pace_of_life.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Pace:</span>{' '}
                {data.lifestyle_preferences.pace_of_life.join(', ')}
              </p>
            )}
            {data.lifestyle_preferences?.urban_rural && data.lifestyle_preferences.urban_rural.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Setting:</span>{' '}
                {data.lifestyle_preferences.urban_rural.join(', ')}
              </p>
            )}
            {data.language_comfort?.already_speak && data.language_comfort.already_speak.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Languages:</span>{' '}
                {data.language_comfort.already_speak.join(', ')}
              </p>
            )}
          </div>
        );
        
      case 'hobbies':
        return (
          <div className={`space-y-1 ${uiConfig.font.size.xs}`}>
            {data.activities && data.activities.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Activities:</span>{' '}
                {data.activities.map(a => a.replace(/_/g, ' ')).join(', ')}
              </p>
            )}
            {data.interests && data.interests.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Interests:</span>{' '}
                {data.interests.map(i => i.replace(/_/g, ' ')).join(', ')}
              </p>
            )}
            <p>
              <span className={`${uiConfig.font.weight.medium}`}>Social:</span>{' '}
              {data.social_preference || 'Not specified'}
            </p>
            <p>
              <span className={`${uiConfig.font.weight.medium}`}>Travel:</span>{' '}
              {data.travel_frequency || 'Not specified'}
            </p>
          </div>
        );
        
      case 'administration':
        return (
          <div className={`space-y-1 ${uiConfig.font.size.xs}`}>
            {data.healthcare_quality && data.healthcare_quality.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Healthcare:</span>{' '}
                {data.healthcare_quality.join(', ')}
              </p>
            )}
            {data.insurance_importance && data.insurance_importance.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Insurance:</span>{' '}
                {data.insurance_importance.join(', ')}
              </p>
            )}
            {data.safety_importance && data.safety_importance.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Safety:</span>{' '}
                {data.safety_importance.join(', ')}
              </p>
            )}
            {data.emergency_services && data.emergency_services.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Emergency Services:</span>{' '}
                {data.emergency_services.join(', ')}
              </p>
            )}
            {data.political_stability && data.political_stability.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Political Stability:</span>{' '}
                {data.political_stability.join(', ')}
              </p>
            )}
            {data.tax_preference && data.tax_preference.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Tax System:</span>{' '}
                {data.tax_preference.join(', ')}
              </p>
            )}
            {data.government_efficiency && data.government_efficiency.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Government Efficiency:</span>{' '}
                {data.government_efficiency.join(', ')}
              </p>
            )}
            {data.visa_preference && data.visa_preference.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Visa Process:</span>{' '}
                {data.visa_preference.join(', ')}
              </p>
            )}
            {data.stay_duration && data.stay_duration.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Stay Duration:</span>{' '}
                {data.stay_duration.map(d => {
                  if (d === 'short') return '1-2 Years';
                  if (d === 'medium') return '3-5 Years';
                  if (d === 'long') return '5+ Years';
                  return d;
                }).join(', ')}
              </p>
            )}
            {data.residency_path && data.residency_path.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Residency Goals:</span>{' '}
                {data.residency_path.map(r => {
                  if (r === 'seasonal') return 'Seasonal';
                  if (r === 'residence') return 'Residence';
                  if (r === 'citizenship') return 'Citizenship';
                  return r;
                }).join(', ')}
              </p>
            )}
            {data.special_medical_needs && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Special Medical Needs:</span>{' '}
                Yes
              </p>
            )}
          </div>
        );
        
      case 'costs':
        return (
          <div className={`space-y-1 ${uiConfig.font.size.xs}`}>
            <p>
              <span className={`${uiConfig.font.weight.medium}`}>Monthly Budget:</span>{' '}
              ${data.total_monthly_budget?.toLocaleString() || '0'}
              {data.total_monthly_budget >= 5000 && '+'}
            </p>
            <p>
              <span className={`${uiConfig.font.weight.medium}`}>Max Rent:</span>{' '}
              ${data.max_monthly_rent?.toLocaleString() || '0'}
              {data.max_monthly_rent >= 2000 && '+'}
            </p>
            <p>
              <span className={`${uiConfig.font.weight.medium}`}>Max Home Price:</span>{' '}
              ${data.max_home_price?.toLocaleString() || '0'}
              {data.max_home_price >= 500000 && '+'}
            </p>
            <p>
              <span className={`${uiConfig.font.weight.medium}`}>Healthcare Budget:</span>{' '}
              ${data.monthly_healthcare_budget || '0'}/month
              {data.monthly_healthcare_budget >= 1500 && '+'}
            </p>
          </div>
        );
        
      default:
        return 'No data available';
    }
  };

  if (initialLoading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.success} ${uiConfig.font.weight.semibold}`}>Loading your preferences...</div>
      </div>
    );
  }

  // Check if we have the necessary data - updated to match new structure
  const allSectionsComplete = onboardingData &&
    onboardingData.current_status &&
    onboardingData.region_preferences &&
    onboardingData.climate_preferences &&
    onboardingData.culture_preferences &&
    onboardingData.hobbies &&
    onboardingData.administration &&
    onboardingData.costs;

  const sections = [
    { key: 'current_status', title: 'Current Status', path: '/onboarding/current-status' },
    { key: 'region_preferences', title: 'Region Preferences', path: '/onboarding/region' },
    { key: 'climate_preferences', title: 'Climate Preferences', path: '/onboarding/climate' },
    { key: 'culture_preferences', title: 'Culture & Lifestyle', path: '/onboarding/culture' },
    { key: 'hobbies', title: 'Hobbies & Interests', path: '/onboarding/hobbies' },
    { key: 'administration', title: 'Administrative Preferences', path: '/onboarding/administration' },
    { key: 'costs', title: 'Budget & Costs', path: '/onboarding/costs' }
  ];

  return (
    <div className={`min-h-[100svh] ${uiConfig.colors.page}`}>
      <OnboardingProgressiveNav 
        currentStep="review" 
        completedSteps={progress.completedSteps} 
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="py-6">
          {/* Header */}
          <div className="mb-4">
            <h1 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading}`}>Review Your Preferences</h1>
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mt-1`}>
              Review and confirm your retirement preferences
            </p>
          </div>

          {!allSectionsComplete ? (
            <div className={`mb-4 p-3 ${uiConfig.notifications.warning} ${uiConfig.layout.radius.lg}`}>
              <p className={`${uiConfig.font.size.xs}`}>
                Some sections are incomplete. Please complete all sections for the best experience.
              </p>
            </div>
          ) : null}

          {/* Section Cards */}
          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.key} className={`p-3 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2`}>
                      {section.title}
                    </h3>
                    <div className={`${uiConfig.colors.body}`}>
                      {formatSectionData(section.key, onboardingData?.[section.key])}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(section.path)}
                    className={`ml-3 ${uiConfig.font.size.xs} ${uiConfig.colors.accent} hover:underline`}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Complete Button */}
          <div className={`mt-6 pt-4 border-t ${uiConfig.colors.borderLight}`}>
            <button
              onClick={handleComplete}
              disabled={loading || !allSectionsComplete}
              className={`w-full px-6 py-2 ${uiConfig.font.size.sm} ${uiConfig.colors.btnPrimary} ${uiConfig.font.weight.medium} ${uiConfig.layout.radius.lg} ${uiConfig.animation.transition} ${uiConfig.states.disabled}`}
            >
              {loading ? 'Processing...' : 'Complete & View Recommendations'}
            </button>
            {!allSectionsComplete && (
              <p className={`mt-2 ${uiConfig.font.size.xs} text-center text-yellow-600 dark:text-yellow-400`}>
                Please complete all sections before proceeding.
              </p>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className={`flex justify-between items-center pt-4 mt-4 border-t ${uiConfig.colors.borderLight}`}>
            <button
              type="button"
              onClick={() => navigate('/onboarding/costs')}
              className={`px-4 py-2 ${uiConfig.font.size.sm} ${uiConfig.colors.body} hover:${uiConfig.colors.heading}`}
            >
              Back
            </button>
            <div></div>
          </div>
        </div>
      </main>
    </div>
  );
}