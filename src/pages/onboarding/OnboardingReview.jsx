import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { getOnboardingProgress, completeOnboarding } from '../../utils/onboardingUtils';
import toast from 'react-hot-toast';

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
      
      toast.success('Onboarding completed! Welcome to Scout2Retire.');
      navigate('/daily');
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
          <div className="space-y-2">
            <p>
              <span className="font-medium">Retirement Status:</span>{' '}
              {data.retirement_timeline.status === 'planning' && 'Planning for Retirement'}
              {data.retirement_timeline.status === 'retiring_soon' && 'Retiring Within a Year'}
              {data.retirement_timeline.status === 'already_retired' && 'Already Retired'}
            </p>
            {data.retirement_timeline.status !== 'already_retired' && (
              <p>
                <span className="font-medium">Target Year:</span>{' '}
                {data.retirement_timeline.target_year}
              </p>
            )}
            <p>
              <span className="font-medium">Family Situation:</span>{' '}
              {data.family_situation.status === 'solo' && 'Solo'}
              {data.family_situation.status === 'couple' && 'Couple'}
              {data.family_situation.status === 'family' && 'Family'}
            </p>
            <p>
              <span className="font-medium">Primary Citizenship:</span>{' '}
              {data.citizenship.primary_citizenship.toUpperCase()}
            </p>
          </div>
        );
        
      case 'region_preferences':
        return (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Continents:</span>{' '}
              {data.continents.length > 0
                ? data.continents.map(c => c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')).join(', ')
                : 'No specific preference'}
            </p>
            <p>
              <span className="font-medium">Countries:</span>{' '}
              {data.countries.length > 0
                ? data.countries.map(c => c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')).join(', ')
                : 'No specific preference'}
            </p>
            <p>
              <span className="font-medium">Water Proximity:</span>{' '}
              {data.proximity_to_water === 'coastal' && 'Coastal'}
              {data.proximity_to_water === 'near_water' && 'Near Lakes/Rivers'}
              {data.proximity_to_water === 'inland' && 'Inland'}
            </p>
            <p>
              <span className="font-medium">Environment:</span>{' '}
              {data.preferred_environment.charAt(0).toUpperCase() + data.preferred_environment.slice(1)}
            </p>
          </div>
        );
        
      case 'climate_preferences':
        return (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Temperature:</span>{' '}
              {data.temperature_preference.charAt(0).toUpperCase() + data.temperature_preference.slice(1)}
            </p>
            <p>
              <span className="font-medium">Temperature Range:</span>{' '}
              {data.min_temperature}°C to {data.max_temperature}°C
            </p>
            <p>
              <span className="font-medium">Rainfall:</span>{' '}
              {data.rainfall_preference.charAt(0).toUpperCase() + data.rainfall_preference.slice(1)}
            </p>
            <p>
              <span className="font-medium">Sunshine:</span>{' '}
              {data.sunshine_hours === 'low' && 'Low (<4 hrs/day)'}
              {data.sunshine_hours === 'moderate' && 'Moderate (4-7 hrs/day)'}
              {data.sunshine_hours === 'high' && 'High (8+ hrs/day)'}
            </p>
          </div>
        );
        
      case 'culture_preferences':
        return (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Expat Community:</span>{' '}
              {data.expat_community_preference === 'none' && 'No expat community needed'}
              {data.expat_community_preference === 'small' && 'Small expat community'}
              {data.expat_community_preference === 'moderate' && 'Moderate expat presence'}
              {data.expat_community_preference === 'large' && 'Large international community'}
            </p>
            <p>
              <span className="font-medium">Language Preference:</span>{' '}
              {data.language_comfort.english_only 
                ? 'Prefer English-speaking locations' 
                : data.language_comfort.willing_to_learn 
                  ? 'Willing to learn local language' 
                  : 'No specific language preference'}
            </p>
            {data.language_comfort.already_speak.length > 0 && (
              <p>
                <span className="font-medium">Languages Spoken:</span>{' '}
                {data.language_comfort.already_speak.map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(', ')}
              </p>
            )}
            <p>
              <span className="font-medium">Lifestyle:</span>{' '}
              {data.lifestyle_preferences.pace_of_life === 'slow' && 'Relaxed pace, '}
              {data.lifestyle_preferences.pace_of_life === 'moderate' && 'Moderate pace, '}
              {data.lifestyle_preferences.pace_of_life === 'fast' && 'Fast-paced, '}
              {data.lifestyle_preferences.urban_rural === 'urban' && 'Urban setting, '}
              {data.lifestyle_preferences.urban_rural === 'suburban' && 'Suburban setting, '}
              {data.lifestyle_preferences.urban_rural === 'rural' && 'Rural setting, '}
              {data.lifestyle_preferences.traditional_progressive === 'traditional' && 'Traditional values'}
              {data.lifestyle_preferences.traditional_progressive === 'balanced' && 'Balanced values'}
              {data.lifestyle_preferences.traditional_progressive === 'progressive' && 'Progressive values'}
            </p>
          </div>
        );
        
      case 'hobbies':
        return (
          <div className="space-y-2">
            {data.activities.length > 0 && (
              <p>
                <span className="font-medium">Activities:</span>{' '}
                {data.activities.map(a => a.charAt(0).toUpperCase() + a.slice(1).replace('_', ' ')).join(', ')}
              </p>
            )}
            {data.interests.length > 0 && (
              <p>
                <span className="font-medium">Interests:</span>{' '}
                {data.interests.map(i => i.charAt(0).toUpperCase() + i.slice(1).replace('_', ' ')).join(', ')}
              </p>
            )}
            <p>
              <span className="font-medium">Social Style:</span>{' '}
              {data.social_preference === 'social' && 'Very Social'}
              {data.social_preference === 'balanced' && 'Balanced'}
              {data.social_preference === 'private' && 'Private'}
            </p>
            <p>
              <span className="font-medium">Travel:</span>{' '}
              {data.travel_frequency === 'frequent' && 'Frequent travel'}
              {data.travel_frequency === 'occasional' && 'Occasional travel'}
              {data.travel_frequency === 'rare' && 'Rare travel'}
            </p>
            {data.pet_owner && (
              <p>
                <span className="font-medium">Pets:</span>{' '}
                {data.pet_types.length > 0 
                  ? data.pet_types.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace('_', ' ')).join(', ') 
                  : 'Pet owner (unspecified)'}
              </p>
            )}
          </div>
        );
        
      case 'budget':
        return (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Monthly Budget:</span>{' '}
              ${data.monthly_budget.toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Housing:</span>{' '}
              {data.housing_preference === 'rent' && 'Prefer to Rent'}
              {data.housing_preference === 'buy' && 'Prefer to Buy'}
              {data.housing_preference === 'either' && 'Open to Either'}
              {', '}
              {data.housing_budget_percentage}% of budget
            </p>
            <p>
              <span className="font-medium">Cost Priorities:</span>{' '}
              {Object.entries(data.cost_priorities)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')} (${value}/5)`)
                .join(', ')}
            </p>
          </div>
        );
        
      default:
        return 'No data available';
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-green-600 font-semibold">Loading your preferences...</div>
      </div>
    );
  }

  // Check if we have the necessary data
  const allSectionsComplete = onboardingData &&
    onboardingData.current_status &&
    onboardingData.region_preferences &&
    onboardingData.climate_preferences &&
    onboardingData.culture_preferences &&
    onboardingData.hobbies &&
    onboardingData.budget;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/onboarding/costs')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-1 rounded-full bg-gray-400 dark:bg-gray-600`}
                ></div>
              ))}
            </div>
            <div className="w-5"></div> {/* Spacer to balance the back button */}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Review Your Preferences</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Review and confirm your retirement preferences before we generate your personalized recommendations.
          </p>
        </div>

        {!allSectionsComplete ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200">
              It looks like some onboarding sections are incomplete. Please go back and complete all sections for the best experience.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Current Status
              </h2>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {formatSectionData('current_status', onboardingData.current_status)}
              </div>
              <button
                onClick={() => navigate('/onboarding/current-status')}
                className="mt-4 text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Edit
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Region Preferences
              </h2>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {formatSectionData('region_preferences', onboardingData.region_preferences)}
              </div>
              <button
                onClick={() => navigate('/onboarding/region')}
                className="mt-4 text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Edit
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Climate Preferences
              </h2>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {formatSectionData('climate_preferences', onboardingData.climate_preferences)}
              </div>
              <button
                onClick={() => navigate('/onboarding/climate')}
                className="mt-4 text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Edit
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Culture & Lifestyle
              </h2>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {formatSectionData('culture_preferences', onboardingData.culture_preferences)}
              </div>
              <button
                onClick={() => navigate('/onboarding/culture')}
                className="mt-4 text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Edit
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Hobbies & Interests
              </h2>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {formatSectionData('hobbies', onboardingData.hobbies)}
              </div>
              <button
                onClick={() => navigate('/onboarding/hobbies')}
                className="mt-4 text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Edit
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Budget & Costs
              </h2>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {formatSectionData('budget', onboardingData.budget)}
              </div>
              <button
                onClick={() => navigate('/onboarding/costs')}
                className="mt-4 text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Edit
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Ready to Find Your Ideal Retirement Locations?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We'll use your preferences to identify and rank the best retirement destinations for you. 
            You can always update your preferences later.
          </p>
          <button
            onClick={handleComplete}
            disabled={loading || !allSectionsComplete}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Complete & View Recommendations'}
          </button>
          {!allSectionsComplete && (
            <p className="mt-4 text-sm text-center text-yellow-600 dark:text-yellow-400">
              Please complete all onboarding sections before proceeding.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}