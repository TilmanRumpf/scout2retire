// src/pages/onboarding/OnboardingCulture.jsx
// Updated 10JUN25: Applied climate page design principles with scout-accent theme and professional enhancements
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Globe2, 
  Languages, 
  Utensils,
  Building,
  Music,
  Church,
  Calendar,
  UserPlus,
  Gauge,
  Home,
  TreePine,
  Zap
} from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import { uiConfig } from '../../styles/uiConfig';
import OnboardingStepNavigation from '../../components/OnboardingStepNavigation';
import toast from 'react-hot-toast';

export default function OnboardingCulture() {
  // Preserved all original state management
  const [formData, setFormData] = useState({
    expat_community_preference: 'moderate', // none, small, moderate, large
    language_comfort: {
      english_only: false,
      willing_to_learn: true,
      already_speak: []
    },
    cultural_importance: {
      restaurants: 3,
      museums: 2,
      nightlife: 2,
      religious_facilities: 3,
      cultural_events: 4,
      international_community: 3
    },
    lifestyle_preferences: {
      pace_of_life: 'moderate', // slow, moderate, fast
      urban_rural: 'suburban', // urban, suburban, rural
      traditional_progressive: 'balanced' // traditional, balanced, progressive
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState({
    completedSteps: {},
    completedCount: 0,
    totalSteps: 7,
    percentage: 0
  });
  
  // Added 10JUN25: Touch feedback state
  const [touchedButton, setTouchedButton] = useState(null);
  
  const navigate = useNavigate();

  // Common languages options - prioritized order
  const languages = [
    { id: 'english', label: 'English', flag: '🇬🇧' },
    { id: 'spanish', label: 'Spanish', flag: '🇪🇸' },
    { id: 'german', label: 'German', flag: '🇩🇪' },
    { id: 'french', label: 'French', flag: '🇫🇷' },
    { id: 'arabic', label: 'Arabic', flag: '🇸🇦' },
    { id: 'croatian', label: 'Croatian', flag: '🇭🇷' },
    { id: 'dutch', label: 'Dutch', flag: '🇳🇱' },
    { id: 'greek', label: 'Greek', flag: '🇬🇷' },
    { id: 'italian', label: 'Italian', flag: '🇮🇹' },
    { id: 'japanese', label: 'Japanese', flag: '🇯🇵' },
    { id: 'latvian', label: 'Latvian', flag: '🇱🇻' },
    { id: 'mandarin', label: 'Mandarin', flag: '🇨🇳' },
    { id: 'portuguese', label: 'Portuguese', flag: '🇵🇹' },
    { id: 'thai', label: 'Thai', flag: '🇹🇭' },
    { id: 'turkish', label: 'Turkish', flag: '🇹🇷' }
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
        
        // Set progress data
        if (userProgress) {
          setProgress(userProgress);
        }
        
        // If culture data exists, load it
        if (data && data.culture_preferences) {
          setFormData(data.culture_preferences);
        }
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadExistingData();
  }, [navigate]);

  // Enhanced 10JUN25: Input handlers with haptic feedback
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // Handle nested properties with dot notation
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      if (child === 'english_only') {
        // If enabling English-only, clear the other language options
        if (checked) {
          setFormData(prev => ({
            ...prev,
            language_comfort: {
              ...prev.language_comfort,
              english_only: true,
              willing_to_learn: false,
              already_speak: []
            }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            language_comfort: {
              ...prev.language_comfort,
              english_only: false
            }
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: checked
          }
        }));
      }
    }
  };

  const handleLanguageChange = (newLanguages) => {
    setFormData(prev => ({
      ...prev,
      language_comfort: {
        ...prev.language_comfort,
        already_speak: newLanguages
      }
    }));
  };

  const handleImportanceChange = (category, value) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    setFormData(prev => ({
      ...prev,
      cultural_importance: {
        ...prev.cultural_importance,
        [category]: value
      }
    }));
  };

  // Enhanced 10JUN25: Form validation
  const validateForm = () => {
    // Check if at least basic preferences are set
    if (!formData.expat_community_preference || !formData.lifestyle_preferences.pace_of_life) {
      toast.error('Please complete all required preferences');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
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
        'culture_preferences'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Culture preferences saved!');
      navigate('/onboarding/hobbies');
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleBack = () => {
    navigate('/onboarding/climate');
  };

  // Updated 10JUN25: Professional loading screen
  if (initialLoading) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scout-accent-300"></div>
          <p className="text-scout-accent-600 font-medium">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  // Cultural importance categories with icons - Compact labels
  const culturalCategories = [
    { id: 'restaurants', label: 'Dining', icon: Utensils },
    { id: 'museums', label: 'Museums', icon: Building },
    { id: 'nightlife', label: 'Nightlife', icon: Music },
    { id: 'religious_facilities', label: 'Religious', icon: Church },
    { id: 'cultural_events', label: 'Events', icon: Calendar },
    { id: 'international_community', label: 'Int\'l', icon: Globe2 }
  ];

  // Expat community options - Ultra compact
  const expatOptions = [
    { value: 'none', label: 'None', icon: Home },
    { value: 'small', label: 'Small', icon: Users },
    { value: 'moderate', label: 'Moderate', icon: UserPlus },
    { value: 'large', label: 'Large', icon: Globe2 }
  ];

  // Pace of life options - Compact labels
  const paceOptions = [
    { value: 'slow', label: 'Relaxed', icon: TreePine },
    { value: 'moderate', label: 'Moderate', icon: Gauge },
    { value: 'fast', label: 'Fast', icon: Zap }
  ];

  // Urban/Rural options - Compact labels
  const urbanOptions = [
    { value: 'urban', label: 'Urban', icon: Building },
    { value: 'suburban', label: 'Suburban', icon: Home },
    { value: 'rural', label: 'Rural', icon: TreePine }
  ];

  // Enhanced 10JUN25: Ultra-compact option button for mobile
  const OptionButton = ({ option, isSelected, onClick, sectionName }) => {
    const buttonId = `${sectionName}-${option.value}`;
    const isPressed = touchedButton === buttonId;
    const Icon = option.icon;
    
    return (
      <button
        type="button"
        onClick={onClick}
        onTouchStart={() => setTouchedButton(buttonId)}
        onTouchEnd={() => setTouchedButton(null)}
        className={`
          relative flex flex-col items-center justify-center p-2 rounded-md border
          transition-all duration-150 transform
          ${isSelected
            ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-scout-accent-200'
          }
          ${isPressed ? 'scale-95' : ''}
          focus:outline-none focus:ring-1 focus:ring-scout-accent-400 focus:ring-offset-1
        `}
        aria-label={option.label}
        aria-pressed={isSelected}
      >
        <Icon 
          size={20} 
          className={`transition-all duration-200 ${
            isSelected 
              ? 'text-scout-accent-600 dark:text-scout-accent-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
        />
        <span className={`text-xs mt-1 ${
          isSelected 
            ? 'text-scout-accent-600 dark:text-scout-accent-400 font-medium' 
            : 'text-gray-600 dark:text-gray-300'
        }`}>
          {option.label}
        </span>
        {isSelected && (
          <div className="absolute -top-1 -right-1">
            <div className="w-1.5 h-1.5 bg-scout-accent-300 rounded-full"></div>
          </div>
        )}
      </button>
    );
  };

  // Enhanced 10JUN25: Clean slider component with scout-accent theme
  const ImportanceSlider = ({ category, icon: Icon }) => {
    const value = formData.cultural_importance[category.id];
    
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Icon size={16} className="text-scout-accent-600 mr-1.5" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {category.label}
            </span>
          </div>
          <span className="text-xs font-medium text-scout-accent-600 dark:text-scout-accent-400">
            {value}/5
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value}
          onChange={(e) => handleImportanceChange(category.id, parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-scout"
          style={{
            background: `linear-gradient(to right, #8fbc8f 0%, #8fbc8f ${(value - 1) * 25}%, #e5e7eb ${(value - 1) * 25}%, #e5e7eb 100%)`
          }}
        />
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} p-4`}>
      <div className={uiConfig.layout.width.containerNarrow}>
        
        {/* Step Navigation */}
        <OnboardingStepNavigation 
          currentStep="culture_preferences"
          completedSteps={progress.completedSteps}
          className="mb-4"
        />

        {/* Main Form - Ultra compact padding */}
        <form onSubmit={handleSubmit} className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} p-3 sm:p-4`}>
          
          {/* Header - Ultra compact */}
          <div className="mb-4">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              Culture & Lifestyle
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Tell us about your cultural preferences.
            </p>
          </div>

          {/* Expat Community Preference - Ultra compact 4 columns */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Users size={18} className="mr-1.5 text-scout-accent-600" />
              Expat Community Preference
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {expatOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  option={option}
                  isSelected={formData.expat_community_preference === option.value}
                  onClick={() => handleInputChange({ 
                    target: { name: 'expat_community_preference', value: option.value } 
                  })}
                  sectionName="expat"
                />
              ))}
            </div>
          </div>

          {/* Pace of Life - Compact 3 columns */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Gauge size={18} className="mr-1.5 text-scout-accent-600" />
              Pace of Life
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {paceOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  option={option}
                  isSelected={formData.lifestyle_preferences.pace_of_life === option.value}
                  onClick={() => setFormData({
                    ...formData,
                    lifestyle_preferences: {
                      ...formData.lifestyle_preferences,
                      pace_of_life: option.value
                    }
                  })}
                  sectionName="pace"
                />
              ))}
            </div>
          </div>

          {/* Urban vs Rural - Compact 3 columns */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Home size={18} className="mr-1.5 text-scout-accent-600" />
              Living Environment
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {urbanOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  option={option}
                  isSelected={formData.lifestyle_preferences.urban_rural === option.value}
                  onClick={() => setFormData({
                    ...formData,
                    lifestyle_preferences: {
                      ...formData.lifestyle_preferences,
                      urban_rural: option.value
                    }
                  })}
                  sectionName="urban"
                />
              ))}
            </div>
          </div>

          {/* Cultural Importance - Compact sliders */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cultural Amenities Importance
            </label>
            <div className="space-y-2">
              {culturalCategories.map((category) => (
                <ImportanceSlider 
                  key={category.id} 
                  category={category} 
                  icon={category.icon}
                />
              ))}
            </div>
            <style jsx>{`
              .slider-scout::-webkit-slider-thumb {
                appearance: none;
                width: 16px;
                height: 16px;
                background: #8fbc8f;
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              }
              .slider-scout::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background: #8fbc8f;
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              }
            `}</style>
          </div>

          {/* Language Preferences - Compact dropdown */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Languages size={18} className="mr-1.5 text-scout-accent-600" />
              Language Preferences
            </label>
            
            {/* Language comfort dropdown */}
            <select
              name="language_comfort_level"
              value={
                formData.language_comfort.english_only ? 'english_only' :
                formData.language_comfort.willing_to_learn ? 'willing_to_learn' :
                'comfortable'
              }
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  language_comfort: {
                    ...prev.language_comfort,
                    english_only: value === 'english_only',
                    willing_to_learn: value === 'willing_to_learn' || value === 'english_only'
                  }
                }));
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            >
              <option value="english_only">English-only destinations</option>
              <option value="willing_to_learn">Willing to learn new language</option>
              <option value="comfortable">Comfortable with any language</option>
            </select>

            {/* Languages you speak - Three columns */}
            {!formData.language_comfort.english_only && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                  Languages you speak:
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {/* Primary Language */}
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Primary</label>
                    <select
                      value={formData.language_comfort.already_speak[0] || ''}
                      onChange={(e) => {
                        const newLanguages = [...formData.language_comfort.already_speak];
                        newLanguages[0] = e.target.value;
                        // Remove duplicates and empty values
                        const uniqueLanguages = [...new Set(newLanguages.filter(Boolean))];
                        handleLanguageChange(uniqueLanguages);
                      }}
                      className="w-full mt-0.5 px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                      <option value="">None</option>
                      {languages.map(lang => (
                        <option key={lang.id} value={lang.id}>
                          {lang.flag} {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Secondary Language */}
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Secondary</label>
                    <select
                      value={formData.language_comfort.already_speak[1] || ''}
                      onChange={(e) => {
                        const newLanguages = [...formData.language_comfort.already_speak];
                        newLanguages[1] = e.target.value;
                        // Remove duplicates and empty values
                        const uniqueLanguages = [...new Set(newLanguages.filter(Boolean))];
                        handleLanguageChange(uniqueLanguages);
                      }}
                      className="w-full mt-0.5 px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                      <option value="">None</option>
                      {languages.map(lang => (
                        <option key={lang.id} value={lang.id}>
                          {lang.flag} {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Optional Language */}
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Optional</label>
                    <select
                      value={formData.language_comfort.already_speak[2] || ''}
                      onChange={(e) => {
                        const newLanguages = [...formData.language_comfort.already_speak];
                        newLanguages[2] = e.target.value;
                        // Remove duplicates and empty values
                        const uniqueLanguages = [...new Set(newLanguages.filter(Boolean))];
                        handleLanguageChange(uniqueLanguages);
                      }}
                      className="w-full mt-0.5 px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                      <option value="">None</option>
                      {languages.map(lang => (
                        <option key={lang.id} value={lang.id}>
                          {lang.flag} {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Section - Ultra compact */}
          {(formData.language_comfort.already_speak.length > 0 || 
            formData.expat_community_preference !== 'moderate' ||
            Object.values(formData.cultural_importance).some(v => v >= 4)) && (
            <div className="mt-3 p-2 bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded text-xs">
              <span className="font-medium text-scout-accent-700 dark:text-scout-accent-300">Summary: </span>
              <span className="text-scout-accent-600 dark:text-scout-accent-400">
                {expatOptions.find(o => o.value === formData.expat_community_preference)?.label} community • 
                {paceOptions.find(o => o.value === formData.lifestyle_preferences.pace_of_life)?.label} pace • 
                {urbanOptions.find(o => o.value === formData.lifestyle_preferences.urban_rural)?.label}
                {formData.language_comfort.already_speak.length > 0 && ` • ${formData.language_comfort.already_speak.map(langId => 
                  languages.find(l => l.id === langId)?.label
                ).filter(Boolean).join(', ')}`}
              </span>
            </div>
          )}

          {/* Bottom Navigation - Compact */}
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft size={14} className="mr-1.5" />
              Back
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-scout-accent-300 rounded-md hover:bg-scout-accent-400 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight size={14} className="ml-1.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Progress Indicator - Compact */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Step 4 of 7 • {Math.round((4/7) * 100)}% complete
          </p>
          <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-scout-accent-300 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((4/7) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}