import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Country to primary language mapping
const countryLanguages = {
  'Spain': 'Spanish',
  'Portugal': 'Portuguese',
  'France': 'French',
  'Italy': 'Italian',
  'Greece': 'Greek',
  'Germany': 'German',
  'Netherlands': 'Dutch',
  'Belgium': 'Dutch', // Also French, but Dutch is primary
  'Switzerland': 'German', // Also French/Italian
  'Austria': 'German',
  'Hungary': 'Hungarian',
  'Czech Republic': 'Czech',
  'Poland': 'Polish',
  'Croatia': 'Croatian',
  'Slovenia': 'Slovenian',
  'Montenegro': 'Montenegrin',
  'Serbia': 'Serbian',
  'Bulgaria': 'Bulgarian',
  'Romania': 'Romanian',
  'Turkey': 'Turkish',
  'Cyprus': 'Greek',
  'Malta': 'Maltese',
  'Ireland': 'English',
  'United Kingdom': 'English',
  'Norway': 'Norwegian',
  'Sweden': 'Swedish',
  'Denmark': 'Danish',
  'Finland': 'Finnish',
  'Estonia': 'Estonian',
  'Latvia': 'Latvian',
  'Lithuania': 'Lithuanian',
  // Americas
  'Mexico': 'Spanish',
  'Costa Rica': 'Spanish',
  'Panama': 'Spanish',
  'Colombia': 'Spanish',
  'Ecuador': 'Spanish',
  'Peru': 'Spanish',
  'Chile': 'Spanish',
  'Argentina': 'Spanish',
  'Uruguay': 'Spanish',
  'Brazil': 'Portuguese',
  'United States': 'English',
  'Canada': 'English',
  // Asia
  'Thailand': 'Thai',
  'Vietnam': 'Vietnamese',
  'Malaysia': 'Malay',
  'Indonesia': 'Indonesian',
  'Philippines': 'Filipino',
  'Singapore': 'English', // Also Mandarin, Malay, Tamil
  'Hong Kong': 'Cantonese',
  'Japan': 'Japanese',
  'South Korea': 'Korean',
  'India': 'Hindi',
  'Sri Lanka': 'Sinhala',
  // Africa
  'Morocco': 'Arabic',
  'Tunisia': 'Arabic',
  'Egypt': 'Arabic',
  'South Africa': 'English',
  'Kenya': 'English',
  'Tanzania': 'Swahili',
  // Oceania
  'Australia': 'English',
  'New Zealand': 'English'
};

// English proficiency estimates by country
const englishProficiency = {
  // Native English
  'United States': 'native',
  'United Kingdom': 'native',
  'Ireland': 'native',
  'Australia': 'native',
  'New Zealand': 'native',
  'Canada': 'native',
  
  // Very High
  'Netherlands': 'excellent',
  'Denmark': 'excellent',
  'Sweden': 'excellent',
  'Norway': 'excellent',
  'Finland': 'excellent',
  'Singapore': 'excellent',
  'Malta': 'excellent',
  
  // High
  'Germany': 'good',
  'Austria': 'good',
  'Belgium': 'good',
  'Switzerland': 'good',
  'Portugal': 'good',
  'Malaysia': 'good',
  'Hong Kong': 'good',
  'Cyprus': 'good',
  'Slovenia': 'good',
  'Estonia': 'good',
  
  // Moderate
  'Spain': 'moderate',
  'France': 'moderate',
  'Italy': 'moderate',
  'Greece': 'moderate',
  'Poland': 'moderate',
  'Czech Republic': 'moderate',
  'Hungary': 'moderate',
  'Croatia': 'moderate',
  'South Korea': 'moderate',
  'India': 'moderate',
  
  // Basic
  'Turkey': 'basic',
  'Mexico': 'basic',
  'Brazil': 'basic',
  'Ecuador': 'basic',
  'Peru': 'basic',
  'Colombia': 'basic',
  'Thailand': 'basic',
  'Vietnam': 'basic',
  'Japan': 'basic',
  'Morocco': 'basic'
};

