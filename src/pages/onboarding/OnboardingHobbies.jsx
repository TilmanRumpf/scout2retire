import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import toast from 'react-hot-toast';

export default function OnboardingHobbies() {
  const [formData, setFormData] = useState({
    activities: [],
    interests: [],
    social_preference: 'balanced', // social, balanced, private
    health_considerations: [],
    travel_frequency: 'occasional', // frequent, occasional, rare
    lifestyle_importance: {
      dining_out: 3,
      outdoor_activities: 3,
      cultural_events: 3,
      nightlife: 2,
      shopping: 2,
      wellness: 3
    },
    pet_owner: false,
    pet_types: []
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  // Activity options
  const activityOptions = [
    { id: 'walking', label: 'Walking & Hiking' },
    { id: 'swimming', label: 'Swimming' },
    { id: 'cycling', label: 'Cycling' },
    { id: 'golf', label: 'Golf' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'fitness', label: 'Gym & Fitness' },
    { id: 'yoga', label: 'Yoga & Pilates' },
    { id: 'dancing', label: 'Dancing' },
    { id: 'water_sports', label: 'Water Sports' },
    { id: 'winter_sports', label: 'Winter Sports' },
    { id: 'fishing', label: 'Fishing' },
    { id: 'gardening', label: 'Gardening' }
  ];

  // Interest options
  const interestOptions = [
    { id: 'arts', label: 'Arts & Crafts' },
    { id: 'music', label: 'Music' },
    { id: 'theater', label: 'Theater & Performing Arts' },
    { id: 'reading', label: 'Reading & Literature' },
    { id: 'cooking', label: 'Cooking & Cuisine' },
    { id: 'wine', label: 'Wine & Spirits' },
    { id: 'history', label: 'History & Museums' },
    { id: 'language', label: 'Language Learning' },
    { id: 'photography', label: 'Photography' },
    { id: 'volunteering', label: 'Volunteering' },
    { id: 'technology', label: 'Technology' },
    { id: 'games', label: 'Games & Puzzles' }
  ];

  // Health consideration options
  const healthOptions = [
    { id: 'mobility', label: 'Mobility limitations' },
    { id: 'chronic_condition', label: 'Chronic health condition' },
    { id: 'regular_checkups', label: 'Need regular medical checkups' },
    { id: 'specialist_care', label: 'Require specialist medical care' },
    { id: 'medication_access', label: 'Need reliable medication access' },
    { id: 'allergy_concerns', label: 'Allergy concerns' },
    { id: 'climate_sensitivity', label: 'Climate sensitivity' }
  ];

  // Pet type options
  const petOptions = [
    { id: 'dog', label: 'Dog(s)' },
    { id: 'cat', label: 'Cat(s)' },
    { id: 'bird', label: 'Bird(s)' },
    { id: 'fish', label: 'Fish/Aquarium' },
    { id: 'other_pet', label: 'Other pets' }
  ];

  // Lifestyle categories for importance ratings
  const lifestyleCategories = [
    { id: 'dining_out', label: 'Dining Out' },
    { id: 'outdoor_activities', label: 'Outdoor Activities' },
    { id: 'cultural_events', label: 'Cultural Events' },
    { id: 'nightlife', label: 'Nightlife' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'wellness', label: 'Wellness & Spas' }
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
        
        // If hobbies data exists, load it
        if (data && data.hobbies) {
          setFormData(data.hobbies);
        }
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadExistingData();
  }, [navigate]);

  const handleCheckboxChange = (group, itemId, checked) => {
    setFormData(prev => {
      const updatedItems = checked
        ? [...prev[group], itemId]
        : prev[group].filter(item => item !== itemId);
      
      return {
        ...prev,
        [group]: updatedItems
      };
    });
  };

  const handleRadioChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePetStatusChange = (value) => {
    setFormData(prev => ({
      ...prev,
      pet_owner: value,
      // Clear pet types if not a pet owner
      pet_types: value ? prev.pet_types : []
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
        'hobbies'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Hobbies and interests saved!');
      navigate('/onboarding/costs');
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
              onClick={() => navigate('/onboarding/culture')}
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
                    step === 5
                      ? 'bg-green-600 dark:bg-green-400'
                      : step < 5
                        ? 'bg-gray-400 dark:bg-gray-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                ></div>
              ))}
            </div>
            <div className="w-5"></div> {/* Spacer to balance the back button */}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Hobbies & Interests</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Share your activities and lifestyle preferences to find locations that match your interests.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Physical Activities
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Select activities you enjoy or plan to enjoy in retirement
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
              {activityOptions.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <input
                    id={`activity_${activity.id}`}
                    type="checkbox"
                    checked={formData.activities.includes(activity.id)}
                    onChange={(e) => handleCheckboxChange('activities', activity.id, e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`activity_${activity.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {activity.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hobbies & Interests
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Select interests that are important to you
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
              {interestOptions.map((interest) => (
                <div key={interest.id} className="flex items-center">
                  <input
                    id={`interest_${interest.id}`}
                    type="checkbox"
                    checked={formData.interests.includes(interest.id)}
                    onChange={(e) => handleCheckboxChange('interests', interest.id, e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`interest_${interest.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {interest.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Social Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'social', label: 'Very Social' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'private', label: 'Private' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRadioChange('social_preference', option.value)}
                  className={`py-3 px-4 rounded-lg border text-center ${
                    formData.social_preference === option.value
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
              Travel Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'frequent', label: 'Frequent' },
                { value: 'occasional', label: 'Occasional' },
                { value: 'rare', label: 'Rare' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRadioChange('travel_frequency', option.value)}
                  className={`py-3 px-4 rounded-lg border text-center ${
                    formData.travel_frequency === option.value
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              How often do you plan to travel from your retirement location?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Lifestyle Importance (1-5 scale)
            </label>
            <div className="space-y-4">
              {lifestyleCategories.map((category) => (
                <div key={category.id} className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{category.label}</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formData.lifestyle_importance[category.id]} / 5
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleImportanceChange(category.id, value)}
                        className={`flex-1 py-2 rounded-md ${
                          formData.lifestyle_importance[category.id] === value
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
              Rate how important each lifestyle aspect is to you (1 = not important, 5 = very important).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Health Considerations (Optional)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Select any health factors that should influence location recommendations
            </p>
            <div className="grid grid-cols-1 gap-2">
              {healthOptions.map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    id={`health_${option.id}`}
                    type="checkbox"
                    checked={formData.health_considerations.includes(option.id)}
                    onChange={(e) => handleCheckboxChange('health_considerations', option.id, e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`health_${option.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pet Ownership
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: true, label: 'Pet Owner' },
                { value: false, label: 'No Pets' }
              ].map((option) => (
                <button
                  key={option.value.toString()}
                  type="button"
                  onClick={() => handlePetStatusChange(option.value)}
                  className={`py-3 px-4 rounded-lg border text-center ${
                    formData.pet_owner === option.value
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {formData.pet_owner && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pet Types
              </label>
              <div className="grid grid-cols-2 gap-2">
                {petOptions.map((pet) => (
                  <div key={pet.id} className="flex items-center">
                    <input
                      id={`pet_${pet.id}`}
                      type="checkbox"
                      checked={formData.pet_types.includes(pet.id)}
                      onChange={(e) => handleCheckboxChange('pet_types', pet.id, e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`pet_${pet.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {pet.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

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