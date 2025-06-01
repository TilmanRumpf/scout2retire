import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import toast from 'react-hot-toast';

export default function OnboardingCurrentStatus() {
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState({
    retirement_timeline: {
      status: 'planning', // planning, retiring_soon, already_retired
      target_year: currentYear + 5,
      flexibility: 'somewhat_flexible' // very_flexible, somewhat_flexible, fixed
    },
    citizenship: {
      primary_citizenship: 'usa',
      secondary_citizenship: '',
      visa_concerns: false
    },
    family_situation: {
      status: 'couple', // solo, couple, family
      partner_agreement: 'full_agreement', // full_agreement, mostly_agree, still_convincing
      bringing_children: false,
      bringing_pets: false
    },
    current_location: '',
    moving_motivation: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  // Country options
  const countries = [
    { id: 'usa', label: 'United States' },
    { id: 'canada', label: 'Canada' },
    { id: 'uk', label: 'United Kingdom' },
    { id: 'australia', label: 'Australia' },
    { id: 'germany', label: 'Germany' },
    { id: 'france', label: 'France' },
    { id: 'spain', label: 'Spain' },
    { id: 'italy', label: 'Italy' },
    { id: 'japan', label: 'Japan' },
    { id: 'other', label: 'Other' }
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
        
        // If current status data exists, load it
        if (data && data.current_status) {
          setFormData(data.current_status);
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
    const { name, value, type, checked } = e.target;
    
    // Handle nested properties with dot notation
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFamilyStatusChange = (status) => {
    setFormData(prev => ({
      ...prev,
      family_situation: {
        ...prev.family_situation,
        status
      }
    }));
  };

  const handleRetirementStatusChange = (status) => {
    setFormData(prev => ({
      ...prev,
      retirement_timeline: {
        ...prev.retirement_timeline,
        status
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
        'current_status'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Current status saved!');
      navigate('/onboarding/region');
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

  // Generate retirement year options (current year to +30 years)
  const retirementYearOptions = [];
  for (let i = 0; i <= 30; i++) {
    retirementYearOptions.push(currentYear + i);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/welcome')}
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
                    step === 1
                      ? 'bg-green-600 dark:bg-green-400'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                ></div>
              ))}
            </div>
            <div className="w-5"></div> {/* Spacer to balance the back button */}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Current Status</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Tell us a bit about your current retirement situation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Retirement Status
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: 'planning', label: 'Planning for Retirement' },
                { value: 'retiring_soon', label: 'Retiring Within a Year' },
                { value: 'already_retired', label: 'Already Retired' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRetirementStatusChange(option.value)}
                  className={`py-3 px-4 rounded-lg border text-left ${
                    formData.retirement_timeline.status === option.value
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {formData.retirement_timeline.status !== 'already_retired' && (
            <div>
              <label htmlFor="target_year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Retirement Year
              </label>
              <select
                id="target_year"
                name="retirement_timeline.target_year"
                value={formData.retirement_timeline.target_year}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                {retirementYearOptions.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="flexibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timeline Flexibility
            </label>
            <select
              id="flexibility"
              name="retirement_timeline.flexibility"
              value={formData.retirement_timeline.flexibility}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="very_flexible">Very Flexible (±3 years)</option>
              <option value="somewhat_flexible">Somewhat Flexible (±1 year)</option>
              <option value="fixed">Fixed Date</option>
            </select>
          </div>

          <div>
            <label htmlFor="primary_citizenship" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Citizenship
            </label>
            <select
              id="primary_citizenship"
              name="citizenship.primary_citizenship"
              value={formData.citizenship.primary_citizenship}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="secondary_citizenship" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secondary Citizenship (Optional)
            </label>
            <select
              id="secondary_citizenship"
              name="citizenship.secondary_citizenship"
              value={formData.citizenship.secondary_citizenship}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="">None / Not Applicable</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center">
              <input
                id="visa_concerns"
                name="citizenship.visa_concerns"
                type="checkbox"
                checked={formData.citizenship.visa_concerns}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="visa_concerns" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                I have concerns about visas or residency permits
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Family Situation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'solo', label: 'Solo' },
                { value: 'couple', label: 'Couple' },
                { value: 'family', label: 'Family' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFamilyStatusChange(option.value)}
                  className={`py-3 px-4 rounded-lg border text-center ${
                    formData.family_situation.status === option.value
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {formData.family_situation.status !== 'solo' && (
            <div>
              {formData.family_situation.status === 'couple' && (
                <div>
                  <label htmlFor="partner_agreement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Partner Agreement Level
                  </label>
                  <select
                    id="partner_agreement"
                    name="family_situation.partner_agreement"
                    value={formData.family_situation.partner_agreement}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="full_agreement">Full Agreement on Relocating</option>
                    <option value="mostly_agree">Mostly Agree on Relocating</option>
                    <option value="still_convincing">Still Convincing Partner</option>
                  </select>
                </div>
              )}

              {formData.family_situation.status === 'family' && (
                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      id="bringing_children"
                      name="family_situation.bringing_children"
                      type="checkbox"
                      checked={formData.family_situation.bringing_children}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="bringing_children" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Bringing children with us
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <div className="flex items-center">
              <input
                id="bringing_pets"
                name="family_situation.bringing_pets"
                type="checkbox"
                checked={formData.family_situation.bringing_pets}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="bringing_pets" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Bringing pets
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="current_location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current City/Region (Optional)
            </label>
            <input
              type="text"
              id="current_location"
              name="current_location"
              value={formData.current_location}
              onChange={handleInputChange}
              placeholder="e.g. Boston, MA"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="moving_motivation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Motivation for Moving (Optional)
            </label>
            <textarea
              id="moving_motivation"
              name="moving_motivation"
              value={formData.moving_motivation}
              onChange={handleInputChange}
              rows="3"
              placeholder="What's your main reason for considering an international move?"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
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