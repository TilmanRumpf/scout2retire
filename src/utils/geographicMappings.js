// Geographic region mappings for intelligent filtering
// This provides context-aware filtering for regions and geo_regions based on country

// Mapping of countries to their relevant broader regions
export const COUNTRY_REGIONS = {
  // Europe
  'Spain': ['Europe', 'Western Europe', 'Southern Europe', 'Mediterranean', 'Iberian Peninsula', 'Atlantic Coast'],
  'Portugal': ['Europe', 'Western Europe', 'Southern Europe', 'Iberian Peninsula', 'Atlantic Coast'],
  'France': ['Europe', 'Western Europe', 'Mediterranean', 'Atlantic Coast', 'Alpine'],
  'Italy': ['Europe', 'Southern Europe', 'Mediterranean', 'Alpine'],
  'Greece': ['Europe', 'Southern Europe', 'Mediterranean', 'Balkans'],
  'Germany': ['Europe', 'Western Europe', 'Central Europe'],
  'Austria': ['Europe', 'Central Europe', 'Alpine'],
  'Switzerland': ['Europe', 'Western Europe', 'Central Europe', 'Alpine'],
  'Netherlands': ['Europe', 'Western Europe', 'North Sea Coast'],
  'Belgium': ['Europe', 'Western Europe'],
  'Luxembourg': ['Europe', 'Western Europe', 'Central Europe'],
  'United Kingdom': ['Europe', 'Northern Europe', 'British Isles', 'Atlantic Coast'],
  'Ireland': ['Europe', 'Northern Europe', 'British Isles', 'Atlantic Coast'],
  'Norway': ['Europe', 'Northern Europe', 'Scandinavia', 'Nordic', 'Atlantic Coast'],
  'Sweden': ['Europe', 'Northern Europe', 'Scandinavia', 'Nordic', 'Baltic'],
  'Finland': ['Europe', 'Northern Europe', 'Nordic', 'Baltic'],
  'Denmark': ['Europe', 'Northern Europe', 'Scandinavia', 'Nordic', 'Baltic'],
  'Iceland': ['Europe', 'Northern Europe', 'Nordic', 'Atlantic Coast'],
  'Poland': ['Europe', 'Eastern Europe', 'Central Europe', 'Baltic'],
  'Czech Republic': ['Europe', 'Eastern Europe', 'Central Europe'],
  'Slovakia': ['Europe', 'Eastern Europe', 'Central Europe'],
  'Hungary': ['Europe', 'Eastern Europe', 'Central Europe'],
  'Romania': ['Europe', 'Eastern Europe', 'Balkans'],
  'Bulgaria': ['Europe', 'Eastern Europe', 'Balkans'],
  'Croatia': ['Europe', 'Southern Europe', 'Eastern Europe', 'Balkans', 'Mediterranean'],
  'Slovenia': ['Europe', 'Southern Europe', 'Central Europe', 'Alpine', 'Balkans'],
  'Serbia': ['Europe', 'Eastern Europe', 'Balkans'],
  'Bosnia and Herzegovina': ['Europe', 'Eastern Europe', 'Balkans'],
  'Montenegro': ['Europe', 'Eastern Europe', 'Balkans', 'Mediterranean'],
  'Albania': ['Europe', 'Eastern Europe', 'Balkans', 'Mediterranean'],
  'Estonia': ['Europe', 'Northern Europe', 'Eastern Europe', 'Baltic'],
  'Latvia': ['Europe', 'Northern Europe', 'Eastern Europe', 'Baltic'],
  'Lithuania': ['Europe', 'Northern Europe', 'Eastern Europe', 'Baltic'],
  'Malta': ['Europe', 'Southern Europe', 'Mediterranean'],
  'Cyprus': ['Europe', 'Southern Europe', 'Mediterranean', 'Middle East'],
  
  // Americas
  'United States': ['Americas', 'North America', 'Atlantic Coast', 'Pacific Coast'],
  'Canada': ['Americas', 'North America', 'Atlantic Coast', 'Pacific Coast'],
  'Mexico': ['Americas', 'North America', 'Central America', 'Pacific Coast', 'Caribbean Islands'],
  'Brazil': ['Americas', 'South America', 'Atlantic Coast', 'Amazon Basin'],
  'Argentina': ['Americas', 'South America', 'Atlantic Coast', 'Andes'],
  'Chile': ['Americas', 'South America', 'Pacific Coast', 'Andes'],
  'Peru': ['Americas', 'South America', 'Pacific Coast', 'Andes', 'Amazon Basin'],
  'Colombia': ['Americas', 'South America', 'Caribbean Islands', 'Pacific Coast', 'Andes', 'Amazon Basin'],
  'Ecuador': ['Americas', 'South America', 'Pacific Coast', 'Andes', 'Amazon Basin'],
  'Uruguay': ['Americas', 'South America', 'Atlantic Coast'],
  'Paraguay': ['Americas', 'South America'],
  'Bolivia': ['Americas', 'South America', 'Andes', 'Amazon Basin'],
  'Costa Rica': ['Americas', 'Central America', 'Pacific Coast', 'Caribbean Islands'],
  'Panama': ['Americas', 'Central America', 'Pacific Coast', 'Caribbean Islands'],
  'Guatemala': ['Americas', 'Central America', 'Pacific Coast', 'Caribbean Islands'],
  'Nicaragua': ['Americas', 'Central America', 'Pacific Coast', 'Caribbean Islands'],
  'Honduras': ['Americas', 'Central America', 'Caribbean Islands'],
  'El Salvador': ['Americas', 'Central America', 'Pacific Coast'],
  'Belize': ['Americas', 'Central America', 'Caribbean Islands'],
  
  // Caribbean
  'Jamaica': ['Americas', 'Caribbean Islands'],
  'Barbados': ['Americas', 'Caribbean Islands', 'Atlantic Coast'],
  'Bahamas': ['Americas', 'Caribbean Islands', 'Atlantic Coast'],
  'Trinidad and Tobago': ['Americas', 'Caribbean Islands', 'South America'],
  'Dominican Republic': ['Americas', 'Caribbean Islands'],
  'Antigua and Barbuda': ['Americas', 'Caribbean Islands'],
  'Saint Lucia': ['Americas', 'Caribbean Islands'],
  'Grenada': ['Americas', 'Caribbean Islands'],
  'Saint Vincent and the Grenadines': ['Americas', 'Caribbean Islands'],
  'Dominica': ['Americas', 'Caribbean Islands'],
  'Aruba': ['Americas', 'Caribbean Islands', 'South America'],
  'Curaçao': ['Americas', 'Caribbean Islands', 'South America'],
  'Bermuda': ['Americas', 'Atlantic Coast'],
  'Cayman Islands': ['Americas', 'Caribbean Islands'],
  'Turks and Caicos': ['Americas', 'Caribbean Islands'],
  'US Virgin Islands': ['Americas', 'Caribbean Islands'],
  
  // Asia
  'China': ['Asia', 'East Asia', 'Pacific Coast'],
  'Japan': ['Asia', 'East Asia', 'Pacific Coast', 'Pacific Islands'],
  'South Korea': ['Asia', 'East Asia', 'Pacific Coast'],
  'Taiwan': ['Asia', 'East Asia', 'Pacific Coast', 'Pacific Islands'],
  'India': ['Asia', 'South Asia', 'Indian Subcontinent', 'Himalayas'],
  'Nepal': ['Asia', 'South Asia', 'Indian Subcontinent', 'Himalayas'],
  'Sri Lanka': ['Asia', 'South Asia', 'Indian Subcontinent'],
  'Thailand': ['Asia', 'Southeast Asia'],
  'Vietnam': ['Asia', 'Southeast Asia', 'Pacific Coast'],
  'Cambodia': ['Asia', 'Southeast Asia'],
  'Laos': ['Asia', 'Southeast Asia'],
  'Malaysia': ['Asia', 'Southeast Asia', 'Pacific Islands'],
  'Singapore': ['Asia', 'Southeast Asia', 'Pacific Islands'],
  'Indonesia': ['Asia', 'Southeast Asia', 'Pacific Islands'],
  'Philippines': ['Asia', 'Southeast Asia', 'Pacific Islands', 'Pacific Coast'],
  'Israel': ['Asia', 'Middle East', 'Mediterranean'],
  'Jordan': ['Asia', 'Middle East'],
  'Lebanon': ['Asia', 'Middle East', 'Mediterranean'],
  'Turkey': ['Europe', 'Asia', 'Middle East', 'Mediterranean', 'Balkans'],
  'Saudi Arabia': ['Asia', 'Middle East', 'Gulf States'],
  'United Arab Emirates': ['Asia', 'Middle East', 'Gulf States'],
  'Oman': ['Asia', 'Middle East', 'Gulf States'],
  'Maldives': ['Asia', 'South Asia'],
  
  // Africa
  'Morocco': ['Africa', 'North Africa', 'Mediterranean', 'Atlantic Coast'],
  'Tunisia': ['Africa', 'North Africa', 'Mediterranean'],
  'Egypt': ['Africa', 'North Africa', 'Middle East', 'Mediterranean'],
  'Kenya': ['Africa', 'East Africa'],
  'South Africa': ['Africa', 'Southern Africa', 'Atlantic Coast'],
  'Ghana': ['Africa', 'West Africa', 'Atlantic Coast'],
  'Senegal': ['Africa', 'West Africa', 'Atlantic Coast'],
  'Rwanda': ['Africa', 'East Africa', 'Central Africa'],
  'Mauritius': ['Africa', 'Southern Africa'],
  'Seychelles': ['Africa', 'East Africa'],
  'Madagascar': ['Africa', 'Southern Africa', 'East Africa'],
  'Namibia': ['Africa', 'Southern Africa', 'Atlantic Coast'],
  'Zambia': ['Africa', 'Southern Africa', 'Central Africa'],
  'Cape Verde': ['Africa', 'West Africa', 'Atlantic Coast'],
  
  // Oceania
  'Australia': ['Oceania', 'Pacific Coast'],
  'New Zealand': ['Oceania', 'Pacific Islands', 'Pacific Coast'],
  'Fiji': ['Oceania', 'Pacific Islands'],
  'Samoa': ['Oceania', 'Pacific Islands'],
  'Tonga': ['Oceania', 'Pacific Islands'],
  'Vanuatu': ['Oceania', 'Pacific Islands'],
  'Palau': ['Oceania', 'Pacific Islands'],
  'Cook Islands': ['Oceania', 'Pacific Islands'],
  'Solomon Islands': ['Oceania', 'Pacific Islands'],
  'Papua New Guinea': ['Oceania', 'Pacific Islands'],
  'French Polynesia': ['Oceania', 'Pacific Islands'],
  'American Samoa': ['Oceania', 'Pacific Islands'],
  'Guam': ['Oceania', 'Pacific Islands']
};

