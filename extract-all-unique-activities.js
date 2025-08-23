import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function extractAllUniqueActivities() {
  console.log('🔍 EXTRACTING ALL UNIQUE ACTIVITIES FROM TOWNS\n');
  console.log('============================================\n');
  
  // Get all towns with their activities
  const { data: towns, error } = await supabase
    .from('towns')
    .select('activities_available');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  // Collect all unique activities
  const allActivities = new Set();
  
  towns.forEach(town => {
    if (town.activities_available && Array.isArray(town.activities_available)) {
      town.activities_available.forEach(activity => {
        allActivities.add(activity);
      });
    }
  });
  
  console.log(`Total unique activities across all towns: ${allActivities.size}\n`);
  
  // Sort and categorize activities
  const sortedActivities = Array.from(allActivities).sort();
  
  // Categorize for better understanding
  const categories = {
    // Physical/Sports
    sports: [],
    water: [],
    winter: [],
    outdoor: [],
    
    // Cultural
    cultural: [],
    food_drink: [],
    arts_crafts: [],
    
    // Entertainment
    entertainment: [],
    social: [],
    
    // Learning/Work
    learning: [],
    work: [],
    
    // Wellness
    wellness: [],
    
    // Other
    other: []
  };
  
  sortedActivities.forEach(activity => {
    // Sports & Physical
    if (activity.includes('sport') || activity.includes('golf') || activity.includes('tennis') || 
        activity.includes('gym') || activity.includes('fitness') || activity.includes('cycling') ||
        activity.includes('jogging') || activity.includes('running') || activity.includes('yoga') ||
        activity.includes('hiking') || activity.includes('climbing')) {
      categories.sports.push(activity);
    }
    // Water activities
    else if (activity.includes('water') || activity.includes('swim') || activity.includes('beach') ||
             activity.includes('surf') || activity.includes('sail') || activity.includes('boat') ||
             activity.includes('diving') || activity.includes('snorkel') || activity.includes('kayak') ||
             activity.includes('paddle') || activity.includes('lake') || activity.includes('river') ||
             activity.includes('ocean') || activity.includes('fishing')) {
      categories.water.push(activity);
    }
    // Winter activities
    else if (activity.includes('ski') || activity.includes('snow') || activity.includes('ice')) {
      categories.winter.push(activity);
    }
    // Outdoor activities
    else if (activity.includes('outdoor') || activity.includes('nature') || activity.includes('camping') ||
             activity.includes('trail') || activity.includes('park') || activity.includes('garden')) {
      categories.outdoor.push(activity);
    }
    // Cultural
    else if (activity.includes('cultur') || activity.includes('museum') || activity.includes('heritage') ||
             activity.includes('temple') || activity.includes('church') || activity.includes('historic') ||
             activity.includes('tour') || activity.includes('tradition')) {
      categories.cultural.push(activity);
    }
    // Food & Drink
    else if (activity.includes('food') || activity.includes('wine') || activity.includes('beer') ||
             activity.includes('coffee') || activity.includes('cooking') || activity.includes('baking') ||
             activity.includes('dining') || activity.includes('restaurant') || activity.includes('cafe') ||
             activity.includes('bar') || activity.includes('tapas') || activity.includes('cuisine') ||
             activity.includes('tasting') || activity.includes('culinary')) {
      categories.food_drink.push(activity);
    }
    // Arts & Crafts
    else if (activity.includes('art') || activity.includes('craft') || activity.includes('paint') ||
             activity.includes('draw') || activity.includes('music') || activity.includes('theater') ||
             activity.includes('dance') || activity.includes('sing') || activity.includes('photo') ||
             activity.includes('pottery') || activity.includes('knit') || activity.includes('sew')) {
      categories.arts_crafts.push(activity);
    }
    // Entertainment
    else if (activity.includes('entertainment') || activity.includes('movie') || activity.includes('concert') ||
             activity.includes('festival') || activity.includes('event') || activity.includes('nightlife') ||
             activity.includes('game') || activity.includes('casino')) {
      categories.entertainment.push(activity);
    }
    // Social
    else if (activity.includes('social') || activity.includes('meet') || activity.includes('club') ||
             activity.includes('community') || activity.includes('volunteer') || activity.includes('expat')) {
      categories.social.push(activity);
    }
    // Learning & Work
    else if (activity.includes('learn') || activity.includes('study') || activity.includes('course') ||
             activity.includes('work') || activity.includes('remote') || activity.includes('digital') ||
             activity.includes('research') || activity.includes('teach')) {
      categories.learning.push(activity);
    }
    // Work
    else if (activity.includes('work') || activity.includes('business') || activity.includes('entrepreneur')) {
      categories.work.push(activity);
    }
    // Wellness
    else if (activity.includes('wellness') || activity.includes('spa') || activity.includes('massage') ||
             activity.includes('meditation') || activity.includes('mindful') || activity.includes('spiritual') ||
             activity.includes('health')) {
      categories.wellness.push(activity);
    }
    // Other
    else {
      categories.other.push(activity);
    }
  });
  
  // Print categorized activities
  console.log('📊 ACTIVITIES BY CATEGORY:\n');
  
  Object.entries(categories).forEach(([category, activities]) => {
    if (activities.length > 0) {
      console.log(`\n${category.toUpperCase().replace('_', ' ')} (${activities.length} activities):`);
      console.log('=' + '='.repeat(50));
      activities.forEach(activity => {
        console.log(`  - ${activity}`);
      });
    }
  });
  
  // Print all activities in one list for easy copying
  console.log('\n\n📝 ALL UNIQUE ACTIVITIES (ALPHABETICAL):\n');
  console.log('=' + '='.repeat(50));
  sortedActivities.forEach(activity => {
    console.log(activity);
  });
  
  console.log('\n\n📈 SUMMARY:\n');
  console.log(`Total unique activities: ${allActivities.size}`);
  console.log(`Sports & Physical: ${categories.sports.length}`);
  console.log(`Water Activities: ${categories.water.length}`);
  console.log(`Winter Activities: ${categories.winter.length}`);
  console.log(`Outdoor Activities: ${categories.outdoor.length}`);
  console.log(`Cultural: ${categories.cultural.length}`);
  console.log(`Food & Drink: ${categories.food_drink.length}`);
  console.log(`Arts & Crafts: ${categories.arts_crafts.length}`);
  console.log(`Entertainment: ${categories.entertainment.length}`);
  console.log(`Social: ${categories.social.length}`);
  console.log(`Learning: ${categories.learning.length}`);
  console.log(`Work: ${categories.work.length}`);
  console.log(`Wellness: ${categories.wellness.length}`);
  console.log(`Other: ${categories.other.length}`);
}

// Run extraction
extractAllUniqueActivities().catch(console.error);