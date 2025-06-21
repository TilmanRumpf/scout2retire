import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Plane, Activity, Stethoscope } from 'lucide-react';
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

export default function OnboardingHobbies() {
  const [formData, setFormData] = useState({
    activities: [],
    interests: [],
    social_preference: 'balanced',
    health_considerations: [],
    travel_frequency: 'occasional',
    lifestyle_importance: {
      outdoor_activities: 3,
      cultural_events: 3,
      shopping: 2,
      wellness: 3,
      dining_out: 3,
      nightlife: 2
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState({ completedSteps: {} });
  const navigate = useNavigate();

  // Activity options - removed fitness, yoga, dancing
  const activityOptions = [
    { id: 'walking', label: 'Walking' },
    { id: 'swimming', label: 'Swimming' },
    { id: 'cycling', label: 'Cycling' },
    { id: 'golf', label: 'Golf' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'water_sports', label: 'Water Sports' },
    { id: 'winter_sports', label: 'Winter Sports' },
    { id: 'fishing', label: 'Fishing' },
    { id: 'gardening', label: 'Gardening' }
  ];

  // Interest options - removed games, technology, language
  const interestOptions = [
    { id: 'arts', label: 'Arts & Crafts' },
    { id: 'music', label: 'Music' },
    { id: 'theater', label: 'Theater' },
    { id: 'reading', label: 'Reading' },
    { id: 'cooking', label: 'Cooking' },
    { id: 'wine', label: 'Wine' },
    { id: 'history', label: 'History' },
    { id: 'photography', label: 'Photography' },
    { id: 'volunteering', label: 'Volunteering' }
  ];

  // Health consideration options - removed checkups
  const healthOptions = [
    { id: 'mobility', label: 'Mobility' },
    { id: 'chronic_condition', label: 'Chronic' },
    { id: 'specialist_care', label: 'Specialist' },
    { id: 'medication_access', label: 'Medication' },
    { id: 'allergy_concerns', label: 'Allergies' },
    { id: 'climate_sensitivity', label: 'Climate' }
  ];

  // Social preference options
  const socialOptions = [
    { id: 'social', label: 'Very Social' },
    { id: 'balanced', label: 'Balanced' },
    { id: 'private', label: 'Private' }
  ];

  // Travel frequency options
  const travelOptions = [
    { id: 'frequent', label: 'Frequent' },
    { id: 'occasional', label: 'Occasional' },
    { id: 'rare', label: 'Rare' }
  ];

  // Updated lifestyle categories to match database
  const lifestyleCategories = [
    { id: 'outdoor_activities', label: 'Outdoor Activities', icon: Activity },
    { id: 'cultural_events', label: 'Cultural Events', icon: Heart },
    { id: 'shopping', label: 'Shopping', icon: Users },
    { id: 'wellness', label: 'Wellness & Spas', icon: Heart },
    { id: 'dining_out', label: 'Dining Out', icon: Heart },
    { id: 'nightlife', label: 'Nightlife', icon: Heart }
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
        
        // If hobbies data exists, load it
        if (data && data.hobbies) {
          setFormData(prev => ({
            ...prev,
            ...data.hobbies,
            // Ensure all fields have default values if not present
            lifestyle_importance: {
              outdoor_activities: 3,
              cultural_events: 3,
              shopping: 2,
              wellness: 3,
              dining_out: 3,
              nightlife: 2,
              ...data.hobbies.lifestyle_importance
            }
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

  const handleActivityToggle = (itemId) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(itemId)
        ? prev.activities.filter(item => item !== itemId)
        : [...prev.activities, itemId]
    }));
  };

  const handleInterestToggle = (itemId) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(itemId)
        ? prev.interests.filter(item => item !== itemId)
        : [...prev.interests, itemId]
    }));
  };

  const handleHealthToggle = (itemId) => {
    setFormData(prev => ({
      ...prev,
      health_considerations: prev.health_considerations.includes(itemId)
        ? prev.health_considerations.filter(item => item !== itemId)
        : [...prev.health_considerations, itemId]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImportanceChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      lifestyle_importance: {
        ...prev.lifestyle_importance,
        [category]: value
      }
    }));
  };

  const handleSkip = () => {
    navigate('/onboarding/administration');
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
      
      // Save only the fields that belong to the hobbies step
      const dataToSave = {
        activities: formData.activities,
        interests: formData.interests,
        social_preference: formData.social_preference,
        health_considerations: formData.health_considerations,
        travel_frequency: formData.travel_frequency,
        lifestyle_importance: formData.lifestyle_importance
      };
      
      const { success, error } = await saveOnboardingStep(
        user.id,
        dataToSave,
        'hobbies'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Hobbies, health & interests saved!');
      navigate('/onboarding/administration');
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

  // Simple slider component - matching culture page exactly
  const ImportanceSlider = ({ category, icon: Icon }) => {
    const value = formData.lifestyle_importance[category.id];
    
    return (
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Icon size={16} className="text-scout-accent-600 mr-1.5" />
            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              {category.label}
            </span>
          </div>
          <span className="text-xs font-medium text-scout-accent-600 dark:text-scout-accent-400">
            {((value - 1) * 25)}%
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value}
          onChange={(e) => handleImportanceChange(category.id, parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #8fbc8f 0%, #8fbc8f ${(value - 1) * 25}%, #e5e7eb ${(value - 1) * 25}%, #e5e7eb 100%)`
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-[100svh] bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-4">
      <div className="max-w-md mx-auto p-4 sm:p-4">
        <OnboardingStepNavigation 
          currentStep="hobbies" 
          completedSteps={progress.completedSteps} 
          className="mb-3" 
        />
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5">
          {/* Header */}
          <div className="mb-3">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Hobbies, Health & Interests</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Share your activities and lifestyle preferences
            </p>
          </div>

          {/* Physical Activities */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Activity size={16} className="mr-1.5" />
              Physical Activities
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {activityOptions.map((activity) => (
                <OptionButton
                  key={activity.id}
                  label={activity.label}
                  isSelected={formData.activities.includes(activity.id)}
                  onClick={() => handleActivityToggle(activity.id)}
                />
              ))}
            </div>
          </div>

          {/* Hobbies & Interests */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Heart size={16} className="mr-1.5" />
              Hobbies & Interests
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {interestOptions.map((interest) => (
                <OptionButton
                  key={interest.id}
                  label={interest.label}
                  isSelected={formData.interests.includes(interest.id)}
                  onClick={() => handleInterestToggle(interest.id)}
                />
              ))}
            </div>
          </div>

          {/* Social Preference */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Users size={16} className="mr-1.5" />
              Social Preference
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {socialOptions.map((option) => (
                <OptionButton
                  key={option.id}
                  label={option.label}
                  isSelected={formData.social_preference === option.id}
                  onClick={() => setFormData(prev => ({ ...prev, social_preference: option.id }))}
                />
              ))}
            </div>
          </div>

          {/* Travel Frequency */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Plane size={16} className="mr-1.5" />
              Travel Frequency
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {travelOptions.map((option) => (
                <OptionButton
                  key={option.id}
                  label={option.label}
                  isSelected={formData.travel_frequency === option.id}
                  onClick={() => setFormData(prev => ({ ...prev, travel_frequency: option.id }))}
                />
              ))}
            </div>
          </div>

          {/* Health Considerations */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Stethoscope size={16} className="mr-1.5" />
              Health Considerations
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {healthOptions.map((health) => (
                <OptionButton
                  key={health.id}
                  label={health.label}
                  isSelected={formData.health_considerations.includes(health.id)}
                  onClick={() => handleHealthToggle(health.id)}
                />
              ))}
            </div>
          </div>

          {/* Lifestyle Importance */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Lifestyle Importance
            </label>
            <div className="space-y-1.5">
              {lifestyleCategories.map((category) => (
                <ImportanceSlider 
                  key={category.id} 
                  category={category} 
                  icon={category.icon}
                />
              ))}
            </div>
          </div>

          {/* Summary Section */}
          {(formData.activities.length > 0 || 
            formData.interests.length > 0 ||
            formData.health_considerations.length > 0) && (
            <div className="mb-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h3 className="font-medium text-gray-800 dark:text-white mb-1.5 text-sm">
                Your Activities & Preferences:
              </h3>
              <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
                {formData.activities.length > 0 && (
                  <div><span className="font-medium">Activities:</span> {formData.activities.map(id => 
                    activityOptions.find(a => a.id === id)?.label
                  ).filter(Boolean).join(', ')}</div>
                )}
                {formData.interests.length > 0 && (
                  <div><span className="font-medium">Interests:</span> {formData.interests.map(id => 
                    interestOptions.find(i => i.id === id)?.label
                  ).filter(Boolean).join(', ')}</div>
                )}
                {formData.health_considerations.length > 0 && (
                  <div><span className="font-medium">Health:</span> {formData.health_considerations.length} considerations</div>
                )}
                <div><span className="font-medium">Social:</span> {formData.social_preference}</div>
                <div><span className="font-medium">Travel:</span> {formData.travel_frequency}</div>
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
                  <span className="font-medium">Pro Tip:</span> Your hobbies help us identify locations with active communities and facilities that match your interests.
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
                  onClick={() => navigate('/onboarding/culture')}
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