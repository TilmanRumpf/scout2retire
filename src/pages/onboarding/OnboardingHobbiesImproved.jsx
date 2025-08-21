import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plane, Activity, ShoppingBag, Sparkles, Lightbulb, Plus, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import { saveUserPreferences } from '../../utils/userPreferences';
import { useOnboardingAutoSave } from '../../hooks/useOnboardingAutoSave';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';

// Enhanced Activity Card Component - using centralized configuration
const ActivityCard = ({ id, label, description, isSelected, onClick, size = 'default' }) => {
  // Use centralized button configuration - MUST use standard height
  const buttonClasses = uiConfig.onboardingButton.getButtonClasses(isSelected, false);
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={buttonClasses}
    >
      {/* Checkmark for selected items - using centralized config */}
      {isSelected && (
        <div className={uiConfig.onboardingButton.checkmark.position}>
          <div className={uiConfig.onboardingButton.checkmark.container}>
            <Check className={uiConfig.onboardingButton.checkmark.icon} />
          </div>
        </div>
      )}
      
      {/* Content - using centralized typography */}
      <div className="flex flex-col justify-center h-full">
        <h3 className={`${uiConfig.onboardingButton.typography.title.weight} ${
          isSelected ? uiConfig.onboardingButton.typography.title.selectedColor : uiConfig.onboardingButton.typography.title.unselectedColor
        } ${uiConfig.onboardingButton.typography.title.size} ${isSelected ? 'pr-6' : ''}`}>
          {label}
        </h3>
        {description && (
          <p className={`${uiConfig.onboardingButton.typography.subtitle.size} ${
            isSelected ? uiConfig.onboardingButton.typography.subtitle.selectedColor : uiConfig.onboardingButton.typography.subtitle.unselectedColor
          } ${uiConfig.onboardingButton.typography.subtitle.spacing}`}>
            {description}
          </p>
        )}
      </div>
    </button>
  );
};

// Custom Activity Input Component
const CustomActivityInput = ({ onAdd, placeholder = "Add custom activity..." }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    const buttonClasses = `${uiConfig.onboardingButton.dimensions.height} ${uiConfig.onboardingButton.dimensions.padding} 
      ${uiConfig.layout.radius.lg} border-2 border-dashed 
      border-gray-300 dark:border-gray-600 hover:border-scout-accent-300 
      dark:hover:border-scout-accent-400 ${uiConfig.animation.transition}
      flex items-center justify-center gap-2
      bg-gray-50/50 dark:bg-gray-800/50 relative`;
    
    return (
      <button
        type="button"
        onClick={() => setIsAdding(true)}
        className={buttonClasses}
      >
        <span className={`${uiConfig.onboardingButton.typography.title.size} text-gray-500 dark:text-gray-400`}>
          {placeholder}
        </span>
      </button>
    );
  }

  return (
    <div className={`p-2 ${uiConfig.layout.radius.lg} border-2 border-scout-accent-300 
      bg-white dark:bg-gray-800 flex items-center gap-2`}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        placeholder={placeholder}
        autoFocus
        className="flex-1 px-2 py-1 text-sm bg-transparent outline-none text-gray-800 dark:text-gray-200"
      />
      <button
        type="button"
        onClick={handleAdd}
        className="px-3 py-1 text-xs bg-scout-accent-500 text-white rounded-md hover:bg-scout-accent-600"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => {
          setIsAdding(false);
          setInputValue('');
        }}
        className="p-1 text-gray-400 hover:text-gray-600"
      >
        <X size={14} />
      </button>
    </div>
  );
};

// Section Component with Expand/Collapse
const ActivitySection = ({ 
  title, 
  icon: Icon, 
  items, 
  selectedItems, 
  onToggle, 
  onAddCustom,
  customPlaceholder,
  initialExpanded = true,
  showAll = false 
}) => {
  const [expanded, setExpanded] = useState(showAll || initialExpanded);
  const [customItems, setCustomItems] = useState([]);
  
  const visibleItems = expanded ? items : items.slice(0, 6);
  const hasMore = items.length > 6;
  const selectedCount = selectedItems.length + customItems.filter(item => 
    selectedItems.includes(`custom_${item}`)
  ).length;

  const handleAddCustom = (value) => {
    const customId = `custom_${value.toLowerCase().replace(/\s+/g, '_')}`;
    setCustomItems(prev => [...prev, value]);
    onToggle(customId);
    if (onAddCustom) {
      onAddCustom(customId, value);
    }
  };

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={20} className="text-scout-accent-500" />
          <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
            {title}
          </h3>
          {selectedCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-scout-accent-100 text-scout-accent-700 
              dark:bg-scout-accent-900/30 dark:text-scout-accent-300 rounded-full">
              {selectedCount} selected
            </span>
          )}
        </div>
        
        {hasMore && !showAll && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-scout-accent-600 dark:text-scout-accent-300 
              hover:text-scout-accent-700 dark:hover:text-scout-accent-200"
          >
            {expanded ? (
              <>Show less <ChevronUp size={16} /></>
            ) : (
              <>Show {items.length - 6} more <ChevronDown size={16} /></>
            )}
          </button>
        )}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {visibleItems.map((item) => (
          <ActivityCard
            key={item.id}
            id={item.id}
            label={item.label}
            description={item.description}
            isSelected={selectedItems.includes(item.id)}
            onClick={() => onToggle(item.id)}
            size={expanded && items.length > 8 ? 'small' : 'default'}
          />
        ))}
        
        {/* Custom Items */}
        {customItems.map((item) => {
          const customId = `custom_${item.toLowerCase().replace(/\s+/g, '_')}`;
          return (
            <ActivityCard
              key={customId}
              id={customId}
              label={item}
              isSelected={selectedItems.includes(customId)}
              onClick={() => onToggle(customId)}
              size={expanded && items.length > 8 ? 'small' : 'default'}
            />
          );
        })}
        
      </div>
    </div>
  );
};

