// Water body mappings by geographic region
// This provides intelligent filtering of water bodies based on location

export const WATER_BODY_REGIONS = {
  // Major oceans and their adjacent regions
  'Atlantic Ocean': [
    'Western Europe', 'Eastern Europe', 'Northern Europe', 'Southern Europe',
    'North America', 'South America', 'Central America', 'Caribbean',
    'West Africa', 'North Africa', 'Southern Africa',
    'Scandinavia', 'British Isles', 'Iberian Peninsula'
  ],
  
  'Pacific Ocean': [
    'East Asia', 'Southeast Asia', 'Oceania', 'Pacific Islands',
    'North America', 'South America', 'Central America'
  ],
  
  'Indian Ocean': [
    'South Asia', 'Southeast Asia', 'East Africa', 'Southern Africa',
    'Middle East', 'Indian Ocean', 'Australia'
  ],
  
  'Arctic Ocean': [
    'Scandinavia', 'Northern Europe', 'North America'
  ],
  
  'Southern Ocean': [
    'Southern Africa', 'South America', 'Oceania'
  ],
  
  // Seas and their regions
  'Mediterranean Sea': [
    'Southern Europe', 'Mediterranean', 'North Africa', 'Middle East',
    'Iberian Peninsula', 'Balkans'
  ],
  
  'Caribbean Sea': [
    'Caribbean', 'Central America', 'South America', 'North America'
  ],
  
  'Baltic Sea': [
    'Northern Europe', 'Scandinavia', 'Eastern Europe', 'Baltic'
  ],
  
  'North Sea': [
    'Northern Europe', 'Western Europe', 'Scandinavia', 'British Isles'
  ],
  
  'Black Sea': [
    'Eastern Europe', 'Balkans', 'Middle East'
  ],
  
  'Red Sea': [
    'Middle East', 'North Africa', 'East Africa'
  ],
  
  'Arabian Sea': [
    'Middle East', 'South Asia', 'Gulf States'
  ],
  
  'South China Sea': [
    'Southeast Asia', 'East Asia'
  ],
  
  'East China Sea': [
    'East Asia'
  ],
  
  'Coral Sea': [
    'Oceania', 'Pacific Islands'
  ],
  
  'Tasman Sea': [
    'Oceania'
  ],
  
  'Adriatic Sea': [
    'Southern Europe', 'Mediterranean', 'Balkans'
  ],
  
  'Aegean Sea': [
    'Southern Europe', 'Mediterranean', 'Balkans'
  ],
  
  'Andaman Sea': [
    'Southeast Asia', 'South Asia'
  ],
  
  'Arabian Gulf': [
    'Middle East', 'Gulf States'
  ],
  
  'Bay of Bengal': [
    'South Asia', 'Southeast Asia'
  ],
  
  'Bay of Biscay': [
    'Western Europe', 'Iberian Peninsula'
  ],
  
  'Gulf of Mexico': [
    'North America', 'Central America', 'Caribbean'
  ],
  
  'Gulf of Thailand': [
    'Southeast Asia'
  ],
  
  'English Channel': [
    'Western Europe', 'British Isles'
  ],
  
  'Irish Sea': [
    'British Isles', 'Western Europe'
  ],
  
  'Java Sea': [
    'Southeast Asia'
  ],
  
  'Sea of Japan': [
    'East Asia'
  ],
  
  'Yellow Sea': [
    'East Asia'
  ],
  
  // Major rivers by region
  'Amazon River': ['South America'],
  'Danube River': ['Eastern Europe', 'Central Europe', 'Balkans'],
  'Rhine River': ['Western Europe', 'Central Europe'],
  'Thames River': ['British Isles'],
  'Seine River': ['Western Europe'],
  
  // Major lakes by region
  'Lake Geneva': ['Western Europe', 'Alpine'],
  'Lake Como': ['Southern Europe', 'Alpine'],
  'Lake Garda': ['Southern Europe', 'Alpine'],
  'Lake Constance': ['Western Europe', 'Central Europe', 'Alpine'],
  'Lake Balaton': ['Eastern Europe', 'Central Europe']
};

