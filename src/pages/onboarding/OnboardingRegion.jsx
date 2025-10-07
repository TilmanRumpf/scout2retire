import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Globe, MapPin, Trees, Lightbulb, Car, Train, Plane, Check } from 'lucide-react';
import { getCurrentUser } from '../../utils/authUtils';
import { saveOnboardingStep, getOnboardingProgress } from '../../utils/userpreferences/onboardingUtils';
import { saveUserPreferences } from '../../utils/userpreferences/userPreferences';
import { useOnboardingAutoSave } from '../../hooks/useOnboardingAutoSave';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import ProTip from '../../components/ProTip';
import toast from 'react-hot-toast';
import { uiConfig } from '../../styles/uiConfig';
import { isIOS } from '../../utils/platformDetection';
import { getLoadingBackgroundClass, getLoadingTextClass } from '../../utils/themeUtils';
import supabase from '../../utils/supabaseClient';
import { SelectionCard, SelectionGrid, SelectionSection } from '../../components/onboarding/SelectionCard';
import { CustomDropdown } from '../../components/CustomDropdown';
import { getFeatureLimit } from '../../utils/paywallUtils';
import { UpgradeModal, useUpgradeModal } from '../../components/UpgradeModal';

// Multi-Select Mobility Dropdown Component - moved from costs page
const MobilityDropdown = ({ values = [], onChange, label, options, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Handle toggling individual options
  const handleToggle = (optionId) => {
    if (values.includes(optionId)) {
      onChange(values.filter(v => v !== optionId));
    } else {
      onChange([...values, optionId]);
    }
  };
  
  // Clear all selections
  const handleClearAll = () => {
    onChange([]);
  };
  
  // Get display text for button
  const getDisplayText = () => {
    if (values.length === 0) return 'Select your preferences';
    const labels = values.map(v => options.find(opt => opt.id === v)?.label).filter(Boolean);
    if (labels.length <= 2) {
      return labels.join(', ');
    }
    // Show first two items and "..." for more
    return `${labels.slice(0, 2).join(', ')}...`;
  };
  
  // Use centralized button classes
  const buttonClasses = uiConfig.onboardingButton.getButtonClasses(values.length > 0, false);
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
      >
        {/* Checkmark indicator - using centralized config */}
        {values.length > 0 && (
          <div className={uiConfig.onboardingButton.checkmark.position}>
            <div className={uiConfig.onboardingButton.checkmark.container}>
              <Check className={uiConfig.onboardingButton.checkmark.icon} />
            </div>
          </div>
        )}
        
        <div className="flex flex-col justify-center h-full">
          {/* Title - using centralized typography */}
          <div className={`${uiConfig.onboardingButton.typography.title.weight} ${
            values.length > 0 ? uiConfig.onboardingButton.typography.title.selectedColor : uiConfig.onboardingButton.typography.title.unselectedColor
          } ${uiConfig.onboardingButton.typography.title.size} ${values.length > 0 ? 'pr-6' : ''}`}>
            {label}
          </div>
          {/* Subtitle - using centralized typography */}
          <div className={`${uiConfig.onboardingButton.typography.subtitle.size} ${
            values.length > 0 ? uiConfig.onboardingButton.typography.subtitle.selectedColor : uiConfig.onboardingButton.typography.subtitle.unselectedColor
          } ${uiConfig.onboardingButton.typography.subtitle.spacing} truncate`}>
            {values.length === 0 ? 'Select your preferences' : getDisplayText()}
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
            max-h-60 overflow-y-auto`}>
            
            {/* Clear all option */}
            {values.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className={`w-full p-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/30 
                  ${uiConfig.animation.transition} border-b border-gray-200 dark:border-gray-700`}
              >
                <div className="text-gray-500 dark:text-gray-400">Clear all</div>
              </button>
            )}
            
            {/* Options with checkboxes */}
            {options.map(opt => {
              const isSelected = values.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleToggle(opt.id)}
                  className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 
                    ${uiConfig.animation.transition} ${isSelected ? 'bg-scout-accent-50 dark:bg-scout-accent-900/20' : ''}`}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 mt-0.5 mr-3 border-2 rounded flex-shrink-0 ${uiConfig.animation.transition}
                      ${isSelected 
                        ? 'bg-scout-accent-500 border-scout-accent-500' 
                        : 'border-gray-300 dark:border-gray-600'
                      }`}>
                      {isSelected && (
                        <Check className="w-3 h-3 text-white m-auto" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm ${isSelected ? 'text-scout-accent-700 dark:text-scout-accent-300 font-medium' : ''}`}>
                        {opt.label}
                      </div>
                      {opt.description && (
                        <div className={`text-xs mt-0.5 ${uiConfig.colors.hint}`}>
                          {opt.description}
                        </div>
                      )}
                    </div>
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

