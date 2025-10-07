import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Globe2, Languages, Utensils, Building, Music, Calendar, Gauge, Home, Lightbulb, Check, Plus } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/userpreferences/onboardingUtils';
import { saveUserPreferences } from '../../utils/userpreferences/userPreferences';
import { useOnboardingAutoSave } from '../../hooks/useOnboardingAutoSave';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import ProTip from '../../components/ProTip';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import { isIOS } from '../../utils/platformDetection';
import { SelectionCard, SelectionGrid, SelectionSection } from '../../components/onboarding/SelectionCard';

// Add Language Dropdown Component - multi-select with checkboxes
const AddLanguageDropdown = ({ selectedLanguages = [], onChange, additionalLanguages, topLanguages }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Toggle language - can add or remove from main selection
  const handleToggle = (langId) => {
    // Check if it's already in the main selected languages
    if (selectedLanguages.includes(langId)) {
      // Remove from main selection
      onChange(selectedLanguages.filter(id => id !== langId));
    } else {
      // Add to main selection
      onChange([...selectedLanguages, langId]);
    }
  };
  
  // Get display text for button - show all additional selected languages
  const getButtonContent = () => {
    // Get all additional languages that are selected (not in top 5)
    const additionalSelected = selectedLanguages
      .filter(langId => !topLanguages.some(t => t.id === langId))
      .map(id => additionalLanguages.find(lang => lang.id === id)?.label)
      .filter(Boolean);
    
    if (additionalSelected.length > 0) {
      if (additionalSelected.length <= 2) {
        return additionalSelected.join(', ');
      } else {
        return `${additionalSelected[0]}, ${additionalSelected[1]}...`;
      }
    }
    return 'Add More';
  };
  
  // Check if any additional languages are selected
  const hasAdditionalLanguages = selectedLanguages.some(
    langId => !topLanguages.some(t => t.id === langId)
  );
  
  // Clear all additional languages (keep only top 5 if selected)
  const handleClearAdditional = (e) => {
    e.stopPropagation(); // Prevent opening dropdown
    const topLanguagesOnly = selectedLanguages.filter(
      langId => topLanguages.some(t => t.id === langId)
    );
    onChange(topLanguagesOnly);
  };
  
  // Use centralized button classes - EXACT SAME AS SelectionCard
  const buttonClasses = uiConfig.onboardingButton.getButtonClasses(hasAdditionalLanguages, false);
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
      >
        {/* Checkmark indicator - using STANDARD position from config */}
        {hasAdditionalLanguages && (
          <button
            type="button"
            onClick={handleClearAdditional}
            className={`${uiConfig.onboardingButton.checkmark.position} hover:scale-110 transition-transform`}
            title="Clear all additional languages"
          >
            <div className={uiConfig.onboardingButton.checkmark.container}>
              <Check className={uiConfig.onboardingButton.checkmark.icon} />
            </div>
          </button>
        )}
        
        {/* Use STANDARD layout from SelectionCard */}
        <div className="flex flex-col justify-center h-full">
          <div className="flex items-center">
            <h3 className={`${uiConfig.onboardingButton.typography.title.weight} ${
              hasAdditionalLanguages ? uiConfig.onboardingButton.typography.title.selectedColor : uiConfig.onboardingButton.typography.title.unselectedColor
            } ${uiConfig.onboardingButton.typography.title.size} ${hasAdditionalLanguages ? 'pr-6' : ''}`}>
              {getButtonContent()}
            </h3>
          </div>
        </div>
      </button>
      
      {/* Dropdown menu with checkboxes */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-gray-800 
            ${uiConfig.layout.radius.lg} border-2 border-gray-300 dark:border-gray-600 shadow-lg 
            max-h-72 overflow-y-auto`}>
            
            {/* Clear all option if any are selected */}
            {hasAdditionalLanguages && (
              <button
                type="button"
                onClick={handleClearAdditional}
                className={`w-full p-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/30 
                  ${uiConfig.animation.transition} border-b border-gray-200 dark:border-gray-700`}
              >
                <div className="text-gray-500 dark:text-gray-400">Clear all</div>
              </button>
            )}
            
            {/* Language options with checkboxes - show all additional languages */}
            {additionalLanguages.map(lang => {
              const isChecked = selectedLanguages.includes(lang.id);
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleToggle(lang.id)}
                  className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 
                    ${uiConfig.animation.transition} ${isChecked ? 'bg-scout-accent-50 dark:bg-scout-accent-900/20' : ''}`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 mr-3 border-2 rounded flex-shrink-0 ${uiConfig.animation.transition}
                      ${isChecked 
                        ? 'bg-scout-accent-500 border-scout-accent-500' 
                        : 'border-gray-300 dark:border-gray-600'
                      }`}>
                      {isChecked && (
                        <Check className="w-3 h-3 text-white m-auto" />
                      )}
                    </div>
                    <span className={`text-sm ${isChecked ? 'text-scout-accent-700 dark:text-scout-accent-300 font-medium' : ''}`}>
                      {lang.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

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
      pace_of_life_preference: [],
      urban_rural_preference_preference: [],
      traditional_progressive: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const navigate = useNavigate();
  
  // Auto-hide navigation on scroll
  const { isVisible: isNavVisible } = useHideOnScroll();
  
  // Enable auto-save for this page
  const autoSave = useOnboardingAutoSave(formData, 'culture_preferences');

  // Top 5 languages to show as cards
  const topLanguages = [
    { id: 'english', label: 'English' },
    { id: 'spanish', label: 'Spanish' },
    { id: 'german', label: 'German' },
    { id: 'french', label: 'French' },
    { id: 'chinese', label: 'Chinese' }
  ];
  
  // Additional languages for dropdown (extensive list)
  const additionalLanguages = [
    { id: 'arabic', label: 'Arabic' },
    { id: 'bengali', label: 'Bengali' },
    { id: 'bulgarian', label: 'Bulgarian' },
    { id: 'catalan', label: 'Catalan' },
    { id: 'croatian', label: 'Croatian' },
    { id: 'czech', label: 'Czech' },
    { id: 'danish', label: 'Danish' },
    { id: 'dutch', label: 'Dutch' },
    { id: 'estonian', label: 'Estonian' },
    { id: 'farsi', label: 'Farsi' },
    { id: 'finnish', label: 'Finnish' },
    { id: 'greek', label: 'Greek' },
    { id: 'hebrew', label: 'Hebrew' },
    { id: 'hindi', label: 'Hindi' },
    { id: 'hungarian', label: 'Hungarian' },
    { id: 'indonesian', label: 'Indonesian' },
    { id: 'italian', label: 'Italian' },
    { id: 'japanese', label: 'Japanese' },
    { id: 'korean', label: 'Korean' },
    { id: 'latvian', label: 'Latvian' },
    { id: 'lithuanian', label: 'Lithuanian' },
    { id: 'malay', label: 'Malay' },
    { id: 'maltese', label: 'Maltese' },
    { id: 'mandarin', label: 'Mandarin' },
    { id: 'norwegian', label: 'Norwegian' },
    { id: 'polish', label: 'Polish' },
    { id: 'portuguese', label: 'Portuguese' },
    { id: 'romanian', label: 'Romanian' },
    { id: 'russian', label: 'Russian' },
    { id: 'serbian', label: 'Serbian' },
    { id: 'slovak', label: 'Slovak' },
    { id: 'slovenian', label: 'Slovenian' },
    { id: 'swedish', label: 'Swedish' },
    { id: 'tagalog', label: 'Tagalog' },
    { id: 'thai', label: 'Thai' },
    { id: 'turkish', label: 'Turkish' },
    { id: 'ukrainian', label: 'Ukrainian' },
    { id: 'urdu', label: 'Urdu' },
    { id: 'vietnamese', label: 'Vietnamese' }
  ];
  
  // All languages combined for displaying selected ones
  const allLanguages = [...topLanguages, ...additionalLanguages];

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
        
        // Progress is now managed by OnboardingLayout
        
        // If culture data exists, load it
        if (progressResult.data && progressResult.data.culture_preferences) {
          const loadedData = {
            ...progressResult.data.culture_preferences,
            expat_community_preference: Array.isArray(progressResult.data.culture_preferences.expat_community_preference) 
              ? progressResult.data.culture_preferences.expat_community_preference 
              : (progressResult.data.culture_preferences.expat_community_preference ? [progressResult.data.culture_preferences.expat_community_preference] : []),
            language_comfort: {
              ...progressResult.data.culture_preferences.language_comfort,
              preferences: progressResult.data.culture_preferences.language_comfort?.preferences || [],
              already_speak: progressResult.data.culture_preferences.language_comfort?.already_speak || []
            },
            lifestyle_preferences: {
              ...progressResult.data.culture_preferences.lifestyle_preferences,
              pace_of_life_preference: Array.isArray(progressResult.data.culture_preferences.lifestyle_preferences?.pace_of_life_preference)
                ? progressResult.data.culture_preferences.lifestyle_preferences.pace_of_life_preference
                : (progressResult.data.culture_preferences.lifestyle_preferences?.pace_of_life_preference ? [progressResult.data.culture_preferences.lifestyle_preferences.pace_of_life_preference] : []),
              urban_rural_preference: Array.isArray(progressResult.data.culture_preferences.lifestyle_preferences?.urban_rural_preference)
                ? progressResult.data.culture_preferences.lifestyle_preferences.urban_rural_preference
                : (progressResult.data.culture_preferences.lifestyle_preferences?.urban_rural_preference ? [progressResult.data.culture_preferences.lifestyle_preferences.urban_rural_preference] : []),
            },
            cultural_importance: {
              // Handle legacy data: combine restaurants and nightlife if they exist separately
              dining_nightlife: progressResult.data.culture_preferences.cultural_importance?.dining_nightlife || 
                                (progressResult.data.culture_preferences.cultural_importance?.restaurants && progressResult.data.culture_preferences.cultural_importance?.nightlife 
                                  ? Math.round((progressResult.data.culture_preferences.cultural_importance.restaurants + 
                                               progressResult.data.culture_preferences.cultural_importance.nightlife) / 2)
                                  : 1),
              museums: progressResult.data.culture_preferences.cultural_importance?.museums || 1,
              cultural_events: progressResult.data.culture_preferences.cultural_importance?.cultural_events || 1
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

  const handleSaveAndExit = async () => {
    setLoading(true);
    await autoSave();
    setLoading(false);
    navigate('/onboarding/complete');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const userResult = await getCurrentUser();
      if (!userResult.user) {
        navigate('/welcome');
        return;
      }
      
      const { success, error } = await saveOnboardingStep(
        userResult.user.id,
        formData,
        'culture_preferences'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Culture preferences saved!');
      
      // Also save to new user_preferences table
      try {
        const { success: prefSuccess, error: prefError } = await saveUserPreferences(
          userResult.user.id,
          'culture_preferences',
          formData
        );
        if (prefSuccess) {
        } else {
          console.error('❌ Failed to save culture to user_preferences:', prefError);
        }
      } catch (err) {
        console.error('Error saving culture to user_preferences:', err);
      }
      
      // Add a small delay to ensure data is saved before navigation
      setTimeout(() => {
        navigate('/onboarding/hobbies');
      }, 100);
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
    { value: 'relaxed', label: 'Relaxed' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'fast', label: 'Fast' }
  ];

  // Language preference options
  const languageOptions = [
    { value: 'languages_i_speak', label: 'Languages I Speak' },
    { value: 'basic_english', label: 'Basic English' },
    { value: 'will_learn', label: 'Will Learn' }
  ];

  // Urban/Rural options
  const urbanOptions = [
  { value: 'rural', label: 'Rural' },
  { value: 'suburban', label: 'Suburban' },
  { value: 'urban', label: 'Urban' }
  ];



  return (
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <form onSubmit={handleSubmit} className="py-6">
          {/* Pro Tip at top */}
          <div className={`bg-scout-accent/10 p-3 lg:p-4 ${uiConfig.layout.radius.lg} mb-4 lg:mb-6 flex items-start`}>
            <Lightbulb size={16} className="mr-2 text-orange-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
            <p className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.colors.body}`}>
              <span className={`${uiConfig.font.weight.medium}`}>Pro Tip:</span> Your cultural preferences help us find communities where you'll feel at home. Consider both practical needs and lifestyle desires.
            </p>
          </div>
          
          {/* Living Environment - moved to first position */}
          <SelectionSection icon={Home} title="Living Environment">
            <SelectionGrid>
              {urbanOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.lifestyle_preferences.urban_rural_preference.includes(option.value)}
                  onClick={() => handleMultiSelect('lifestyle_preferences.urban_rural_preference', option.value, true)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Pace of Life - moved to second position */}
          <SelectionSection icon={Gauge} title="Pace of Life">
            <SelectionGrid>
              {paceOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.lifestyle_preferences.pace_of_life_preference.includes(option.value)}
                  onClick={() => handleMultiSelect('lifestyle_preferences.pace_of_life_preference', option.value, true)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Expat Community */}
          <SelectionSection icon={Users} title="Expat Community">
            <SelectionGrid>
              {expatOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.expat_community_preference.includes(option.value)}
                  onClick={() => handleMultiSelect('expat_community_preference', option.value)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Languages You Speak - moved above Language Preference */}
          <SelectionSection icon={Globe2} title="Languages You Speak">
            <SelectionGrid>
              {/* Top 5 language cards */}
              {topLanguages.map((lang) => (
                <SelectionCard
                  key={lang.id}
                  title={lang.label}
                  isSelected={formData.language_comfort.already_speak.includes(lang.id)}
                  onClick={() => {
                    const currentLanguages = formData.language_comfort.already_speak || [];
                    const isSelected = currentLanguages.includes(lang.id);
                    handleLanguageChange(
                      isSelected 
                        ? currentLanguages.filter(l => l !== lang.id)
                        : [...currentLanguages, lang.id]
                    );
                  }}
                  size="small"
                />
              ))}
              
              {/* Add Language button with dropdown */}
              <AddLanguageDropdown
                selectedLanguages={formData.language_comfort.already_speak}
                onChange={handleLanguageChange}
                additionalLanguages={additionalLanguages}
                topLanguages={topLanguages}
              />
            </SelectionGrid>
          </SelectionSection>

          {/* Language Preference - now after Languages You Speak */}
          <SelectionSection icon={Languages} title="Language Preference">
            <SelectionGrid>
              {languageOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  isSelected={formData.language_comfort.preferences.includes(option.value)}
                  onClick={() => handleMultiSelect('language_comfort.preferences', option.value, true)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Cultural & Lifestyle Priorities - converted to SelectionCards */}
          <SelectionSection icon={Music} title="Cultural & Lifestyle Priorities">
            <div className="space-y-3">
              {culturalCategories.map((category) => {
                const value = formData.cultural_importance[category.id];
                const importanceOptions = [
                  { value: 1, label: 'Not Important' },
                  { value: 3, label: 'Nice to Have' },
                  { value: 5, label: 'Very Important' }
                ];
                
                return (
                  <div key={category.id}>
                    <label className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} block mb-2`}>
                      {category.label}
                    </label>
                    <div className="grid grid-cols-2 min-[428px]:grid-cols-3 gap-2 sm:gap-3">
                      {importanceOptions.map((option) => (
                        <SelectionCard
                          key={option.value}
                          title={option.label}
                          isSelected={value === option.value}
                          onClick={() => handleImportanceChange(category.id, option.value)}
                          size="small"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </SelectionSection>

          {/* Summary Section */}
          {(formData.expat_community_preference.length > 0 ||
            formData.lifestyle_preferences.pace_of_life_preference.length > 0 ||
            formData.lifestyle_preferences.urban_rural_preference.length > 0 ||
            formData.language_comfort.preferences.length > 0 ||
            formData.language_comfort.already_speak.length > 0) && (
            <div className={`mb-4 p-3 lg:p-4 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg} lg:rounded-xl`}>
              <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-1.5 ${uiConfig.font.size.sm}`}>
                Your Culture & Lifestyle:
              </h3>
              <div className={`space-y-0.5 ${uiConfig.font.size.xs} ${uiConfig.colors.body}`}>
                {formData.lifestyle_preferences.urban_rural_preference.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Environment:</span> {formData.lifestyle_preferences.urban_rural_preference.join(', ')}</div>
                )}
                {formData.lifestyle_preferences.pace_of_life_preference.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Pace:</span> {formData.lifestyle_preferences.pace_of_life_preference.join(', ')}</div>
                )}
                {formData.expat_community_preference.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Community:</span> {formData.expat_community_preference.join(', ')}</div>
                )}
                {formData.language_comfort.preferences.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Language preference:</span> {formData.language_comfort.preferences.join(', ').replace(/_/g, ' ')}</div>
                )}
                {formData.language_comfort.already_speak.length > 0 && (
                  <div><span className={`${uiConfig.font.weight.medium}`}>Speaks:</span> {formData.language_comfort.already_speak.map(langId => 
                    allLanguages.find(l => l.id === langId)?.label
                  ).filter(Boolean).join(', ')}</div>
                )}
              </div>
            </div>
          )}

        </form>

        {/* Bottom Navigation - Using centralized config */}
        <div className={uiConfig.bottomNavigation.container.getContainerClasses(isIOS(), isNavVisible)}>
          <div className={uiConfig.bottomNavigation.container.innerContainer}>
            <div className={uiConfig.bottomNavigation.container.buttonLayout}>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  await autoSave();
                  setLoading(false);
                  navigate('/onboarding/climate');
                }}
                disabled={loading}
                className={uiConfig.components.buttonSecondary}
              >
                ← Back
              </button>
              <div className="flex-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSaveAndExit}
                  className={uiConfig.components.buttonSecondary}
                >
                  Save & Exit
                </button>
              </div>
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
      </main>
  );
}