// Mapping of countries to their relevant geo_regions
export const COUNTRY_GEO_REGIONS = {
  // Europe
  'Spain': ['Western Europe', 'Southern Europe', 'Mediterranean'],
  'Portugal': ['Western Europe', 'Southern Europe'],
  'France': ['Western Europe', 'Mediterranean'],
  'Italy': ['Southern Europe', 'Mediterranean'],
  'Greece': ['Southern Europe', 'Mediterranean', 'Eastern Europe'],
  'Germany': ['Western Europe', 'Central Europe', 'Northern Europe'],
  'Austria': ['Central Europe', 'Western Europe'],
  'Switzerland': ['Western Europe', 'Central Europe'],
  'Netherlands': ['Western Europe', 'Northern Europe'],
  'Belgium': ['Western Europe'],
  'Luxembourg': ['Western Europe'],
  'United Kingdom': ['Northern Europe', 'Western Europe'],
  'Ireland': ['Northern Europe', 'Western Europe'],
  'Norway': ['Northern Europe', 'Scandinavia'],
  'Sweden': ['Northern Europe', 'Scandinavia'],
  'Finland': ['Northern Europe', 'Scandinavia'],
  'Denmark': ['Northern Europe', 'Scandinavia'],
  'Iceland': ['Northern Europe', 'Scandinavia'],
  'Poland': ['Eastern Europe', 'Central Europe'],
  'Czech Republic': ['Eastern Europe', 'Central Europe'],
  'Slovakia': ['Eastern Europe', 'Central Europe'],
  'Hungary': ['Eastern Europe', 'Central Europe'],
  'Romania': ['Eastern Europe'],
  'Bulgaria': ['Eastern Europe', 'Southern Europe'],
  'Croatia': ['Southern Europe', 'Eastern Europe', 'Mediterranean'],
  'Slovenia': ['Southern Europe', 'Central Europe'],
  'Serbia': ['Eastern Europe', 'Southern Europe'],
  'Bosnia and Herzegovina': ['Eastern Europe', 'Southern Europe'],
  'Montenegro': ['Eastern Europe', 'Southern Europe', 'Mediterranean'],
  'Albania': ['Eastern Europe', 'Southern Europe', 'Mediterranean'],
  'Estonia': ['Northern Europe', 'Eastern Europe'],
  'Latvia': ['Northern Europe', 'Eastern Europe'],
  'Lithuania': ['Northern Europe', 'Eastern Europe'],
  'Malta': ['Southern Europe', 'Mediterranean'],
  'Cyprus': ['Mediterranean', 'Middle East'],
  
  // Americas
  'United States': ['North America'],
  'Canada': ['North America'],
  'Mexico': ['North America', 'Central America'],
  'Brazil': ['South America'],
  'Argentina': ['South America'],
  'Chile': ['South America'],
  'Peru': ['South America'],
  'Colombia': ['South America'],
  'Ecuador': ['South America'],
  'Uruguay': ['South America'],
  'Paraguay': ['South America'],
  'Bolivia': ['South America'],
  'Costa Rica': ['Central America'],
  'Panama': ['Central America'],
  'Guatemala': ['Central America'],
  'Nicaragua': ['Central America'],
  'Honduras': ['Central America'],
  'El Salvador': ['Central America'],
  'Belize': ['Central America', 'Caribbean'],
  
  // Caribbean
  'Jamaica': ['Caribbean'],
  'Barbados': ['Caribbean'],
  'Bahamas': ['Caribbean'],
  'Trinidad and Tobago': ['Caribbean', 'South America'],
  'Dominican Republic': ['Caribbean'],
  'Antigua and Barbuda': ['Caribbean'],
  'Saint Lucia': ['Caribbean'],
  'Grenada': ['Caribbean'],
  'Saint Vincent and the Grenadines': ['Caribbean'],
  'Dominica': ['Caribbean'],
  'Aruba': ['Caribbean', 'South America'],
  'Curaçao': ['Caribbean', 'South America'],
  'Bermuda': ['North America'],
  'Cayman Islands': ['Caribbean'],
  'Turks and Caicos': ['Caribbean'],
  'US Virgin Islands': ['Caribbean'],
  
  // Asia
  'China': ['East Asia'],
  'Japan': ['East Asia'],
  'South Korea': ['East Asia'],
  'Taiwan': ['East Asia'],
  'India': ['South Asia'],
  'Nepal': ['South Asia'],
  'Sri Lanka': ['South Asia'],
  'Thailand': ['Southeast Asia'],
  'Vietnam': ['Southeast Asia'],
  'Cambodia': ['Southeast Asia'],
  'Laos': ['Southeast Asia'],
  'Malaysia': ['Southeast Asia'],
  'Singapore': ['Southeast Asia'],
  'Indonesia': ['Southeast Asia', 'Oceania'],
  'Philippines': ['Southeast Asia'],
  'Israel': ['Middle East', 'Mediterranean'],
  'Jordan': ['Middle East'],
  'Lebanon': ['Middle East', 'Mediterranean'],
  'Turkey': ['Middle East', 'Mediterranean', 'Eastern Europe'],
  'Saudi Arabia': ['Middle East'],
  'United Arab Emirates': ['Middle East'],
  'Oman': ['Middle East'],
  'Maldives': ['South Asia', 'Indian Ocean'],
  
  // Africa
  'Morocco': ['North Africa', 'Mediterranean'],
  'Tunisia': ['North Africa', 'Mediterranean'],
  'Egypt': ['North Africa', 'Middle East'],
  'Kenya': ['East Africa'],
  'South Africa': ['Southern Africa'],
  'Ghana': ['West Africa'],
  'Senegal': ['West Africa'],
  'Rwanda': ['East Africa'],
  'Mauritius': ['Southern Africa', 'Indian Ocean'],
  'Seychelles': ['East Africa', 'Indian Ocean'],
  'Madagascar': ['Southern Africa', 'East Africa'],
  'Namibia': ['Southern Africa'],
  'Zambia': ['Southern Africa'],
  'Cape Verde': ['West Africa'],
  
  // Oceania
  'Australia': ['Oceania'],
  'New Zealand': ['Oceania', 'Pacific Islands'],
  'Fiji': ['Oceania', 'Pacific Islands'],
  'Samoa': ['Oceania', 'Pacific Islands'],
  'Tonga': ['Oceania', 'Pacific Islands'],
  'Vanuatu': ['Oceania', 'Pacific Islands'],
  'Palau': ['Oceania', 'Pacific Islands'],
  'Cook Islands': ['Oceania', 'Pacific Islands'],
  'Solomon Islands': ['Oceania', 'Pacific Islands'],
  'Papua New Guinea': ['Oceania', 'Pacific Islands'],
  'French Polynesia': ['Oceania', 'Pacific Islands'],
  'American Samoa': ['Oceania', 'Pacific Islands'],
  'Guam': ['Oceania', 'Pacific Islands']
};

