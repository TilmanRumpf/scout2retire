import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep } from '../../utils/onboardingUtils';
import toast from 'react-hot-toast';

export default function OnboardingRegion() {
  const [formData, setFormData] = useState({
    continents: [],
    countries: [],
    proximity_to_water: 'coastal', // coastal, near_water, inland
    preferred_environment: 'mixed', // urban, suburban, rural, mixed
    altitude_preference: 'low', // low, moderate, high, any
    specific_exclusions: []
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  // Continent options
  const continents = [
    { id: 'europe', label: 'Europe' },
    { id: 'north_america', label: 'North America' },
    { id: 'central_america', label: 'Central America' },
    { id: 'south_america', label: 'South America' },
    { id: 'asia', label: 'Asia' },
    { id: 'oceania', label: 'Oceania' },
    { id: 'africa', label: 'Africa' }
  ];

  // Popular retirement destination countries
  const popularCountries = [
    // Europe
    { id: 'portugal', label: 'Portugal', continent: 'europe' },
    { id: 'spain', label: 'Spain', continent: 'europe' },
    { id: 'france', label: 'France', continent: 'europe' },
    { id: 'italy', label: 'Italy', continent: 'europe' },
    { id: 'greece', label: 'Greece', continent: 'europe' },
    { id: 'croatia', label: 'Croatia', continent: 'europe' },
    { id: 'malta', label: 'Malta', continent: 'europe' },
    { id: 'cyprus', label: 'Cyprus', continent: 'europe' },
    // North America
    { id: 'mexico', label: 'Mexico', continent: 'north_america' },
    { id: 'canada', label: 'Canada', continent: 'north_america' },
    // Central America
    { id: 'costa_rica', label: 'Costa Rica', continent: 'central_america' },
    { id: 'panama', label: 'Panama', continent: 'central_america' },
    { id: 'belize', label: 'Belize', continent: 'central_america' },
    // South America
    { id: 'ecuador', label: 'Ecuador', continent: 'south_america' },
    { id: 'colombia', label: 'Colombia', continent: 'south_america' },
    { id: 'uruguay', label: 'Uruguay', continent: 'south_america' },
    { id: 'chile', label: 'Chile', continent: 'south_america' },
    // Asia
    { id: 'thailand', label: 'Thailand', continent: 'asia' },
    { id: 'malaysia', label: 'Malaysia', continent: 'asia' },
    { id: 'vietnam', label: 'Vietnam', continent: 'asia' },
    { id: 'philippines', label: 'Philippines', continent: 'asia' },
    // Oceania
    { id: 'australia', label: 'Australia', continent: 'oceania' },
    { id: 'new_zealand', label: 'New Zealand', continent: 'oceania' },
  ];

  // Load existing data if available
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const { user, profile } = await getCurrentUser();
        if (!user) {
          navigate('/welcome');
          return;
        }
        
        // TODO: Load existing data if any
        // For now, just set initial loading to false
        
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadExistingData();
  }, [navigate]);

  const handleContinentChange = (continentId, checked) => {
    setFormData(prev => {
      const updatedContinents = checked
        ? [...prev.continents, continentId]
        : prev.continents.filter(c => c !== continentId);
      
      // Update countries based on continent selection
      let updatedCountries = [...prev.countries];
      if (!checked) {
        // Remove countries from deselected continent
        updatedCountries = updatedCountries.filter(countryId =>
          !popularCountries.find(c => c.id === countryId && c.continent === continentId)
        );
      }
      
      return {
        ...prev,
        continents: updatedContinents,
        countries: updatedCountries
      };
    });
  };

  const handleCountryChange = (countryId, checked) => {
    setFormData(prev => {
      const updatedCountries = checked
        ? [...prev.countries, countryId]
        : prev.countries.filter(c => c !== countryId);
      
      // Add continent if a country is selected and the continent isn't already selected
      let updatedContinents = [...prev.continents];
      if (checked) {
        const country = popularCountries.find(c => c.id === countryId);
        if (country && !updatedContinents.includes(country.continent)) {
          updatedContinents.push(country.continent);
        }
      }
      
      return {
        ...prev,
        countries: updatedCountries,
        continents: updatedContinents
      };
    });
  };

  const handleExclusionChange = (exclusionId, checked) => {
    setFormData(prev => {
      const updatedExclusions = checked
        ? [...prev.specific_exclusions, exclusionId]
        : prev.specific_exclusions.filter(e => e !== exclusionId);
      
      return {
        ...prev,
        specific_exclusions: updatedExclusions
      };
    });
  };

  const handleRadioChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        'region_preferences'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Region preferences saved!');
      navigate('/onboarding/climate');
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

  // Get relevant countries for selected continents
  const relevantCountries = popularCountries.filter(
    country => formData.continents.includes(country.continent)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/onboarding/current-status')}
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
                    step === 2
                      ? 'bg-green-600 dark:bg-green-400'
                      : step < 2
                      ? 'bg-gray-400 dark:bg-gray-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                ></div>
              ))}
            </div>
            <div className="w-5"></div> {/* Spacer to balance the back button */}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Region Preferences</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select the regions and environments you're interested in exploring.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Continents of Interest
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Select all that interest you for retirement
            </p>
            <div className="grid grid-cols-2 gap-2">
              {continents.map((continent) => (
                <div key={continent.id} className="flex items-center">
                  <input
                    id={`continent_${continent.id}`}
                    type="checkbox"
                    checked={formData.continents.includes(continent.id)}
                    onChange={(e) => handleContinentChange(continent.id, e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`continent_${continent.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {continent.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {relevantCountries.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Countries of Interest
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Select specific countries you're interested in
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                {relevantCountries.map((country) => (
                  <div key={country.id} className="flex items-center">
                    <input
                      id={`country_${country.id}`}
                      type="checkbox"
                      checked={formData.countries.includes(country.id)}
                      onChange={(e) => handleCountryChange(country.id, e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`country_${country.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {country.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proximity to Water
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'coastal', label: 'Coastal' },
                { value: 'near_water', label: 'Near Lakes/Rivers' },
                { value: 'inland', label: 'Inland' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRadioChange('proximity_to_water', option.value)}
                  className={`py-3 px-4 rounded-lg border text-center ${
                    formData.proximity_to_water === option.value
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
              Preferred Environment
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'urban', label: 'Urban' },
                { value: 'suburban', label: 'Suburban' },
                { value: 'rural', label: 'Rural' },
                { value: 'mixed', label: 'Mixed/Any' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRadioChange('preferred_environment', option.value)}
                  className={`py-3 px-4 rounded-lg border text-center ${
                    formData.preferred_environment === option.value
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
              Altitude Preference
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'low', label: 'Low Altitude' },
                { value: 'moderate', label: 'Moderate Altitude' },
                { value: 'high', label: 'High Altitude' },
                { value: 'any', label: 'Any Altitude' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRadioChange('altitude_preference', option.value)}
                  className={`py-3 px-4 rounded-lg border text-center ${
                    formData.altitude_preference === option.value
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
              Specific Exclusions (Optional)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'exclude_islands', label: 'No islands' },
                { id: 'exclude_landlocked', label: 'No landlocked countries' },
                { id: 'exclude_developing', label: 'No developing economies' },
                { id: 'exclude_remote', label: 'No remote areas' }
              ].map((exclusion) => (
                <div key={exclusion.id} className="flex items-center">
                  <input
                    id={exclusion.id}
                    type="checkbox"
                    checked={formData.specific_exclusions.includes(exclusion.id)}
                    onChange={(e) => handleExclusionChange(exclusion.id, e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor={exclusion.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {exclusion.label}
                  </label>
                </div>
              ))}
            </div>
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