import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Globe, MapPin, Trees, Lightbulb } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/onboardingUtils';
import { saveUserPreferences } from '../../utils/userPreferences';
import { useOnboardingAutoSave } from '../../hooks/useOnboardingAutoSave';
import ProTip from '../../components/ProTip';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import { getLoadingBackgroundClass, getLoadingTextClass } from '../../utils/themeUtils';
import supabase from '../../utils/supabaseClient';
import { SelectionCard, SelectionGrid, SelectionSection } from '../../components/onboarding/SelectionCard';

const OnboardingRegion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  
  // Updated state arrays to only have 2 elements instead of 3
  const [selectedRegions, setSelectedRegions] = useState(['', '']);
  const [selectedCountries, setSelectedCountries] = useState(['', '']);
  const [selectedProvinces, setSelectedProvinces] = useState(['', '']);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedVegetation, setSelectedVegetation] = useState([]);
  
  // Added state to control visibility of dependent dropdowns
  const [showDependentDropdowns, setShowDependentDropdowns] = useState([false, false]);
  const [showCountryDropdowns, setShowCountryDropdowns] = useState([false, false]);
  
  // NEW: Dynamic regions from database
  const [regions, setRegions] = useState(['Recommended']); // Start with just Recommended
  const [regionsLoading, setRegionsLoading] = useState(true);
  
  // State to track which preference card is expanded
  const [expandedPreference, setExpandedPreference] = useState(-1); // -1 means none expanded
  
  // Create formData object for auto-save
  const formData = {
    regions: selectedRegions.filter(region => region && region !== ''),
    countries: selectedCountries.filter(country => country && country !== ''),
    provinces: selectedProvinces.filter(province => province && province !== ''),
    geographic_features: selectedFeatures,
    vegetation_types: selectedVegetation
  };
  
  // Enable auto-save for this page
  const autoSave = useOnboardingAutoSave(formData, 'region_preferences');

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

  // Updated mapping for dynamic geo_regions from database
  const regionCountries = {
    // Keep US states/provinces in North America
    'North America': ['United States', 'Canada', 'Mexico', 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'],
    'Caribbean': ['Antigua and Barbuda', 'Bahamas', 'Barbados', 'Cuba', 'Dominica', 'Dominican Republic', 'Grenada', 'Haiti', 'Jamaica', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago'],
    'Central America': ['Belize', 'Costa Rica', 'El Salvador', 'Guatemala', 'Honduras', 'Nicaragua', 'Panama'],
    'South America': ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'French Guiana', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'],
    'Northern Europe': ['Norway', 'Sweden', 'Denmark', 'Finland', 'Iceland', 'Estonia', 'Latvia', 'Lithuania'],
    'Western Europe': ['United Kingdom', 'Ireland', 'France', 'Netherlands', 'Belgium', 'Luxembourg', 'Germany', 'Austria', 'Switzerland'],
    'Eastern Europe': ['Poland', 'Czech Republic', 'Slovakia', 'Hungary', 'Romania', 'Bulgaria', 'Russia', 'Ukraine', 'Belarus', 'Moldova'],
    'Southern Europe': ['Spain', 'Portugal', 'Italy', 'Croatia', 'Slovenia', 'Serbia', 'Bosnia and Herzegovina', 'Montenegro', 'Albania', 'North Macedonia', 'Greece'],
    'Mediterranean': ['Spain', 'France', 'Monaco', 'Italy', 'Slovenia', 'Croatia', 'Bosnia and Herzegovina', 'Montenegro', 'Albania', 'Greece', 'Turkey', 'Cyprus', 'Syria', 'Lebanon', 'Israel', 'Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco', 'Malta'],
    'North Africa': ['Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco', 'Sudan'],
    'West Africa': ['Nigeria', 'Ghana', 'Senegal', 'Mali', 'Burkina Faso', 'Niger', 'Ivory Coast', 'Guinea', 'Benin', 'Togo', 'Sierra Leone', 'Liberia', 'Mauritania', 'Gambia', 'Guinea-Bissau'],
    'East Africa': ['Ethiopia', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Burundi', 'Somalia', 'Djibouti', 'Eritrea'],
    'Southern Africa': ['South Africa', 'Zimbabwe', 'Botswana', 'Namibia', 'Zambia', 'Mozambique', 'Angola', 'Malawi', 'Lesotho', 'Eswatini'],
    'Middle East': ['Turkey', 'Syria', 'Lebanon', 'Israel', 'Palestine', 'Jordan', 'Saudi Arabia', 'Yemen', 'Oman', 'United Arab Emirates', 'Qatar', 'Bahrain', 'Kuwait', 'Iraq', 'Iran'],
    'South Asia': ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Maldives', 'Afghanistan'],
    'Indian Ocean': ['Mauritius', 'Seychelles', 'Madagascar', 'Maldives', 'Sri Lanka'],
    'Southeast Asia': ['Thailand', 'Vietnam', 'Cambodia', 'Laos', 'Myanmar', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Brunei', 'East Timor'],
    'East Asia': ['China', 'Japan', 'South Korea', 'North Korea', 'Mongolia', 'Taiwan'],
    'Pacific Islands': ['Fiji', 'Samoa', 'Tonga', 'Vanuatu', 'Solomon Islands', 'French Polynesia', 'New Caledonia'],
    'Oceania': ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Solomon Islands', 'Vanuatu', 'Samoa', 'Tonga']
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

  // Load regions from database
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        // Fetch unique geo_regions from towns table
        const { data: towns, error } = await supabase
          .from('towns')
          .select('geo_region')
          .not('geo_region', 'is', null);
        
        if (error) {
          console.error('Error fetching regions:', error);
          // Fall back to the ordered defaults if needed
          setRegions(['Recommended', 'North America', 'Caribbean', 'Central America', 'South America', 'Northern Europe', 'Western Europe', 'Eastern Europe', 'Southern Europe', 'Mediterranean', 'North Africa', 'West Africa', 'East Africa', 'Southern Africa', 'Middle East', 'South Asia', 'Indian Ocean', 'Southeast Asia', 'East Asia', 'Pacific Islands', 'Oceania']);
        } else {
          // Use the custom ordered list instead of dynamic regions
          // This ensures the regions appear in the specific order requested
          setRegions(['Recommended', 'North America', 'Caribbean', 'Central America', 'South America', 'Northern Europe', 'Western Europe', 'Eastern Europe', 'Southern Europe', 'Mediterranean', 'North Africa', 'West Africa', 'East Africa', 'Southern Africa', 'Middle East', 'South Asia', 'Indian Ocean', 'Southeast Asia', 'East Asia', 'Pacific Islands', 'Oceania']);
        }
      } catch (err) {
        console.error('Error fetching regions:', err);
      } finally {
        setRegionsLoading(false);
      }
    };
    
    fetchRegions();
  }, []); // Run once on mount

  // Load existing data if available
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const userResult = await getCurrentUser();
        if (!userResult.user) {
          navigate('/welcome');
          return;
        }
        
        const { success, data, progress: userProgress, error } = await getOnboardingProgress(userResult.user.id);
        if (!success) {
          console.error("Error loading existing data:", error);
          setInitialLoading(false);
          return;
        }
        
        // Progress is now managed by OnboardingLayout
        
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]); // Dependencies intentionally omitted - this should only run once on mount to load saved data

  // Preserved original filtering logic
  const getFilteredCountries = (regionIndex) => {
    const selectedRegion = selectedRegions[regionIndex];
    
    if (!selectedRegion || selectedRegion === '') {
      return [];
    }
    
    if (selectedRegion === 'Recommended') {
      const allCountries = Object.values(regionCountries).flat();
      return ['', ...new Set(allCountries)].sort();
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

    return ['', ...primaryCountries, ...nearbyCountriesList];
  };

  const getFilteredProvinces = (countryIndex) => {
    const selectedCountry = selectedCountries[countryIndex];
    
    if (!selectedCountry || selectedCountry === '' || !countryProvinces[selectedCountry]) {
      return [];
    }

    return ['', ...countryProvinces[selectedCountry]];
  };

  // Updated event handlers to always reset dependent selections
  const handleRegionChange = (index, value) => {
    const newRegions = [...selectedRegions];
    newRegions[index] = value;
    setSelectedRegions(newRegions);
    
    // Control visibility of dependent dropdowns
    const newShowDependentDropdowns = [...showDependentDropdowns];
    newShowDependentDropdowns[index] = value && value !== '' && value !== 'Recommended';
    setShowDependentDropdowns(newShowDependentDropdowns);
    
    // Show country dropdown when region is selected
    const newShowCountryDropdowns = [...showCountryDropdowns];
    newShowCountryDropdowns[index] = value && value !== '' && value !== 'Recommended';
    setShowCountryDropdowns(newShowCountryDropdowns);
    
    // ALWAYS reset country and province when region changes (even if same region)
    const newCountries = [...selectedCountries];
    const newProvinces = [...selectedProvinces];
    newCountries[index] = '';
    newProvinces[index] = '';
    setSelectedCountries(newCountries);
    setSelectedProvinces(newProvinces);
  };

  const handleCountryChange = (index, value) => {
    const newCountries = [...selectedCountries];
    newCountries[index] = value;
    setSelectedCountries(newCountries);
    
    // Reset province when country changes
    const newProvinces = [...selectedProvinces];
    newProvinces[index] = '';
    setSelectedProvinces(newProvinces);
  };

  const handleCountryBlur = (index) => {
    // Hide country dropdown if it's still empty
    if (selectedCountries[index] === '') {
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

  const handleSkip = async () => {
    setLoading(true);
    await autoSave();
    setLoading(false);
    navigate('/onboarding/climate');
  };

  // Function to get the hierarchical display value
  const getDisplayValue = (index) => {
    if (selectedProvinces[index] && selectedProvinces[index] !== '') {
      // Show "Country, Province"
      return `${selectedCountries[index]}, ${selectedProvinces[index]}`;
    }
    if (selectedCountries[index] && selectedCountries[index] !== '') {
      // Show "Region, Country"
      return `${selectedRegions[index]}, ${selectedCountries[index]}`;
    }
    // Show just "Region"
    return selectedRegions[index];
  };

  // Function to get available regions (all regions always available)
  const getAvailableRegions = () => {
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
    return selectedCountry && selectedCountry !== '' && countryProvinces[selectedCountry];
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
      
      // Prepare form data for saving
      const formData = {
        regions: selectedRegions.filter(region => region && region !== ''),
        countries: selectedCountries.filter(country => country && country !== ''),
        provinces: selectedProvinces.filter(province => province && province !== ''),
        geographic_features: selectedFeatures,
        vegetation_types: selectedVegetation
      };
      
      const { success, error } = await saveOnboardingStep(
        userResult.user.id,
        formData,
        'region_preferences'
      );
      
      if (!success) {
        toast.error(`Failed to save: ${error.message}`);
        setLoading(false);
        return;
      }
      
      toast.success('Regional preferences saved!');
      
      // Also save to new user_preferences table
      try {
        const { success: prefSuccess, error: prefError } = await saveUserPreferences(
          userResult.user.id,
          'region_preferences',
          formData
        );
        if (prefSuccess) {
          console.log('✅ Saved region to user_preferences table');
        } else {
          console.error('❌ Failed to save region to user_preferences:', prefError);
        }
      } catch (err) {
        console.error('Error saving region to user_preferences:', err);
      }
      
      // Add a small delay to ensure data is saved before navigation
      setTimeout(() => {
        navigate('/onboarding/climate');
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
      <div className={`h-96 ${getLoadingBackgroundClass()} p-4 flex items-center justify-center`}>
        <div className={`${uiConfig.animation.pulse} ${getLoadingTextClass()} ${uiConfig.font.weight.semibold} ${uiConfig.font.size.base}`}>Loading...</div>
      </div>
    );
  }

  return (
      <main className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <form onSubmit={handleSubmit} className="py-6">
          {/* Pro Tip at top */}
          <div className={`bg-scout-accent/10 p-3 lg:p-4 ${uiConfig.layout.radius.lg} mb-4 lg:mb-6 flex items-start`}>
            <Lightbulb size={16} className="mr-2 text-orange-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
            <p className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.colors.body}`}>
              <span className={`${uiConfig.font.weight.medium}`}>Pro Tip:</span> Keep your options open by selecting "Recommended" for regions. You can drill down to specific countries or provinces if you have strong preferences.
            </p>
          </div>
          
          {/* Geographical Preferences section */}
          <div className="mb-4">
            <label className={`${uiConfig.font.size.sm} sm:${uiConfig.font.size.base} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 sm:mb-3 flex items-center`}>
              <Globe size={16} className="mr-1.5 sm:mr-2" />
              Geographical Preferences
            </label>
            
            <div className="space-y-3 sm:space-y-4">
              {/* SelectionCard buttons - side by side on large screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                {[0, 1].map(index => (
                  <SelectionCard
                    key={`card-${index}`}
                    title={getPreferenceLabel(index)}
                    description={getDisplayValue(index) || "Select region"}
                    icon={Globe}
                    isSelected={selectedRegions[index] !== ''}
                    onClick={() => setExpandedPreference(expandedPreference === index ? -1 : index)}
                    showCheckmark={selectedRegions[index] !== ''}
                  />
                ))}
              </div>
              
              {/* Expandable dropdown section below the cards */}
              {[0, 1].map(index => (
                <div key={`dropdown-${index}`}>
                  {expandedPreference === index && (
                    <div className={`mt-3 p-4 sm:p-5 ${uiConfig.layout.radius.lg} bg-white dark:bg-gray-800/30 border-2 border-scout-accent-200 dark:border-scout-accent-600 shadow-lg space-y-3 ${uiConfig.animation.transition}`}>
                      {/* Region dropdown */}
                      <div>
                        <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1 sm:mb-1.5 block`}>
                          Select Region
                        </label>
                        <div className="relative">
                          <select
                        value={selectedRegions[index]}
                        onChange={(e) => handleRegionChange(index, e.target.value)}
                        onFocus={() => {
                          // When user clicks dropdown, if they have made selections, reset them to allow re-selection
                          if (selectedCountries[index] !== '' || selectedProvinces[index] !== '') {
                            const newCountries = [...selectedCountries];
                            const newProvinces = [...selectedProvinces];
                            newCountries[index] = '';
                            newProvinces[index] = '';
                            setSelectedCountries(newCountries);
                            setSelectedProvinces(newProvinces);
                          }
                        }}
                        className={`w-full px-3 sm:px-4 ${uiConfig.layout.radius.md} appearance-none cursor-pointer focus:ring-2 focus:ring-scout-accent-300 ${uiConfig.animation.transition} h-[44px] sm:h-[48px] border-2 ${
                          selectedRegions[index] 
                            ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-700 dark:text-scout-accent-300 font-medium'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/30 text-gray-700 dark:text-gray-200 hover:border-scout-accent-200 dark:hover:border-scout-accent-400'
                        }`}
                      >
                        <option value="">{regionsLoading ? 'Loading regions...' : 'Select region'}</option>
                        {!regionsLoading && getAvailableRegions().map(region => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                      {/* Show hierarchical selection as overlay text when selections are made */}
                      {(selectedCountries[index] !== '' || selectedProvinces[index] !== '') && (
                        <div className={`absolute inset-0 px-3 py-2 sm:py-2.5 ${uiConfig.font.size.sm} ${uiConfig.colors.heading} ${uiConfig.colors.badge} border ${uiConfig.colors.borderActive} ${uiConfig.layout.radius.lg} pointer-events-none flex items-center`}>
                          {getDisplayValue(index)}
                        </div>
                      )}
                      <ChevronDown 
                        size={20} 
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${uiConfig.colors.muted} pointer-events-none z-10`}
                      />
                    </div>
                  </div>

                  {/* Country/State dropdown - only show when country dropdown should be visible */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      showCountryDropdowns[index] && selectedCountries[index] === '' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div>
                      <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1 sm:mb-1.5 block`}>
                        Country/State
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCountries[index]}
                          onChange={(e) => handleCountryChange(index, e.target.value)}
                          onBlur={() => handleCountryBlur(index)}
                          className={`w-full px-3 sm:px-4 ${uiConfig.layout.radius.md} appearance-none cursor-pointer focus:ring-2 focus:ring-scout-accent-300 ${uiConfig.animation.transition} h-[44px] sm:h-[48px] border-2 ${
                          selectedCountries[index] 
                            ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-700 dark:text-scout-accent-300 font-medium'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/30 text-gray-700 dark:text-gray-200 hover:border-scout-accent-200 dark:hover:border-scout-accent-400'
                        }`}
                        >
                          <option value="">Select country</option>
                          {getFilteredCountries(index).filter(c => c !== '').map(country => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                        <ChevronDown 
                          size={20} 
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${uiConfig.colors.muted} pointer-events-none`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Province dropdown - only show if provinces are available for the selected country AND country dropdown is still visible */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      showCountryDropdowns[index] && selectedCountries[index] !== '' && hasProvinces(index) && selectedProvinces[index] === '' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div>
                      <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1 sm:mb-1.5 block`}>
                        Province
                      </label>
                      <div className="relative">
                        <select
                          value={selectedProvinces[index]}
                          onChange={(e) => handleProvinceChange(index, e.target.value)}
                          onBlur={() => handleProvinceBlur(index)}
                          className={`w-full px-3 sm:px-4 ${uiConfig.layout.radius.md} appearance-none cursor-pointer focus:ring-2 focus:ring-scout-accent-300 ${uiConfig.animation.transition} h-[44px] sm:h-[48px] border-2 ${
                          selectedProvinces[index] 
                            ? 'border-scout-accent-300 bg-scout-accent-50 dark:bg-scout-accent-900/20 text-scout-accent-700 dark:text-scout-accent-300 font-medium'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/30 text-gray-700 dark:text-gray-200 hover:border-scout-accent-200 dark:hover:border-scout-accent-400'
                        }`}
                        >
                          <option value="">Select province</option>
                          {getFilteredProvinces(index).filter(p => p !== '').map(province => (
                            <option key={province} value={province}>
                              {province}
                            </option>
                          ))}
                        </select>
                        <ChevronDown 
                          size={20} 
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${uiConfig.colors.muted} pointer-events-none`}
                        />
                      </div>
                    </div>
                  </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Features section */}
          <SelectionSection icon={MapPin} title="Geographic Features">
            <p className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.colors.hint} mb-2 sm:mb-3 -mt-2`}>
              Select preferred geographic features (optional)
            </p>
            <SelectionGrid>
              {geographicFeatures.map(feature => (
                <SelectionCard
                  key={feature}
                  title={feature}
                  isSelected={selectedFeatures.includes(feature)}
                  onClick={() => handleFeatureToggle(feature)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Vegetation section */}
          <SelectionSection icon={Trees} title="Vegetation Types">
            <p className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.colors.hint} mb-2 sm:mb-3 -mt-2`}>
              Select preferred vegetation types (optional)
            </p>
            <SelectionGrid>
              {vegetationTypes.map(vegetation => (
                <SelectionCard
                  key={vegetation}
                  title={vegetation}
                  isSelected={selectedVegetation.includes(vegetation)}
                  onClick={() => handleVegetationToggle(vegetation)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Summary section */}
          <div className={`mb-4 p-3 sm:p-4 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg}`}>
            <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-2 sm:mb-3 ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base}`}>
              Your Geographical Preferences:
            </h3>
            <div className={`space-y-1 sm:space-y-1.5 ${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
              <div>
                <span className={`${uiConfig.font.weight.medium}`}>Regions:</span>{' '}
                {selectedRegions.filter(region => region !== 'Recommended').length > 0 
                  ? selectedRegions.filter(region => region !== 'Recommended').join(', ') 
                  : 'Any region worldwide'}
              </div>
              <div>
                <span className={`${uiConfig.font.weight.medium}`}>Countries/States:</span>{' '}
                {selectedCountries.filter(country => country !== 'Any').length > 0 
                  ? selectedCountries.filter(country => country !== 'Any').join(', ') 
                  : 'Any location'}
              </div>
              <div>
                <span className={`${uiConfig.font.weight.medium}`}>Provinces:</span>{' '}
                {selectedProvinces.filter(province => province !== 'Any').length > 0 
                  ? selectedProvinces.filter(province => province !== 'Any').join(', ') 
                  : 'Any province'}
              </div>
              <div>
                <span className={`${uiConfig.font.weight.medium}`}>Geographic Features:</span>{' '}
                {selectedFeatures.length > 0 
                  ? selectedFeatures.join(', ') 
                  : 'Any features'}
              </div>
              <div>
                <span className={`${uiConfig.font.weight.medium}`}>Vegetation Types:</span>{' '}
                {selectedVegetation.length > 0 
                  ? selectedVegetation.join(', ') 
                  : 'Any vegetation'}
              </div>
            </div>
          </div>
        </form>

        {/* Bottom Navigation - Fixed on mobile, sticky on desktop */}
        <div className={`fixed sm:sticky bottom-0 left-0 right-0 sm:relative ${uiConfig.colors.card} border-t ${uiConfig.colors.borderLight} p-4 sm:p-0 sm:border-0 sm:bg-transparent sm:mt-6 lg:mt-8`}>
          <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto">
            <div className="flex items-center">
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  await autoSave();
                  setLoading(false);
                  navigate('/onboarding/current-status');
                }}
                disabled={loading}
                className={uiConfig.components.buttonSecondary}
              >
                ← Back
              </button>
              <div className="flex-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSkip}
                  className={uiConfig.components.buttonSecondary}
                >
                  Skip
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
};

export default OnboardingRegion;
