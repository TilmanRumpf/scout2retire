import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Globe2, Languages, Utensils, Building, Music, Calendar, Gauge, Home } from 'lucide-react';
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
        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/30 hover:border-scout-accent-200 dark:hover:border-scout-accent-400'
    }`}
  >
    <div className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-scout-accent-700 dark:text-scout-accent-200' : 'text-gray-700 dark:text-gray-200'}`}>{label}</div>
    {description && <div className={`text-[10px] sm:text-xs mt-0.5 ${isSelected ? 'text-scout-accent-600 dark:text-scout-accent-400' : 'text-gray-500 dark:text-gray-400'}`}>{description}</div>}
  </button>
);

export default function OnboardingCulture() {
  const [formData, setFormData] = useState({
    expat_community_preference: [],
    language_comfort: {
      preferences: [],
      already_speak: []
    },
    cultural_importance: {
      restaurants: 3,
      museums: 2,
      nightlife: 2,
      cultural_events: 3
    },
    lifestyle_preferences: {
      pace_of_life: [],
      urban_rural: [],
      traditional_progressive: 'balanced'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState({ completedSteps: {} });
  const navigate = useNavigate();

  // Common languages options
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
        
        setProgress(userProgress);
        
        // If culture data exists, load it
        if (data && data.culture_preferences) {
          const loadedData = {
            ...data.culture_preferences,
            expat_community_preference: Array.isArray(data.culture_preferences.expat_community_preference) 
              ? data.culture_preferences.expat_community_preference 
              : (data.culture_preferences.expat_community_preference ? [data.culture_preferences.expat_community_preference] : []),
            language_comfort: {
              ...data.culture_preferences.language_comfort,
              preferences: data.culture_preferences.language_comfort?.preferences || [],
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
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

  const handleMultiSelect = (fieldName, value, isNested = false) => {
    if (isNested) {
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
    setFormData(prev => ({
      ...prev,
      cultural_importance: {
        ...prev.cultural_importance,
        [category]: value
      }
    }));
  };

  const handleSkip = () => {
    navigate('/onboarding/hobbies');
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

  if (initialLoading) {
    return (
      <div className="min-h-[100svh] bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-scout-accent-600 font-semibold">Loading...</div>
      </div>
    );
  }

  // Cultural importance categories with icons
  const culturalCategories = [
    { id: 'restaurants', label: 'Dining', icon: Utensils },
    { id: 'nightlife', label: 'Nightlife', icon: Music },
    { id: 'cultural_events', label: 'Events', icon: Calendar },
    { id: 'museums', label: 'Museums', icon: Building }
  ];

  // Expat community options
  const expatOptions = [
    { value: 'small', label: 'Small' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'large', label: 'Large' }
  ];

  // Pace of life options
  const paceOptions = [
    { value: 'slow', label: 'Relaxed' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'fast', label: 'Fast' }
  ];

  // Language preference options
  const languageOptions = [
    { value: 'english_only', label: 'English Only' },
    { value: 'willing_to_learn', label: 'Will Learn' },
    { value: 'comfortable', label: 'Any Language' }
  ];

  // Urban/Rural options
  const urbanOptions = [
  { value: 'rural', label: 'Rural' },
  { value: 'suburban', label: 'Suburban' },
  { value: 'urban', label: 'Urban' }
  ];

  // Simple slider component
  const ImportanceSlider = ({ category, icon: Icon }) => {
    const value = formData.cultural_importance[category.id];
    
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
            background: `linear-gradient(to right, rgb(var(--scout-accent-300)) 0%, rgb(var(--scout-accent-300)) ${(value - 1) * 25}%, rgb(var(--gray-200)) ${(value - 1) * 25}%, rgb(var(--gray-200)) 100%)`
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-[100svh] bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-4">
      <div className="max-w-md mx-auto p-4 sm:p-4">
        <OnboardingStepNavigation 
          currentStep="culture_preferences" 
          completedSteps={progress.completedSteps} 
          className="mb-3" 
        />
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5">
          {/* Header */}
          <div className="mb-3">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Culture & Lifestyle</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Tell us about your cultural preferences
            </p>
          </div>

          {/* Expat Community Preference */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Users size={16} className="mr-1.5" />
              Expat Community Preference
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {expatOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.expat_community_preference.includes(option.value)}
                  onClick={() => handleMultiSelect('expat_community_preference', option.value)}
                />
              ))}
            </div>
          </div>

          {/* Pace of Life */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Gauge size={16} className="mr-1.5" />
              Pace of Life
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {paceOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.lifestyle_preferences.pace_of_life.includes(option.value)}
                  onClick={() => handleMultiSelect('lifestyle_preferences.pace_of_life', option.value, true)}
                />
              ))}
            </div>
          </div>

          {/* Living Environment */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Home size={16} className="mr-1.5" />
              Living Environment
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {urbanOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.lifestyle_preferences.urban_rural.includes(option.value)}
                  onClick={() => handleMultiSelect('lifestyle_preferences.urban_rural', option.value, true)}
                />
              ))}
            </div>
          </div>

          {/* Language Preferences */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Languages size={16} className="mr-1.5" />
              Language Preferences
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {languageOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.language_comfort.preferences.includes(option.value)}
                  onClick={() => handleMultiSelect('language_comfort.preferences', option.value, true)}
                />
              ))}
            </div>
          </div>

          {/* Languages you speak */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Languages you speak
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {/* Primary Language */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Primary</label>
                <select
                  value={formData.language_comfort.already_speak[0] || ''}
                  onChange={(e) => {
                    const newLanguages = [...formData.language_comfort.already_speak];
                    newLanguages[0] = e.target.value;
                    const uniqueLanguages = [...new Set(newLanguages.filter(Boolean))];
                    handleLanguageChange(uniqueLanguages);
                  }}
                  className="w-full mt-0.5 px-2 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 appearance-none cursor-pointer focus:ring-0 focus:border-scout-accent-300 transition-colors h-[44px]"
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
                    const uniqueLanguages = [...new Set(newLanguages.filter(Boolean))];
                    handleLanguageChange(uniqueLanguages);
                  }}
                  className="w-full mt-0.5 px-2 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 appearance-none cursor-pointer focus:ring-0 focus:border-scout-accent-300 transition-colors h-[44px]"
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
                    const uniqueLanguages = [...new Set(newLanguages.filter(Boolean))];
                    handleLanguageChange(uniqueLanguages);
                  }}
                  className="w-full mt-0.5 px-2 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 appearance-none cursor-pointer focus:ring-0 focus:border-scout-accent-300 transition-colors h-[44px]"
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
          </div>

          {/* Cultural & Lifestyle Priorities */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Cultural & Lifestyle Priorities
            </label>
            <div className="space-y-1.5">
              {culturalCategories.map((category) => (
                <ImportanceSlider 
                  key={category.id} 
                  category={category} 
                  icon={category.icon}
                />
              ))}
            </div>
          </div>

          {/* Summary Section */}
          {(formData.expat_community_preference.length > 0 ||
            formData.lifestyle_preferences.pace_of_life.length > 0 ||
            formData.lifestyle_preferences.urban_rural.length > 0 ||
            formData.language_comfort.preferences.length > 0 ||
            formData.language_comfort.already_speak.length > 0) && (
            <div className="mb-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h3 className="font-medium text-gray-800 dark:text-white mb-1.5 text-sm">
                Your Culture & Lifestyle:
              </h3>
              <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
                {formData.expat_community_preference.length > 0 && (
                  <div><span className="font-medium">Community:</span> {formData.expat_community_preference.join(', ')}</div>
                )}
                {formData.lifestyle_preferences.pace_of_life.length > 0 && (
                  <div><span className="font-medium">Pace:</span> {formData.lifestyle_preferences.pace_of_life.join(', ')}</div>
                )}
                {formData.lifestyle_preferences.urban_rural.length > 0 && (
                  <div><span className="font-medium">Environment:</span> {formData.lifestyle_preferences.urban_rural.join(', ')}</div>
                )}
                {formData.language_comfort.preferences.length > 0 && (
                  <div><span className="font-medium">Language preference:</span> {formData.language_comfort.preferences.join(', ').replace(/_/g, ' ')}</div>
                )}
                {formData.language_comfort.already_speak.length > 0 && (
                  <div><span className="font-medium">Speaks:</span> {formData.language_comfort.already_speak.map(langId => 
                    languages.find(l => l.id === langId)?.label
                  ).filter(Boolean).join(', ')}</div>
                )}
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
                  <span className="font-medium">Pro Tip:</span> Your cultural preferences help us find communities where you'll feel at home. Consider both practical needs and lifestyle desires.
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
                  onClick={() => navigate('/onboarding/climate')}
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