// Common activities by town type
const townActivities = {
  coastal: ['beaches', 'water_sports', 'sailing', 'fishing', 'surfing', 'diving', 'coastal_walks'],
  mountain: ['hiking', 'skiing', 'mountain_biking', 'climbing', 'nature_walks'],
  historic: ['museums', 'historic_sites', 'cultural_tours', 'architecture_viewing'],
  urban: ['shopping', 'dining', 'nightlife', 'cultural_events', 'public_transport'],
  small_town: ['local_markets', 'community_events', 'walking', 'cafes'],
  wine_region: ['wine_tasting', 'vineyard_tours', 'gastronomy'],
  lake: ['boating', 'fishing', 'swimming', 'lakeside_walks']
};

// Common interests supported
const commonInterests = {
  cultural: ['museums', 'art_galleries', 'theater', 'concerts', 'festivals'],
  culinary: ['local_cuisine', 'cooking_classes', 'food_markets', 'wine_culture'],
  outdoor: ['nature', 'hiking', 'cycling', 'gardening', 'bird_watching'],
  social: ['expat_community', 'local_clubs', 'volunteering', 'language_exchange'],
  wellness: ['yoga', 'spas', 'fitness', 'healthy_lifestyle', 'meditation']
};

async function enrichCriticalData() {
  console.log('🚀 Starting critical data enrichment\n');
  
  // Get all towns
  const { data: towns } = await supabase
    .from('towns')
    .select('*')
    .order('name');
    
  console.log(`Processing ${towns.length} towns...\n`);
  
  let updateCount = 0;
  
  for (const town of towns) {
    const updates = {};
    
    // 1. Add primary language
    if (!town.primary_language && countryLanguages[town.country]) {
      updates.primary_language = countryLanguages[town.country];
    }
    
    // 2. Add languages spoken (primary + English if applicable)
    if (!town.languages_spoken || town.languages_spoken.length === 0) {
      const spokenLangs = [];
      
      // Add primary language
      if (countryLanguages[town.country]) {
        spokenLangs.push(countryLanguages[town.country]);
      }
      
      // Add English if it's different from primary and commonly spoken
      const engProf = englishProficiency[town.country];
      if (engProf && engProf !== 'basic' && countryLanguages[town.country] !== 'English') {
        spokenLangs.push('English');
      }
      
      // Add regional languages for specific countries
      if (town.country === 'Spain' && town.region) {
        if (town.region.includes('Catalonia')) spokenLangs.push('Catalan');
        if (town.region.includes('Basque')) spokenLangs.push('Basque');
        if (town.region.includes('Galicia')) spokenLangs.push('Galician');
      }
      
      if (spokenLangs.length > 0) {
        updates.languages_spoken = [...new Set(spokenLangs)];
      }
    }
    
    // 3. Add English proficiency
    if (!town.english_proficiency_level && englishProficiency[town.country]) {
      updates.english_proficiency_level = englishProficiency[town.country];
    }
    
    // 4. Add activities based on features
    if (!town.activities_available || town.activities_available.length === 0) {
      const activities = new Set();
      
      // Add based on geographic features
      if (town.beaches_nearby || town.geographic_features_actual?.includes('coastal')) {
        townActivities.coastal.forEach(a => activities.add(a));
      }
      
      if (town.mountains_nearby || town.geographic_features_actual?.includes('mountains')) {
        townActivities.mountain.forEach(a => activities.add(a));
      }
      
      // Add based on town characteristics
      if (town.description?.toLowerCase().includes('historic')) {
        townActivities.historic.forEach(a => activities.add(a));
      }
      
      // Add universal activities
      activities.add('walking');
      activities.add('dining');
      activities.add('local_markets');
      activities.add('photography');
      
      // Add specific activities mentioned in description
      if (town.description) {
        const desc = town.description.toLowerCase();
        if (desc.includes('golf')) activities.add('golf');
        if (desc.includes('wine')) activities.add('wine_tasting');
        if (desc.includes('ski')) activities.add('skiing');
        if (desc.includes('dive') || desc.includes('diving')) activities.add('diving');
        if (desc.includes('surf')) activities.add('surfing');
        if (desc.includes('hik')) activities.add('hiking');
        if (desc.includes('museum')) activities.add('museums');
        if (desc.includes('market')) activities.add('local_markets');
      }
      
      if (activities.size > 0) {
        updates.activities_available = Array.from(activities);
      }
    }
    
    // 5. Add interests supported
    if (!town.interests_supported || town.interests_supported.length === 0) {
      const interests = new Set();
      
      // Cultural interests for all towns
      interests.add('cultural');
      interests.add('culinary');
      
      // Outdoor for towns with nature features
      if (town.beaches_nearby || town.mountains_nearby || 
          town.geographic_features_actual?.includes('coastal') ||
          town.geographic_features_actual?.includes('mountains')) {
        interests.add('outdoor');
      }
      
      // Social for towns with expat communities
      if (town.expat_community_size === 'large' || town.expat_community_size === 'moderate') {
        interests.add('social');
        interests.add('expat_community');
      }
      
      // Beach lifestyle for coastal towns
      if (town.beaches_nearby) {
        interests.add('beach_lifestyle');
      }
      
      if (interests.size > 0) {
        updates.interests_supported = Array.from(interests);
      }
    }
    
    // 6. Add coordinates for major cities (would need geocoding API for all)
    // For now, just add a few known ones
    const knownCoordinates = {
      'Lisbon, Portugal': { lat: 38.7223, lon: -9.1393 },
      'Porto, Portugal': { lat: 41.1579, lon: -8.6291 },
      'Barcelona, Spain': { lat: 41.3851, lon: 2.1734 },
      'Madrid, Spain': { lat: 40.4168, lon: -3.7038 },
      'Valencia, Spain': { lat: 39.4699, lon: -0.3763 },
      'Alicante, Spain': { lat: 38.3460, lon: -0.4907 },
      'Athens, Greece': { lat: 37.9838, lon: 23.7275 },
      'Rome, Italy': { lat: 41.9028, lon: 12.4964 },
      'Florence, Italy': { lat: 43.7696, lon: 11.2558 },
      'Paris, France': { lat: 48.8566, lon: 2.3522 },
      'Nice, France': { lat: 43.7102, lon: 7.2620 },
      'Berlin, Germany': { lat: 52.5200, lon: 13.4050 },
      'Amsterdam, Netherlands': { lat: 52.3676, lon: 4.9041 },
      'Brussels, Belgium': { lat: 50.8503, lon: 4.3517 },
      'Prague, Czech Republic': { lat: 50.0755, lon: 14.4378 },
      'Budapest, Hungary': { lat: 47.4979, lon: 19.0402 },
      'Vienna, Austria': { lat: 48.2082, lon: 16.3738 },
      'Dublin, Ireland': { lat: 53.3498, lon: -6.2603 },
      'London, United Kingdom': { lat: 51.5074, lon: -0.1278 },
      'Bangkok, Thailand': { lat: 13.7563, lon: 100.5018 },
      'Chiang Mai, Thailand': { lat: 18.7883, lon: 98.9853 },
      'Da Nang, Vietnam': { lat: 16.0544, lon: 108.2022 },
      'George Town, Malaysia': { lat: 5.4141, lon: 100.3288 },
      'Singapore, Singapore': { lat: 1.3521, lon: 103.8198 },
      'Mexico City, Mexico': { lat: 19.4326, lon: -99.1332 },
      'Playa del Carmen, Mexico': { lat: 20.6296, lon: -87.0739 }
    };
    
    const coordKey = `${town.name}, ${town.country}`;
    if (!town.latitude && knownCoordinates[coordKey]) {
      updates.latitude = knownCoordinates[coordKey].lat;
      updates.longitude = knownCoordinates[coordKey].lon;
    }
    
    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('towns')
        .update(updates)
        .eq('id', town.id);
        
      if (error) {
        console.log(`❌ Error updating ${town.name}: ${error.message}`);
      } else {
        console.log(`✅ Updated ${town.name}: ${Object.keys(updates).join(', ')}`);
        updateCount++;
      }
    }
  }
  
  console.log(`\n✅ Enrichment complete! Updated ${updateCount} towns.`);
  
  // Clean up
  await supabase.from('towns').update({ data_last_updated: new Date().toISOString() }).gte('id', '');
}

enrichCriticalData().catch(console.error);