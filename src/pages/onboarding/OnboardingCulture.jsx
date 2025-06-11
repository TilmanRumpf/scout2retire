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
  Zap,
  BookOpen,
  Scale,
  Plus,
  Check,
  X
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
      already_speak: [],
      additional_language: '' // For custom language input
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
  const [showLanguageInput, setShowLanguageInput] = useState(false);
  
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
          const loadedData = {
            ...data.culture_preferences,
            language_comfort: {
              ...data.culture_preferences.language_comfort,
              additional_language: data.culture_preferences.language_comfort?.additional_language || ''
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

  const handleLanguageToggle = (language) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    setFormData(prev => {
      let updatedComfort = { ...prev.language_comfort };
      const isSelected = updatedComfort.already_speak.includes(language);
      
      if (isSelected) {
        updatedComfort.already_speak = updatedComfort.already_speak.filter(lang => lang !== language);
      } else {
        updatedComfort.english_only = false;
        updatedComfort.already_speak = [...updatedComfort.already_speak, language];
      }
      
      return {
        ...prev,
        language_comfort: updatedComfort
      };
    });
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

  // Enhanced 10JUN25: Additional language handler
  const handleAdditionalLanguageAdd = () => {
    const additionalLang = (formData.language_comfort.additional_language || '').trim();
    if (additionalLang && !formData.language_comfort.already_speak.includes(additionalLang.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        language_comfort: {
          ...prev.language_comfort,
          already_speak: [...prev.language_comfort.already_speak, additionalLang.toLowerCase()],
          additional_language: '',
          english_only: false
        }
      }));
      setShowLanguageInput(false);
      toast.success(`Added ${additionalLang} to your languages`);
    }
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

  // Cultural importance categories with icons
  const culturalCategories = [
    { id: 'restaurants', label: 'Dining & Cuisine', icon: Utensils },
    { id: 'museums', label: 'Museums & Art', icon: Building },
    { id: 'nightlife', label: 'Nightlife', icon: Music },
    { id: 'religious_facilities', label: 'Religious Sites', icon: Church },
    { id: 'cultural_events', label: 'Cultural Events', icon: Calendar },
    { id: 'international_community', label: 'Int\'l Community', icon: Globe2 }
  ];

  // Expat community options
  const expatOptions = [
    { value: 'none', label: 'None Needed', icon: Home, description: 'Prefer local immersion' },
    { value: 'small', label: 'Small', icon: Users, description: 'Few expats around' },
    { value: 'moderate', label: 'Moderate', icon: UserPlus, description: 'Balanced mix' },
    { value: 'large', label: 'Large', icon: Globe2, description: 'Strong expat presence' }
  ];

  // Pace of life options
  const paceOptions = [
    { value: 'slow', label: 'Relaxed', icon: TreePine, description: 'Slow & peaceful' },
    { value: 'moderate', label: 'Moderate', icon: Gauge, description: 'Balanced pace' },
    { value: 'fast', label: 'Fast', icon: Zap, description: 'Energetic & busy' }
  ];

  // Urban/Rural options
  const urbanOptions = [
    { value: 'urban', label: 'Urban', icon: Building, description: 'City living' },
    { value: 'suburban', label: 'Suburban', icon: Home, description: 'Mix of both' },
    { value: 'rural', label: 'Rural', icon: TreePine, description: 'Countryside' }
  ];

  // Community values options
  const valuesOptions = [
    { value: 'traditional', label: 'Traditional', icon: BookOpen, description: 'Conservative values' },
    { value: 'balanced', label: 'Balanced', icon: Scale, description: 'Mixed approach' },
    { value: 'progressive', label: 'Progressive', icon: Zap, description: 'Liberal values' }
  ];

  // Enhanced 10JUN25: Compact option button for mobile-first design
  const OptionButton = ({ option, isSelected, onClick, sectionName, compact = false }) => {
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
          relative flex ${compact ? 'flex-row items-center' : 'flex-col items-center justify-center'} 
          ${compact ? 'p-3' : 'p-4'} rounded-lg border-2 
          transition-all duration-200 transform
          ${isSelected
            ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20 shadow-md scale-[1.02]'
            : 'border-gray-200 dark:border-gray-700 hover:border-scout-accent-200 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${isPressed ? 'scale-95' : ''}
          focus:outline-none focus:ring-2 focus:ring-scout-accent-400 focus:ring-offset-2
        `}
        aria-label={option.label}
        aria-pressed={isSelected}
      >
        <Icon 
          size={compact ? 20 : 24} 
          className={`transition-all duration-300 ${
            isSelected 
              ? 'text-scout-accent-700 dark:text-scout-accent-300' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
        />
        <span className={`text-sm font-medium ${compact ? 'ml-3' : 'mt-2 text-center'} ${
          isSelected 
            ? 'text-scout-accent-700 dark:text-scout-accent-300' 
            : 'text-gray-800 dark:text-gray-200'
        }`}>
          {option.label}
        </span>
        {!compact && option.shortDesc && (
          <span className={`text-xs mt-1 ${
            isSelected 
              ? 'text-scout-accent-600 dark:text-scout-accent-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {option.shortDesc}
          </span>
        )}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-scout-accent-300 rounded-full animate-pulse"></div>
          </div>
        )}
      </button>
    );
  };

  // Enhanced 10JUN25: Importance slider component
  const ImportanceSlider = ({ category, icon: Icon }) => {
    const value = formData.cultural_importance[category.id];
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon size={20} className="text-scout-accent-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {category.label}
            </span>
          </div>
          <span className="text-sm font-semibold text-scout-accent-600 dark:text-scout-accent-400">
            {value}/5
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={value}
            onChange={(e) => handleImportanceChange(category.id, parseInt(e.target.value))}
            className={`
              w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 
              [&::-webkit-slider-thumb]:bg-scout-accent-300 [&::-webkit-slider-thumb]:rounded-full 
              [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg 
              [&::-webkit-slider-thumb]:hover:shadow-xl [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:hover:scale-110
            `}
          />
          <div 
            className="absolute top-0 left-0 h-2 bg-scout-accent-300 rounded-full pointer-events-none transition-all duration-300"
            style={{ width: `${(value - 1) * 25}%` }}
          ></div>
        </div>
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
          className="mb-8"
        />

        {/* Main Form */}
        <form onSubmit={handleSubmit} className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} ${uiConfig.layout.spacing.card}`}>
          
          {/* Header */}
          <div className="mb-8">
            <h1 className={`${uiConfig.font.size['2xl']} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading} mb-2`}>
              Culture & Lifestyle
            </h1>
            <p className={`${uiConfig.font.size.base} ${uiConfig.colors.body}`}>
              Tell us about your cultural preferences and lifestyle expectations.
            </p>
          </div>

          {/* Expat Community Preference - Enhanced with visual options */}
          <div className={uiConfig.layout.spacing.field}>
            <label className={`${uiConfig.components.label} flex items-center`}>
              <Users size={20} className="mr-2 text-scout-accent-600" />
              Expat Community Preference
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

          {/* Pace of Life - Enhanced with icons */}
          <div className={uiConfig.layout.spacing.field}>
            <label className={`${uiConfig.components.label} flex items-center`}>
              <Gauge size={20} className="mr-2 text-scout-accent-600" />
              Preferred Pace of Life
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          {/* Urban vs Rural - Enhanced with icons */}
          <div className={uiConfig.layout.spacing.field}>
            <label className={`${uiConfig.components.label} flex items-center`}>
              <Home size={20} className="mr-2 text-scout-accent-600" />
              Living Environment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          {/* Community Values - New visual section */}
          <div className={uiConfig.layout.spacing.field}>
            <label className={`${uiConfig.components.label} flex items-center`}>
              <Scale size={20} className="mr-2 text-scout-accent-600" />
              Community Values
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {valuesOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  option={option}
                  isSelected={formData.lifestyle_preferences.traditional_progressive === option.value}
                  onClick={() => setFormData({
                    ...formData,
                    lifestyle_preferences: {
                      ...formData.lifestyle_preferences,
                      traditional_progressive: option.value
                    }
                  })}
                  sectionName="values"
                />
              ))}
            </div>
          </div>

          {/* Cultural Importance - Enhanced sliders */}
          <div className={uiConfig.layout.spacing.field}>
            <label className={`${uiConfig.components.label} mb-4`}>
              Cultural Amenities Importance
            </label>
            <div className="space-y-4">
              {culturalCategories.map((category) => (
                <ImportanceSlider 
                  key={category.id} 
                  category={category} 
                  icon={category.icon}
                />
              ))}
            </div>
            <p className={`${uiConfig.components.helpText} mt-3`}>
              Rate how important each amenity is to you (1 = not important, 5 = very important)
            </p>
          </div>

          {/* Languages - Enhanced visual selection */}
          <div className={uiConfig.layout.spacing.field}>
            <label className={`${uiConfig.components.label} flex items-center`}>
              <Languages size={20} className="mr-2 text-scout-accent-600" />
              Language Preferences
            </label>
            
            {/* Language comfort options */}
            <div className="space-y-3 mb-4">
              <label className="flex items-center p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-scout-accent-200 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  name="language_comfort.english_only"
                  checked={formData.language_comfort.english_only}
                  onChange={handleCheckboxChange}
                  className={uiConfig.components.checkbox}
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  I prefer English-only destinations
                </span>
              </label>
              
              <label className={`flex items-center p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-scout-accent-200 transition-all cursor-pointer ${
                formData.language_comfort.english_only ? 'opacity-50 cursor-not-allowed' : ''
              }`}>
                <input
                  type="checkbox"
                  name="language_comfort.willing_to_learn"
                  checked={formData.language_comfort.willing_to_learn}
                  onChange={handleCheckboxChange}
                  disabled={formData.language_comfort.english_only}
                  className={uiConfig.components.checkbox}
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  I'm willing to learn a new language
                </span>
              </label>
            </div>

            {/* Languages you speak */}
            {!formData.language_comfort.english_only && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Languages you already speak:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {languages.map((language) => (
                    <button
                      key={language.id}
                      type="button"
                      onClick={() => handleLanguageToggle(language.id)}
                      className={`
                        flex items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                        ${formData.language_comfort.already_speak.includes(language.id)
                          ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-scout-accent-200'
                        }
                      `}
                    >
                      <span className="mr-2">{language.flag}</span>
                      <span className={`text-sm font-medium ${
                        formData.language_comfort.already_speak.includes(language.id)
                          ? 'text-scout-accent-700 dark:text-scout-accent-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {language.label}
                      </span>
                    </button>
                  ))}
                  
                  {/* Add custom language button */}
                  <button
                    type="button"
                    onClick={() => setShowLanguageInput(true)}
                    className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-scout-accent-300 transition-all duration-200"
                  >
                    <Plus size={20} className="mr-2 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Add Other
                    </span>
                  </button>
                </div>

                {/* Custom language input */}
                {showLanguageInput && (
                  <div className="flex space-x-2 mt-3">
                    <input
                      type="text"
                      name="language_comfort.additional_language"
                      value={formData.language_comfort.additional_language || ''}
                      onChange={handleInputChange}
                      placeholder="Enter language name"
                      className={`flex-1 ${uiConfig.components.input}`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAdditionalLanguageAdd}
                      disabled={!(formData.language_comfort.additional_language || '').trim()}
                      className="px-4 py-2 bg-scout-accent-300 text-white rounded-lg hover:bg-scout-accent-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLanguageInput(false);
                        setFormData(prev => ({
                          ...prev,
                          language_comfort: {
                            ...prev.language_comfort,
                            additional_language: ''
                          }
                        }));
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary Section - Added 10JUN25 */}
          {(formData.language_comfort.already_speak.length > 0 || 
            formData.expat_community_preference !== 'moderate' ||
            Object.values(formData.cultural_importance).some(v => v >= 4)) && (
            <div className="mt-6 p-4 bg-scout-accent-50 dark:bg-scout-accent-900/20 rounded-lg">
              <h3 className="text-sm font-medium text-scout-accent-700 dark:text-scout-accent-300 mb-2">
                Your Culture Profile:
              </h3>
              <div className="text-xs text-scout-accent-600 dark:text-scout-accent-400 space-y-1">
                <p>• Community: {expatOptions.find(o => o.value === formData.expat_community_preference)?.label}</p>
                <p>• Pace: {paceOptions.find(o => o.value === formData.lifestyle_preferences.pace_of_life)?.label}</p>
                <p>• Environment: {urbanOptions.find(o => o.value === formData.lifestyle_preferences.urban_rural)?.label}</p>
                {formData.language_comfort.already_speak.length > 0 && (
                  <p>• Languages: {formData.language_comfort.already_speak.length} spoken</p>
                )}
                {Object.entries(formData.cultural_importance).filter(([_, v]) => v >= 4).length > 0 && (
                  <p>• High priorities: {Object.entries(formData.cultural_importance).filter(([_, v]) => v >= 4).map(([k]) => 
                    culturalCategories.find(c => c.id === k)?.label
                  ).join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className={uiConfig.bottomNavigation.styles.container}>
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className={uiConfig.bottomNavigation.styles.backButton}
            >
              <ChevronLeft size={16} className="mr-2" />
              Back
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className={uiConfig.bottomNavigation.styles.nextButton}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight size={16} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Progress Indicator */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Step 4 of 7 • {Math.round((4/7) * 100)}% complete
          </p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-scout-accent-300 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((4/7) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}