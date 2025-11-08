import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { getOnboardingProgress, completeOnboarding } from '../../utils/userpreferences/onboardingUtils';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';

export default function OnboardingReview() {
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
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
        
        const { success, data, error } = await getOnboardingProgress(user.id);
        if (!success) {
          console.error("Error loading onboarding data:", error);
          setInitialLoading(false);
          return;
        }
        
        setOnboardingData(data);
        // Note: setProgress was removed as progress state is not defined in this component
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
        console.error('No user found, redirecting to welcome');
        navigate('/welcome');
        return;
      }
      
      
      const { success, error } = await completeOnboarding(user.id);
      
      
      if (!success) {
        const errorMessage = error?.message || 'Unknown error';
        console.error('Failed to complete onboarding:', error);
        toast.error(`Failed to complete onboarding: ${errorMessage}`);
        setLoading(false);
        return;
      }
      
      toast.success('Onboarding completed! Let\'s find your perfect matches...');
      navigate('/onboarding/complete');
    } catch (err) {
      console.error('Unexpected error in handleComplete:', err);
      toast.error('An unexpected error occurred');
      setLoading(false);
    }
  };

  // Helper function to safely render values
  const safeRender = (value, fallback = 'Not specified') => {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'object') return fallback;
    return String(value);
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
              {data.retirement_timeline?.status === 'planning' ? 'Planning for retirement' :
               data.retirement_timeline?.status === 'retiring_soon' ? 'Retiring soon' :
               data.retirement_timeline?.status === 'already_retired' ? 'Already retired' :
               'Not specified'}
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
              {data.family_situation?.status || 'Not specified'}
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
        // Seasonal preference display mapping
        const seasonalLabels = {
          'all_seasons': 'All Seasons',
          'summer_focused': 'Warm Seasons',
          'winter_focused': 'Cool Seasons'
        };

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
            {data.precipitation && data.precipitation.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Precipitation:</span>{' '}
                {data.precipitation.join(', ')}
              </p>
            )}
            {data.seasonal_preference && data.seasonal_preference !== 'Optional' && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Seasonal:</span>{' '}
                {seasonalLabels[data.seasonal_preference] || data.seasonal_preference}
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
            {data.lifestyle_preferences?.pace_of_life_preference && data.lifestyle_preferences.pace_of_life_preference.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Pace:</span>{' '}
                {data.lifestyle_preferences.pace_of_life_preference.join(', ')}
              </p>
            )}
            {data.lifestyle_preferences?.urban_rural_preference && data.lifestyle_preferences.urban_rural_preference.length > 0 && (
              <p>
                <span className={`${uiConfig.font.weight.medium}`}>Setting:</span>{' '}
                {data.lifestyle_preferences.urban_rural_preference.join(', ')}
              </p>
            )}
            {data.language_comfort?.already_speak && Array.isArray(data.language_comfort.already_speak) && data.language_comfort.already_speak.length > 0 && (
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
              <span className={`${uiConfig.font.weight.medium}`}>Travel:</span>{' '}
              {safeRender(data.travel_frequency)}
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
        // Tier definitions matching OnboardingCosts.jsx
        const costTiers = [
          { value: 1500, label: '$1,500-2,000' },
          { value: 2000, label: '$2,000-3,000' },
          { value: 3000, label: '$3,000-4,000' },
          { value: 4000, label: '$4,000-5,000' },
          { value: 5000, label: '$5,000+' }
        ];
        const rentTiers = [
          { value: 500, label: '$500-750' },
          { value: 750, label: '$750-1,000' },
          { value: 1000, label: '$1,000-1,500' },
          { value: 1500, label: '$1,500-2,000' },
          { value: 2000, label: '$2,000+' }
        ];
        const homePriceTiers = [
          { value: 100000, label: '$100k-200k' },
          { value: 200000, label: '$200k-300k' },
          { value: 300000, label: '$300k-400k' },
          { value: 400000, label: '$400k-500k' },
          { value: 500000, label: '$500k+' }
        ];
        const healthcareTiers = [
          { value: 500, label: '$500-750' },
          { value: 750, label: '$750-1,000' },
          { value: 1000, label: '$1,000-1,250' },
          { value: 1250, label: '$1,250-1,500' },
          { value: 1500, label: '$1,500+' }
        ];

        // Helper to format array values
        const formatCostArray = (values, tiers) => {
          if (!values || !Array.isArray(values) || values.length === 0) {
            return 'Not specified';
          }
          return values.map(v => tiers.find(t => t.value === v)?.label).filter(Boolean).join(', ') || 'Not specified';
        };

        // Helper to find closest tier (for healthcare single select)
        const findClosestTier = (value, tiers) => {
          if (!value) return tiers[0]?.value;
          return tiers.reduce((prev, curr) =>
            Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev
          ).value;
        };

        return (
          <div className={`space-y-1 ${uiConfig.font.size.xs}`}>
            <p>
              <span className={`${uiConfig.font.weight.medium}`}>Monthly Cost:</span>{' '}
              {formatCostArray(data.total_monthly_cost, costTiers)}
            </p>
            <p>
              <span className={`${uiConfig.font.weight.medium}`}>Max Rent:</span>{' '}
              {formatCostArray(data.max_monthly_rent, rentTiers)}
            </p>
            <p>
              <span className={`${uiConfig.font.weight.medium}`}>Max Home Price:</span>{' '}
              {formatCostArray(data.max_home_price, homePriceTiers)}
            </p>
            <p>
              <span className={`${uiConfig.font.weight.medium}`}>Healthcare Cost:</span>{' '}
              {healthcareTiers.find(t => t.value === findClosestTier(data.monthly_healthcare_cost, healthcareTiers))?.label || 'Not specified'}/month
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
    { key: 'costs', title: 'Costs & Taxes', path: '/onboarding/costs' }
  ];

  return (
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
              className={`w-full px-6 py-2 ${uiConfig.font.size.sm} ${uiConfig.colors.btnPrimary} ${uiConfig.font.weight.medium} ${uiConfig.layout.radius.lg} ${uiConfig.animation.transition} disabled:opacity-50 disabled:cursor-not-allowed`}
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
  );
}
