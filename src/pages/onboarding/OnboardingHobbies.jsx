import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import { uiConfig } from '../../styles/uiConfig'; // 08JUN25: Added missing import
import toast from 'react-hot-toast';

export default function OnboardingHobbies() {
  const [formData, setFormData] = useState({
    activities: [],
    interests: [],
    social_preference: 'balanced', // social, balanced, private
    health_considerations: [],
    travel_frequency: 'occasional', // frequent, occasional, rare
    lifestyle_importance: {
      outdoor_activities: 3,
      cultural_events: 3,
      shopping: 2,
      wellness: 3
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  // Activity options
  const activityOptions = [
    { id: 'walking', label: 'Walking & Hiking' },
    { id: 'swimming', label: 'Swimming' },
    { id: 'cycling', label: 'Cycling' },
    { id: 'golf', label: 'Golf' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'fitness', label: 'Gym & Fitness' },
    { id: 'yoga', label: 'Yoga & Pilates' },
    { id: 'dancing', label: 'Dancing' },
    { id: 'water_sports', label: 'Water Sports' },
    { id: 'winter_sports', label: 'Winter Sports' },
    { id: 'fishing', label: 'Fishing' },
    { id: 'gardening', label: 'Gardening' }
  ];

  // Interest options
  const interestOptions = [
    { id: 'arts', label: 'Arts & Crafts' },
    { id: 'music', label: 'Music' },
    { id: 'theater', label: 'Theater & Performing Arts' },
    { id: 'reading', label: 'Reading & Literature' },
    { id: 'cooking', label: 'Cooking & Cuisine' },
    { id: 'wine', label: 'Wine & Spirits' },
    { id: 'history', label: 'History & Museums' },
    { id: 'language', label: 'Language Learning' },
    { id: 'photography', label: 'Photography' },
    { id: 'volunteering', label: 'Volunteering' },
    { id: 'technology', label: 'Technology' },
    { id: 'games', label: 'Games & Puzzles' }
  ];

  // Health consideration options
  const healthOptions = [
    { id: 'mobility', label: 'Mobility limitations' },
    { id: 'chronic_condition', label: 'Chronic health condition' },
    { id: 'regular_checkups', label: 'Need regular medical checkups' },
    { id: 'specialist_care', label: 'Require specialist medical care' },
    { id: 'medication_access', label: 'Need reliable medication access' },
    { id: 'allergy_concerns', label: 'Allergy concerns' },
    { id: 'climate_sensitivity', label: 'Climate sensitivity' }
  ];

  // Lifestyle categories for importance ratings (08JUN25: Removed redundant items)
  const lifestyleCategories = [
    { id: 'outdoor_activities', label: 'Outdoor Activities' },
    { id: 'cultural_events', label: 'Cultural Events' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'wellness', label: 'Wellness & Spas' }
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
        
        const { success, data, error } = await getOnboardingProgress(user.id);
        if (!success) {
          console.error("Error loading existing data:", error);
          setInitialLoading(false);
          return;
        }
        
        // If hobbies data exists, load it
        if (data && data.hobbies) {
          setFormData(data.hobbies);
        }
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadExistingData();
  }, [navigate]);

  const handleCheckboxChange = (group, itemId, checked) => {
    setFormData(prev => {
      const updatedItems = checked
        ? [...prev[group], itemId]
        : prev[group].filter(item => item !== itemId);
      
      return {
        ...prev,
        [group]: updatedItems
      };
    });
  };

  const handleRadioChange = (name, value) => {
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
        'hobbies'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Hobbies and interests saved!');
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
      <div className={`min-h-screen ${uiConfig.colors.page} ${uiConfig.layout.spacing.section} flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent} ${uiConfig.font.weight.semibold}`}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} ${uiConfig.layout.spacing.section}`}>
      <div className={uiConfig.layout.width.containerNarrow}>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/onboarding/culture')}
              className={`${uiConfig.colors.hint} hover:${uiConfig.colors.body} ${uiConfig.animation.transition}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={uiConfig.icons.size.md} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-1 ${uiConfig.layout.radius.full} ${
                    step === 5
                      ? 'bg-green-600 dark:bg-green-400'
                      : step < 5
                        ? 'bg-gray-400 dark:bg-gray-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                ></div>
              ))}
            </div>
            <div className="w-5"></div>
          </div>
          <h1 className={`${uiConfig.font.size['2xl']} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading} mb-2`}>Hobbies & Interests</h1>
          <p className={`${uiConfig.colors.hint} mb-6`}>
            Share your activities and lifestyle preferences to find locations that match your interests.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={`space-y-6 ${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} ${uiConfig.layout.spacing.card}`}>
          
          {/* 08JUN25: Physical Activities with horizontal layout */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
              <div className="sm:min-w-0 sm:flex-shrink-0">
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
                  Physical Activities
                </label>
                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                  Select activities you enjoy
                </p>
              </div>
              <div className="sm:flex-1 sm:max-w-lg">
                <div className="grid grid-cols-2 gap-2">
                  {activityOptions.map((activity) => (
                    <div key={activity.id} className="flex items-center">
                      <input
                        id={`activity_${activity.id}`}
                        type="checkbox"
                        checked={formData.activities.includes(activity.id)}
                        onChange={(e) => handleCheckboxChange('activities', activity.id, e.target.checked)}
                        className={uiConfig.components.checkbox}
                      />
                      <label htmlFor={`activity_${activity.id}`} className={`ml-2 ${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
                        {activity.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 08JUN25: Hobbies & Interests with horizontal layout */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
              <div className="sm:min-w-0 sm:flex-shrink-0">
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
                  Hobbies & Interests
                </label>
                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                  Select your main interests
                </p>
              </div>
              <div className="sm:flex-1 sm:max-w-lg">
                <div className="grid grid-cols-2 gap-2">
                  {interestOptions.map((interest) => (
                    <div key={interest.id} className="flex items-center">
                      <input
                        id={`interest_${interest.id}`}
                        type="checkbox"
                        checked={formData.interests.includes(interest.id)}
                        onChange={(e) => handleCheckboxChange('interests', interest.id, e.target.checked)}
                        className={uiConfig.components.checkbox}
                      />
                      <label htmlFor={`interest_${interest.id}`} className={`ml-2 ${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
                        {interest.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 08JUN25: Social Preference with horizontal layout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} sm:min-w-0 sm:flex-shrink-0`}>
              Social Preference
            </label>
            <div className="sm:flex-1 sm:max-w-xs">
              <select
                value={formData.social_preference}
                onChange={(e) => handleRadioChange('social_preference', e.target.value)}
                className={uiConfig.components.select}
              >
                <option value="social">Very social - love meeting people</option>
                <option value="balanced">Balanced - some social interaction</option>
                <option value="private">Private - prefer quiet lifestyle</option>
              </select>
            </div>
          </div>

          {/* 08JUN25: Travel Frequency with horizontal layout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} sm:min-w-0 sm:flex-shrink-0`}>
              Travel Frequency
            </label>
            <div className="sm:flex-1 sm:max-w-xs">
              <select
                value={formData.travel_frequency}
                onChange={(e) => handleRadioChange('travel_frequency', e.target.value)}
                className={uiConfig.components.select}
              >
                <option value="frequent">Frequent - love to travel</option>
                <option value="occasional">Occasional - some travel</option>
                <option value="rare">Rare - prefer staying local</option>
              </select>
            </div>
          </div>

          {/* 08JUN25: Health Considerations with horizontal layout */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
              <div className="sm:min-w-0 sm:flex-shrink-0">
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
                  Health Considerations
                </label>
                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                  Select any that apply
                </p>
              </div>
              <div className="sm:flex-1 sm:max-w-lg">
                <div className="grid grid-cols-1 gap-2">
                  {healthOptions.map((health) => (
                    <div key={health.id} className="flex items-center">
                      <input
                        id={`health_${health.id}`}
                        type="checkbox"
                        checked={formData.health_considerations.includes(health.id)}
                        onChange={(e) => handleCheckboxChange('health_considerations', health.id, e.target.checked)}
                        className={uiConfig.components.checkbox}
                      />
                      <label htmlFor={`health_${health.id}`} className={`ml-2 ${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
                        {health.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 08JUN25: Lifestyle Importance Ratings */}
          <div>
            <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-4`}>
              Lifestyle Importance (1-5 scale)
            </h3>
            <div className="space-y-4">
              {lifestyleCategories.map((category) => (
                <div key={category.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} sm:min-w-0 sm:flex-shrink-0`}>
                    {category.label}
                  </label>
                  <div className="sm:flex-1 sm:max-w-xs">
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={formData.lifestyle_importance[category.id]}
                        onChange={(e) => handleImportanceChange(category.id, parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                      <span className={`${uiConfig.font.weight.medium} ${uiConfig.colors.accent} text-sm w-8`}>
                        {formData.lifestyle_importance[category.id]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${uiConfig.colors.btnPrimary} ${uiConfig.font.weight.medium} py-3 px-4 ${uiConfig.layout.radius.lg} disabled:opacity-50 ${uiConfig.animation.transition}`}
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}