// Direct country to water bodies mappings (more accurate)
export const COUNTRY_WATER_BODIES = {
  // Europe - Mediterranean Countries
  'Spain': ['Atlantic Ocean', 'Mediterranean Sea', 'Bay of Biscay'],
  'Portugal': ['Atlantic Ocean'],
  'France': ['Atlantic Ocean', 'Mediterranean Sea', 'Bay of Biscay', 'English Channel', 'Rhine River', 'Seine River'],
  'Italy': ['Mediterranean Sea', 'Adriatic Sea', 'Tyrrhenian Sea', 'Lake Como', 'Lake Garda'],
  'Greece': ['Mediterranean Sea', 'Aegean Sea', 'Ionian Sea'],
  'Croatia': ['Adriatic Sea'],
  'Slovenia': ['Adriatic Sea'],
  'Albania': ['Adriatic Sea', 'Ionian Sea'],
  'Montenegro': ['Adriatic Sea'],
  'Malta': ['Mediterranean Sea'],
  'Cyprus': ['Mediterranean Sea'],
  
  // Europe - Atlantic Countries  
  'United Kingdom': ['Atlantic Ocean', 'North Sea', 'English Channel', 'Irish Sea', 'Thames River'],
  'Ireland': ['Atlantic Ocean', 'Irish Sea'],
  'Iceland': ['Atlantic Ocean', 'Arctic Ocean'],
  'Norway': ['Atlantic Ocean', 'North Sea', 'Arctic Ocean'],
  
  // Europe - Baltic/North Sea Countries
  'Germany': ['North Sea', 'Baltic Sea', 'Rhine River', 'Danube River'],
  'Netherlands': ['North Sea', 'Rhine River'],
  'Belgium': ['North Sea'],
  'Denmark': ['North Sea', 'Baltic Sea'],
  'Sweden': ['Baltic Sea', 'North Sea'],
  'Finland': ['Baltic Sea'],
  'Poland': ['Baltic Sea'],
  'Estonia': ['Baltic Sea'],
  'Latvia': ['Baltic Sea'],
  'Lithuania': ['Baltic Sea'],
  
  // Europe - Danube Countries
  'Austria': ['Danube River', 'Lake Constance'],
  'Hungary': ['Danube River', 'Lake Balaton'],
  'Romania': ['Black Sea', 'Danube River'],
  'Bulgaria': ['Black Sea', 'Danube River'],
  'Serbia': ['Danube River'],
  'Slovakia': ['Danube River'],
  
  // Europe - Landlocked
  'Czech Republic': [],
  'Switzerland': ['Rhine River', 'Lake Geneva', 'Lake Constance'],
  'Luxembourg': [],
  'Bosnia and Herzegovina': [],
  
  // Americas
  'United States': ['Atlantic Ocean', 'Pacific Ocean', 'Gulf of Mexico'],
  'Canada': ['Atlantic Ocean', 'Pacific Ocean', 'Arctic Ocean'],
  'Mexico': ['Pacific Ocean', 'Gulf of Mexico', 'Caribbean Sea'],
  'Brazil': ['Atlantic Ocean', 'Amazon River'],
  'Argentina': ['Atlantic Ocean', 'Southern Ocean'],
  'Chile': ['Pacific Ocean', 'Southern Ocean'],
  'Peru': ['Pacific Ocean'],
  'Colombia': ['Pacific Ocean', 'Caribbean Sea'],
  'Ecuador': ['Pacific Ocean'],
  'Uruguay': ['Atlantic Ocean'],
  'Paraguay': [],  // Landlocked
  'Bolivia': [],  // Landlocked
  'Costa Rica': ['Pacific Ocean', 'Caribbean Sea'],
  'Panama': ['Pacific Ocean', 'Caribbean Sea'],
  'Guatemala': ['Pacific Ocean', 'Caribbean Sea'],
  'Nicaragua': ['Pacific Ocean', 'Caribbean Sea'],
  'Honduras': ['Caribbean Sea'],
  'El Salvador': ['Pacific Ocean'],
  'Belize': ['Caribbean Sea'],
  'Jamaica': ['Caribbean Sea'],
  'Barbados': ['Atlantic Ocean', 'Caribbean Sea'],
  'Bahamas': ['Atlantic Ocean'],
  'Trinidad and Tobago': ['Atlantic Ocean', 'Caribbean Sea'],
  'Dominican Republic': ['Atlantic Ocean', 'Caribbean Sea'],
  'Antigua and Barbuda': ['Atlantic Ocean', 'Caribbean Sea'],
  'Saint Lucia': ['Atlantic Ocean', 'Caribbean Sea'],
  'Grenada': ['Atlantic Ocean', 'Caribbean Sea'],
  'Saint Vincent and the Grenadines': ['Atlantic Ocean', 'Caribbean Sea'],
  'Dominica': ['Atlantic Ocean', 'Caribbean Sea'],
  'Aruba': ['Caribbean Sea'],
  'Curaçao': ['Caribbean Sea'],
  'Bermuda': ['Atlantic Ocean'],
  'Cayman Islands': ['Caribbean Sea'],
  'Turks and Caicos': ['Atlantic Ocean'],
  'US Virgin Islands': ['Atlantic Ocean', 'Caribbean Sea'],
  
  // Asia
  'China': ['Pacific Ocean', 'East China Sea', 'South China Sea', 'Yellow Sea'],
  'Japan': ['Pacific Ocean', 'Sea of Japan', 'East China Sea'],
  'South Korea': ['Yellow Sea', 'Sea of Japan', 'East China Sea'],
  'Taiwan': ['Pacific Ocean', 'East China Sea', 'South China Sea'],
  'India': ['Indian Ocean', 'Arabian Sea', 'Bay of Bengal'],
  'Nepal': [],  // Landlocked
  'Sri Lanka': ['Indian Ocean'],
  'Thailand': ['Andaman Sea', 'Gulf of Thailand'],
  'Vietnam': ['South China Sea'],
  'Cambodia': ['Gulf of Thailand'],
  'Laos': [],  // Landlocked
  'Malaysia': ['South China Sea', 'Andaman Sea'],
  'Singapore': ['South China Sea'],
  'Indonesia': ['Indian Ocean', 'Pacific Ocean', 'South China Sea', 'Java Sea'],
  'Philippines': ['Pacific Ocean', 'South China Sea'],
  'Israel': ['Mediterranean Sea', 'Red Sea'],
  'Jordan': ['Red Sea'],
  'Lebanon': ['Mediterranean Sea'],
  'Turkey': ['Mediterranean Sea', 'Black Sea', 'Aegean Sea'],
  'Saudi Arabia': ['Red Sea', 'Arabian Gulf'],
  'United Arab Emirates': ['Arabian Gulf'],
  'Oman': ['Arabian Sea', 'Arabian Gulf'],
  'Maldives': ['Indian Ocean'],
  
  // Africa
  'Morocco': ['Atlantic Ocean', 'Mediterranean Sea'],
  'Tunisia': ['Mediterranean Sea'],
  'Egypt': ['Mediterranean Sea', 'Red Sea'],
  'Kenya': ['Indian Ocean'],
  'South Africa': ['Atlantic Ocean', 'Indian Ocean', 'Southern Ocean'],
  'Ghana': ['Atlantic Ocean'],
  'Senegal': ['Atlantic Ocean'],
  'Rwanda': [],  // Landlocked
  'Mauritius': ['Indian Ocean'],
  'Seychelles': ['Indian Ocean'],
  'Madagascar': ['Indian Ocean'],
  'Namibia': ['Atlantic Ocean'],
  'Zambia': [],  // Landlocked
  'Cape Verde': ['Atlantic Ocean'],
  
  // Oceania
  'Australia': ['Pacific Ocean', 'Indian Ocean', 'Southern Ocean', 'Coral Sea', 'Tasman Sea'],
  'New Zealand': ['Pacific Ocean', 'Tasman Sea', 'Southern Ocean'],
  'Fiji': ['Pacific Ocean', 'Coral Sea'],
  'Samoa': ['Pacific Ocean'],
  'Tonga': ['Pacific Ocean'],
  'Vanuatu': ['Pacific Ocean', 'Coral Sea'],
  'Palau': ['Pacific Ocean'],
  'Cook Islands': ['Pacific Ocean'],
  'Solomon Islands': ['Pacific Ocean', 'Coral Sea'],
  'Papua New Guinea': ['Pacific Ocean', 'Coral Sea'],
  'French Polynesia': ['Pacific Ocean'],
  'American Samoa': ['Pacific Ocean'],
  'Guam': ['Pacific Ocean']
};

// Function to get relevant water bodies for a town
export function getRelevantWaterBodies(country, geoRegion) {
  // Use direct country mappings if available
  const directMappings = COUNTRY_WATER_BODIES[country];
  
  if (directMappings) {
    return directMappings;
  }
  
  // Fallback: If country not in our mappings, return empty array
  // (all water bodies will appear in "Other" section)
  console.warn(`No water body mappings found for country: ${country}`);
  return [];
}

// Function to check if a water body is relevant for a location
export function isWaterBodyRelevant(waterBody, country, geoRegion) {
  const relevant = getRelevantWaterBodies(country, geoRegion);
  return relevant.includes(waterBody);
}

// Get all water bodies sorted with relevant ones first
export function getSortedWaterBodies(country, geoRegion) {
  const relevant = getRelevantWaterBodies(country, geoRegion);
  const allBodies = Object.keys(WATER_BODY_REGIONS);
  
  // Separate relevant and other bodies
  const other = allBodies.filter(body => !relevant.includes(body));
  
  return {
    relevant,
    other,
    all: [...relevant, ...other]
  };
}