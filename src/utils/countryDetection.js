// Utility to detect country from hometown string
export function detectCountryFromHometown(hometown) {
  if (!hometown || typeof hometown !== 'string') {
    return null;
  }

  // Clean the input - trim and convert to lowercase
  const cleaned = hometown.trim().toLowerCase();
  
  if (!cleaned) {
    return null;
  }

  // Common country mappings - both full names and abbreviations
  const countryMappings = {
    // United States variations
    'usa': 'usa',
    'us': 'usa',
    'united states': 'usa',
    'united states of america': 'usa',
    'america': 'usa',
    
    // United Kingdom variations
    'uk': 'uk',
    'united kingdom': 'uk',
    'great britain': 'uk',
    'gb': 'uk',
    'england': 'uk',
    'scotland': 'uk',
    'wales': 'uk',
    'northern ireland': 'uk',
    
    // France
    'france': 'france',
    'fr': 'france',
    
    // Germany
    'germany': 'germany',
    'de': 'germany',
    'deutschland': 'germany',
    
    // Spain
    'spain': 'spain',
    'es': 'spain',
    'españa': 'spain',
    
    // Italy
    'italy': 'italy',
    'it': 'italy',
    'italia': 'italy',
    
    // Canada
    'canada': 'canada',
    'ca': 'canada',
    
    // Australia
    'australia': 'australia',
    'au': 'australia',
    
    // Japan
    'japan': 'japan',
    'jp': 'japan',
    
    // China
    'china': 'china',
    'cn': 'china',
    
    // India
    'india': 'india',
    'in': 'india',
    
    // Brazil
    'brazil': 'brazil',
    'br': 'brazil',
    'brasil': 'brazil',
    
    // Mexico
    'mexico': 'mexico',
    'mx': 'mexico',
    'méxico': 'mexico',
    
    // Russia
    'russia': 'russia',
    'ru': 'russia',
    
    // South Korea
    'south korea': 'south korea',
    'korea': 'south korea',
    'kr': 'south korea',
    
    // Netherlands
    'netherlands': 'netherlands',
    'nl': 'netherlands',
    'holland': 'netherlands',
    
    // Belgium
    'belgium': 'belgium',
    'be': 'belgium',
    
    // Switzerland
    'switzerland': 'switzerland',
    'ch': 'switzerland',
    
    // Austria
    'austria': 'austria',
    'at': 'austria',
    
    // Sweden
    'sweden': 'sweden',
    'se': 'sweden',
    
    // Norway
    'norway': 'norway',
    'no': 'norway',
    
    // Denmark
    'denmark': 'denmark',
    'dk': 'denmark',
    
    // Finland
    'finland': 'finland',
    'fi': 'finland',
    
    // Poland
    'poland': 'poland',
    'pl': 'poland',
    
    // Portugal
    'portugal': 'portugal',
    'pt': 'portugal',
    
    // Greece
    'greece': 'greece',
    'gr': 'greece',
    
    // New Zealand
    'new zealand': 'new zealand',
    'nz': 'new zealand',
    
    // Argentina
    'argentina': 'argentina',
    'ar': 'argentina',
    
    // Chile
    'chile': 'chile',
    'cl': 'chile',
    
    // South Africa
    'south africa': 'south africa',
    'za': 'south africa',
    
    // United Arab Emirates
    'uae': 'uae',
    'united arab emirates': 'uae',
    'dubai': 'uae',
    'abu dhabi': 'uae',
    
    // Ireland
    'ireland': 'ireland',
    'ie': 'ireland',
    
    // Czech Republic
    'czech republic': 'czech republic',
    'czechia': 'czech republic',
    'cz': 'czech republic',
    
    // Turkey
    'turkey': 'turkey',
    'türkiye': 'turkey',
    'tr': 'turkey',
    
    // Israel
    'israel': 'israel',
    'il': 'israel',
    
    // Singapore
    'singapore': 'singapore',
    'sg': 'singapore',
    
    // Malaysia
    'malaysia': 'malaysia',
    'my': 'malaysia',
    
    // Thailand
    'thailand': 'thailand',
    'th': 'thailand',
    
    // Philippines
    'philippines': 'philippines',
    'ph': 'philippines',
    
    // Indonesia
    'indonesia': 'indonesia',
    'id': 'indonesia',
    
    // Vietnam
    'vietnam': 'vietnam',
    'vn': 'vietnam',
  };

  // US state abbreviations that indicate USA
  const usStateAbbreviations = [
    'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga',
    'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md',
    'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj',
    'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc',
    'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy', 'dc'
  ];

  // Split by comma and analyze parts
  const parts = cleaned.split(',').map(part => part.trim());
  
  // Check from right to left (country is usually last)
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    
    // FIRST: Check if it's a US state abbreviation (exact match)
    // This needs to be checked before country codes to avoid conflicts
    if (part.length === 2 && usStateAbbreviations.includes(part)) {
      return 'usa';
    }
    
    // SECOND: Direct country match (exact match)
    if (countryMappings[part]) {
      return countryMappings[part];
    }
    
    // THIRD: For longer potential country names, check for word boundaries
    // This prevents "in" from matching in "Berlin"
    for (const [key, value] of Object.entries(countryMappings)) {
      // Skip very short abbreviations when doing partial matches
      if (key.length <= 2) continue;
      
      // Check if the key appears as a whole word
      const regex = new RegExp(`\\b${key}\\b`, 'i');
      if (regex.test(part)) {
        return value;
      }
    }
  }
  
  // No country detected
  return null;
}

// Convert country to nationality format used in the database
export function countryToNationality(country) {
  if (!country) return null;
  
  // For now, most countries can use their name as nationality
  // But you might want to expand this mapping in the future
  const nationalityMappings = {
    'uk': 'british',
    'netherlands': 'dutch',
    'new zealand': 'new zealander',
    'south africa': 'south african',
    'south korea': 'south korean',
  };
  
  return nationalityMappings[country] || country;
}