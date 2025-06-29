import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Globe2, Languages, Utensils, Building, Music, Calendar, Gauge, Home } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import OnboardingProgressiveNav from '../../components/OnboardingProgressiveNav';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';

// Option Button Component - Responsive for mobile and desktop
const OptionButton = ({ label, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`${uiConfig.components.buttonSizes.default} lg:py-3 lg:px-4 xl:py-4 xl:px-5 ${uiConfig.layout.radius.md} lg:rounded-lg border-2 ${uiConfig.animation.transition} text-center ${
      isSelected
        ? uiConfig.components.buttonVariants.selected
        : uiConfig.components.buttonVariants.unselected
    }`}
  >
    <div className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${isSelected ? 'text-white' : uiConfig.colors.body}`}>{label}</div>
  </button>
);

// Language Select Component - styled like OptionButton
const LanguageSelect = ({ value, onChange, label, languages }) => (
  <div>
    <label className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} block mb-0.5`}>{label}</label>
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 text-xs sm:text-sm lg:text-base ${uiConfig.layout.radius.md} appearance-none cursor-pointer focus:ring-0 ${uiConfig.animation.transition} h-[44px] sm:h-[48px] lg:h-[52px] border-2 flex items-center text-center ${
        value 
          ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-300 dark:text-scout-accent-300 font-medium'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/30 text-gray-700 dark:text-gray-200 hover:border-scout-accent-200 dark:hover:border-scout-accent-400'
      }`}
      style={{ lineHeight: '44px', paddingTop: '0', paddingBottom: '0' }}
    >
      <option value="">None</option>
      {languages.map(lang => (
        <option key={lang.id} value={lang.id}>
          {lang.label}
        </option>
      ))}
    </select>
  </div>
);

export default function OnboardingCulture() {
  const [formData, setFormData] = useState({
    expat_community_preference: [],
    language_comfort: {
      preferences: [],
      already_speak: []
    },
    cultural_importance: {
      dining_nightlife: 1,
      museums: 1,
      cultural_events: 1
    },
    lifestyle_preferences: {
      pace_of_life: [],
      urban_rural: [],
      social_preference: '',
      traditional_progressive: ''
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
                : (data.culture_preferences.lifestyle_preferences?.urban_rural ? [data.culture_preferences.lifestyle_preferences.urban_rural] : []),
              social_preference: data.culture_preferences.lifestyle_preferences?.social_preference || ''
            },
            cultural_importance: {
              // Handle legacy data: combine restaurants and nightlife if they exist separately
              dining_nightlife: data.culture_preferences.cultural_importance?.dining_nightlife || 
                                (data.culture_preferences.cultural_importance?.restaurants && data.culture_preferences.cultural_importance?.nightlife 
                                  ? Math.round((data.culture_preferences.cultural_importance.restaurants + 
                                               data.culture_preferences.cultural_importance.nightlife) / 2)
                                  : 1),
              museums: data.culture_preferences.cultural_importance?.museums || 1,
              cultural_events: data.culture_preferences.cultural_importance?.cultural_events || 1
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
      <div className={`min-h-[100svh] ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.success} ${uiConfig.font.weight.semibold}`}>Loading...</div>
      </div>
    );
  }

  // Cultural importance categories with icons - renamed Events and Museums
  const culturalCategories = [
    { id: 'dining_nightlife', label: 'Dining & Nightlife', icon: Utensils },
    { id: 'cultural_events', label: 'Events & Concerts', icon: Calendar },
    { id: 'museums', label: 'Museums & Arts', icon: Building }
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
    { value: 'comfortable', label: 'Flexible' }
  ];

  // Urban/Rural options
  const urbanOptions = [
  { value: 'rural', label: 'Rural' },
  { value: 'suburban', label: 'Suburban' },
  { value: 'urban', label: 'Urban' }
  ];

  // Social preference options
  const socialOptions = [
    { value: 'social', label: 'Very Social' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'private', label: 'Private' }
  ];

  // Simple slider component with consistent icon colors
  const ImportanceSlider = ({ category, icon: Icon }) => {
    const value = formData.cultural_importance[category.id];
    
    return (
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Icon size={16} className={`mr-1.5 lg:mr-2 ${uiConfig.colors.body}`} />
            <span className={`text-xs sm:text-sm lg:text-base ${uiConfig.colors.body}`}>
              {category.label}
            </span>
          </div>
          <span className={`text-xs sm:text-sm lg:text-base ${uiConfig.font.weight.medium} text-scout-accent-300 dark:text-scout-accent-300`}>
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
          className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgb(var(--scout-accent-300)) 0%, rgb(var(--scout-accent-300)) ${(value - 1) * 25}%, rgb(var(--gray-200)) ${(value - 1) * 25}%, rgb(var(--gray-200)) 100%)`
          }}
        />
      </div>
    );
  };

  return (
    <div className={`min-h-[100svh] ${uiConfig.colors.page}`}>
      <OnboardingProgressiveNav 
        currentStep="culture_preferences" 
        completedSteps={progress.completedSteps} 
      />
      <main className="max-w-7xl mx-auto px-4 py-6">
        
        <form onSubmit={handleSubmit} className="py-6">
          {/* Living Environment - moved to first position */>
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <Home size={16} className="mr-1.5 lg:mr-2" />
              Living Environment
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
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

          {/* Pace of Life - moved to second position */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <Gauge size={16} className="mr-1.5 lg:mr-2" />
              Pace of Life
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
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

          {/* Social Preference - between Pace of Life and Expat Community */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <Users size={16} className="mr-1.5 lg:mr-2" />
              Social Preference
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
              {socialOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  isSelected={formData.lifestyle_preferences.social_preference === option.value}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    lifestyle_preferences: { 
                      ...prev.lifestyle_preferences, 
                      social_preference: option.value 
                    } 
                  }))}
                />
              ))}
            </div>
          </div>

          {/* Expat Community */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <Users size={16} className="mr-1.5 lg:mr-2" />
              Expat Community
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
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

          {/* Language Preferences - moved to fourth position */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <Languages size={16} className="mr-1.5 lg:mr-2" />
              Language Preference
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
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

          {/* Languages you speak - after Language Preference */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
              <Languages size={16} className="mr-1.5 lg:mr-2" />
              Languages you speak
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
              {/* Primary Language */}
              <LanguageSelect
                value={formData.language_comfort.already_speak[0] || ''}
                onChange={(e) => {
                  const newLanguages = [...formData.language_comfort.already_speak];
                  newLanguages[0] = e.target.value;
                  const uniqueLanguages = [...new Set(newLanguages.filter(Boolean))];
                  handleLanguageChange(uniqueLanguages);
                }}
                label="Primary"
                languages={languages}
              />

              {/* Secondary Language */}
              <LanguageSelect
                value={formData.language_comfort.already_speak[1] || ''}
                onChange={(e) => {
                  const newLanguages = [...formData.language_comfort.already_speak];
                  newLanguages[1] = e.target.value;
                  const uniqueLanguages = [...new Set(newLanguages.filter(Boolean))];
                  handleLanguageChange(uniqueLanguages);
                }}
                label="Secondary"
                languages={languages}
              />

              {/* Optional Language */}
              <LanguageSelect
                value={formData.language_comfort.already_speak[2] || ''}
                onChange={(e) => {
                  const newLanguages = [...formData.language_comfort.already_speak];
                  newLanguages[2] = e.target.value;
                  const uniqueLanguages = [...new Set(newLanguages.filter(Boolean))];
                  handleLanguageChange(uniqueLanguages);
                }}
                label="Optional"
                languages={languages}
              />
            </div>
          </div>

          {/* Cultural & Lifestyle Priorities */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 block`}>
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
            formData.lifestyle_preferences.social_preference ||
            formData.language_comfort.preferences.length > 0 ||
            formData.language_comfort.already_speak.length > 0) && (
            <div className={`mb-4 p-3 lg:p-4 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg} lg:rounded-xl`}>
              <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-1.5 ${uiConfig.font.size.sm}`}>
                Your Culture & Lifestyle:
              </h3>
              <div className={`space-y-0.5 ${uiConfig.font.size.xs} ${uiConfig.colors.body}`}>
                {formData.lifestyle_preferences.urban_rural.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Environment:</span> {formData.lifestyle_preferences.urban_rural.join(', ')}</div>
                )}
                {formData.lifestyle_preferences.pace_of_life.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Pace:</span> {formData.lifestyle_preferences.pace_of_life.join(', ')}</div>
                )}
                {formData.lifestyle_preferences.social_preference && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Social:</span> {formData.lifestyle_preferences.social_preference}</div>
                )}
                {formData.expat_community_preference.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Community:</span> {formData.expat_community_preference.join(', ')}</div>
                )}
                {formData.language_comfort.preferences.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Language preference:</span> {formData.language_comfort.preferences.join(', ').replace(/_/g, ' ')}</div>
                )}
                {formData.language_comfort.already_speak.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Speaks:</span> {formData.language_comfort.already_speak.map(langId => 
                    languages.find(l => l.id === langId)?.label
                  ).filter(Boolean).join(', ')}</div>
                )}
              </div>
            </div>
          )}

          {/* Pro Tip */}
          <div className={`mb-4 p-3 lg:p-4 bg-scout-accent-50 dark:bg-scout-accent-900/20 border border-scout-accent-300 dark:border-scout-accent-600 ${uiConfig.layout.radius.lg} lg:rounded-xl`}>
            <div className="flex items-start">
              <div className="mr-2">
                <svg className={`${uiConfig.icons.size.sm} ${uiConfig.colors.accent}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.body}`}>
                  <span className={`${uiConfig.font.weight.medium}`}>Pro Tip:</span> Your cultural preferences help us find communities where you'll feel at home. Consider both practical needs and lifestyle desires.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Bottom Navigation - Fixed on mobile, sticky on desktop */}
        <div className={`fixed sm:sticky lg:relative bottom-0 left-0 right-0 ${uiConfig.colors.card} border-t ${uiConfig.colors.borderLight} sm:border-0 p-4 sm:p-0 sm:bg-transparent sm:mt-4 lg:mt-6`}>
          <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} border ${uiConfig.colors.border} p-3 ${uiConfig.layout.shadow.lg} ${uiConfig.responsive.sm}shadow-none`}>
              <div className="flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/onboarding/climate')}
                  className={uiConfig.components.buttonSecondary}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className={uiConfig.components.buttonSecondary}
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className={uiConfig.components.buttonPrimary}
                >
                  {loading ? 'Saving...' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}