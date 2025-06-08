import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const OnboardingRegion = (props) => {
  const { onNext, onPrevious, formData, setFormData } = props || {};
  const [selectedRegions, setSelectedRegions] = useState(['Recommended', 'Recommended', 'Recommended']);
  const [selectedCountries, setSelectedCountries] = useState(['Optional', 'Optional', 'Optional']);
  const [selectedProvinces, setSelectedProvinces] = useState(['Optional', 'Optional', 'Optional']);
  const [selectedFeatures, setSelectedFeatures] = useState(['Optional', 'Optional', 'Optional']);
  const [selectedVegetation, setSelectedVegetation] = useState(['Optional', 'Optional', 'Optional']);
  const [selectedDensity, setSelectedDensity] = useState(['Optional', 'Optional', 'Optional']);

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

  const handleRegionChange = (index, value) => {
    const newRegions = [...selectedRegions];
    newRegions[index] = value;
    setSelectedRegions(newRegions);
    
    // Reset country and province when region changes
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

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: 'white',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '30px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '8px'
        }}>Find Your Perfect Retirement Location</h1>
        <div style={{
          width: '100%',
          backgroundColor: '#e5e7eb',
          borderRadius: '9999px',
          height: '8px',
          marginBottom: '16px'
        }}>
          <div style={{
            backgroundColor: '#2563eb',
            height: '8px',
            borderRadius: '9999px',
            width: '40%',
            transition: 'all 0.3s'
          }}></div>
        </div>
        <p style={{ color: '#6b7280' }}>Step 2 of 5: Regional Preferences</p>
      </div>

      {/* Three Column Geographical Hierarchy */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px'
        }}>
          Geographical Preferences
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '24px'
        }}>
          All choices are optional - select "Recommended" or "Optional" to keep options open
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0px'
        }}>
          {[0, 1, 2].map(index => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '0 24px',
              borderRight: index < 2 ? '1px solid #e5e7eb' : 'none'
            }}>
              {/* Region Dropdown */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Preference {index + 1}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedRegions[index]}
                    onChange={(e) => handleRegionChange(index, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      color: '#374151',
                      fontSize: '14px',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {regions.map(region => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={20} 
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Country/State Dropdown */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Country/State
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedCountries[index]}
                    onChange={(e) => handleCountryChange(index, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      color: '#374151',
                      fontSize: '14px',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {getFilteredCountries(index).map(country => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={20} 
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Province Dropdown */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Province
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedProvinces[index]}
                    onChange={(e) => handleProvinceChange(index, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      color: '#374151',
                      fontSize: '14px',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {getFilteredProvinces(index).map(province => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={20} 
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Features Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px'
        }}>
          Geographic Features
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '24px'
        }}>
          Select preferred geographic features for your retirement location
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0px'
        }}>
          {[0, 1, 2].map(index => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '0 24px',
              borderRight: index < 2 ? '1px solid #e5e7eb' : 'none'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Feature {index + 1}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedFeatures[index]}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      color: '#374151',
                      fontSize: '14px',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {geographicFeatures.map(feature => (
                      <option key={feature} value={feature}>
                        {feature}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={20} 
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vegetation Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px'
        }}>
          Vegetation
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '24px'
        }}>
          Select preferred vegetation types for your retirement location
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0px'
        }}>
          {[0, 1, 2].map(index => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '0 24px',
              borderRight: index < 2 ? '1px solid #e5e7eb' : 'none'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Vegetation {index + 1}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedVegetation[index]}
                    onChange={(e) => handleVegetationChange(index, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      color: '#374151',
                      fontSize: '14px',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {vegetationTypes.map(vegetation => (
                      <option key={vegetation} value={vegetation}>
                        {vegetation}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={20} 
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Population Density Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px'
        }}>
          Population Density
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '24px'
        }}>
          Select preferred population density for your retirement location
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0px'
        }}>
          {[0, 1, 2].map(index => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '0 24px',
              borderRight: index < 2 ? '1px solid #e5e7eb' : 'none'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Density {index + 1}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedDensity[index]}
                    onChange={(e) => handleDensityChange(index, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      color: '#374151',
                      fontSize: '14px',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {populationDensity.map(density => (
                      <option key={density} value={density}>
                        {density}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    size={20} 
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '32px'
      }}>
        <h3 style={{
          fontWeight: '500',
          color: '#1f2937',
          marginBottom: '12px'
        }}>Your Geographical Preferences:</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <span style={{
              fontWeight: '500',
              color: '#374151'
            }}>Regions:</span>
            <p style={{
              color: '#6b7280',
              marginTop: '4px',
              margin: '4px 0 0 0'
            }}>
              {selectedRegions.filter(region => region !== 'Recommended').length > 0 
                ? selectedRegions.filter(region => region !== 'Recommended').join(', ') 
                : 'Any region worldwide'}
            </p>
          </div>
          <div>
            <span style={{
              fontWeight: '500',
              color: '#374151'
            }}>Countries/States:</span>
            <p style={{
              color: '#6b7280',
              marginTop: '4px',
              margin: '4px 0 0 0'
            }}>
              {selectedCountries.filter(country => country !== 'Optional').length > 0 
                ? selectedCountries.filter(country => country !== 'Optional').join(', ') 
                : 'Any location'}
            </p>
          </div>
          <div>
            <span style={{
              fontWeight: '500',
              color: '#374151'
            }}>Provinces:</span>
            <p style={{
              color: '#6b7280',
              marginTop: '4px',
              margin: '4px 0 0 0'
            }}>
              {selectedProvinces.filter(province => province !== 'Optional').length > 0 
                ? selectedProvinces.filter(province => province !== 'Optional').join(', ') 
                : 'Any province'}
            </p>
          </div>
          <div>
            <span style={{
              fontWeight: '500',
              color: '#374151'
            }}>Geographic Features:</span>
            <p style={{
              color: '#6b7280',
              marginTop: '4px',
              margin: '4px 0 0 0'
            }}>
              {selectedFeatures.filter(feature => feature !== 'Optional').length > 0 
                ? selectedFeatures.filter(feature => feature !== 'Optional').join(', ') 
                : 'Any features'}
            </p>
          </div>
          <div>
            <span style={{
              fontWeight: '500',
              color: '#374151'
            }}>Vegetation Types:</span>
            <p style={{
              color: '#6b7280',
              marginTop: '4px',
              margin: '4px 0 0 0'
            }}>
              {selectedVegetation.filter(vegetation => vegetation !== 'Optional').length > 0 
                ? selectedVegetation.filter(vegetation => vegetation !== 'Optional').join(', ') 
                : 'Any vegetation'}
            </p>
          </div>
          <div>
            <span style={{
              fontWeight: '500',
              color: '#374151'
            }}>Population Density:</span>
            <p style={{
              color: '#6b7280',
              marginTop: '4px',
              margin: '4px 0 0 0'
            }}>
              {selectedDensity.filter(density => density !== 'Optional').length > 0 
                ? selectedDensity.filter(density => density !== 'Optional').join(', ') 
                : 'Any density'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '24px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button 
          onClick={handlePrevious}
          style={{
            padding: '12px 24px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            color: '#374151',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
        >
          Previous Step
        </button>
        <div style={{
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Step 2 of 5
        </div>
        <button 
          onClick={handleNext}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
        >
          Continue to Step 3
        </button>
      </div>
    </div>
  );
};

export default OnboardingRegion;