// Function to get relevant regions for a country
export function getRelevantRegions(country) {
  return COUNTRY_REGIONS[country] || [];
}

// Function to get relevant geo_regions for a country
export function getRelevantGeoRegions(country) {
  return COUNTRY_GEO_REGIONS[country] || [];
}

// Function to check if a region is relevant for a country
export function isRegionRelevant(region, country) {
  const relevant = getRelevantRegions(country);
  return relevant.includes(region);
}

// Function to check if a geo_region is relevant for a country
export function isGeoRegionRelevant(geoRegion, country) {
  const relevant = getRelevantGeoRegions(country);
  return relevant.includes(geoRegion);
}

// Get all regions sorted with relevant ones first
export function getSortedRegions(country, allRegions) {
  const relevant = getRelevantRegions(country);
  const other = allRegions.filter(region => !relevant.includes(region));
  
  return {
    relevant: relevant.filter(r => allRegions.includes(r)), // Only include regions that exist in the full list
    other,
    all: [...relevant.filter(r => allRegions.includes(r)), ...other]
  };
}

// Get all geo_regions sorted with relevant ones first
export function getSortedGeoRegions(country, allGeoRegions) {
  const relevant = getRelevantGeoRegions(country);
  const other = allGeoRegions.filter(region => !relevant.includes(region));
  
  return {
    relevant: relevant.filter(r => allGeoRegions.includes(r)), // Only include regions that exist in the full list
    other,
    all: [...relevant.filter(r => allGeoRegions.includes(r)), ...other]
  };
}