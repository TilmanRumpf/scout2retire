import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Montenegro, Latvia, and other missing countries
const additionalEnglishProficiency = {
  'Montenegro': 'moderate',  // Tourism-focused, moderate English
  'Latvia': 'good',         // Baltic state, good English education
  'Albania': 'basic',       // Growing tourism, basic English
  'Belize': 'native',       // English is official language
  'Barbados': 'native',     // English-speaking Caribbean
  'Bahamas': 'native',      // English-speaking Caribbean
  'Jamaica': 'native',      // English-speaking Caribbean
  'Trinidad and Tobago': 'native', // English-speaking Caribbean
  'Guatemala': 'basic',     // Spanish-speaking, basic English
  'Nicaragua': 'basic',     // Spanish-speaking, basic English
  'Paraguay': 'basic',      // Spanish-speaking, basic English
  'Dominican Republic': 'basic', // Spanish-speaking, tourist areas have basic English
  'UAE': 'good',           // International hub, good English
  'Israel': 'good',        // High English education
  'Senegal': 'basic',      // French-speaking, basic English
  'Rwanda': 'moderate',    // English adopted as official language
  'Botswana': 'good',      // English is official language
  'Namibia': 'good',       // English is official language
  'Mauritius': 'good',     // English is official language
  'Fiji': 'good',          // English is official language
  'Samoa': 'moderate',     // English widely spoken
  'Tonga': 'moderate',     // English widely spoken
  'Vanuatu': 'moderate',   // English is official language
  'Solomon Islands': 'moderate', // English is official language
  'Palau': 'good',         // English is official language
  'Marshall Islands': 'good', // English is official language
  'Micronesia': 'good',    // English is official language
  'American Samoa': 'native', // US territory
  'US Virgin Islands': 'native', // US territory
  'British Virgin Islands': 'native', // British territory
  'Cayman Islands': 'native', // British territory
  'Turks and Caicos': 'native', // British territory
  'Antigua and Barbuda': 'native', // English-speaking Caribbean
  'Saint Kitts and Nevis': 'native', // English-speaking Caribbean
  'Saint Lucia': 'native', // English is official language
  'Saint Vincent and the Grenadines': 'native', // English-speaking Caribbean
  'Grenada': 'native', // English-speaking Caribbean
  'Dominica': 'native', // English-speaking Caribbean
  'Sint Maarten': 'good', // Dutch/English territory
  'Aruba': 'good', // Dutch territory, English widely spoken
  'French Polynesia': 'basic', // French territory
  'New Caledonia': 'basic', // French territory
  'Martinique': 'basic', // French territory
  'Cook Islands': 'native', // English is official language
  'Iceland': 'excellent', // Nordic country, excellent English
  'Cambodia': 'basic', // Growing tourism, basic English
  'Laos': 'basic', // Limited English
  'Nepal': 'moderate', // Tourism industry, moderate English
  'Sri Lanka': 'moderate', // English is official language
  'Myanmar': 'basic', // Limited English
  'Hong Kong': 'good', // Former British colony
  'Taiwan': 'moderate', // Growing English education
  'Palau': 'good', // English is official language
  'Cyprus': 'good', // EU member, good English education
  'Kyrgyzstan': 'basic' // Limited English
};

async function fixRemainingEnglishProficiency() {
  console.log('🔍 Finding visible towns without English proficiency...\n');
  
  // Get visible towns without English proficiency
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .not('image_url_1', 'is', null)
    .is('english_proficiency_level', null)
    .order('name');
    
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  console.log(`Found ${towns.length} visible towns without English proficiency data\n`);
  
  let updateCount = 0;
  
  for (const town of towns) {
    console.log(`Checking ${town.name}, ${town.country}:`);
    
    // Check if we have data for this country
    const proficiency = additionalEnglishProficiency[town.country];
    
    if (proficiency) {
      const { error } = await supabase
        .from('towns')
        .update({ english_proficiency_level: proficiency })
        .eq('id', town.id);
        
      if (error) {
        console.log(`  ❌ Error updating: ${error.message}`);
      } else {
        console.log(`  ✅ Updated English proficiency to: ${proficiency}`);
        updateCount++;
      }
    } else {
      console.log(`  ⚠️  No English proficiency data for ${town.country}`);
      // Default to 'basic' for unknown countries
      const { error } = await supabase
        .from('towns')
        .update({ english_proficiency_level: 'basic' })
        .eq('id', town.id);
        
      if (error) {
        console.log(`  ❌ Error updating: ${error.message}`);
      } else {
        console.log(`  ✅ Set default English proficiency to: basic`);
        updateCount++;
      }
    }
  }
  
  console.log(`\n✅ Updated ${updateCount} towns with English proficiency data`);
  
  // Final check
  const { data: finalCheck } = await supabase
    .from('towns')
    .select('id, name, country, english_proficiency_level')
    .not('image_url_1', 'is', null)
    .order('name');
    
  const withProficiency = finalCheck.filter(t => t.english_proficiency_level).length;
  
  console.log(`\n📊 Final Status: ${withProficiency}/${finalCheck.length} visible towns have English proficiency data (${(withProficiency/finalCheck.length*100).toFixed(1)}%)`);
  
  // Show any remaining without data
  const remaining = finalCheck.filter(t => !t.english_proficiency_level);
  if (remaining.length > 0) {
    console.log('\nRemaining towns without English proficiency:');
    remaining.forEach(t => console.log(`- ${t.name}, ${t.country}`));
  }
}

fixRemainingEnglishProficiency().catch(console.error);