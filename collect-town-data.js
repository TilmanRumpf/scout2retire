import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function collectTownData() {
  console.log('Starting town data collection...');
  
  // First, let's see what we're working with
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, name, country, cost_index, primary_language, data_completeness_score')
    .order('data_completeness_score', { ascending: true })
    .limit(100);

  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }

  console.log(`Found ${towns.length} towns to process`);
  
  // Process each town
  for (const town of towns) {
    console.log(`\nProcessing ${town.name}, ${town.country}...`);
    
    try {
      const updates = await enhanceTownData(town);
      
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('towns')
          .update(updates)
          .eq('id', town.id);
          
        if (updateError) {
          console.error(`Failed to update ${town.name}:`, updateError);
        } else {
          console.log(`✓ Updated ${town.name} with ${Object.keys(updates).length} fields`);
        }
      }
    } catch (err) {
      console.error(`Error processing ${town.name}:`, err);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\nData collection complete!');
}

async function enhanceTownData(town) {
  const updates = {};
  
  // Add language based on country
  if (!town.primary_language) {
    updates.primary_language = getLanguageByCountry(town.country);
  }
  
  // Add visa data based on country
  if (!town.visa_on_arrival_countries) {
    updates.visa_on_arrival_countries = getVisaDataByCountry(town.country);
  }
  
  // Add geographic features (this would normally use a geo API)
  updates.geographic_features = inferGeographicFeatures(town);
  
  // Add basic tax data
  updates.income_tax_rate_pct = getTaxRateByCountry(town.country);
  
  // Calculate completeness
  updates.data_completeness_score = calculateCompleteness({ ...town, ...updates });
  updates.last_verified_date = new Date().toISOString();
  updates.data_sources = ['initial_import', 'basic_inference'];
  
  return updates;
}

function getLanguageByCountry(country) {
  const languages = {
    'Portugal': 'Portuguese',
    'Spain': 'Spanish',
    'Mexico': 'Spanish',
    'France': 'French',
    'Italy': 'Italian',
    'Germany': 'German',
    'Netherlands': 'Dutch',
    'Greece': 'Greek',
    'Thailand': 'Thai',
    'Vietnam': 'Vietnamese',
    'Malaysia': 'Malay',
    'Indonesia': 'Indonesian',
    'Philippines': 'Filipino',
    'Japan': 'Japanese',
    'South Korea': 'Korean',
    'Turkey': 'Turkish',
    'Croatia': 'Croatian',
    'Czech Republic': 'Czech',
    'Poland': 'Polish',
    'Hungary': 'Hungarian',
    'Romania': 'Romanian',
    'Bulgaria': 'Bulgarian',
    'Estonia': 'Estonian',
    'Latvia': 'Latvian',
    'Lithuania': 'Lithuanian',
    'Slovenia': 'Slovenian',
    'Slovakia': 'Slovak',
    'Malta': 'Maltese',
    'Cyprus': 'Greek',
    'Argentina': 'Spanish',
    'Chile': 'Spanish',
    'Colombia': 'Spanish',
    'Peru': 'Spanish',
    'Ecuador': 'Spanish',
    'Uruguay': 'Spanish',
    'Brazil': 'Portuguese',
    'Costa Rica': 'Spanish',
    'Panama': 'Spanish',
    'Dominican Republic': 'Spanish',
    'Belize': 'English',
    'Canada': 'English',
    'United States': 'English',
    'United Kingdom': 'English',
    'Ireland': 'English',
    'Australia': 'English',
    'New Zealand': 'English'
  };
  
  return languages[country] || 'Unknown';
}

