import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Organizations and alliances
const NATO_COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Luxembourg', 'Norway', 'Denmark', 'Iceland', 'Greece', 'Turkey', 'Poland', 'Czech Republic', 'Hungary', 'Estonia', 'Latvia', 'Lithuania', 'Slovenia', 'Slovakia', 'Bulgaria', 'Romania', 'Albania', 'Croatia', 'Montenegro'];

const EU_COUNTRIES = ['France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Luxembourg', 'Austria', 'Greece', 'Finland', 'Sweden', 'Denmark', 'Ireland', 'Poland', 'Czech Republic', 'Hungary', 'Estonia', 'Latvia', 'Lithuania', 'Slovenia', 'Slovakia', 'Bulgaria', 'Romania', 'Croatia', 'Cyprus', 'Malta'];

const SCHENGEN_COUNTRIES = ['Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Croatia'];

const COMMONWEALTH_COUNTRIES = ['United Kingdom', 'Canada', 'Australia', 'New Zealand', 'India', 'South Africa', 'Malaysia', 'Singapore', 'Cyprus', 'Malta', 'Barbados', 'Bahamas', 'Grenada', 'Mauritius', 'Seychelles', 'Fiji', 'Samoa'];

const ASEAN_COUNTRIES = ['Thailand', 'Vietnam', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Cambodia', 'Laos', 'Myanmar', 'Brunei'];

const MERCOSUR_COUNTRIES = ['Argentina', 'Brazil', 'Paraguay', 'Uruguay'];

// Geographic and climate zones
const GEOGRAPHIC_TAGS = {
  // Mountain ranges
  'Alps': ['Switzerland', 'Austria', 'France', 'Italy', 'Germany', 'Slovenia'],
  'Rockies': ['United States', 'Canada'], // specific states/provinces
  'Andes': ['Argentina', 'Chile', 'Peru', 'Ecuador', 'Colombia', 'Bolivia'],
  'Himalayas': ['Nepal', 'India', 'Bhutan'],
  'Pyrenees': ['Spain', 'France', 'Andorra'],
  
  // Major rivers
  'Amazon Basin': ['Brazil', 'Peru', 'Colombia', 'Ecuador'],
  'Rhine Valley': ['Germany', 'Netherlands', 'Switzerland', 'France'],
  'Danube Region': ['Germany', 'Austria', 'Hungary', 'Romania', 'Bulgaria'],
  'Mekong Delta': ['Vietnam', 'Cambodia', 'Laos', 'Thailand'],
  'Ganges Basin': ['India', 'Bangladesh'],
  
  // Climate zones
  'Tropical': ['Thailand', 'Malaysia', 'Singapore', 'Philippines', 'Indonesia', 'Vietnam', 'Cambodia', 'Costa Rica', 'Panama', 'Colombia', 'Ecuador', 'Brazil'],
  'Mediterranean Climate': ['Spain', 'Italy', 'Greece', 'Portugal', 'France', 'Croatia', 'Turkey', 'Cyprus', 'Malta'],
  'Desert': ['Egypt', 'United Arab Emirates', 'Saudi Arabia', 'Jordan'],
  'Subtropical': ['United States', 'Argentina', 'Uruguay', 'South Africa', 'Australia'],
  'Temperate': ['United Kingdom', 'Germany', 'Netherlands', 'Belgium', 'Czech Republic', 'Poland'],
  'Nordic': ['Norway', 'Sweden', 'Finland', 'Denmark', 'Iceland'],
  
  // Economic zones
  'G7': ['United States', 'Canada', 'United Kingdom', 'France', 'Germany', 'Italy', 'Japan'],
  'G20': ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'United Kingdom', 'France', 'Germany', 'Italy', 'Turkey', 'South Africa', 'Saudi Arabia', 'India', 'China', 'Japan', 'South Korea', 'Indonesia', 'Australia'],
  'OECD': ['United States', 'Canada', 'Mexico', 'United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Luxembourg', 'Austria', 'Switzerland', 'Greece', 'Turkey', 'Poland', 'Czech Republic', 'Hungary', 'Estonia', 'Latvia', 'Lithuania', 'Slovenia', 'Slovakia', 'Finland', 'Sweden', 'Denmark', 'Norway', 'Iceland', 'Ireland', 'Australia', 'New Zealand', 'Japan', 'South Korea', 'Chile', 'Colombia', 'Costa Rica'],
  
  // Cultural regions
  'Latin America': ['Mexico', 'Guatemala', 'Costa Rica', 'Panama', 'Colombia', 'Venezuela', 'Ecuador', 'Peru', 'Brazil', 'Bolivia', 'Paraguay', 'Uruguay', 'Argentina', 'Chile'],
  'Anglo-America': ['United States', 'Canada'],
  'Iberian Peninsula': ['Spain', 'Portugal'],
  'Scandinavia': ['Norway', 'Sweden', 'Denmark'],
  'Balkans': ['Croatia', 'Slovenia', 'Serbia', 'Bosnia and Herzegovina', 'Montenegro', 'Albania', 'North Macedonia', 'Bulgaria', 'Greece', 'Romania'],
  'Caribbean': ['Cuba', 'Jamaica', 'Dominican Republic', 'Puerto Rico', 'Barbados', 'Trinidad and Tobago', 'Bahamas', 'Antigua and Barbuda', 'Saint Lucia', 'Grenada', 'Curacao', 'Aruba', 'British Virgin Islands', 'Belize'],
  'Middle East': ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Jordan', 'Lebanon', 'Israel', 'Turkey', 'Egypt'],
  'Southeast Asia': ['Thailand', 'Vietnam', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Cambodia', 'Laos', 'Myanmar'],
  'East Asia': ['China', 'Japan', 'South Korea', 'Taiwan', 'Hong Kong', 'Macau'],
  'South Asia': ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan'],
  'Pacific Islands': ['Fiji', 'Samoa', 'Tonga', 'French Polynesia', 'New Caledonia'],
  'British Isles': ['United Kingdom', 'Ireland']
};

async function enrichRegionsArrays() {
  console.log('🌍 ENRICHING REGIONS ARRAYS WITH COMPREHENSIVE DATA\n');
  console.log('===================================================\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Processing ${towns.length} towns...\n`);
  
  let updateCount = 0;
  let errorCount = 0;
  
  for (const town of towns) {
    // Start with existing regions or empty array
    let regions = new Set(town.regions || []);
    const initialSize = regions.size;
    
    // Add organizations
    if (NATO_COUNTRIES.includes(town.country)) regions.add('NATO');
    if (EU_COUNTRIES.includes(town.country)) regions.add('EU');
    if (SCHENGEN_COUNTRIES.includes(town.country)) regions.add('Schengen');
    if (COMMONWEALTH_COUNTRIES.includes(town.country)) regions.add('Commonwealth');
    if (ASEAN_COUNTRIES.includes(town.country)) regions.add('ASEAN');
    if (MERCOSUR_COUNTRIES.includes(town.country)) regions.add('MERCOSUR');
    
    // Add geographic and cultural tags
    for (const [tag, countries] of Object.entries(GEOGRAPHIC_TAGS)) {
      if (countries.includes(town.country)) {
        // Special handling for specific regions
        if (tag === 'Alps' && ['Zurich', 'Geneva', 'Lugano', 'Innsbruck', 'Grenoble', 'Chamonix'].includes(town.name)) {
          regions.add('Alps');
        } else if (tag === 'Rockies' && town.country === 'United States' && ['Denver', 'Boulder', 'Colorado Springs', 'Salt Lake City', 'Boise'].includes(town.name)) {
          regions.add('Rocky Mountains');
        } else if (tag === 'Andes' && ['Mendoza', 'Bariloche', 'Cusco', 'Quito', 'La Paz', 'Santiago'].includes(town.name)) {
          regions.add('Andes');
        } else if (!tag.includes('Alps') && !tag.includes('Rockies') && !tag.includes('Andes')) {
          // Add other tags directly
          regions.add(tag);
        }
      }
    }
    
    // Add continent if not present
    const continentMap = {
      'United States': 'North America',
      'Canada': 'North America',
      'Mexico': 'North America',
      'Argentina': 'South America',
      'Brazil': 'South America',
      'Chile': 'South America',
      'Colombia': 'South America',
      'Peru': 'South America',
      'Ecuador': 'South America',
      'Uruguay': 'South America',
      'France': 'Europe',
      'Germany': 'Europe',
      'Italy': 'Europe',
      'Spain': 'Europe',
      'Portugal': 'Europe',
      'United Kingdom': 'Europe',
      'Netherlands': 'Europe',
      'Belgium': 'Europe',
      'Switzerland': 'Europe',
      'Austria': 'Europe',
      'Greece': 'Europe',
      'Croatia': 'Europe',
      'Czech Republic': 'Europe',
      'Poland': 'Europe',
      'Hungary': 'Europe',
      'Thailand': 'Asia',
      'Vietnam': 'Asia',
      'Malaysia': 'Asia',
      'Singapore': 'Asia',
      'Philippines': 'Asia',
      'Cambodia': 'Asia',
      'Laos': 'Asia',
      'India': 'Asia',
      'Nepal': 'Asia',
      'Japan': 'Asia',
      'South Korea': 'Asia',
      'Taiwan': 'Asia',
      'China': 'Asia',
      'Australia': 'Oceania',
      'New Zealand': 'Oceania',
      'Fiji': 'Oceania',
      'Egypt': 'Africa',
      'Morocco': 'Africa',
      'South Africa': 'Africa',
      'Kenya': 'Africa',
      'Senegal': 'Africa',
      'Mauritius': 'Africa',
      'Seychelles': 'Africa'
    };
    
    if (continentMap[town.country]) {
      regions.add(continentMap[town.country]);
    }
    
    // Add specific features based on geographic_features
    if (town.geographic_features) {
      const features = town.geographic_features.join(' ').toLowerCase();
      if (features.includes('coastal')) regions.add('Coastal');
      if (features.includes('island')) regions.add('Island');
      if (features.includes('mountain')) regions.add('Mountainous');
      if (features.includes('desert')) regions.add('Desert');
      if (features.includes('tropical')) regions.add('Tropical');
      if (features.includes('rainforest')) regions.add('Rainforest');
      if (features.includes('valley')) regions.add('Valley');
      if (features.includes('peninsula')) regions.add('Peninsula');
    }
    
    // Convert back to array and check if we need to update
    const newRegions = Array.from(regions);
    
    if (newRegions.length > initialSize) {
      // Update the town
      const { error: updateError } = await supabase
        .from('towns')
        .update({ regions: newRegions })
        .eq('id', town.id);
        
      if (updateError) {
        console.log(`❌ Failed to update ${town.name}: ${updateError.message}`);
        errorCount++;
      } else {
        updateCount++;
        if (updateCount % 20 === 0) {
          console.log(`  Updated ${updateCount} towns...`);
        }
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('REGIONS ARRAY ENRICHMENT COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Show some examples
  console.log('\n📋 SAMPLE ENRICHED REGIONS:\n');
  
  const samples = ['Paris', 'London', 'Denver', 'Sydney', 'Buenos Aires', 'Bangkok', 'Dubai'];
  for (const name of samples) {
    const { data: town } = await supabase
      .from('towns')
      .select('name, country, regions')
      .eq('name', name)
      .single();
      
    if (town) {
      console.log(`${town.name}, ${town.country}:`);
      console.log(`  [${town.regions.join(', ')}]\n`);
    }
  }
}

// Run enrichment
enrichRegionsArrays().catch(console.error);