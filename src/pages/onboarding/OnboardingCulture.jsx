import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import toast from 'react-hot-toast';

export default function OnboardingCulture() {
  const [formData, setFormData] = useState({
    expat_community_preference: 'moderate', // none, small, moderate, large
    language_comfort: {
      english_only: false,
      willing_to_learn: true,
      already_speak: [],
      additional_language: '' // 08JUN25: Added for custom language input
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
  const navigate = useNavigate();

  // Common languages options - prioritized order with English first, then alphabetical
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
        
        const { success, data, error } = await getOnboardingProgress(user.id);
        if (!success) {
          console.error("Error loading existing data:", error);
          setInitialLoading(false);
          return;
        }
        
        // If culture data exists, load it
        if (data && data.culture_preferences) {
          // 08JUN25: Ensure additional_language property exists for backward compatibility
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
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

  const handleLanguageChange = (language, checked) => {
    setFormData(prev => {
      // If checking a language, make sure english_only is false
      let updatedComfort = { ...prev.language_comfort };
      
      if (checked) {
        updatedComfort.english_only = false;
        updatedComfort.already_speak = [...updatedComfort.already_speak];
        
        if (!updatedComfort.already_speak.includes(language)) {
          updatedComfort.already_speak.push(language);
        }
      } else {
        updatedComfort.already_speak = updatedComfort.already_speak.filter(lang => lang !== language);
      }
      
      return {
        ...prev,
        language_comfort: updatedComfort
      };
    });
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

  // 08JUN25: Added handler for additional language input
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
    }
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-green-600 dark:text-green-400 font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/onboarding/climate')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-1 rounded-full ${
                    step === 4
                      ? 'bg-green-600 dark:bg-green-400'
                      : step < 4
                        ? 'bg-gray-400 dark:bg-gray-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                ></div>
              ))}
            </div>
            <div className="w-5"></div> {/* Spacer to balance the back button */}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Culture & Lifestyle</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Tell us about your cultural preferences and lifestyle expectations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          
          {/* 08JUN25: Rearranged sections - 1. Dining & Food */}
          <div>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Dining & Food
            </label>
            <input
              type="range"
              name="restaurants"
              min="1"
              max="5"
              step="1"
              value={formData.cultural_importance.restaurants}
              onChange={(e) => handleImportanceChange('restaurants', parseInt(e.target.value))}
              className={uiConfig.components.slider}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span className={`${uiConfig.font.weight.medium} ${uiConfig.colors.accent}`}>{formData.cultural_importance.restaurants} / 5</span>
              <span>5</span>
            </div>
            <p className={`mt-1 ${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
              How important are restaurants and local cuisine?
            </p>
          </div>

          {/* 08JUN25: 2. Museums & Art */}
          <div>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Museums & Art
            </label>
            <input
              type="range"
              name="museums"
              min="1"
              max="5"
              step="1"
              value={formData.cultural_importance.museums}
              onChange={(e) => handleImportanceChange('museums', parseInt(e.target.value))}
              className={uiConfig.components.slider}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span className={`${uiConfig.font.weight.medium} ${uiConfig.colors.accent}`}>{formData.cultural_importance.museums} / 5</span>
              <span>5</span>
            </div>
            <p className={`mt-1 ${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
              How important are museums and art galleries?
            </p>
          </div>

          {/* 08JUN25: 3. Nightlife & Entertainment */}
          <div>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Nightlife & Entertainment
            </label>
            <input
              type="range"
              name="nightlife"
              min="1"
              max="5"
              step="1"
              value={formData.cultural_importance.nightlife}
              onChange={(e) => handleImportanceChange('nightlife', parseInt(e.target.value))}
              className={uiConfig.components.slider}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span className={`${uiConfig.font.weight.medium} ${uiConfig.colors.accent}`}>{formData.cultural_importance.nightlife} / 5</span>
              <span>5</span>
            </div>
            <p className={`mt-1 ${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
              How important is nightlife and entertainment?
            </p>
          </div>

          {/* 08JUN25: 4. Cultural Events & Festivals */}
          <div>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Cultural Events & Festivals
            </label>
            <input
              type="range"
              name="cultural_events"
              min="1"
              max="5"
              step="1"
              value={formData.cultural_importance.cultural_events}
              onChange={(e) => handleImportanceChange('cultural_events', parseInt(e.target.value))}
              className={uiConfig.components.slider}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span className={`${uiConfig.font.weight.medium} ${uiConfig.colors.accent}`}>{formData.cultural_importance.cultural_events} / 5</span>
              <span>5</span>
            </div>
            <p className={`mt-1 ${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
              How important are cultural events and festivals?
            </p>
          </div>

          {/* 08JUN25: 5. Preferred Pace of Life */}
          <div>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Preferred Pace of Life
            </label>
            <select
              name="lifestyle_preferences.pace_of_life"
              value={formData.lifestyle_preferences.pace_of_life}
              onChange={handleInputChange}
              className={uiConfig.components.select}
            >
              <option value="slow">Slow and relaxed</option>
              <option value="moderate">Moderate pace</option>
              <option value="fast">Fast and energetic</option>
            </select>
            <p className={`mt-1 ${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
              What pace of life do you prefer?
            </p>
          </div>

          {/* 08JUN25: 6. Community Values Preference */}
          <div>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Community Values Preference
            </label>
            <select
              name="expat_community_preference"
              value={formData.expat_community_preference}
              onChange={handleInputChange}
              className={uiConfig.components.select}
            >
              <option value="none">No expat community needed</option>
              <option value="small">Small expat community</option>
              <option value="moderate">Moderate expat presence</option>
              <option value="large">Large international community</option>
            </select>
            <p className={`mt-1 ${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
              How important is having other expatriates nearby?
            </p>
          </div>

          {/* 08JUN25: 7. Religious Facilities */}
          <div>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Religious Facilities
            </label>
            <input
              type="range"
              name="religious_facilities"
              min="1"
              max="5"
              step="1"
              value={formData.cultural_importance.religious_facilities}
              onChange={(e) => handleImportanceChange('religious_facilities', parseInt(e.target.value))}
              className={uiConfig.components.slider}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span className={`${uiConfig.font.weight.medium} ${uiConfig.colors.accent}`}>{formData.cultural_importance.religious_facilities} / 5</span>
              <span>5</span>
            </div>
            <p className={`mt-1 ${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
              How important are religious facilities?
            </p>
          </div>

          {/* 08JUN25: 8. Languages You Already Speak */}
          <div className={`${formData.language_comfort.english_only ? 'opacity-50' : ''}`}>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Languages You Already Speak
            </label>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((language) => (
                <div key={language.id} className="flex items-center">
                  <input
                    id={`language_${language.id}`}
                    type="checkbox"
                    checked={formData.language_comfort.already_speak.includes(language.id)}
                    onChange={(e) => handleLanguageChange(language.id, e.target.checked)}
                    disabled={formData.language_comfort.english_only}
                    className={uiConfig.components.checkbox}
                  />
                  <label htmlFor={`language_${language.id}`} className={`ml-2 ${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
                    {language.label}
                  </label>
                </div>
              ))}
            </div>
            <p className={`mt-1 ${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
              Select all languages you can speak conversationally
            </p>
          </div>

          {/* 08JUN25: 9. Language Comfort Level */}
          <div>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Language Comfort Level
            </label>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="english_only"
                  type="checkbox"
                  name="language_comfort.english_only"
                  checked={formData.language_comfort.english_only}
                  onChange={handleCheckboxChange}
                  className={uiConfig.components.checkbox}
                />
                <label htmlFor="english_only" className={`ml-2 ${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
                  I prefer English-only destinations
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="willing_to_learn"
                  type="checkbox"
                  name="language_comfort.willing_to_learn"
                  checked={formData.language_comfort.willing_to_learn}
                  onChange={handleCheckboxChange}
                  disabled={formData.language_comfort.english_only}
                  className={`${uiConfig.components.checkbox} ${
                    formData.language_comfort.english_only ? 'opacity-50' : ''
                  }`}
                />
                <label
                  htmlFor="willing_to_learn"
                  className={`ml-2 ${uiConfig.font.size.sm} ${uiConfig.colors.body} ${
                    formData.language_comfort.english_only ? 'opacity-50' : ''
                  }`}
                >
                  I'm willing to learn a new language
                </label>
              </div>
            </div>
            <p className={`mt-1 ${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
              How comfortable are you with language barriers?
            </p>
          </div>

          {/* 08JUN25: 10. Add Additional Language */}
          <div className={`${formData.language_comfort.english_only ? 'opacity-50' : ''}`}>
            <label className={`block ${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Add Additional Language
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="language_comfort.additional_language"
                value={formData.language_comfort.additional_language || ''}
                onChange={handleInputChange}
                disabled={formData.language_comfort.english_only}
                placeholder="Enter a language not listed above"
                className={`${uiConfig.components.input} ${formData.language_comfort.english_only ? uiConfig.states.disabled : ''}`}
              />
              <button
                type="button"
                onClick={handleAdditionalLanguageAdd}
                disabled={formData.language_comfort.english_only || !(formData.language_comfort.additional_language || '').trim()}
                className={`px-4 py-3 ${uiConfig.colors.btnPrimary} font-medium rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                Add
              </button>
            </div>
            <p className={`mt-1 ${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>
              Add a language that's not in the list above
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${uiConfig.colors.btnPrimary} ${uiConfig.font.weight.medium} py-3 px-4 ${uiConfig.layout.radius.lg} disabled:opacity-50`}
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
