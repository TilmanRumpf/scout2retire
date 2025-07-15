import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Import mappings from the previous script
const countryLanguages = {
  'Spain': 'Spanish',
  'Portugal': 'Portuguese',
  'France': 'French',
  'Italy': 'Italian',
  'Greece': 'Greek',
  'Germany': 'German',
  'Netherlands': 'Dutch',
  'Belgium': 'Dutch',
  'Switzerland': 'German',
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
  'Thailand': 'Thai',
  'Vietnam': 'Vietnamese',
  'Malaysia': 'Malay',
  'Indonesia': 'Indonesian',
  'Philippines': 'Filipino',
  'Singapore': 'English',
  'Hong Kong': 'Cantonese',
  'Japan': 'Japanese',
  'South Korea': 'Korean',
  'India': 'Hindi',
  'Sri Lanka': 'Sinhala',
  'Morocco': 'Arabic',
  'Tunisia': 'Arabic',
  'Egypt': 'Arabic',
  'South Africa': 'English',
  'Kenya': 'English',
  'Tanzania': 'Swahili',
  'Australia': 'English',
  'New Zealand': 'English'
};

const englishProficiency = {
  'United States': 'native',
  'United Kingdom': 'native',
  'Ireland': 'native',
  'Australia': 'native',
  'New Zealand': 'native',
  'Canada': 'native',
  'Netherlands': 'excellent',
  'Denmark': 'excellent',
  'Sweden': 'excellent',
  'Norway': 'excellent',
  'Finland': 'excellent',
  'Singapore': 'excellent',
  'Malta': 'excellent',
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

const townActivities = {
  coastal: ['beaches', 'water_sports', 'sailing', 'fishing', 'surfing', 'diving', 'coastal_walks'],
  mountain: ['hiking', 'skiing', 'mountain_biking', 'climbing', 'nature_walks'],
  historic: ['museums', 'historic_sites', 'cultural_tours', 'architecture_viewing'],
  urban: ['shopping', 'dining', 'nightlife', 'cultural_events', 'public_transport'],
  small_town: ['local_markets', 'community_events', 'walking', 'cafes'],
  wine_region: ['wine_tasting', 'vineyard_tours', 'gastronomy'],
  lake: ['boating', 'fishing', 'swimming', 'lakeside_walks']
};

const commonInterests = {
  cultural: ['museums', 'art_galleries', 'theater', 'concerts', 'festivals'],
  culinary: ['local_cuisine', 'cooking_classes', 'food_markets', 'wine_culture'],
  outdoor: ['nature', 'hiking', 'cycling', 'gardening', 'bird_watching'],
  social: ['expat_community', 'local_clubs', 'volunteering', 'language_exchange'],
  wellness: ['yoga', 'spas', 'fitness', 'healthy_lifestyle', 'meditation']
};

async function enrichMissingVisibleTowns() {
  console.log('🔍 Finding visible towns with missing data...\n');
  
  // Get towns with images that have missing data in any of the 5 fields
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .not('image_url_1', 'is', null)
    .or('primary_language.is.null,languages_spoken.is.null,english_proficiency_level.is.null,activities_available.is.null,interests_supported.is.null')
    .order('name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Found ${towns.length} visible towns with missing data\n`);
  
  let updateCount = 0;
  
  for (const town of towns) {
    console.log(`\nChecking ${town.name}, ${town.country}:`);
    const updates = {};
    let missingFields = [];
    
    // Check what's missing
    if (!town.primary_language) missingFields.push('primary_language');
    if (!town.languages_spoken || town.languages_spoken.length === 0) missingFields.push('languages_spoken');
    if (!town.english_proficiency_level) missingFields.push('english_proficiency_level');
    if (!town.activities_available || town.activities_available.length === 0) missingFields.push('activities_available');
    if (!town.interests_supported || town.interests_supported.length === 0) missingFields.push('interests_supported');
    
    if (missingFields.length === 0) {
      console.log('  ✓ All data complete');
      continue;
    }
    
    console.log(`  Missing: ${missingFields.join(', ')}`);
    
    // Add primary language
    if (!town.primary_language && countryLanguages[town.country]) {
      updates.primary_language = countryLanguages[town.country];
      console.log(`  + Adding primary language: ${countryLanguages[town.country]}`);
    }
    
    // Add languages spoken
    if (!town.languages_spoken || town.languages_spoken.length === 0) {
      const spokenLangs = [];
      
      if (countryLanguages[town.country]) {
        spokenLangs.push(countryLanguages[town.country]);
      }
      
      const engProf = englishProficiency[town.country];
      if (engProf && engProf !== 'basic' && countryLanguages[town.country] !== 'English') {
        spokenLangs.push('English');
      }
      
      // Add regional languages for Spain
      if (town.country === 'Spain' && town.region) {
        if (town.region.includes('Catalonia')) spokenLangs.push('Catalan');
        if (town.region.includes('Basque')) spokenLangs.push('Basque');
        if (town.region.includes('Galicia')) spokenLangs.push('Galician');
      }
      
      if (spokenLangs.length > 0) {
        updates.languages_spoken = [...new Set(spokenLangs)];
        console.log(`  + Adding languages: ${updates.languages_spoken.join(', ')}`);
      }
    }
    
    // Add English proficiency
    if (!town.english_proficiency_level && englishProficiency[town.country]) {
      updates.english_proficiency_level = englishProficiency[town.country];
      console.log(`  + Adding English proficiency: ${englishProficiency[town.country]}`);
    }
    
    // Add activities based on features
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
      
      // Parse description for specific activities
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
        if (desc.includes('beach')) activities.add('beaches');
        if (desc.includes('art')) activities.add('art_galleries');
        if (desc.includes('theat')) activities.add('theater');
        if (desc.includes('festival')) activities.add('festivals');
      }
      
      if (activities.size > 0) {
        updates.activities_available = Array.from(activities);
        console.log(`  + Adding ${activities.size} activities`);
      }
    }
    
    // Add interests supported
    if (!town.interests_supported || town.interests_supported.length === 0) {
      const interests = new Set();
      
      // All towns support these
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
      
      // Wellness for tourist areas
      if (town.description?.toLowerCase().includes('spa') || 
          town.description?.toLowerCase().includes('wellness') ||
          town.description?.toLowerCase().includes('yoga')) {
        interests.add('wellness');
      }
      
      if (interests.size > 0) {
        updates.interests_supported = Array.from(interests);
        console.log(`  + Adding ${interests.size} interests`);
      }
    }
    
    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('towns')
        .update(updates)
        .eq('id', town.id);
        
      if (error) {
        console.log(`  ❌ Error updating: ${error.message}`);
      } else {
        console.log(`  ✅ Successfully updated!`);
        updateCount++;
      }
    }
  }
  
  console.log(`\n✅ Enrichment complete! Updated ${updateCount} visible towns.`);
  
  // Final status check
  const { data: finalCheck } = await supabase
    .from('towns')
    .select('id, primary_language, languages_spoken, english_proficiency_level, activities_available, interests_supported')
    .not('image_url_1', 'is', null);
    
  const stats = {
    total: finalCheck.length,
    withPrimaryLanguage: finalCheck.filter(t => t.primary_language).length,
    withLanguagesSpoken: finalCheck.filter(t => t.languages_spoken?.length > 0).length,
    withEnglishProficiency: finalCheck.filter(t => t.english_proficiency_level).length,
    withActivities: finalCheck.filter(t => t.activities_available?.length > 0).length,
    withInterests: finalCheck.filter(t => t.interests_supported?.length > 0).length
  };
  
  console.log('\n📊 Final Status for Visible Towns:');
  console.log(`Primary Language: ${stats.withPrimaryLanguage}/${stats.total} (${(stats.withPrimaryLanguage/stats.total*100).toFixed(1)}%)`);
  console.log(`Languages Spoken: ${stats.withLanguagesSpoken}/${stats.total} (${(stats.withLanguagesSpoken/stats.total*100).toFixed(1)}%)`);
  console.log(`English Proficiency: ${stats.withEnglishProficiency}/${stats.total} (${(stats.withEnglishProficiency/stats.total*100).toFixed(1)}%)`);
  console.log(`Activities: ${stats.withActivities}/${stats.total} (${(stats.withActivities/stats.total*100).toFixed(1)}%)`);
  console.log(`Interests: ${stats.withInterests}/${stats.total} (${(stats.withInterests/stats.total*100).toFixed(1)}%)`);
}

enrichMissingVisibleTowns().catch(console.error);