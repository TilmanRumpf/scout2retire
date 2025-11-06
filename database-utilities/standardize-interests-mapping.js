import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Add these missing universal interests that users actually use
const MISSING_UNIVERSAL_INTERESTS = [
  'reading',      // User has this, we forgot it!
  'golf',         // User activities include this
  'tennis',       // User activities include this
  'fishing',      // User activities include this
  'swimming',     // Users say swimming, not swimming_pools
  'water_sports', // Generic term users use
  'cooking',      // Separate from cooking classes
  'arts',         // Already in universal but make sure
  'history',      // Already exists but ensure it's universal
  'heritage'      // Already exists but ensure it's universal
];

async function standardizeInterests() {
  console.log('🔄 STANDARDIZING INTERESTS BETWEEN TOWNS AND USERS\n');
  console.log('==================================================\n');
  
  // Get all towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('id, interests_supported')
    .order('id');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Processing ${towns.length} towns...\n`);
  
  let updateCount = 0;
  let errorCount = 0;
  
  for (const town of towns) {
    let interests = town.interests_supported || [];
    let needsUpdate = false;
    
    // Add missing universal interests if not present
    MISSING_UNIVERSAL_INTERESTS.forEach(interest => {
      if (!interests.includes(interest)) {
        interests.push(interest);
        needsUpdate = true;
      }
    });
    
    // Standardize variations
    // If has 'cooking_classes' but not 'cooking', add 'cooking'
    if (interests.includes('cooking_classes') && !interests.includes('cooking')) {
      interests.push('cooking');
      needsUpdate = true;
    }
    
    // If has 'wine_culture' but not 'wine', add 'wine' (users use both)
    if (interests.includes('wine_culture') && !interests.includes('wine')) {
      interests.push('wine');
      needsUpdate = true;
    }
    
    // Add 'swimming' if has 'swimming_pools'
    if (interests.includes('swimming_pools') && !interests.includes('swimming')) {
      interests.push('swimming');
      needsUpdate = true;
    }
    
    // Ensure arts is included (user preference)
    if (!interests.includes('arts')) {
      interests.push('arts');
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      // Remove duplicates and sort
      interests = [...new Set(interests)].sort();
      
      // Update the town
      const { error: updateError } = await supabase
        .from('towns')
        .update({ interests_supported: interests })
        .eq('id', town.id);
        
      if (updateError) {
        console.error(`Failed to update town ${town.id}: ${updateError.message}`);
        errorCount++;
      } else {
        updateCount++;
        if (updateCount % 50 === 0) {
          console.log(`  Updated ${updateCount} towns...`);
        }
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('INTERESTS STANDARDIZATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Updated: ${updateCount} towns`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Verify the standardization
  console.log('\n📊 VERIFICATION:\n');
  
  // Check a sample town
  const { data: sampleTown } = await supabase
    .from('towns')
    .select('town_name, interests_supported')
    .eq('name', 'Barcelona')
    .single();
  
  if (sampleTown) {
    const userTerms = ['reading', 'golf', 'tennis', 'fishing', 'swimming', 
                       'water_sports', 'cooking', 'wine', 'arts', 'history', 'heritage'];
    
    console.log(`Sample check for ${sampleTown.name}:`);
    console.log(`Total interests: ${sampleTown.interests_supported.length}`);
    console.log('\nUser terms now included:');
    userTerms.forEach(term => {
      const included = sampleTown.interests_supported.includes(term);
      console.log(`  ${included ? '✅' : '❌'} ${term}`);
    });
  }
  
  // Create a reference document
  console.log('\n📝 MATCHING GUIDE FOR DEVELOPERS:\n');
  console.log('User Preferences Field → Town Interests Field:');
  console.log('  interests: cooking_wine → wine_culture, wine, cooking');
  console.log('  interests: wine → wine, wine_culture');
  console.log('  interests: theater → theater');
  console.log('  interests: music → music');
  console.log('  interests: arts → arts');
  console.log('  interests: volunteering → volunteering');
  console.log('  interests: reading → reading');
  console.log('');
  console.log('  activities: golf_tennis → golf, tennis');
  console.log('  activities: golf → golf');
  console.log('  activities: tennis → tennis');
  console.log('  activities: fishing → fishing');
  console.log('  activities: swimming → swimming, swimming_pools');
  console.log('  activities: water_sports → water_sports, ocean_sports, lake_sports');
  console.log('  activities: cycling → cycling');
  console.log('  activities: walking → walking');
  console.log('  activities: walking_cycling → walking, cycling');
  console.log('  activities: gardening → gardening');
}

// Run standardization
standardizeInterests().catch(console.error);