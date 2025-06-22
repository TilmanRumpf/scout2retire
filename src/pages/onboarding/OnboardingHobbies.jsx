import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plane, Activity, ShoppingBag, Sparkles } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import OnboardingStepNavigation from '../../components/OnboardingStepNavigation';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';

// Option Button Component
const OptionButton = ({ label, description, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2.5 sm:p-3 lg:p-4 ${uiConfig.layout.radius.md} border-2 ${uiConfig.animation.transition} text-center min-h-[44px] sm:min-h-[48px] lg:min-h-[52px] ${
      isSelected
        ? uiConfig.components.buttonVariants.selected
        : uiConfig.components.buttonVariants.unselected
    }`}
  >
    <div className={`text-xs sm:text-sm lg:text-base ${uiConfig.font.weight.medium} ${isSelected ? 'text-scout-accent-300 dark:text-scout-accent-300' : ''}`}>{label}</div>
    {description && <div className={`text-[10px] sm:text-xs mt-0.5 ${isSelected ? 'text-scout-accent-300 dark:text-scout-accent-300' : uiConfig.colors.hint}`}>{description}</div>}
  </button>
);

export default function OnboardingHobbies() {
  const [formData, setFormData] = useState({
    activities: [],
    interests: [],
    travel_frequency: '',
    lifestyle_importance: {
      outdoor_activities: 1,
      cultural_events: 1,
      shopping: 1,
      wellness: 1
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
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'wellness', label: 'Wellness & Spas', icon: Sparkles }
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
              outdoor_activities: 1,
              cultural_events: 1,
              shopping: 1,
              wellness: 1,
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
      <div className={`min-h-[100svh] ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.success} ${uiConfig.font.weight.semibold}`}>Loading...</div>
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
            <Icon size={16} className={`mr-1.5 ${uiConfig.colors.body}`} />
            <span className={`${uiConfig.font.size.xs} ${uiConfig.responsive.sm}${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
              {category.label}
            </span>
          </div>
          <span className={`${uiConfig.font.size.xs} ${uiConfig.responsive.sm}${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} text-scout-accent-300 dark:text-scout-accent-300`}>
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
            background: `linear-gradient(to right, rgb(var(--scout-accent-300)) 0%, rgb(var(--scout-accent-300)) ${(value - 1) * 25}%, rgb(var(--gray-200)) ${(value - 1) * 25}%, rgb(var(--gray-200)) 100%)`
          }}
        />
      </div>
    );
  };

  return (
    <div className={`min-h-[100svh] ${uiConfig.colors.page} pb-20 ${uiConfig.responsive.sm}pb-4`}>
      <div className="max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <OnboardingStepNavigation 
          currentStep="hobbies" 
          completedSteps={progress.completedSteps} 
          className="mb-3" 
        />
        
        <form onSubmit={handleSubmit} className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-4 sm:p-6 lg:p-8`}>
          {/* Header */}
          <div className="mb-3">
            <h1 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading}`}>Hobbies & Interests</h1>
            <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mt-0.5`}>
              Share your activities and lifestyle preferences
            </p>
          </div>

          {/* Physical Activities */}
          <div className="mb-3">
            <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 flex items-center`}>
              <Activity size={16} className="mr-1.5" />
              Physical Activities
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 lg:gap-4">
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
            <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 flex items-center`}>
              <Heart size={16} className="mr-1.5" />
              Hobbies & Interests
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 lg:gap-4">
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


          {/* Travel Frequency */}
          <div className="mb-3">
            <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 flex items-center`}>
              <Plane size={16} className="mr-1.5" />
              Travel Frequency
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 lg:gap-4">
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


          {/* Lifestyle Importance */}
          <div className="mb-3">
            <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 block`}>
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
            formData.interests.length > 0) && (
            <div className={`mb-3 p-2.5 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg}`}>
              <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-1.5 ${uiConfig.font.size.sm}`}>
                Your Activities & Preferences:
              </h3>
              <div className={`space-y-0.5 ${uiConfig.font.size.xs} ${uiConfig.colors.body}`}>
                {formData.activities.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Activities:</span> {formData.activities.map(id => 
                    activityOptions.find(a => a.id === id)?.label
                  ).filter(Boolean).join(', ')}</div>
                )}
                {formData.interests.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Interests:</span> {formData.interests.map(id => 
                    interestOptions.find(i => i.id === id)?.label
                  ).filter(Boolean).join(', ')}</div>
                )}
                <div><span className={`${uiConfig.font.weight.medium}`}>Travel:</span> {formData.travel_frequency}</div>
              </div>
            </div>
          )}

          {/* Pro Tip */}
          <div className={`mb-3 p-2.5 ${uiConfig.notifications.info} ${uiConfig.layout.radius.lg}`}>
            <div className="flex items-start">
              <div className="mr-2">
                <svg className={`${uiConfig.icons.size.sm} ${uiConfig.colors.accent}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.body}`}>
                  <span className={`${uiConfig.font.weight.medium}`}>Pro Tip:</span> Your hobbies help us identify locations with active communities and facilities that match your interests.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Bottom Navigation - Fixed on mobile, sticky on desktop */}
        <div className={`fixed ${uiConfig.responsive.sm}sticky bottom-0 left-0 right-0 ${uiConfig.responsive.sm}relative ${uiConfig.colors.card} border-t ${uiConfig.colors.borderLight} p-4 ${uiConfig.responsive.sm}p-0 ${uiConfig.responsive.sm}border-0 ${uiConfig.responsive.sm}bg-transparent ${uiConfig.responsive.sm}mt-4`}>
          <div className="max-w-md mx-auto">
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} border ${uiConfig.colors.border} p-3 ${uiConfig.layout.shadow.lg} ${uiConfig.responsive.sm}shadow-none`}>
              <div className="flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/onboarding/culture')}
                  className={`px-4 py-2.5 ${uiConfig.font.size.sm} ${uiConfig.colors.body} hover:${uiConfig.colors.heading} ${uiConfig.font.weight.medium} ${uiConfig.animation.transition} min-h-[44px]`}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className={`px-4 py-2.5 ${uiConfig.font.size.sm} ${uiConfig.colors.hint} hover:${uiConfig.colors.body} ${uiConfig.font.weight.medium} ${uiConfig.animation.transition} min-h-[44px]`}
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className={`px-6 py-2.5 ${uiConfig.font.size.sm} ${uiConfig.colors.btnPrimary} ${uiConfig.font.weight.medium} ${uiConfig.layout.radius.lg} ${uiConfig.states.disabled} min-h-[44px]`}
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