function getVisaDataByCountry(country) {
  // EU countries
  const euCountries = [
    'Portugal', 'Spain', 'France', 'Italy', 'Germany', 'Netherlands',
    'Greece', 'Croatia', 'Czech Republic', 'Poland', 'Hungary',
    'Romania', 'Bulgaria', 'Estonia', 'Latvia', 'Lithuania',
    'Slovenia', 'Slovakia', 'Malta', 'Cyprus', 'Ireland'
  ];
  
  if (euCountries.includes(country)) {
    // EU countries typically allow visa-free access from these countries
    return ['US', 'CA', 'UK', 'AU', 'NZ', 'JP', 'KR', 'SG', 'IL'];
  }
  
  // Other patterns
  const visaPatterns = {
    'Mexico': ['US', 'CA', 'EU', 'UK', 'JP', 'AU'],
    'Thailand': ['US', 'CA', 'UK', 'AU', 'EU', 'JP', 'KR'],
    'Malaysia': ['US', 'CA', 'UK', 'AU', 'EU', 'JP', 'SG'],
    'Turkey': ['US', 'CA', 'UK', 'AU', 'EU', 'JP', 'KR'],
    'Brazil': ['US', 'CA', 'UK', 'AU', 'EU', 'JP'],
    'Argentina': ['US', 'CA', 'UK', 'AU', 'EU', 'JP'],
    'Costa Rica': ['US', 'CA', 'UK', 'AU', 'EU', 'JP']
  };
  
  return visaPatterns[country] || ['US', 'UK'];
}

function getTaxRateByCountry(country) {
  const taxRates = {
    'Portugal': 28,
    'Spain': 24,
    'France': 30,
    'Italy': 23,
    'Germany': 26,
    'Greece': 22,
    'Mexico': 30,
    'Thailand': 35,
    'Malaysia': 28,
    'Turkey': 35,
    'Croatia': 24,
    'Czech Republic': 15,
    'Poland': 19,
    'Hungary': 15,
    'Romania': 10,
    'Bulgaria': 10,
    'Estonia': 20,
    'Malta': 35,
    'Cyprus': 35,
    'Costa Rica': 30,
    'Panama': 25,
    'Brazil': 27.5,
    'Argentina': 35,
    'Chile': 25,
    'Colombia': 33,
    'United States': 24,
    'Canada': 26,
    'United Kingdom': 20,
    'Australia': 32.5,
    'New Zealand': 28,
    'Ireland': 20
  };
  
  return taxRates[country] || 25;
}

function inferGeographicFeatures(town) {
  const features = [];
  
  // Coastal countries/cities (this is simplified - normally use geo data)
  const coastalPlaces = [
    'Porto', 'Lisbon', 'Barcelona', 'Valencia', 'Nice', 'Athens',
    'Split', 'Dubrovnik', 'Antalya', 'Phuket', 'Penang', 'Bali',
    'Canggu', 'Da Nang', 'Nha Trang', 'Playa del Carmen', 'Tulum',
    'Tamarindo', 'Bocas del Toro', 'Cartagena', 'Florianopolis',
    'Mar del Plata', 'Viña del Mar', 'Gold Coast', 'Auckland'
  ];
  
  if (coastalPlaces.includes(town.name)) {
    features.push('coastal');
  }
  
  // Mountain regions (simplified)
  const mountainPlaces = [
    'Chiang Mai', 'Cusco', 'Quito', 'La Paz', 'Kathmandu',
    'Interlaken', 'Innsbruck', 'Zakopane', 'Brasov', 'Sofia'
  ];
  
  if (mountainPlaces.includes(town.name)) {
    features.push('mountain');
  }
  
  // Island locations
  const islandPlaces = [
    'Bali', 'Canggu', 'Phuket', 'Koh Samui', 'Penang',
    'Malta', 'Valletta', 'Funchal', 'Las Palmas', 'Tenerife'
  ];
  
  if (islandPlaces.includes(town.name)) {
    features.push('island');
  }
  
  return features.length > 0 ? features : ['inland'];
}

function calculateCompleteness(town) {
  const fields = [
    'name', 'country', 'cost_index', 'climate', 'healthcare_score',
    'safety_score', 'primary_language', 'visa_on_arrival_countries',
    'geographic_features', 'income_tax_rate_pct', 'description',
    'population', 'internet_speed', 'public_transport_quality'
  ];
  
  let filledFields = 0;
  
  for (const field of fields) {
    if (town[field] !== null && town[field] !== undefined) {
      if (Array.isArray(town[field]) && town[field].length > 0) {
        filledFields++;
      } else if (!Array.isArray(town[field])) {
        filledFields++;
      }
    }
  }
  
  return Math.round((filledFields / fields.length) * 100);
}

// Run the collection
collectTownData().catch(console.error);