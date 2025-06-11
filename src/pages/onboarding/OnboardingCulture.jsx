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
  Calendar,
  UserPlus,
  Gauge,
  Home,
  TreePine,
  Zap,
  BookOpen
} from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import { uiConfig } from '../../styles/uiConfig';
import OnboardingStepNavigation from '../../components/OnboardingStepNavigation';
import toast from 'react-hot-toast';

export default function OnboardingCulture() {
  // BEST PRACTICE 10JUN25: All form fields should use consistent heights
  // Standard field height: px-4 py-2 (matches button heights)
  // This should be defined in uiConfig.ts as:
  // formFieldHeight: 'px-4 py-2'
  // Then applied consistently across all inputs, selects, and interactive elements
  
  // Preserved all original state management
  const [formData, setFormData] = useState({
    expat_community_preference: [], // Changed to array for multi-select
    language_comfort: {
      preferences: [], // Changed to array for multi-select buttons
      already_speak: []
    },
    cultural_importance: {
      restaurants: 3,
      museums: 2,
      nightlife: 2,
      cultural_events: 4
    },
    lifestyle_preferences: {
      pace_of_life: [], // Changed to array for multi-select
      urban_rural: [], // Changed to array for multi-select
      traditional_progressive: 'balanced'
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
  
  const [showLanguageInput, setShowLanguageInput] = useState(false);
  const [touchedButton, setTouchedButton] = useState(null);
  
  const navigate = useNavigate();

  // Common languages options - prioritized order WITHOUT FLAGS
  const languages = [
    { id: 'english', label: 'English' },
    { id: 'spanish', label: 'Spanish' },
    { id: 'german', label: 'German' },
    { id: 'french', label: 'French' },
    { id: 'arabic', label: 'Arabic' },
    { id: 'croatian', label: 'Croatian' },
    { id: 'dutch', label: 'Dutch' },
    { id: 'greek', label: 'Greek' },
    { id: 'italian', label: 'Italian' },
    { id: 'japanese', label: 'Japanese' },
    { id: 'latvian', label: 'Latvian' },
    { id: 'mandarin', label: 'Mandarin' },
    { id: 'portuguese', label: 'Portuguese' },
    { id: 'thai', label: 'Thai' },
    { id: 'turkish', label: 'Turkish' }
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
          // Handle backward compatibility - convert old single values to arrays
          const loadedData = {
            ...data.culture_preferences,
            expat_community_preference: Array.isArray(data.culture_preferences.expat_community_preference) 
              ? data.culture_preferences.expat_community_preference 
              : (data.culture_preferences.expat_community_preference ? [data.culture_preferences.expat_community_preference] : []),
            language_comfort: {
              ...data.culture_preferences.language_comfort,
              preferences: data.culture_preferences.language_comfort?.preferences || 
                (data.culture_preferences.language_comfort?.english_only ? ['english_only'] :
                 data.culture_preferences.language_comfort?.willing_to_learn ? ['willing_to_learn'] : 
                 ['comfortable']),
              already_speak: data.culture_preferences.language_comfort?.already_speak || []
            },
            lifestyle_preferences: {
              ...data.culture_preferences.lifestyle_preferences,
              pace_of_life: Array.isArray(data.culture_preferences.lifestyle_preferences?.pace_of_life)
                ? data.culture_preferences.lifestyle_preferences.pace_of_life
                : (data.culture_preferences.lifestyle_preferences?.pace_of_life ? [data.culture_preferences.lifestyle_preferences.pace_of_life] : []),
              urban_rural: Array.isArray(data.culture_preferences.lifestyle_preferences?.urban_rural)
                ? data.culture_preferences.lifestyle_preferences.urban_rural
                : (data.culture_preferences.lifestyle_preferences?.urban_rural ? [data.culture_preferences.lifestyle_preferences.urban_rural] : [])
            }
          };
          setFormData(loadedData);
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

  // Multi-select toggle handler for all option buttons
  const handleMultiSelect = (fieldName, value, isNested = false) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    if (isNested) {
      // For nested fields like lifestyle_preferences
      const [parent, child] = fieldName.split('.');
      setFormData(prev => {
        const currentValues = prev[parent][child] || [];
        const isSelected = currentValues.includes(value);
        
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: isSelected 
              ? currentValues.filter(v => v !== value)
              : [...currentValues, value]
          }
        };
      });
    } else {
      // For top-level fields
      setFormData(prev => {
        const currentValues = prev[fieldName] || [];
        const isSelected = currentValues.includes(value);
        
        return {
          ...prev,
          [fieldName]: isSelected 
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value]
        };
      });
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
    // Check if at least some preferences are set
    if (formData.expat_community_preference.length === 0 && 
        formData.lifestyle_preferences.pace_of_life.length === 0 &&
        formData.lifestyle_preferences.urban_rural.length === 0 &&
        formData.language_comfort.preferences.length === 0) {
      toast.error('Please select at least some preferences');
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

  // Cultural importance categories with icons - Reordered and removed Religious/Int'l
  const culturalCategories = [
    { id: 'restaurants', label: 'Dining', icon: Utensils },
    { id: 'nightlife', label: 'Nightlife', icon: Music },
    { id: 'cultural_events', label: 'Events', icon: Calendar },
    { id: 'museums', label: 'Museums', icon: Building }
  ];

  // Expat community options - Removed "None"
  const expatOptions = [
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

  // Language preference options
  const languageOptions = [
    { value: 'english_only', label: 'English Only', icon: Languages },
    { value: 'willing_to_learn', label: 'Will Learn', icon: BookOpen },
    { value: 'comfortable', label: 'Any Language', icon: Globe2 }
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
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
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

          {/* Expat Community Preference - 3 columns, multi-select */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Users size={18} className="mr-1.5 text-scout-accent-600" />
              Expat Community Preference
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {expatOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  option={option}
                  isSelected={formData.expat_community_preference.includes(option.value)}
                  onClick={() => handleMultiSelect('expat_community_preference', option.value)}
                  sectionName="expat"
                />
              ))}
            </div>
          </div>

          {/* Pace of Life - Multi-select */}
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
                  isSelected={formData.lifestyle_preferences.pace_of_life.includes(option.value)}
                  onClick={() => handleMultiSelect('lifestyle_preferences.pace_of_life', option.value, true)}
                  sectionName="pace"
                />
              ))}
            </div>
          </div>

          {/* Urban vs Rural - Multi-select */}
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
                  isSelected={formData.lifestyle_preferences.urban_rural.includes(option.value)}
                  onClick={() => handleMultiSelect('lifestyle_preferences.urban_rural', option.value, true)}
                  sectionName="urban"
                />
              ))}
            </div>
          </div>

          {/* Language Preferences - 3 button layout */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Languages size={18} className="mr-1.5 text-scout-accent-600" />
              Language Preferences
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {languageOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  option={option}
                  isSelected={formData.language_comfort.preferences.includes(option.value)}
                  onClick={() => handleMultiSelect('language_comfort.preferences', option.value, true)}
                  sectionName="language"
                />
              ))}
            </div>
          </div>

          {/* Languages you speak - Same hierarchy level */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Languages you speak
            </label>
            {formData.language_comfort.preferences.includes('english_only') ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                Language selection disabled for English-only destinations
              </p>
            ) : (
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
                    className="w-full mt-0.5 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-scout-accent-400"
                  >
                    <option value="">None</option>
                    {languages.map(lang => (
                      <option key={lang.id} value={lang.id}>
                        {lang.label}
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
                    className="w-full mt-0.5 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-scout-accent-400"
                  >
                    <option value="">None</option>
                    {languages.map(lang => (
                      <option key={lang.id} value={lang.id}>
                        {lang.label}
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
                    className="w-full mt-0.5 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-scout-accent-400"
                  >
                    <option value="">None</option>
                    {languages.map(lang => (
                      <option key={lang.id} value={lang.id}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Cultural & Lifestyle Priorities - Compact sliders */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cultural & Lifestyle Priorities
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
          </div>

          {/* Summary Section - Consistent height with buttons */}
          {(formData.language_comfort.already_speak.length > 0 || 
            formData.expat_community_preference.length > 0 ||
            formData.lifestyle_preferences.pace_of_life.length > 0 ||
            formData.lifestyle_preferences.urban_rural.length > 0 ||
            formData.language_comfort.preferences.length > 0 ||
            Object.values(formData.cultural_importance).some(v => v >= 4)) && (
            <div className="mt-3 px-4 py-2 bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-md text-sm flex items-center">
              <span className="font-medium text-scout-accent-700 dark:text-scout-accent-300">Summary: </span>
              <span className="text-scout-accent-600 dark:text-scout-accent-400 ml-1">
                {formData.expat_community_preference.map(v => 
                  expatOptions.find(o => o.value === v)?.label
                ).filter(Boolean).join(', ')}
                {formData.expat_community_preference.length > 0 && ' community • '}
                {formData.lifestyle_preferences.pace_of_life.map(v => 
                  paceOptions.find(o => o.value === v)?.label
                ).filter(Boolean).join(', ')}
                {formData.lifestyle_preferences.pace_of_life.length > 0 && ' pace • '}
                {formData.lifestyle_preferences.urban_rural.map(v => 
                  urbanOptions.find(o => o.value === v)?.label
                ).filter(Boolean).join(', ')}
                {formData.lifestyle_preferences.urban_rural.length > 0 && ' • '}
                {formData.language_comfort.preferences.map(v => 
                  languageOptions.find(o => o.value === v)?.label
                ).filter(Boolean).join(', ')}
                {formData.language_comfort.preferences.length > 0 && ' • '}
                {formData.language_comfort.already_speak.length > 0 && `${formData.language_comfort.already_speak.map(langId => 
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
      </div>
    </div>
  );
}