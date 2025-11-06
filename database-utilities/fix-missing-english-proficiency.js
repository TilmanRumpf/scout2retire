/**
 * Fix the 21 towns still missing English proficiency data
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin operations
);

// Country defaults
const COUNTRY_DEFAULTS = {
  'United States': 95,
  'Canada': 90,
  'United Kingdom': 98,
  'Australia': 95,
  'New Zealand': 95,
  'Ireland': 98,
  'Netherlands': 72,
  'Singapore': 68,
  'Portugal': 60,
  'Spain': 35,
  'Italy': 36,
  'France': 39,
  'Germany': 63,
  'Mexico': 35,
  'Greece': 52,
  'Croatia': 60,
  'Thailand': 27,
  'Vietnam': 32,
  'Malta': 89,
  'Cyprus': 73,
  'Israel': 68,
  'India': 58,
  'South Africa': 61,
  'Philippines': 58,
  'Malaysia': 58,
  'Belize': 62,
  'Austria': 64,
  'Belgium': 61,
  'Switzerland': 61,
  'Bahamas': 98,
  'Barbados': 98,
  'Turks and Caicos': 90,
  'U.S. Virgin Islands': 85,
  'Saint Lucia': 90,
  'Saint Kitts and Nevis': 90,
  'Saint Vincent and Grenadines': 90,
  'Sint Maarten': 75,
  'Saint Martin': 45,
  'Aruba': 65,
  'Puerto Rico': 50,
  'Dominican Republic': 35,
  'Panama': 45,
  'Costa Rica': 43,
  'Chile': 42,
  'Argentina': 45,
  'Uruguay': 41,
  'Brazil': 28,
  'Colombia': 32,
  'Ecuador': 35,
  'Peru': 30,
  'Turkey': 33,
  'Morocco': 32,
  'Tunisia': 35,
  'Egypt': 35,
  'Indonesia': 30,
  'Cambodia': 23,
  'Laos': 20,
  'Japan': 30,
  'South Korea': 50,
  'Taiwan': 48,
  'Hong Kong': 55,
  'United Arab Emirates': 75,
  'Slovenia': 59,
  'Latvia': 55,
  'Mauritius': 45,
  'Seychelles': 60,
  'Vanuatu': 30,
  'Samoa': 50,
  'Tonga': 35,
  'Fiji': 55,
  'Solomon Islands': 35,
  'Palau': 45,
  'Nicaragua': 25,
  'Bolivia': 25,
  'Paraguay': 28,
  'Guatemala': 28,
  'Honduras': 27,
  'El Salvador': 28,
  'Namibia': 45,
  'Botswana': 40,
  'Ghana': 48,
  'Rwanda': 35,
  'Tanzania': 30,
  'Uganda': 35,
  'Senegal': 25,
  'Cape Verde': 30,
  'Madagascar': 25,
  'Sri Lanka': 47,
  'Bangladesh': 35,
  'Nepal': 40,
  'Pakistan': 49,
  'Jordan': 45,
  'Lebanon': 48,
  'Qatar': 70,
  'Bahrain': 65,
  'Kuwait': 55,
  'Oman': 46,
  'Saudi Arabia': 40,
  'China': 28,
  'Mongolia': 25,
  'Kazakhstan': 30,
  'Uzbekistan': 25,
  'Guinea-Bissau': 20,
  'Myanmar': 32
};

async function fixMissingEnglishProficiency() {
  console.log('🔧 Fixing missing English proficiency data...\n');

  try {
    // Get towns with NULL english_proficiency
    const { data: missingTowns, error } = await supabase
      .from('towns')
      .select('id, town_name, country')
      .is('english_proficiency', null);

    if (error) {
      console.error('Error fetching missing towns:', error);
      return;
    }

    if (missingTowns.length === 0) {
      console.log('✅ All towns already have English proficiency data!');
      return;
    }

    console.log(`Found ${missingTowns.length} towns missing English proficiency:\n`);

    let fixedCount = 0;

    for (const town of missingTowns) {
      console.log(`- ${town.town_name}, ${town.country}`);

      // Get country default or use 30 as fallback
      const proficiency = COUNTRY_DEFAULTS[town.country] || 30;

      // Update the town
      const { error: updateError } = await supabase
        .from('towns')
        .update({ english_proficiency: proficiency })
        .eq('id', town.id);

      if (updateError) {
        console.error(`  ❌ Failed to update ${town.town_name}:`, updateError.message);
      } else {
        console.log(`  ✅ Set to ${proficiency}% (${town.country} default)`);
        fixedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Fixed: ${fixedCount} towns`);
    console.log(`❌ Failed: ${missingTowns.length - fixedCount} towns`);

    // Verify final state
    const { count } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .not('english_proficiency', 'is', null);

    console.log(`\n🎉 Total towns with English proficiency: ${count} / 352`);

    if (count === 352) {
      console.log('💯 ALL TOWNS NOW HAVE ENGLISH PROFICIENCY DATA!');
    }

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

fixMissingEnglishProficiency();