const OnboardingRegion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Auto-hide navigation on scroll
  const { isVisible: isNavVisible } = useHideOnScroll();

  // Paywall: Region limit and upgrade modal
  const [regionLimit, setRegionLimit] = useState(null);
  const { upgradeModalProps, showUpgradeModal, hideUpgradeModal } = useUpgradeModal();

  // Updated state arrays to only have 2 elements instead of 3
  const [selectedRegions, setSelectedRegions] = useState(['', '']);
  const [selectedCountries, setSelectedCountries] = useState(['', '']);
  const [selectedProvinces, setSelectedProvinces] = useState(['', '']);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedVegetation, setSelectedVegetation] = useState([]);
  
  // Mobility state - moved from costs page
  const [mobility, setMobility] = useState({
    local: [],
    regional: [],
    international: []
  });
  
  // Added state to control visibility of dependent dropdowns
  const [showDependentDropdowns, setShowDependentDropdowns] = useState([false, false]);
  const [showCountryDropdowns, setShowCountryDropdowns] = useState([false, false]);
  const [showProvinceDropdowns, setShowProvinceDropdowns] = useState([false, false]);
  
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
    vegetation_types: selectedVegetation,
    mobility: mobility // Add mobility to formData
  };
  
  // Enable auto-save for this page
  const autoSave = useOnboardingAutoSave(formData, 'region_preferences');

  // Mobility options - moved from costs page
  const localMobilityOptions = [
    { id: 'walk_bike', label: 'Walk/Bike', description: 'Walkable neighborhoods' },
    { id: 'public_transit', label: 'Public Transit', description: 'Bus/metro access' },
    { id: 'need_car', label: 'Own Vehicle', description: 'Car required' },
    { id: 'taxi_rideshare', label: 'Taxi/Rideshare', description: 'On-demand transport' },
    { id: 'flexible', label: 'Flexible', description: 'Open to any option' }
  ];

  const regionalMobilityOptions = [
    { id: 'train_access', label: 'Train Access', description: 'Rail connections' },
    { id: 'bus_network', label: 'Bus Network', description: 'Regional buses' },
    { id: 'need_car', label: 'Own Vehicle', description: 'Car required' },
    { id: 'not_important', label: 'Not Important', description: 'Rarely travel regionally' },
    { id: 'flexible', label: 'Flexible', description: 'Open to any option' }
  ];

  const intlMobilityOptions = [
    { id: 'major_airport', label: 'Major Airport', description: 'International hub nearby' },
    { id: 'regional_airport', label: 'Regional Airport', description: 'Domestic flights' },
    { id: 'train_connections', label: 'Train Connections', description: 'Cross-border rail' },
    { id: 'not_important', label: 'Not Important', description: 'Rarely travel internationally' },
    { id: 'flexible', label: 'Flexible', description: 'Open to any option' }
  ];

  // Geographic features for onboarding - limited set, lowercase for consistency
  const geographicFeatures = [
    'coastal',
    'mountain',
    'island',
    'lake',
    'river',
    'valley',
    'desert',
    'forest',
    'plains'
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
    'Northern Europe': ['Russia', 'Greenland'],
    'Western Europe': ['Morocco', 'Algeria', 'Tunisia'],
    'Southern Europe': ['Turkey', 'Morocco', 'Algeria', 'Tunisia'],
    'Mediterranean': [],
    'Asia': ['Australia', 'New Zealand', 'Papua New Guinea', 'Russia', 'Egypt'],
    'Africa': ['Spain', 'Italy', 'Greece', 'Cyprus', 'Yemen', 'Madagascar'],
    'Australia & New Zealand': ['Indonesia', 'Papua New Guinea', 'Fiji', 'New Caledonia', 'Vanuatu'],
    'Oceania': ['Indonesia', 'Australia', 'New Zealand', 'Philippines']
  };

  // Load region limit from paywall system
  useEffect(() => {
    const loadRegionLimit = async () => {
      const limit = await getFeatureLimit('regions');
      setRegionLimit(limit);
    };
    loadRegionLimit();
  }, []);

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
              if (index < 2) {
                // Fix old "Europe" data - reset to empty if invalid region
                if (region === 'Europe') {
                  newRegions[index] = ''; // Clear invalid "Europe" entry
                } else {
                  newRegions[index] = region;
                }
              }
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
          
          // Handle mobility - moved from costs
          if (regionData.mobility) {
            const mobilityToSet = {
              local: Array.isArray(regionData.mobility.local) ? regionData.mobility.local : [],
              regional: Array.isArray(regionData.mobility.regional) ? regionData.mobility.regional : [],
              international: Array.isArray(regionData.mobility.international) ? regionData.mobility.international : []
            };
            setMobility(mobilityToSet);
          } else {
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

    return ['', 'Any Province', ...countryProvinces[selectedCountry]];
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
    
    // If "Recommended" is selected, close the panel immediately
    if (value === 'Recommended') {
      setTimeout(() => {
        setExpandedPreference(-1);
      }, 300); // Small delay so user sees their selection
    }
  };

  const handleCountryChange = (index, value) => {
    const newCountries = [...selectedCountries];
    newCountries[index] = value;
    setSelectedCountries(newCountries);
    
    // Reset province when country changes
    const newProvinces = [...selectedProvinces];
    newProvinces[index] = '';
    setSelectedProvinces(newProvinces);
    
    // Show or hide province dropdown based on whether provinces are available
    if (value !== '') {
      const provincesAvailable = countryProvinces[value] && countryProvinces[value].length > 0;
      const newShowProvinceDropdowns = [...showProvinceDropdowns];
      newShowProvinceDropdowns[index] = provincesAvailable;
      setShowProvinceDropdowns(newShowProvinceDropdowns);
      
      // If no provinces available, close the panel
      if (!provincesAvailable) {
        setTimeout(() => {
          setExpandedPreference(-1);
        }, 300); // Small delay so user sees their selection
      }
    } else {
      // If country is deselected, hide province dropdown
      const newShowProvinceDropdowns = [...showProvinceDropdowns];
      newShowProvinceDropdowns[index] = false;
      setShowProvinceDropdowns(newShowProvinceDropdowns);
    }
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
    
    // If a province is selected (including "Any Province"), close the entire expanded panel
    if (value !== '') {
      setTimeout(() => {
        setExpandedPreference(-1);
      }, 300); // Small delay so user sees their selection
    }
  };

  const handleProvinceBlur = (index) => {
    // Always hide province dropdown on blur - it's the last tier
    const newShowCountryDropdowns = [...showCountryDropdowns];
    newShowCountryDropdowns[index] = false;
    setShowCountryDropdowns(newShowCountryDropdowns);
  };

  const handleFeatureToggle = (feature) => {
    setSelectedFeatures(prev =>
      prev.some(f => f.toLowerCase() === feature.toLowerCase())
        ? prev.filter(f => f.toLowerCase() !== feature.toLowerCase())
        : [...prev, feature]
    );
  };

  const handleVegetationToggle = (vegetation) => {
    setSelectedVegetation(prev =>
      prev.some(v => v.toLowerCase() === vegetation.toLowerCase())
        ? prev.filter(v => v.toLowerCase() !== vegetation.toLowerCase())
        : [...prev, vegetation]
    );
  };

  const handleMobilityUpdate = (field, values) => {
    setMobility(prev => ({
      ...prev,
      [field]: values
    }));
  };

  const handleSaveAndExit = async () => {
    setLoading(true);
    await autoSave();
    setLoading(false);
    navigate('/onboarding/complete');
  };

  // Function to get the hierarchical display value
  const getDisplayValue = (index) => {
    if (selectedProvinces[index] && selectedProvinces[index] !== '') {
      // Show full breadcrumb: "Region, Country, Province"
      // "Any Province" is already stored as the value, so it will display correctly
      return `${selectedRegions[index]}, ${selectedCountries[index]}, ${selectedProvinces[index]}`;
    }
    if (selectedCountries[index] && selectedCountries[index] !== '') {
      // Check if this country has provinces available
      const provincesAvailable = countryProvinces[selectedCountries[index]] && 
                                 countryProvinces[selectedCountries[index]].length > 0;
      if (provincesAvailable) {
        // User selected a country with provinces but didn't select a specific province
        // Show "Region, Country, Any Province"
        return `${selectedRegions[index]}, ${selectedCountries[index]}, Any Province`;
      } else {
        // Country has no provinces, just show "Region, Country"
        return `${selectedRegions[index]}, ${selectedCountries[index]}`;
      }
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
        vegetation_types: selectedVegetation,
        mobility: mobility // Include mobility preferences in save
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
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <form onSubmit={handleSubmit} className="py-6">
          {/* Pro Tip at top */}
          <div className={`bg-scout-accent/10 p-3 lg:p-4 ${uiConfig.layout.radius.lg} mb-4 lg:mb-6 flex items-start`}>
            <Lightbulb size={16} className="mr-2 text-orange-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
            <p className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.colors.body}`}>
              <span className={`${uiConfig.font.weight.medium}`}>Pro Tip:</span> Keep your options open by selecting "Recommended" for regions. You can drill down to specific countries or provinces if you have strong preferences.
            </p>
          </div>
          
          {/* Geographical Preferences section */}
          <div className="mb-6">
            <label className={`${uiConfig.font.size.sm} sm:${uiConfig.font.size.base} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-3 sm:mb-4 flex items-center`}>
              <Globe size={16} className="mr-1.5 sm:mr-2" />
              Geographical Preferences
            </label>
            
            <div className="space-y-3 sm:space-y-4">
              {/* First Preference Card */}
              <div>
                <SelectionCard
                  title={getPreferenceLabel(0)}
                  description={getDisplayValue(0) || "Select region"}
                  isSelected={selectedRegions[0] !== ''}
                  onClick={() => {
                    // Toggle expanded state
                    if (expandedPreference === 0) {
                      setExpandedPreference(-1);
                    } else {
                      setExpandedPreference(0);
                      // When re-opening, show all relevant dropdowns based on current selections
                      if (selectedRegions[0] && selectedRegions[0] !== '' && selectedRegions[0] !== 'Recommended') {
                        const newShowCountryDropdowns = [...showCountryDropdowns];
                        newShowCountryDropdowns[0] = true;
                        setShowCountryDropdowns(newShowCountryDropdowns);
                        
                        if (selectedCountries[0] && selectedCountries[0] !== '') {
                          const newShowProvinceDropdowns = [...showProvinceDropdowns];
                          newShowProvinceDropdowns[0] = true;
                          setShowProvinceDropdowns(newShowProvinceDropdowns);
                        }
                      }
                    }
                  }}
                  showCheckmark={selectedRegions[0] !== ''}
                />
                
                {/* First Preference Dropdown - appears right after its card */}
                {expandedPreference === 0 && (
                  <div className={`mt-3 p-3 sm:p-4 ${uiConfig.layout.radius.lg} bg-white dark:bg-gray-800/30 border-2 border-scout-accent-200 dark:border-scout-accent-600 shadow-lg space-y-3 ${uiConfig.animation.transition} relative z-10`}>
                    {/* Region dropdown */}
                    <div>
                      <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1 sm:mb-1.5 block`}>
                        Select Region
                      </label>
                      <CustomDropdown
                        value={selectedRegions[0]}
                        onChange={(value) => {
                          // Reset dependent selections when region changes
                          if (selectedCountries[0] !== '' || selectedProvinces[0] !== '') {
                            const newCountries = [...selectedCountries];
                            const newProvinces = [...selectedProvinces];
                            newCountries[0] = '';
                            newProvinces[0] = '';
                            setSelectedCountries(newCountries);
                            setSelectedProvinces(newProvinces);
                          }
                          handleRegionChange(0, value);
                        }}
                        options={[
                          { value: '', label: regionsLoading ? 'Loading regions...' : 'Select region' },
                          ...(!regionsLoading ? getAvailableRegions().map(region => ({
                            value: region,
                            label: region
                          })) : [])
                        ]}
                        placeholder={regionsLoading ? 'Loading regions...' : 'Select region'}
                        disabled={regionsLoading}
                      />
                    </div>

                    {/* Country/State dropdown - show when region is selected (not Recommended) */}
                    {showCountryDropdowns[0] && (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <div>
                        <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1 sm:mb-1.5 block`}>
                          Country/State
                        </label>
                        <CustomDropdown
                          value={selectedCountries[0]}
                          onChange={(value) => handleCountryChange(0, value)}
                          options={
                            getFilteredCountries(0).map(country => ({
                              value: country,
                              label: country === '' ? 'Select country' : country
                            }))
                          }
                          placeholder="Select country"
                          showSearch={false}
                        />
                      </div>
                    </div>
                    )}

                    {/* Province dropdown - show when country is selected and has provinces */}
                    {showProvinceDropdowns[0] && hasProvinces(0) && (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                      <div>
                        <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1 sm:mb-1.5 block flex items-center justify-between`}>
                          <span>Province (Optional)</span>
                          <button
                            type="button"
                            onClick={() => {
                              // Close the panel without selecting a province
                              setExpandedPreference(-1);
                            }}
                            className="text-xs text-scout-accent-600 hover:text-scout-accent-700 dark:text-scout-accent-400 dark:hover:text-scout-accent-300 underline"
                          >
                            Skip Province
                          </button>
                        </label>
                        <CustomDropdown
                          value={selectedProvinces[0]}
                          onChange={(value) => handleProvinceChange(0, value)}
                          options={
                            getFilteredProvinces(0).map(province => ({
                              value: province,
                              label: province === '' ? 'Select province' : province
                            }))
                          }
                          placeholder="Select province"
                          showSearch={false}
                        />
                      </div>
                    </div>
                    )}
                  </div>
                )}
              </div>

              {/* Second Preference Card - Check paywall limit */}
              <div>
                <SelectionCard
                  title={getPreferenceLabel(1)}
                  description={getDisplayValue(1) || (regionLimit !== null && regionLimit < 2 ? "Upgrade to unlock" : "Select region")}
                  isSelected={selectedRegions[1] !== ''}
                  onClick={() => {
                    // Check if user has access to second region
                    if (regionLimit !== null && regionLimit < 2) {
                      showUpgradeModal({
                        featureName: 'Regions',
                        current_usage: 1,
                        limit: regionLimit,
                        upgrade_to: 'premium',
                        reason: `Your plan allows ${regionLimit} region${regionLimit === 1 ? '' : 's'}. Upgrade to select multiple regions.`
                      });
                      return;
                    }

                    // Toggle expanded state
                    if (expandedPreference === 1) {
                      setExpandedPreference(-1);
                    } else {
                      setExpandedPreference(1);
                      // When re-opening, show all relevant dropdowns based on current selections
                      if (selectedRegions[1] && selectedRegions[1] !== '' && selectedRegions[1] !== 'Recommended') {
                        const newShowCountryDropdowns = [...showCountryDropdowns];
                        newShowCountryDropdowns[1] = true;
                        setShowCountryDropdowns(newShowCountryDropdowns);

                        if (selectedCountries[1] && selectedCountries[1] !== '') {
                          const newShowProvinceDropdowns = [...showProvinceDropdowns];
                          newShowProvinceDropdowns[1] = true;
                          setShowProvinceDropdowns(newShowProvinceDropdowns);
                        }
                      }
                    }
                  }}
                  showCheckmark={selectedRegions[1] !== ''}
                  isLocked={regionLimit !== null && regionLimit < 2}
                />
                
                {/* Second Preference Dropdown - appears right after its card */}
                {expandedPreference === 1 && (
                  <div className={`mt-3 p-3 sm:p-4 ${uiConfig.layout.radius.lg} bg-white dark:bg-gray-800/30 border-2 border-scout-accent-200 dark:border-scout-accent-600 shadow-lg space-y-3 ${uiConfig.animation.transition} relative z-10`}>
                    {/* Region dropdown */}
                    <div>
                      <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1 sm:mb-1.5 block`}>
                        Select Region
                      </label>
                      <CustomDropdown
                        value={selectedRegions[1]}
                        onChange={(value) => {
                          // Reset dependent selections when region changes
                          if (selectedCountries[1] !== '' || selectedProvinces[1] !== '') {
                            const newCountries = [...selectedCountries];
                            const newProvinces = [...selectedProvinces];
                            newCountries[1] = '';
                            newProvinces[1] = '';
                            setSelectedCountries(newCountries);
                            setSelectedProvinces(newProvinces);
                          }
                          handleRegionChange(1, value);
                        }}
                        options={[
                          { value: '', label: regionsLoading ? 'Loading regions...' : 'Select region' },
                          ...(!regionsLoading ? getAvailableRegions().map(region => ({
                            value: region,
                            label: region
                          })) : [])
                        ]}
                        placeholder={regionsLoading ? 'Loading regions...' : 'Select region'}
                        disabled={regionsLoading}
                      />
                    </div>

                    {/* Country/State dropdown - show when region is selected (not Recommended) */}
                    {showCountryDropdowns[1] && (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <div>
                        <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1 sm:mb-1.5 block`}>
                          Country/State
                        </label>
                        <CustomDropdown
                          value={selectedCountries[1]}
                          onChange={(value) => handleCountryChange(1, value)}
                          options={
                            getFilteredCountries(1).map(country => ({
                              value: country,
                              label: country === '' ? 'Select country' : country
                            }))
                          }
                          placeholder="Select country"
                          showSearch={false}
                        />
                      </div>
                    </div>
                    )}

                    {/* Province dropdown - show when country is selected and has provinces */}
                    {showProvinceDropdowns[1] && hasProvinces(1) && (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                      <div>
                        <label className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1 sm:mb-1.5 block flex items-center justify-between`}>
                          <span>Province (Optional)</span>
                          <button
                            type="button"
                            onClick={() => {
                              // Close the panel without selecting a province
                              setExpandedPreference(-1);
                            }}
                            className="text-xs text-scout-accent-600 hover:text-scout-accent-700 dark:text-scout-accent-400 dark:hover:text-scout-accent-300 underline"
                          >
                            Skip Province
                          </button>
                        </label>
                        <CustomDropdown
                          value={selectedProvinces[1]}
                          onChange={(value) => handleProvinceChange(1, value)}
                          options={
                            getFilteredProvinces(1).map(province => ({
                              value: province,
                              label: province === '' ? 'Select province' : province
                            }))
                          }
                          placeholder="Select province"
                          showSearch={false}
                        />
                      </div>
                    </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Geographic Features section */}
          <SelectionSection icon={MapPin} title="Geographic Features">
            <p className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.colors.hint} mb-2 sm:mb-3 -mt-2`}>
              Select preferred geographic features (optional)
            </p>
            <SelectionGrid columns="two">
              {geographicFeatures.map(feature => (
                <SelectionCard
                  key={feature}
                  title={feature.charAt(0).toUpperCase() + feature.slice(1)}
                  isSelected={selectedFeatures.some(f => f.toLowerCase() === feature.toLowerCase())}
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
            <SelectionGrid columns="two">
              {vegetationTypes.map(vegetation => (
                <SelectionCard
                  key={vegetation}
                  title={vegetation}
                  isSelected={selectedVegetation.some(v => v.toLowerCase() === vegetation.toLowerCase())}
                  onClick={() => handleVegetationToggle(vegetation)}
                  size="small"
                />
              ))}
            </SelectionGrid>
          </SelectionSection>

          {/* Transportation Preferences - moved from costs page */}
          <SelectionSection icon={Car} title="Transportation Preferences">
            <p className={`${uiConfig.font.size.xs} sm:${uiConfig.font.size.sm} ${uiConfig.colors.hint} mb-2 sm:mb-3 -mt-2`}>
              How do you prefer to get around? (optional)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <MobilityDropdown
                values={mobility.local || []}
                onChange={(values) => handleMobilityUpdate('local', values)}
                label="Local"
                options={localMobilityOptions}
              />
              
              <MobilityDropdown
                values={mobility.regional || []}
                onChange={(values) => handleMobilityUpdate('regional', values)}
                label="Regional"
                options={regionalMobilityOptions}
              />
              
              <MobilityDropdown
                values={mobility.international || []}
                onChange={(values) => handleMobilityUpdate('international', values)}
                label="International"
                options={intlMobilityOptions}
              />
            </div>
          </SelectionSection>

          {/* Summary section - matching hobbies page styling */}
          {(selectedRegions.filter(r => r && r !== '').length > 0 ||
            selectedCountries.filter(c => c && c !== '').length > 0 ||
            selectedProvinces.filter(p => p && p !== '').length > 0 ||
            selectedFeatures.length > 0 ||
            selectedVegetation.length > 0 ||
            mobility.local.length > 0 ||
            mobility.regional.length > 0 ||
            mobility.international.length > 0) && (
          <div className={`mb-3 p-2.5 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg}`}>
            <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-1.5 ${uiConfig.font.size.sm}`}>
              Your Geographical Preferences:
            </h3>
            <div className={`space-y-0.5 ${uiConfig.font.size.xs} ${uiConfig.colors.body}`}>
              {/* First Preference */}
              {selectedRegions[0] && selectedRegions[0] !== '' && (
                <div>
                  <span className={`${uiConfig.font.weight.medium}`}>First Preference:</span>{' '}
                  {getDisplayValue(0)}
                </div>
              )}
              
              {/* Optional Preference */}
              {selectedRegions[1] && selectedRegions[1] !== '' && (
                <div>
                  <span className={`${uiConfig.font.weight.medium}`}>Optional Preference:</span>{' '}
                  {getDisplayValue(1)}
                </div>
              )}
              
              {/* Geographic Features */}
              {selectedFeatures.length > 0 && (
                <div>
                  <span className={`${uiConfig.font.weight.medium}`}>Geographic Features:</span>{' '}
                  {selectedFeatures.join(', ')}
                </div>
              )}
              
              {/* Vegetation Types */}
              {selectedVegetation.length > 0 && (
                <div>
                  <span className={`${uiConfig.font.weight.medium}`}>Vegetation Types:</span>{' '}
                  {selectedVegetation.join(', ')}
                </div>
              )}
              
              {/* Transportation */}
              {(mobility.local.length > 0 || mobility.regional.length > 0 || mobility.international.length > 0) && (
                <div>
                  <span className={`${uiConfig.font.weight.medium}`}>Transportation:</span>{' '}
                  {[
                    mobility.local.length > 0 && `Local: ${mobility.local.map(id => localMobilityOptions.find(o => o.id === id)?.label).filter(Boolean).join(', ')}`,
                    mobility.regional.length > 0 && `Regional: ${mobility.regional.map(id => regionalMobilityOptions.find(o => o.id === id)?.label).filter(Boolean).join(', ')}`,
                    mobility.international.length > 0 && `Int'l: ${mobility.international.map(id => intlMobilityOptions.find(o => o.id === id)?.label).filter(Boolean).join(', ')}`
                  ].filter(Boolean).join('; ')}
                </div>
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

        {/* Upgrade Modal */}
        <UpgradeModal {...upgradeModalProps} onClose={hideUpgradeModal} />
      </main>
  );
};

export default OnboardingRegion;
