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

  // Cultural categories for importance ratings
  const culturalCategories = [
    { id: 'restaurants', label: 'Restaurants & Cuisine' },
    { id: 'museums', label: 'Museums & Art' },
    { id: 'nightlife', label: 'Nightlife & Entertainment' },
    { id: 'religious_facilities', label: 'Religious Facilities' },
    { id: 'cultural_events', label: 'Cultural Events & Festivals' },
    { id: 'international_community', label: 'International Community' }
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
        <div className="animate-pulse text-green-600 font-semibold">Loading...</div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expat Community Preference
            </label>
            <select
              name="expat_community_preference"
              value={formData.expat_community_preference}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="none">No expat community needed</option>
              <option value="small">Small expat community</option>
              <option value="moderate">Moderate expat presence</option>
              <option value="large">Large international community</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              How important is having other expatriates nearby?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language Comfort
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="english_only"
                  name="language_comfort.english_only"
                  type="checkbox"
                  checked={formData.language_comfort.english_only}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="english_only" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  I prefer places where English is widely spoken
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="willing_to_learn"
                  name="language_comfort.willing_to_learn"
                  type="checkbox"
                  checked={formData.language_comfort.willing_to_learn}
                  onChange={handleCheckboxChange}
                  disabled={formData.language_comfort.english_only}
                  className={`h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded ${
                    formData.language_comfort.english_only ? 'opacity-50' : ''
                  }`}
                />
                <label
                  htmlFor="willing_to_learn"
                  className={`ml-2 text-sm text-gray-700 dark:text-gray-300 ${
                    formData.language_comfort.english_only ? 'opacity-50' : ''
                  }`}
                >
                  I'm willing to learn a new language
                </label>
              </div>
              
              <div className={`mt-3 ${formData.language_comfort.english_only ? 'opacity-50' : ''}`}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Languages I already speak
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
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`language_${language.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {language.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Cultural Importance (1-5 scale)
            </label>
            <div className="space-y-4">
              {culturalCategories.map((category) => (
                <div key={category.id} className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{category.label}</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formData.cultural_importance[category.id]} / 5
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleImportanceChange(category.id, value)}
                        className={`flex-1 py-2 rounded-md ${
                          formData.cultural_importance[category.id] === value
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Rate how important each cultural aspect is to you (1 = not important, 5 = very important).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pace of Life
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'slow', label: 'Relaxed' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'fast', label: 'Fast-Paced' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    lifestyle_preferences: {
                      ...formData.lifestyle_preferences,
                      pace_of_life: option.value
                    }
                  })}
                  className={`py-3 px-4 rounded-lg border text-center ${
                    formData.lifestyle_preferences.pace_of_life === option.value
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Urban vs Rural
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'urban', label: 'Urban' },
                { value: 'suburban', label: 'Suburban' },
                { value: 'rural', label: 'Rural' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    lifestyle_preferences: {
                      ...formData.lifestyle_preferences,
                      urban_rural: option.value
                    }
                  })}
                  className={`py-3 px-4 rounded-lg border text-center ${
                    formData.lifestyle_preferences.urban_rural === option.value
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Traditional vs Progressive
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'traditional', label: 'Traditional' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'progressive', label: 'Progressive' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    lifestyle_preferences: {
                      ...formData.lifestyle_preferences,
                      traditional_progressive: option.value
                    }
                  })}
                  className={`py-3 px-4 rounded-lg border text-center ${
                    formData.lifestyle_preferences.traditional_progressive === option.value
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Do you prefer communities with traditional values or more progressive attitudes?
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}