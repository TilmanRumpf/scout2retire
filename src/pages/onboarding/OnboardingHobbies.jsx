import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import toast from 'react-hot-toast';
// 08JUN25: Import uiConfig for consistent design system
import { uiConfig } from '../../styles/uiConfig';

// 08JUN25: Professional Slider Component with Hover Tooltip - Reused from Culture page
const SliderWithTooltip = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 5, 
  leftLabel = "Low", 
  rightLabel = "High",
  className = "",
  ...props 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`flex items-center gap-3 w-full ${className}`}>
      <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} text-right min-w-[32px]`}>
        {leftLabel}
      </span>
      <div 
        className={uiConfig.components.sliderWithTooltip.container}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          className={uiConfig.components.sliderWithTooltip.slider}
          {...props}
        />
        {showTooltip && (
          <div 
            className={`${uiConfig.components.sliderWithTooltip.tooltip} ${showTooltip ? uiConfig.components.sliderWithTooltip.tooltipVisible : ''}`}
            style={{ left: `${((value - min) / (max - min)) * 100}%`, transform: 'translateX(-50%)' }}
          >
            {value}
            <div className={uiConfig.components.sliderWithTooltip.tooltipArrow}></div>
          </div>
        )}
      </div>
      <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} min-w-[36px]`}>
        {rightLabel}
      </span>
    </div>
  );
};