// Selection Summary Bar
const SelectionSummaryBar = ({ 
  activities, 
  interests, 
  travelFrequency,
  onBack,
  onSkip,
  onNext,
  loading 
}) => {
  const totalSelected = activities.length + interests.length;
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 ${uiConfig.colors.card} 
      border-t-2 ${uiConfig.colors.border} shadow-lg z-10`}>
      {/* Summary Section */}
      <div className="px-4 py-2 border-b ${uiConfig.colors.borderLight}">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
              {totalSelected} activities selected
            </span>
            <div className="hidden sm:flex items-center gap-3 text-xs ${uiConfig.colors.muted}">
              {activities.length > 0 && (
                <span>Physical: {activities.length}</span>
              )}
              {interests.length > 0 && (
                <span>Interests: {interests.length}</span>
              )}
              {travelFrequency && (
                <span>Travel: {travelFrequency}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className={`px-4 py-2 ${uiConfig.components.buttonSecondary}`}
          >
            ← Back
          </button>
          
          <button
            type="button"
            onClick={onSkip}
            disabled={loading}
            className={`px-4 py-2 ${uiConfig.components.buttonSecondary}`}
          >
            Skip
          </button>
          
          <button
            type="button"
            onClick={onNext}
            disabled={loading}
            className={`px-4 py-2 ${uiConfig.components.buttonPrimary}`}
          >
            {loading ? 'Saving...' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OnboardingHobbiesImproved() {
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
  const [customActivities, setCustomActivities] = useState({});
  
  const navigate = useNavigate();
  
  // Enable auto-save for this page
  const autoSave = useOnboardingAutoSave(formData, 'hobbies');

  // Enhanced activity options with descriptions
  const activityOptions = [
    { id: 'walking', label: 'Walking', description: 'trails • parks • nature' },
    { id: 'swimming', label: 'Swimming', description: 'pools • beach • water' },
    { id: 'cycling', label: 'Cycling', description: 'roads • trails • touring' },
    { id: 'golf', label: 'Golf', description: 'courses • driving range' },
    { id: 'tennis', label: 'Tennis', description: 'courts • clubs • pickleball' },
    { id: 'water_sports', label: 'Water Sports', description: 'sailing • kayaking • surfing' },
    { id: 'winter_sports', label: 'Winter Sports', description: 'skiing • snowboarding' },
    { id: 'fishing', label: 'Fishing', description: 'lakes • ocean • fly fishing' },
    { id: 'gardening', label: 'Gardening', description: 'plants • vegetables • landscaping' },
    { id: 'hiking', label: 'Hiking', description: 'mountains • trails • backpacking' },
    { id: 'yoga', label: 'Yoga & Fitness', description: 'studios • gyms • pilates' },
    { id: 'dancing', label: 'Dancing', description: 'ballroom • social • line dancing' }
  ];

  // Enhanced interest options with descriptions
  const interestOptions = [
    { id: 'arts', label: 'Arts & Crafts', description: 'painting • pottery • crafts' },
    { id: 'music', label: 'Music', description: 'concerts • instruments • choir' },
    { id: 'theater', label: 'Theater', description: 'plays • musicals • opera' },
    { id: 'reading', label: 'Reading', description: 'books • clubs • libraries' },
    { id: 'cooking', label: 'Cooking', description: 'cuisine • classes • baking' },
    { id: 'wine', label: 'Wine & Dining', description: 'tastings • restaurants • breweries' },
    { id: 'history', label: 'History', description: 'museums • tours • genealogy' },
    { id: 'photography', label: 'Photography', description: 'nature • travel • portraits' },
    { id: 'volunteering', label: 'Volunteering', description: 'community • charity • mentoring' },
    { id: 'games', label: 'Games', description: 'cards • board games • puzzles' },
    { id: 'technology', label: 'Technology', description: 'computers • gadgets • online' },
    { id: 'language', label: 'Languages', description: 'learning • practice • culture' }
  ];

  // Travel frequency options with descriptions
  const travelOptions = [
    { id: 'rare', label: 'Rare Traveler', description: 'Prefer staying local' },
    { id: 'occasional', label: 'Occasional', description: 'A few trips per year' },
    { id: 'frequent', label: 'Frequent Flyer', description: 'Monthly adventures' }
  ];

  // Lifestyle categories
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
        
        // If hobbies data exists, load it
        if (progressResult.data && progressResult.data.hobbies) {
          setFormData(prev => ({
            ...prev,
            ...progressResult.data.hobbies,
            lifestyle_importance: {
              outdoor_activities: 1,
              cultural_events: 1,
              shopping: 1,
              wellness: 1,
              ...progressResult.data.hobbies.lifestyle_importance
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

  const handleAddCustomActivity = (id, label) => {
    setCustomActivities(prev => ({ ...prev, [id]: label }));
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

  const handleSkip = async () => {
    setLoading(true);
    await autoSave();
    setLoading(false);
    navigate('/onboarding/administration');
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const userResult = await getCurrentUser();
      if (!userResult.user) {
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
        userResult.user.id,
        dataToSave,
        'hobbies'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Activities & interests saved!');
      
      // Also save to new user_preferences table
      try {
        const { success: prefSuccess, error: prefError } = await saveUserPreferences(
          userResult.user.id,
          'hobbies',
          dataToSave
        );
        if (prefSuccess) {
          console.log('✅ Saved hobbies to user_preferences table');
        }
      } catch (err) {
        console.error('Error saving hobbies to user_preferences:', err);
      }
      
      setTimeout(() => {
        navigate('/onboarding/administration');
      }, 100);
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ImportanceSlider = ({ category }) => {
    const value = formData.lifestyle_importance[category.id];
    const Icon = category.icon;
    
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-scout-accent-500" />
            <span className={`${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
              {category.label}
            </span>
          </div>
          <span className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.semibold} text-scout-accent-500`}>
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
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer 
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
            [&::-webkit-slider-thumb]:bg-scout-accent-500 [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
          style={{
            background: `linear-gradient(to right, rgb(143, 188, 143) 0%, rgb(143, 188, 143) ${(value - 1) * 25}%, rgb(229, 231, 235) ${(value - 1) * 25}%, rgb(229, 231, 235) 100%)`
          }}
        />
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className={`min-h-[100svh] ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.success} ${uiConfig.font.weight.semibold}`}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[100svh] ${uiConfig.colors.page} pb-32`}>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className={`${uiConfig.font.size['3xl']} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading} mb-2`}>
            What do you enjoy doing?
          </h1>
          <p className={`${uiConfig.font.size.base} ${uiConfig.colors.body}`}>
            Select activities and interests that matter to you
          </p>
        </div>

        {/* Pro Tip */}
        <div className={`bg-scout-accent-50 dark:bg-scout-accent-900/20 p-4 ${uiConfig.layout.radius.lg} mb-6 flex items-start`}>
          <Lightbulb size={20} className="mr-3 text-scout-accent-600 dark:text-scout-accent-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
              <span className={`${uiConfig.font.weight.semibold}`}>Pro Tip:</span> Your selections help us identify locations with active communities and facilities that match your interests. Each category includes multiple related activities!
            </p>
          </div>
        </div>
        
        {/* Physical Activities Section */}
        <ActivitySection
          title="Physical Activities"
          icon={Activity}
          items={activityOptions}
          selectedItems={formData.activities}
          onToggle={handleActivityToggle}
          onAddCustom={handleAddCustomActivity}
          customPlaceholder="Add custom activity..."
          initialExpanded={true}
        />

        {/* Lifestyle & Interests Section */}
        <ActivitySection
          title="Lifestyle & Interests"
          icon={Heart}
          items={interestOptions}
          selectedItems={formData.interests}
          onToggle={handleInterestToggle}
          onAddCustom={handleAddCustomActivity}
          customPlaceholder="Add custom interest..."
          initialExpanded={formData.interests.length > 0}
        />

        {/* Travel Frequency Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Plane size={20} className="text-scout-accent-500" />
            <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
              Travel Frequency
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {travelOptions.map((option) => (
              <ActivityCard
                key={option.id}
                id={option.id}
                label={option.label}
                description={option.description}
                isSelected={formData.travel_frequency === option.id}
                onClick={() => setFormData(prev => ({ ...prev, travel_frequency: option.id }))}
              />
            ))}
          </div>
        </div>

        {/* Lifestyle Importance Sliders */}
        <div className="mb-6">
          <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-4`}>
            Lifestyle Importance
          </h3>
          <div className={`${uiConfig.colors.card} p-4 ${uiConfig.layout.radius.lg} border ${uiConfig.colors.border}`}>
            {lifestyleCategories.map((category) => (
              <ImportanceSlider key={category.id} category={category} />
            ))}
          </div>
        </div>
      </main>

      {/* Fixed Bottom Summary Bar */}
      <SelectionSummaryBar
        activities={formData.activities}
        interests={formData.interests}
        travelFrequency={formData.travel_frequency}
        onBack={async () => {
          setLoading(true);
          await autoSave();
          setLoading(false);
          navigate('/onboarding/culture');
        }}
        onSkip={handleSkip}
        onNext={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
