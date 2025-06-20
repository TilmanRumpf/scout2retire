import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Globe, MapPin, Trees } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import OnboardingStepNavigation from '../../components/OnboardingStepNavigation';
import toast from 'react-hot-toast';

// Option Button Component - Optimized for mobile
const OptionButton = ({ label, description, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 sm:p-2.5 rounded-md border-2 transition-all text-center min-h-[44px] ${
      isSelected
        ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20'
        : 'border-gray-300 dark:border-gray-600 hover:border-scout-accent-200 dark:hover:border-scout-accent-400'
    }`}
  >
    <div className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-scout-accent-700 dark:text-scout-accent-300' : ''}`}>{label}</div>
    {description && <div className={`text-[10px] sm:text-xs mt-0.5 ${isSelected ? 'text-scout-accent-600 dark:text-scout-accent-400' : 'text-gray-500 dark:text-gray-400'}`}>{description}</div>}
  </button>
);

const OnboardingRegion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState({ completedSteps: {} });
  
  // Updated state arrays to only have 2 elements instead of 3
  const [selectedRegions, setSelectedRegions] = useState(['Recommended', 'Recommended']);
  const [selectedCountries, setSelectedCountries] = useState(['Any', 'Any']);
  const [selectedProvinces, setSelectedProvinces] = useState(['Any', 'Any']);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedVegetation, setSelectedVegetation] = useState([]);
  
  // Added state to control visibility of dependent dropdowns
  const [showDependentDropdowns, setShowDependentDropdowns] = useState([false, false]);
  const [showCountryDropdowns, setShowCountryDropdowns] = useState([false, false]);

  // Preserved all original data arrays
  const regions = [
    'Recommended',
    'North America',
    'Central America',
    'Caribbean',
    'South America',
    'Europe',
    'Mediterranean',
    'Asia',
    'Africa',
    'Australia & New Zealand',
    'Oceania'
  ];

  const geographicFeatures = [
    'Coastal',
    'Mountains',
    'Island',
    'Lakes',
    'River',
    'Valley',
    'Desert',
    'Forest',
    'Plains'
  ];

  // Removed Alpine from vegetation types
  const vegetationTypes = [
    'Tropical',
    'Subtropical',
    'Mediterranean',
    'Forest',
    'Grassland',
    'Desert'
  ];

  // Preserved all original data mappings
  const regionCountries = {
    'North America': ['Mexico', 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'],
    'Central America': ['Belize', 'Costa Rica', 'El Salvador', 'Guatemala', 'Honduras', 'Nicaragua', 'Panama'],
    'Caribbean': ['Antigua and Barbuda', 'Bahamas', 'Barbados', 'Cuba', 'Dominica', 'Dominican Republic', 'Grenada', 'Haiti', 'Jamaica', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago'],
    'South America': ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'French Guiana', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'],
    'Europe': ['Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom', 'Vatican City'],
    'Mediterranean': ['Spain', 'France', 'Monaco', 'Italy', 'Slovenia', 'Croatia', 'Bosnia and Herzegovina', 'Montenegro', 'Albania', 'Greece', 'Turkey', 'Cyprus', 'Syria', 'Lebanon', 'Israel', 'Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco', 'Malta'],
    'Asia': ['Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China', 'Cyprus', 'East Timor', 'Georgia', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Russia', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand', 'Turkey', 'Turkmenistan', 'United Arab Emirates', 'Uzbekistan', 'Vietnam', 'Yemen'],
    'Africa': ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 'Democratic Republic of the Congo', 'Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'São Tomé and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'],
    'Australia & New Zealand': ['Australia', 'New Zealand'],
    'Oceania': ['Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu']
  };

  const countryProvinces = {
    'France': ['Provence-Alpes-Côte d\'Azur', 'Occitanie', 'Nouvelle-Aquitaine', 'Auvergne-Rhône-Alpes', 'Île-de-France', 'Bretagne', 'Normandie', 'Hauts-de-France', 'Grand Est', 'Bourgogne-Franche-Comté', 'Centre-Val de Loire', 'Pays de la Loire', 'Corsica'],
    'Spain': ['Andalusia', 'Catalonia', 'Valencia', 'Madrid', 'Galicia', 'Castile and León', 'Basque Country', 'Canary Islands', 'Castile-La Mancha', 'Murcia', 'Aragon', 'Extremadura', 'Balearic Islands', 'Asturias', 'Navarre', 'Cantabria', 'La Rioja'],
    'Italy': ['Tuscany', 'Sicily', 'Lombardy', 'Veneto', 'Emilia-Romagna', 'Piedmont', 'Campania', 'Lazio', 'Liguria', 'Marche', 'Abruzzo', 'Friuli-Venezia Giulia', 'Trentino-Alto Adige', 'Umbria', 'Sardinia', 'Calabria', 'Basilicata', 'Molise', 'Valle d\'Aosta'],
    'Portugal': ['Lisbon', 'Porto', 'Algarve', 'Centro', 'Norte', 'Alentejo', 'Azores', 'Madeira'],
    'Germany': ['Bavaria', 'Baden-Württemberg', 'North Rhine-Westphalia', 'Lower Saxony', 'Hesse', 'Saxony', 'Rhineland-Palatinate', 'Schleswig-Holstein', 'Brandenburg', 'Saxony-Anhalt', 'Thuringia', 'Mecklenburg-Vorpommern', 'Hamburg', 'Saarland', 'Bremen', 'Berlin'],
    'Greece': ['Crete', 'Central Macedonia', 'Attica', 'Thessaly', 'Peloponnese', 'Western Greece', 'Central Greece', 'Epirus', 'Ionian Islands', 'Western Macedonia', 'Eastern Macedonia and Thrace', 'North Aegean', 'South Aegean'],
    'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    'California': ['Northern California', 'Central California', 'Southern California'],
    'Florida': ['North Florida', 'Central Florida', 'South Florida'],
    'Texas': ['East Texas', 'North Texas', 'Central Texas', 'South Texas', 'West Texas'],
    'British Columbia': ['Lower Mainland', 'Vancouver Island', 'Interior', 'Northern BC'],
    'Ontario': ['Southern Ontario', 'Eastern Ontario', 'Central Ontario', 'Northern Ontario'],
    'Quebec': ['Greater Montreal', 'Quebec City', 'Eastern Quebec', 'Northern Quebec'],
    'Mexico': ['Baja California', 'Baja California Sur', 'Sonora', 'Chihuahua', 'Sinaloa', 'Jalisco', 'Nayarit', 'Colima', 'Michoacán', 'Guerrero', 'Oaxaca', 'Chiapas', 'Yucatán', 'Quintana Roo', 'Campeche', 'Tabasco', 'Veracruz', 'Puebla', 'Hidalgo', 'Querétaro', 'Guanajuato', 'San Luis Potosí', 'Zacatecas', 'Aguascalientes', 'Nuevo León', 'Tamaulipas', 'Coahuila', 'Durango', 'Mexico City', 'State of Mexico', 'Morelos', 'Tlaxcala'],
    'Costa Rica': ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'],
    'Panama': ['Panama', 'Chiriquí', 'Veraguas', 'Los Santos', 'Herrera', 'Coclé', 'Colón', 'Bocas del Toro', 'Darién', 'Comarca Guna Yala'],
    'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'Northern Territory', 'Australian Capital Territory'],
    'New Zealand': ['North Island', 'South Island'],
    'Thailand': ['Bangkok', 'Central Thailand', 'Northern Thailand', 'Northeastern Thailand', 'Eastern Thailand', 'Southern Thailand'],
    'Japan': ['Honshu', 'Hokkaido', 'Kyushu', 'Shikoku', 'Okinawa'],
    'Brazil': ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná', 'Rio Grande do Sul', 'Pernambuco', 'Ceará', 'Pará', 'Santa Catarina', 'Maranhão', 'Goiás', 'Paraíba', 'Espírito Santo', 'Amazonas', 'Mato Grosso', 'Rio Grande do Norte', 'Alagoas', 'Piauí', 'Distrito Federal', 'Mato Grosso do Sul', 'Sergipe', 'Rondônia', 'Acre', 'Amapá', 'Roraima', 'Tocantins']
  };

  const nearbyCountries = {
    'North America': ['Greenland', 'Iceland'],
    'Central America': ['Mexico', 'Colombia', 'Venezuela', 'Cuba', 'Jamaica'],
    'Caribbean': ['Florida', 'Venezuela', 'Colombia', 'Guyana', 'Suriname'],
    'South America': ['Panama', 'Trinidad and Tobago', 'Barbados'],
    'Europe': ['Morocco', 'Algeria', 'Tunisia', 'Turkey', 'Russia', 'Greenland'],
    'Mediterranean': ['Portugal', 'Switzerland', 'Austria', 'Bulgaria', 'Romania'],
    'Asia': ['Australia', 'New Zealand', 'Papua New Guinea', 'Russia', 'Egypt'],
    'Africa': ['Spain', 'Italy', 'Greece', 'Cyprus', 'Yemen', 'Madagascar'],
    'Australia & New Zealand': ['Indonesia', 'Papua New Guinea', 'Fiji', 'New Caledonia', 'Vanuatu'],
    'Oceania': ['Indonesia', 'Australia', 'New Zealand', 'Philippines']
  };

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
        
        // If region data exists, load it
        if (data && data.region_preferences) {
          // Map the saved data back to the dropdown states
          const regionData = data.region_preferences;
          
          // Handle regions
          if (regionData.regions && regionData.regions.length > 0) {
            const newRegions = [...selectedRegions];
            regionData.regions.forEach((region, index) => {
              if (index < 2) newRegions[index] = region;
            });
            setSelectedRegions(newRegions);
            
            // Set dropdown visibility
            const newShowDependentDropdowns = [...showDependentDropdowns];
            regionData.regions.forEach((region, index) => {
              if (index < 2) newShowDependentDropdowns[index] = region !== 'Recommended';
            });
            setShowDependentDropdowns(newShowDependentDropdowns);
          }
          
          // Handle countries
          if (regionData.countries && regionData.countries.length > 0) {
            const newCountries = [...selectedCountries];
            regionData.countries.forEach((country, index) => {
              if (index < 2) newCountries[index] = country;
            });
            setSelectedCountries(newCountries);
          }
          
          // Handle provinces
          if (regionData.provinces && regionData.provinces.length > 0) {
            const newProvinces = [...selectedProvinces];
            regionData.provinces.forEach((province, index) => {
              if (index < 2) newProvinces[index] = province;
            });
            setSelectedProvinces(newProvinces);
          }
          
          // Handle features
          if (regionData.geographic_features && regionData.geographic_features.length > 0) {
            setSelectedFeatures(regionData.geographic_features);
          }
          
          // Handle vegetation
          if (regionData.vegetation_types && regionData.vegetation_types.length > 0) {
            setSelectedVegetation(regionData.vegetation_types);
          }
        }
      } catch (err) {
        console.error("Unexpected error loading data:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadExistingData();
  }, [navigate]);

  // Preserved original filtering logic
  const getFilteredCountries = (regionIndex) => {
    const selectedRegion = selectedRegions[regionIndex];
    
    if (selectedRegion === 'Recommended') {
      const allCountries = Object.values(regionCountries).flat();
      return ['Any', ...new Set(allCountries)].sort();
    }

    let primaryCountries = [];
    let nearbyCountriesSet = new Set();

    if (regionCountries[selectedRegion]) {
      primaryCountries.push(...regionCountries[selectedRegion]);
    }
    if (nearbyCountries[selectedRegion]) {
      nearbyCountries[selectedRegion].forEach(country => nearbyCountriesSet.add(country));
    }

    primaryCountries = [...new Set(primaryCountries)].sort();
    
    const nearbyCountriesList = Array.from(nearbyCountriesSet)
      .filter(country => !primaryCountries.includes(country))
      .sort();

    return ['Any', ...primaryCountries, ...nearbyCountriesList];
  };

  const getFilteredProvinces = (countryIndex) => {
    const selectedCountry = selectedCountries[countryIndex];
    
    if (selectedCountry === 'Any' || !countryProvinces[selectedCountry]) {
      return ['Any'];
    }

    return ['Any', ...countryProvinces[selectedCountry]];
  };

  // Updated event handlers to always reset dependent selections
  const handleRegionChange = (index, value) => {
    const newRegions = [...selectedRegions];
    newRegions[index] = value;
    setSelectedRegions(newRegions);
    
    // Control visibility of dependent dropdowns
    const newShowDependentDropdowns = [...showDependentDropdowns];
    newShowDependentDropdowns[index] = value !== 'Recommended';
    setShowDependentDropdowns(newShowDependentDropdowns);
    
    // Show country dropdown when region is selected
    const newShowCountryDropdowns = [...showCountryDropdowns];
    newShowCountryDropdowns[index] = value !== 'Recommended';
    setShowCountryDropdowns(newShowCountryDropdowns);
    
    // ALWAYS reset country and province when region changes (even if same region)
    const newCountries = [...selectedCountries];
    const newProvinces = [...selectedProvinces];
    newCountries[index] = 'Any';
    newProvinces[index] = 'Any';
    setSelectedCountries(newCountries);
    setSelectedProvinces(newProvinces);
  };

  const handleCountryChange = (index, value) => {
    const newCountries = [...selectedCountries];
    newCountries[index] = value;
    setSelectedCountries(newCountries);
    
    // Reset province when country changes
    const newProvinces = [...selectedProvinces];
    newProvinces[index] = 'Any';
    setSelectedProvinces(newProvinces);
  };

  const handleCountryBlur = (index) => {
    // Hide country dropdown if it's still "Any"
    if (selectedCountries[index] === 'Any') {
      const newShowCountryDropdowns = [...showCountryDropdowns];
      newShowCountryDropdowns[index] = false;
      setShowCountryDropdowns(newShowCountryDropdowns);
    }
  };

  const handleProvinceChange = (index, value) => {
    const newProvinces = [...selectedProvinces];
    newProvinces[index] = value;
    setSelectedProvinces(newProvinces);
  };

  const handleProvinceBlur = (index) => {
    // Always hide province dropdown on blur - it's the last tier
    const newShowCountryDropdowns = [...showCountryDropdowns];
    newShowCountryDropdowns[index] = false;
    setShowCountryDropdowns(newShowCountryDropdowns);
  };

  const handleFeatureToggle = (feature) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleVegetationToggle = (vegetation) => {
    setSelectedVegetation(prev => 
      prev.includes(vegetation) 
        ? prev.filter(v => v !== vegetation)
        : [...prev, vegetation]
    );
  };

  const handleSkip = () => {
    navigate('/onboarding/climate');
  };

  // Function to get the hierarchical display value
  const getDisplayValue = (index) => {
    if (selectedProvinces[index] !== 'Any') {
      // Show "Country, Province"
      return `${selectedCountries[index]}, ${selectedProvinces[index]}`;
    }
    if (selectedCountries[index] !== 'Any') {
      // Show "Region, Country"
      return `${selectedRegions[index]}, ${selectedCountries[index]}`;
    }
    // Show just "Region"
    return selectedRegions[index];
  };

  // Function to get available regions (all regions always available)
  const getAvailableRegions = (index) => {
    // Always show all regions - user should be able to reselect same region
    return regions;
  };

  // Function to get preference label based on index
  const getPreferenceLabel = (index) => {
    return index === 0 ? 'First Preference' : 'Optional Preference';
  };

  // Check if provinces are available for the current country
  const hasProvinces = (index) => {
    const selectedCountry = selectedCountries[index];
    return selectedCountry !== 'Any' && countryProvinces[selectedCountry];
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
      
      // Prepare form data for saving
      const formData = {
        regions: selectedRegions.filter(region => region !== 'Recommended'),
        countries: selectedCountries.filter(country => country !== 'Any'),
        provinces: selectedProvinces.filter(province => province !== 'Any'),
        geographic_features: selectedFeatures,
        vegetation_types: selectedVegetation
      };
      
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
      
      toast.success('Regional preferences saved!');
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
      <div className="min-h-[100svh] bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-scout-accent-600 font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-4">
      <div className="max-w-md mx-auto p-4 sm:p-4">
        <OnboardingStepNavigation 
          currentStep="region_preferences" 
          completedSteps={progress.completedSteps} 
          className="mb-3" 
        />
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5">
          {/* Header */}
          <div className="mb-3">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">Regional Preferences</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              All choices are optional - select "Recommended" to keep options open
            </p>
          </div>

          {/* Geographical Preferences section */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Globe size={16} className="mr-1.5" />
              Geographical Preferences
            </label>
            
            <div className="space-y-3">
              {[0, 1].map(index => (
                <div key={index} className="space-y-2">
                  {/* Region dropdown */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      {getPreferenceLabel(index)}
                    </label>
                    <div className="relative">
                      <select
                        value={selectedRegions[index]}
                        onChange={(e) => handleRegionChange(index, e.target.value)}
                        onFocus={() => {
                          // When user clicks dropdown, if they have made selections, reset them to allow re-selection
                          if (selectedCountries[index] !== 'Any' || selectedProvinces[index] !== 'Any') {
                            const newCountries = [...selectedCountries];
                            const newProvinces = [...selectedProvinces];
                            newCountries[index] = 'Any';
                            newProvinces[index] = 'Any';
                            setSelectedCountries(newCountries);
                            setSelectedProvinces(newProvinces);
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white appearance-none cursor-pointer focus:ring-0 focus:border-scout-accent-300 transition-colors h-[44px]"
                      >
                        {getAvailableRegions(index).map(region => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                      {/* Show hierarchical selection as overlay text when selections are made */}
                      {(selectedCountries[index] !== 'Any' || selectedProvinces[index] !== 'Any') && (
                        <div className="absolute inset-0 px-3 py-2 text-sm text-gray-800 dark:text-white bg-scout-accent-50 dark:bg-scout-accent-900/20 border border-scout-accent-200 dark:border-scout-accent-800 rounded-lg pointer-events-none flex items-center">
                          {getDisplayValue(index)}
                        </div>
                      )}
                      <ChevronDown 
                        size={20} 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                      />
                    </div>
                  </div>

                  {/* Country/State dropdown - only show when country dropdown should be visible */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      showCountryDropdowns[index] && selectedCountries[index] === 'Any' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Country/State
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCountries[index]}
                          onChange={(e) => handleCountryChange(index, e.target.value)}
                          onBlur={() => handleCountryBlur(index)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white appearance-none cursor-pointer focus:ring-0 focus:border-scout-accent-300 transition-colors h-[44px]"
                        >
                          {getFilteredCountries(index).map(country => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                        <ChevronDown 
                          size={20} 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Province dropdown - only show if provinces are available for the selected country AND country dropdown is still visible */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      showCountryDropdowns[index] && selectedCountries[index] !== 'Any' && hasProvinces(index) && selectedProvinces[index] === 'Any' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                        Province
                      </label>
                      <div className="relative">
                        <select
                          value={selectedProvinces[index]}
                          onChange={(e) => handleProvinceChange(index, e.target.value)}
                          onBlur={() => handleProvinceBlur(index)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white appearance-none cursor-pointer focus:ring-0 focus:border-scout-accent-300 transition-colors h-[44px]"
                        >
                          {getFilteredProvinces(index).map(province => (
                            <option key={province} value={province}>
                              {province}
                            </option>
                          ))}
                        </select>
                        <ChevronDown 
                          size={20} 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>

                  {index === 0 && <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Features section */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <MapPin size={16} className="mr-1.5" />
              Geographic Features
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Select preferred geographic features (optional)
            </p>
            
            <div className="grid grid-cols-3 gap-1.5">
              {geographicFeatures.map(feature => (
                <OptionButton
                  key={feature}
                  label={feature}
                  isSelected={selectedFeatures.includes(feature)}
                  onClick={() => handleFeatureToggle(feature)}
                />
              ))}
            </div>
          </div>

          {/* Vegetation section */}
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center">
              <Trees size={16} className="mr-1.5" />
              Vegetation Types
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Select preferred vegetation types (optional)
            </p>
            
            <div className="grid grid-cols-3 gap-1.5">
              {vegetationTypes.map(vegetation => (
                <OptionButton
                  key={vegetation}
                  label={vegetation}
                  isSelected={selectedVegetation.includes(vegetation)}
                  onClick={() => handleVegetationToggle(vegetation)}
                />
              ))}
            </div>
          </div>

          {/* Summary section */}
          <div className="mb-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="font-medium text-gray-800 dark:text-white mb-1.5 text-sm">
              Your Geographical Preferences:
            </h3>
            <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
              <div>
                <span className="font-medium">Regions:</span>{' '}
                {selectedRegions.filter(region => region !== 'Recommended').length > 0 
                  ? selectedRegions.filter(region => region !== 'Recommended').join(', ') 
                  : 'Any region worldwide'}
              </div>
              <div>
                <span className="font-medium">Countries/States:</span>{' '}
                {selectedCountries.filter(country => country !== 'Any').length > 0 
                  ? selectedCountries.filter(country => country !== 'Any').join(', ') 
                  : 'Any location'}
              </div>
              <div>
                <span className="font-medium">Provinces:</span>{' '}
                {selectedProvinces.filter(province => province !== 'Any').length > 0 
                  ? selectedProvinces.filter(province => province !== 'Any').join(', ') 
                  : 'Any province'}
              </div>
              <div>
                <span className="font-medium">Geographic Features:</span>{' '}
                {selectedFeatures.length > 0 
                  ? selectedFeatures.join(', ') 
                  : 'Any features'}
              </div>
              <div>
                <span className="font-medium">Vegetation Types:</span>{' '}
                {selectedVegetation.length > 0 
                  ? selectedVegetation.join(', ') 
                  : 'Any vegetation'}
              </div>
            </div>
          </div>

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
                  <span className="font-medium">Pro Tip:</span> Keep your options open by selecting "Recommended" for regions. You can drill down to specific countries or provinces if you have strong preferences.
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
                  onClick={() => navigate('/onboarding/current-status')}
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
};

export default OnboardingRegion;