export default function OnboardingHobbies() {
  const [formData, setFormData] = useState({
    activities: [],
    interests: [],
    social_preference: 'balanced', // social, balanced, private
    health_considerations: [],
    travel_frequency: 'occasional', // frequent, occasional, rare
    lifestyle_importance: {
      outdoor_activities: 3,
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

  // 08JUN25: Lifestyle categories for slider importance ratings - removed duplicates from Culture page
  const lifestyleCategories = [
    { key: 'outdoor_activities', title: 'Outdoor Activities' },
    { key: 'shopping', title: 'Shopping' },
    { key: 'wellness', title: 'Wellness & Spas' }
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

  // 08JUN25: Updated to handle slider changes instead of button clicks
  const handleImportanceChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      lifestyle_importance: {
        ...prev.lifestyle_importance,
        [category]: parseInt(value)
      }
    }));
  };

  // 08JUN25: Updated next handler to match Culture navigation pattern
  const handleNext = async () => {
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

  // 08JUN25: Added previous step handler to match Culture navigation pattern
  const handlePrevious = () => {
    navigate('/onboarding/culture');
  };

  // 08JUN25: Loading screen with uiConfig styling - matches Culture
  if (initialLoading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} text-scout-accent-600 ${uiConfig.font.weight.semibold}`}>Loading...</div>
      </div>
    );
  }

  return (
    // 08JUN25: Mobile-first page container using uiConfig design tokens - matching Culture pattern
    <div className={`${uiConfig.layout.width.containerWide} ${uiConfig.layout.spacing.section} ${uiConfig.colors.page} min-h-screen ${uiConfig.font.family}`}>
      
      {/* 08JUN25: Header section with mobile-responsive design - matching Culture */}
      <div className="mb-6 sm:mb-8">
        <h1 className={`${uiConfig.font.size['2xl']} sm:${uiConfig.font.size['3xl']} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading} mb-2`}>
          Hobbies & Interests
        </h1>
        
        {/* 08JUN25: Progress bar with uiConfig styling - Step 5 of 5 */}
        <div className={`w-full ${uiConfig.progress.track} ${uiConfig.layout.radius.full} h-2 mb-4`}>
          <div className={`${uiConfig.progress.fill} h-2 ${uiConfig.layout.radius.full} ${uiConfig.animation.transition}`} 
               style={{ width: '100%' }}>
          </div>
        </div>
        <p className={`${uiConfig.colors.hint} ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base}`}>
          Step 5 of 5: Hobbies & Interests
        </p>
      </div>

      {/* 08JUN25: Main content area with form */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.xl} ${uiConfig.layout.shadow.sm} ${uiConfig.colors.borderLight} border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8`}>
        
        {/* 08JUN25: Description section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-scout-accent-100 dark:bg-scout-accent-900/20 ${uiConfig.layout.radius.full} mb-3 sm:mb-4`}>
            <svg className={`${uiConfig.icons.size.lg} sm:${uiConfig.icons.size.xl} text-scout-accent-600 dark:text-scout-accent-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className={`${uiConfig.colors.body} ${uiConfig.font.size.base} sm:${uiConfig.font.size.lg} px-2`}>
            Share your activities and lifestyle preferences to find locations that match your interests.
          </p>
        </div>

        {/* 08JUN25: Form sections - clean and professional design */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* 08JUN25: Physical Activities section with responsive checkbox grid */}
          <div>
            <div className="mb-4">
              <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-1`}>
                Physical Activities
              </h3>
              <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                Select activities you enjoy or plan to enjoy in retirement.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {activityOptions.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <input
                    id={`activity_${activity.id}`}
                    type="checkbox"
                    checked={formData.activities.includes(activity.id)}
                    onChange={(e) => handleCheckboxChange('activities', activity.id, e.target.checked)}
                    className={uiConfig.components.checkbox}
                  />
                  <label htmlFor={`activity_${activity.id}`} className={`ml-2 ${uiConfig.font.size.sm} ${uiConfig.colors.body} cursor-pointer`}>
                    {activity.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 08JUN25: Hobbies & Interests section with responsive checkbox grid */}
          <div>
            <div className="mb-4">
              <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-1`}>
                Hobbies & Interests
              </h3>
              <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                Select interests that are important to you.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {interestOptions.map((interest) => (
                <div key={interest.id} className="flex items-center">
                  <input
                    id={`interest_${interest.id}`}
                    type="checkbox"
                    checked={formData.interests.includes(interest.id)}
                    onChange={(e) => handleCheckboxChange('interests', interest.id, e.target.checked)}
                    className={uiConfig.components.checkbox}
                  />
                  <label htmlFor={`interest_${interest.id}`} className={`ml-2 ${uiConfig.font.size.sm} ${uiConfig.colors.body} cursor-pointer`}>
                    {interest.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 08JUN25: Social Preference section with responsive button grid */}
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
              <div className="md:flex-1">
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1 md:mb-0`}>
                  Social Preference
                </label>
                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} md:mt-1`}>
                  How social do you prefer to be in retirement?
                </p>
              </div>
              <div className="md:flex-1 md:max-w-xs">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'social', label: 'Very Social' },
                    { value: 'balanced', label: 'Balanced' },
                    { value: 'private', label: 'Private' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleRadioChange('social_preference', option.value)}
                      className={`py-2 px-3 ${uiConfig.layout.radius.lg} border text-center ${uiConfig.font.size.sm} ${uiConfig.animation.transition} ${
                        formData.social_preference === option.value
                          ? `${uiConfig.colors.borderActive} bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-700 dark:text-scout-accent-300`
                          : `${uiConfig.colors.borderLight} ${uiConfig.colors.body}`
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 08JUN25: Travel Frequency section with responsive button grid */}
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
              <div className="md:flex-1">
                <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1 md:mb-0`}>
                  Travel Frequency
                </label>
                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} md:mt-1`}>
                  How often do you plan to travel from your retirement location?
                </p>
              </div>
              <div className="md:flex-1 md:max-w-xs">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'frequent', label: 'Frequent' },
                    { value: 'occasional', label: 'Occasional' },
                    { value: 'rare', label: 'Rare' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleRadioChange('travel_frequency', option.value)}
                      className={`py-2 px-3 ${uiConfig.layout.radius.lg} border text-center ${uiConfig.font.size.sm} ${uiConfig.animation.transition} ${
                        formData.travel_frequency === option.value
                          ? `${uiConfig.colors.borderActive} bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-700 dark:text-scout-accent-300`
                          : `${uiConfig.colors.borderLight} ${uiConfig.colors.body}`
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 08JUN25: Lifestyle Importance section with SliderWithTooltip - converted from buttons */}
          <div className={`pt-4 border-t ${uiConfig.colors.borderLight}`}>
            <div className="mb-4">
              <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-1`}>
                Lifestyle Importance
              </h3>
              <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                Rate how important each lifestyle aspect is to you.
              </p>
            </div>

            <div className="space-y-4">
              {lifestyleCategories.map((category) => (
                <div key={category.key} className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} leading-tight`}>
                      {category.title}
                    </div>
                  </div>
                  <SliderWithTooltip
                    value={formData.lifestyle_importance[category.key]}
                    onChange={(e) => handleImportanceChange(category.key, e.target.value)}
                    min={1}
                    max={5}
                    leftLabel="Low"
                    rightLabel="High"
                    className="md:flex-1 md:max-w-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 08JUN25: Health Considerations section with responsive checkbox grid */}
          <div>
            <div className="mb-4">
              <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-1`}>
                Health Considerations
                <span className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} ${uiConfig.font.weight.normal} ml-2`}>
                  (Optional)
                </span>
              </h3>
              <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
                Select any health factors that should influence location recommendations.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {healthOptions.map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    id={`health_${option.id}`}
                    type="checkbox"
                    checked={formData.health_considerations.includes(option.id)}
                    onChange={(e) => handleCheckboxChange('health_considerations', option.id, e.target.checked)}
                    className={uiConfig.components.checkbox}
                  />
                  <label htmlFor={`health_${option.id}`} className={`ml-2 ${uiConfig.font.size.sm} ${uiConfig.colors.body} cursor-pointer`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 08JUN25: Navigation section matching Culture pattern */}
      <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center pt-6 border-t ${uiConfig.colors.borderLight} space-y-4 sm:space-y-0`}>
        <button 
          onClick={handlePrevious}
          className={`w-full sm:w-auto px-4 sm:px-6 py-3 border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.heading} ${uiConfig.colors.input} cursor-pointer ${uiConfig.states.hover} ${uiConfig.animation.transition} order-2 sm:order-1`}
        >
          Previous Step
        </button>
        <div className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint} text-center order-1 sm:order-2`}>
          Step 5 of 5
        </div>
        <button 
          onClick={handleNext}
          disabled={loading}
          className={`w-full sm:w-auto px-4 sm:px-6 py-3 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.lg} border-none cursor-pointer ${uiConfig.animation.transition} ${uiConfig.colors.focusRing} focus:ring-offset-2 order-3 ${loading ? uiConfig.states.disabled : ''}`}
        >
          {loading ? 'Saving...' : 'Complete Onboarding'}
        </button>
      </div>
    </div>
  );
}