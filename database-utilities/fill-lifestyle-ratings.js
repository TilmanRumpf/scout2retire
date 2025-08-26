import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fillLifestyleRatings() {
  console.log('🎭 Filling lifestyle ratings (restaurants, nightlife, cultural, wellness, shopping, outdoor)...\n');
  
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('country, name');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // World-class lifestyle destinations
  const LIFESTYLE_CAPITALS = {
    // Culinary capitals
    'Paris': { restaurants: 10, cultural: 10, shopping: 10, nightlife: 9 },
    'Tokyo': { restaurants: 10, cultural: 9, shopping: 10, nightlife: 8 },
    'New York': { restaurants: 10, cultural: 10, shopping: 10, nightlife: 10 },
    'Barcelona': { restaurants: 9, cultural: 9, shopping: 8, nightlife: 9 },
    'Bangkok': { restaurants: 9, cultural: 8, shopping: 9, nightlife: 9 },
    'Singapore': { restaurants: 9, cultural: 8, shopping: 9, nightlife: 7 },
    'London': { restaurants: 9, cultural: 10, shopping: 10, nightlife: 9 },
    'Rome': { restaurants: 9, cultural: 10, shopping: 8, nightlife: 7 },
    'Mexico City': { restaurants: 9, cultural: 9, shopping: 8, nightlife: 8 },
    'Buenos Aires': { restaurants: 8, cultural: 9, shopping: 7, nightlife: 9 },
    
    // Beach/resort destinations
    'Dubai': { restaurants: 8, cultural: 6, shopping: 10, nightlife: 8 },
    'Miami': { restaurants: 8, cultural: 7, shopping: 9, nightlife: 10 },
    'Cancun': { restaurants: 7, cultural: 5, shopping: 7, nightlife: 9 },
    'Phuket': { restaurants: 7, cultural: 6, shopping: 7, nightlife: 8 },
    'Bali': { restaurants: 8, cultural: 8, shopping: 7, nightlife: 8, wellness: 10 },
    
    // Wellness destinations
    'Ubud': { wellness: 10, restaurants: 8, cultural: 9, outdoor: 9 },
    'Sedona': { wellness: 9, outdoor: 10, restaurants: 6, cultural: 6 },
    'Byron Bay': { wellness: 9, outdoor: 9, restaurants: 7, cultural: 6 },
    'Tulum': { wellness: 9, outdoor: 8, restaurants: 7, nightlife: 7 }
  };
  
  // Base ratings by city size and type
  const getSizeBaseline = (population) => {
    if (population > 5000000) return { restaurants: 8, cultural: 8, shopping: 8, nightlife: 8, wellness: 7, outdoor: 6 };
    if (population > 1000000) return { restaurants: 7, cultural: 7, shopping: 7, nightlife: 7, wellness: 6, outdoor: 6 };
    if (population > 500000) return { restaurants: 6, cultural: 6, shopping: 6, nightlife: 6, wellness: 5, outdoor: 6 };
    if (population > 100000) return { restaurants: 5, cultural: 5, shopping: 5, nightlife: 5, wellness: 4, outdoor: 6 };
    if (population > 50000) return { restaurants: 4, cultural: 4, shopping: 4, nightlife: 4, wellness: 3, outdoor: 6 };
    return { restaurants: 3, cultural: 3, shopping: 3, nightlife: 2, wellness: 3, outdoor: 7 };
  };
  
  // Regional modifiers
  const REGIONAL_MODIFIERS = {
    'Europe': { cultural: +1, restaurants: +1 },
    'Asia': { restaurants: +1, shopping: +1 },
    'Latin America': { nightlife: +1, outdoor: +1 },
    'Mediterranean': { restaurants: +1, outdoor: +1 },
    'Caribbean': { outdoor: +2, wellness: +1 },
    'Pacific': { outdoor: +2, wellness: +1 }
  };
  
  // Process each rating type
  const ratingTypes = [
    'restaurants_rating',
    'nightlife_rating', 
    'cultural_rating',
    'wellness_rating',
    'shopping_rating',
    'outdoor_activities_rating'
  ];
  
  const updates = {};
  let processedCount = 0;
  
  towns.forEach(town => {
    const needsUpdate = ratingTypes.some(rating => town[rating] === null);
    if (!needsUpdate) return;
    
    processedCount++;
    updates[town.id] = { id: town.id };
    
    // Start with baselines
    let ratings;
    
    // Check if it's a known destination
    if (LIFESTYLE_CAPITALS[town.name]) {
      ratings = { ...getSizeBaseline(town.population), ...LIFESTYLE_CAPITALS[town.name] };
    } else {
      ratings = getSizeBaseline(town.population);
      
      // Apply regional modifiers
      if (['France', 'Italy', 'Spain', 'Germany', 'Austria', 'Belgium', 'Netherlands'].includes(town.country)) {
        Object.entries(REGIONAL_MODIFIERS.Europe).forEach(([key, mod]) => {
          ratings[key.replace('_rating', '')] = Math.min(10, (ratings[key.replace('_rating', '')] || 5) + mod);
        });
      }
      
      if (['Thailand', 'Vietnam', 'Malaysia', 'Singapore', 'Japan', 'South Korea'].includes(town.country)) {
        Object.entries(REGIONAL_MODIFIERS.Asia).forEach(([key, mod]) => {
          ratings[key.replace('_rating', '')] = Math.min(10, (ratings[key.replace('_rating', '')] || 5) + mod);
        });
      }
      
      // Coastal/Island bonuses
      if (town.geographic_features?.includes('coastal') || town.geographic_features?.includes('island')) {
        ratings.outdoor = Math.min(10, ratings.outdoor + 2);
        ratings.restaurants = Math.min(10, ratings.restaurants + 1);
      }
      
      // Tourist areas get boosts
      if (town.expat_community_size === 'large' || town.english_speaking_doctors) {
        ratings.restaurants = Math.min(10, ratings.restaurants + 1);
        ratings.shopping = Math.min(10, ratings.shopping + 1);
      }
      
      // Capital cities get cultural boost
      if (town.name === town.country || town.name.includes('City')) {
        ratings.cultural = Math.min(10, ratings.cultural + 1);
        ratings.shopping = Math.min(10, ratings.shopping + 1);
      }
    }
    
    // Fill missing ratings
    if (town.restaurants_rating === null) updates[town.id].restaurants_rating = ratings.restaurants || 5;
    if (town.nightlife_rating === null) updates[town.id].nightlife_rating = ratings.nightlife || 4;
    if (town.cultural_rating === null) updates[town.id].cultural_rating = ratings.cultural || 5;
    if (town.wellness_rating === null) updates[town.id].wellness_rating = ratings.wellness || 5;
    if (town.shopping_rating === null) updates[town.id].shopping_rating = ratings.shopping || 5;
    if (town.outdoor_activities_rating === null) updates[town.id].outdoor_activities_rating = ratings.outdoor || 6;
  });
  
  console.log(`🎯 Found ${processedCount} towns needing lifestyle ratings\n`);
  
  // Update in batches
  const updateArray = Object.values(updates);
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < updateArray.length; i += BATCH_SIZE) {
    const batch = updateArray.slice(i, i + BATCH_SIZE);
    
    for (const update of batch) {
      const { error } = await supabase
        .from('towns')
        .update(update)
        .eq('id', update.id);
        
      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`✅ Updated batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(updateArray.length/BATCH_SIZE)}`);
  }
  
  console.log('\n🎉 Lifestyle ratings update complete!');
  
  // Verify
  const { data: verification } = await supabase
    .from('towns')
    .select('restaurants_rating, nightlife_rating, cultural_rating, wellness_rating, shopping_rating, outdoor_activities_rating');
    
  let missingCount = 0;
  ratingTypes.forEach(rating => {
    const missing = verification.filter(t => t[rating] === null).length;
    if (missing > 0) {
      console.log(`${rating}: ${missing} still missing`);
      missingCount += missing;
    }
  });
  
  if (missingCount === 0) {
    console.log('\n✅ All lifestyle ratings are now complete!');
  }
}

fillLifestyleRatings();