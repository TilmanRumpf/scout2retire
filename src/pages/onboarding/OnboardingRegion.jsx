import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
// 08JUN25: Import uiConfig for consistent design system
import { uiConfig } from '../../styles/uiConfig';

// 08JUN25: Updated to have only 2 preferences - First Preference and Optional Preference
// Removed Preference 3 completely and updated all related functionality
const OnboardingRegion = (props) => {
  // 08JUN25: Preserved original props destructuring
  const { onNext, onPrevious, formData, setFormData } = props || {};
  
  // 08JUN25: Updated state arrays to only have 2 elements instead of 3
  const [selectedRegions, setSelectedRegions] = useState(['Recommended', 'Recommended']);
  const [selectedCountries, setSelectedCountries] = useState(['Optional', 'Optional']);
  const [selectedProvinces, setSelectedProvinces] = useState(['Optional', 'Optional']);
  const [selectedFeatures, setSelectedFeatures] = useState(['Optional', 'Optional']);
  const [selectedVegetation, setSelectedVegetation] = useState(['Optional', 'Optional']);
  const [selectedDensity, setSelectedDensity] = useState(['Optional', 'Optional']);
  
  // 08JUN25: Added state to control visibility of dependent dropdowns
  const [showDependentDropdowns, setShowDependentDropdowns] = useState([false, false]);

  // 08JUN25: Preserved all original data arrays
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
    'Optional',
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

  const vegetationTypes = [
    'Optional',
    'Tropical',
    'Subtropical',
    'Mediterranean',
    'Temperate forest',
    'Grassland',
    'Coniferous forest',
    'Desert',
    'Alpine'
  ];

  const populationDensity = [
    'Optional',
    'Metropolitan',
    'Urban', 
    'Suburban',
    'Town',
    'Village',
    'Remote'
  ];

  // 08JUN25: Preserved all original data mappings
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

  // 08JUN25: Preserved original filtering logic
  const getFilteredCountries = (regionIndex) => {
    const selectedRegion = selectedRegions[regionIndex];
    
    if (selectedRegion === 'Recommended') {
      const allCountries = Object.values(regionCountries).flat();
      return ['Optional', ...new Set(allCountries)].sort();
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

    return ['Optional', ...primaryCountries, ...nearbyCountriesList];
  };

  const getFilteredProvinces = (countryIndex) => {
    const selectedCountry = selectedCountries[countryIndex];
    
    if (selectedCountry === 'Optional' || !countryProvinces[selectedCountry]) {
      return ['Optional'];
    }

    return ['Optional', ...countryProvinces[selectedCountry]];
  };

  // 08JUN25: Updated event handlers to always reset dependent selections
  const handleRegionChange = (index, value) => {
    const newRegions = [...selectedRegions];
    newRegions[index] = value;
    setSelectedRegions(newRegions);
    
    // 08JUN25: Control visibility of dependent dropdowns
    const newShowDependentDropdowns = [...showDependentDropdowns];
    newShowDependentDropdowns[index] = value !== 'Recommended';
    setShowDependentDropdowns(newShowDependentDropdowns);
    
    // 08JUN25: ALWAYS reset country and province when region changes (even if same region)
    const newCountries = [...selectedCountries];
    const newProvinces = [...selectedProvinces];
    newCountries[index] = 'Optional';
    newProvinces[index] = 'Optional';
    setSelectedCountries(newCountries);
    setSelectedProvinces(newProvinces);
  };

  const handleCountryChange = (index, value) => {
    const newCountries = [...selectedCountries];
    newCountries[index] = value;
    setSelectedCountries(newCountries);
    
    // Reset province when country changes
    const newProvinces = [...selectedProvinces];
    newProvinces[index] = 'Optional';
    setSelectedProvinces(newProvinces);
  };

  const handleProvinceChange = (index, value) => {
    const newProvinces = [...selectedProvinces];
    newProvinces[index] = value;
    setSelectedProvinces(newProvinces);
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...selectedFeatures];
    newFeatures[index] = value;
    setSelectedFeatures(newFeatures);
  };

  const handleVegetationChange = (index, value) => {
    const newVegetation = [...selectedVegetation];
    newVegetation[index] = value;
    setSelectedVegetation(newVegetation);
  };

  const handleDensityChange = (index, value) => {
    const newDensity = [...selectedDensity];
    newDensity[index] = value;
    setSelectedDensity(newDensity);
  };

  // 08JUN25: Preserved original useEffect for form data updates
  useEffect(() => {
    if (setFormData && typeof setFormData === 'function') {
      setFormData(prev => ({
        ...prev,
        preferredRegions: selectedRegions.filter(region => region !== 'Recommended'),
        preferredCountries: selectedCountries.filter(country => country !== 'Optional'),
        preferredProvinces: selectedProvinces.filter(province => province !== 'Optional'),
        geographicFeatures: selectedFeatures.filter(feature => feature !== 'Optional'),
        vegetationTypes: selectedVegetation.filter(vegetation => vegetation !== 'Optional'),
        populationDensity: selectedDensity.filter(density => density !== 'Optional')
      }));
    }
  }, [selectedRegions, selectedCountries, selectedProvinces, selectedFeatures, selectedVegetation, selectedDensity, setFormData]);

  // 08JUN25: Preserved original navigation handlers
  const handleNext = () => {
    if (onNext && typeof onNext === 'function') {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (onPrevious && typeof onPrevious === 'function') {
      onPrevious();
    }
  };

  // 08JUN25: Function to get the hierarchical display value
  const getDisplayValue = (index) => {
    if (selectedProvinces[index] !== 'Optional') {
      // Show "Country, Province"
      return `${selectedCountries[index]}, ${selectedProvinces[index]}`;
    }
    if (selectedCountries[index] !== 'Optional') {
      // Show "Region, Country"
      return `${selectedRegions[index]}, ${selectedCountries[index]}`;
    }
    // Show just "Region"
    return selectedRegions[index];
  };

  // 08JUN25: Function to get available regions (all regions always available)
  const getAvailableRegions = (index) => {
    // Always show all regions - user should be able to reselect same region
    return regions;
  };

  // 08JUN25: Function to get preference label based on index
  const getPreferenceLabel = (index) => {
    return index === 0 ? 'First Preference' : 'Optional Preference';
  };

  return (
    // 08JUN25: Mobile-first page container using uiConfig design tokens
    <div className={`${uiConfig.layout.width.containerWide} ${uiConfig.layout.spacing.section} ${uiConfig.colors.page} min-h-screen ${uiConfig.font.family}`}>
      
      {/* 08JUN25: Header section with mobile-responsive design */}
      <div className="mb-6 sm:mb-8">
        <h1 className={`${uiConfig.font.size['2xl']} sm:${uiConfig.font.size['3xl']} ${uiConfig.font.weight.bold} ${uiConfig.colors.heading} mb-2`}>
          Find Your Perfect Retirement Location
        </h1>
        
        {/* 08JUN25: Progress bar with uiConfig styling */}
        <div className={`w-full ${uiConfig.progress.track} ${uiConfig.layout.radius.full} h-2 mb-4`}>
          <div className={`${uiConfig.progress.fill} h-2 ${uiConfig.layout.radius.full} ${uiConfig.animation.transition}`} 
               style={{ width: '40%' }}>
          </div>
        </div>
        <p className={`${uiConfig.colors.hint} ${uiConfig.font.size.sm} sm:${uiConfig.font.size.base}`}>
          Step 2 of 5: Regional Preferences
        </p>
      </div>

      {/* 08JUN25: Mobile-first geographical preferences section - Updated to show only 2 preferences */}
      <div className="mb-6 sm:mb-8">
        <h2 className={`${uiConfig.font.size.lg} sm:${uiConfig.font.size.xl} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-2`}>
          Geographical Preferences
        </h2>
        <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.body} mb-4 sm:mb-6`}>
          All choices are optional - select "Recommended" or "Optional" to keep options open
        </p>
        
        {/* 08JUN25: Updated grid to accommodate 2 columns - mobile stacked, desktop side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map(index => (
            <div key={index} className={`flex flex-col gap-4 lg:px-6 ${index === 0 ? 'lg:border-r lg:border-gray-200 dark:lg:border-gray-700' : ''}`}>
              
              {/* 08JUN25: Region dropdown with updated labels - horizontal layout */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} sm:min-w-0 sm:flex-shrink-0`}>
                  {getPreferenceLabel(index)}
                </label>
                <div className="relative sm:flex-1 sm:max-w-xs">
                  <select
                    value={selectedRegions[index]}
                    onChange={(e) => handleRegionChange(index, e.target.value)}
                    onFocus={() => {
                      // 08JUN25: When user clicks dropdown, if they have made selections, reset them to allow re-selection
                      if (selectedCountries[index] !== 'Optional' || selectedProvinces[index] !== 'Optional') {
                        const newCountries = [...selectedCountries];
                        const newProvinces = [...selectedProvinces];
                        newCountries[index] = 'Optional';
                        newProvinces[index] = 'Optional';
                        setSelectedCountries(newCountries);
                        setSelectedProvinces(newProvinces);
                      }
                    }}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.input} ${uiConfig.colors.heading} appearance-none cursor-pointer ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.animation.transition}`}
                  >
                    {getAvailableRegions(index).map(region => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  {/* 08JUN25: Show hierarchical selection as overlay text when selections are made */}
                  {(selectedCountries[index] !== 'Optional' || selectedProvinces[index] !== 'Optional') && (
                    <div className={`absolute inset-0 px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} ${uiConfig.colors.heading} bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg pointer-events-none flex items-center`}>
                      {getDisplayValue(index)}
                    </div>
                  )}
                  <ChevronDown 
                    size={20} 
                    className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 ${uiConfig.colors.hint} pointer-events-none z-10`}
                  />
                </div>
              </div>

              {/* 08JUN25: Country/State dropdown - stay visible until province is chosen */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showDependentDropdowns[index] && selectedProvinces[index] === 'Optional' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} sm:min-w-0 sm:flex-shrink-0`}>
                      Country/State
                    </label>
                    <div className="relative sm:flex-1 sm:max-w-xs">
                      <select
                        value={selectedCountries[index]}
                        onChange={(e) => handleCountryChange(index, e.target.value)}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.input} ${uiConfig.colors.heading} appearance-none cursor-pointer ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.animation.transition}`}
                      >
                        {getFilteredCountries(index).map(country => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      <ChevronDown 
                        size={20} 
                        className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 ${uiConfig.colors.hint} pointer-events-none`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 08JUN25: Province dropdown - show when country chosen, hide when province chosen */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showDependentDropdowns[index] && selectedCountries[index] !== 'Optional' && selectedProvinces[index] === 'Optional' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} sm:min-w-0 sm:flex-shrink-0`}>
                      Province
                    </label>
                    <div className="relative sm:flex-1 sm:max-w-xs">
                      <select
                        value={selectedProvinces[index]}
                        onChange={(e) => handleProvinceChange(index, e.target.value)}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.input} ${uiConfig.colors.heading} appearance-none cursor-pointer ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.animation.transition}`}
                      >
                        {getFilteredProvinces(index).map(province => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                      <ChevronDown 
                        size={20} 
                        className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 ${uiConfig.colors.hint} pointer-events-none`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 08JUN25: Geographic Features section - Updated to 2 columns */}
      <div className="mb-6 sm:mb-8">
        <h2 className={`${uiConfig.font.size.lg} sm:${uiConfig.font.size.xl} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-2`}>
          Geographic Features
        </h2>
        <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.body} mb-4 sm:mb-6`}>
          Select preferred geographic features for your retirement location
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map(index => (
            <div key={index} className={`flex flex-col gap-4 lg:px-6 ${index === 0 ? 'lg:border-r lg:border-gray-200 dark:lg:border-gray-700' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} sm:min-w-0 sm:flex-shrink-0`}>
                  Feature {index + 1}
                </label>
                <div className="relative sm:flex-1 sm:max-w-xs">
                  <select
                    value={selectedFeatures[index]}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.input} ${uiConfig.colors.heading} appearance-none cursor-pointer ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.animation.transition}`}
                  >
                    {geographicFeatures.map(feature => (
                      <option key={feature} value={feature}>
                        {feature}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={20} 
                    className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 ${uiConfig.colors.hint} pointer-events-none`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 08JUN25: Vegetation section - Updated to 2 columns */}
      <div className="mb-6 sm:mb-8">
        <h2 className={`${uiConfig.font.size.lg} sm:${uiConfig.font.size.xl} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-2`}>
          Vegetation
        </h2>
        <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.body} mb-4 sm:mb-6`}>
          Select preferred vegetation types for your retirement location
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map(index => (
            <div key={index} className={`flex flex-col gap-4 lg:px-6 ${index === 0 ? 'lg:border-r lg:border-gray-200 dark:lg:border-gray-700' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} sm:min-w-0 sm:flex-shrink-0`}>
                  Vegetation {index + 1}
                </label>
                <div className="relative sm:flex-1 sm:max-w-xs">
                  <select
                    value={selectedVegetation[index]}
                    onChange={(e) => handleVegetationChange(index, e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.input} ${uiConfig.colors.heading} appearance-none cursor-pointer ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.animation.transition}`}
                  >
                    {vegetationTypes.map(vegetation => (
                      <option key={vegetation} value={vegetation}>
                        {vegetation}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={20} 
                    className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 ${uiConfig.colors.hint} pointer-events-none`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 08JUN25: Population Density section - Updated to 2 columns */}
      <div className="mb-6 sm:mb-8">
        <h2 className={`${uiConfig.font.size.lg} sm:${uiConfig.font.size.xl} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-2`}>
          Population Density
        </h2>
        <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.body} mb-4 sm:mb-6`}>
          Select preferred population density for your retirement location
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map(index => (
            <div key={index} className={`flex flex-col gap-4 lg:px-6 ${index === 0 ? 'lg:border-r lg:border-gray-200 dark:lg:border-gray-700' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} sm:min-w-0 sm:flex-shrink-0`}>
                  Density {index + 1}
                </label>
                <div className="relative sm:flex-1 sm:max-w-xs">
                  <select
                    value={selectedDensity[index]}
                    onChange={(e) => handleDensityChange(index, e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 ${uiConfig.font.size.sm} border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.input} ${uiConfig.colors.heading} appearance-none cursor-pointer ${uiConfig.colors.focusRing} focus:border-transparent ${uiConfig.animation.transition}`}
                  >
                    {populationDensity.map(density => (
                      <option key={density} value={density}>
                        {density}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={20} 
                    className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 ${uiConfig.colors.hint} pointer-events-none`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 08JUN25: Summary section with uiConfig styling - Updated to reflect 2 preferences */}
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.spacing.card} ${uiConfig.layout.radius.lg} border ${uiConfig.colors.borderLight} mb-6 sm:mb-8`}>
        <h3 className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading} mb-3`}>
          Your Geographical Preferences:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <span className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>Regions:</span>
            <p className={`${uiConfig.colors.body} mt-1 ${uiConfig.font.size.sm}`}>
              {selectedRegions.filter(region => region !== 'Recommended').length > 0 
                ? selectedRegions.filter(region => region !== 'Recommended').join(', ') 
                : 'Any region worldwide'}
            </p>
          </div>
          <div>
            <span className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>Countries/States:</span>
            <p className={`${uiConfig.colors.body} mt-1 ${uiConfig.font.size.sm}`}>
              {selectedCountries.filter(country => country !== 'Optional').length > 0 
                ? selectedCountries.filter(country => country !== 'Optional').join(', ') 
                : 'Any location'}
            </p>
          </div>
          <div>
            <span className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>Provinces:</span>
            <p className={`${uiConfig.colors.body} mt-1 ${uiConfig.font.size.sm}`}>
              {selectedProvinces.filter(province => province !== 'Optional').length > 0 
                ? selectedProvinces.filter(province => province !== 'Optional').join(', ') 
                : 'Any province'}
            </p>
          </div>
          <div>
            <span className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>Geographic Features:</span>
            <p className={`${uiConfig.colors.body} mt-1 ${uiConfig.font.size.sm}`}>
              {selectedFeatures.filter(feature => feature !== 'Optional').length > 0 
                ? selectedFeatures.filter(feature => feature !== 'Optional').join(', ') 
                : 'Any features'}
            </p>
          </div>
          <div>
            <span className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>Vegetation Types:</span>
            <p className={`${uiConfig.colors.body} mt-1 ${uiConfig.font.size.sm}`}>
              {selectedVegetation.filter(vegetation => vegetation !== 'Optional').length > 0 
                ? selectedVegetation.filter(vegetation => vegetation !== 'Optional').join(', ') 
                : 'Any vegetation'}
            </p>
          </div>
          <div>
            <span className={`${uiConfig.font.weight.medium} ${uiConfig.colors.heading}`}>Population Density:</span>
            <p className={`${uiConfig.colors.body} mt-1 ${uiConfig.font.size.sm}`}>
              {selectedDensity.filter(density => density !== 'Optional').length > 0 
                ? selectedDensity.filter(density => density !== 'Optional').join(', ') 
                : 'Any density'}
            </p>
          </div>
        </div>
      </div>

      {/* 08JUN25: Mobile-first navigation with uiConfig styling */}
      <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center pt-6 border-t ${uiConfig.colors.borderLight} space-y-4 sm:space-y-0`}>
        <button 
          onClick={handlePrevious}
          className={`w-full sm:w-auto px-4 sm:px-6 py-3 border ${uiConfig.colors.border} ${uiConfig.layout.radius.lg} ${uiConfig.colors.heading} ${uiConfig.colors.input} cursor-pointer ${uiConfig.states.hover} ${uiConfig.animation.transition} order-2 sm:order-1`}
        >
          Previous Step
        </button>
        <div className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint} text-center order-1 sm:order-2`}>
          Step 2 of 5
        </div>
        <button 
          onClick={handleNext}
          className={`w-full sm:w-auto px-4 sm:px-6 py-3 ${uiConfig.colors.btnPrimary} ${uiConfig.layout.radius.lg} border-none cursor-pointer ${uiConfig.animation.transition} ${uiConfig.colors.focusRing} focus:ring-offset-2 order-3`}
        >
          Continue to Step 3
        </button>
      </div>
    </div>
  );
};

export default OnboardingRegion;