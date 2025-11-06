/**
 * Populate English proficiency data for all towns
 * This is CRITICAL for retirees to know if they can communicate
 * Data based on EF English Proficiency Index and local knowledge
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// English proficiency by country (percentage who speak English)
// Based on EF EPI Index, tourist areas, and expat communities
const ENGLISH_PROFICIENCY_DATA = {
  // Native English countries
  'United States': 95,
  'Canada': 90, // Some French areas
  'United Kingdom': 98,
  'Australia': 95,
  'New Zealand': 95,
  'Ireland': 98,

  // Very High Proficiency (Europe)
  'Netherlands': 72,
  'Singapore': 68,
  'Austria': 64,
  'Denmark': 71,
  'Norway': 68,
  'Sweden': 70,
  'Finland': 65,
  'Luxembourg': 66,
  'Germany': 63,
  'Belgium': 61,
  'Portugal': 60, // Higher in tourist areas
  'Croatia': 60,

  // High Proficiency
  'Poland': 55,
  'Greece': 52, // Much higher in tourist areas
  'Czech Republic': 54,
  'Hungary': 52,
  'Romania': 51,
  'Serbia': 50,
  'Switzerland': 61,
  'Latvia': 55,
  'Lithuania': 52,
  'Estonia': 58,
  'South Korea': 50,
  'Malaysia': 58,
  'Hong Kong': 55,

  // Moderate Proficiency
  'France': 39, // Higher in Paris/Riviera
  'Spain': 35, // Higher in tourist areas
  'Italy': 36, // Higher in tourist areas
  'Taiwan': 48,
  'Japan': 30, // Higher in Tokyo
  'Argentina': 45,
  'Costa Rica': 43,
  'Chile': 42,
  'Uruguay': 41,
  'Belize': 62, // Former British colony
  'Malta': 89, // English is official
  'Cyprus': 73,
  'Israel': 68,
  'India': 58,
  'South Africa': 61,
  'Kenya': 50,

  // Lower Proficiency
  'Mexico': 35, // Much higher in expat areas
  'Brazil': 28,
  'Turkey': 33,
  'Morocco': 32,
  'Tunisia': 35,
  'Egypt': 35,
  'Thailand': 27, // Higher in tourist areas
  'Vietnam': 32,
  'Indonesia': 30,
  'Philippines': 58,
  'Cambodia': 23,
  'Laos': 20,
  'Myanmar': 25,

  // Special cases - tourist/expat areas
  'Panama': 45, // Higher in expat areas
  'Ecuador': 35,
  'Colombia': 32,
  'Peru': 30,
  'Dominican Republic': 35, // Tourist areas
  'Puerto Rico': 50, // US territory
  'Barbados': 98,
  'Jamaica': 95,
  'Trinidad and Tobago': 94,
  'Bahamas': 98,
  'Aruba': 65,
  'Curaçao': 60,
  'Mauritius': 45,
  'Seychelles': 60,

  // Island nations
  'Vanuatu': 30,
  'Samoa': 50,
  'Tonga': 35,
  'Fiji': 55,
  'Solomon Islands': 35,
  'Palau': 45,
  'U.S. Virgin Islands': 85,
  'Turks and Caicos': 90,
  'Saint Lucia': 90,
  'Saint Kitts and Nevis': 90,
  'Saint Vincent and Grenadines': 90,
  'Saint Martin': 45,
  'Sint Maarten': 75,

  // Additional countries
  'Russia': 30,
  'Ukraine': 35,
  'Georgia': 32,
  'Albania': 40,
  'Montenegro': 38,
  'Slovenia': 59,
  'Slovakia': 50,
  'Bulgaria': 48,
  'North Macedonia': 35,
  'Bosnia and Herzegovina': 35,
  'Moldova': 30,
  'Nicaragua': 25,
  'Bolivia': 25,
  'Paraguay': 28,
  'Venezuela': 30,
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
  'United Arab Emirates': 75, // Very international
  'Qatar': 70,
  'Bahrain': 65,
  'Kuwait': 55,
  'Oman': 46,
  'Saudi Arabia': 40,
  'China': 28,
  'Mongolia': 25,
  'Kazakhstan': 30,
  'Uzbekistan': 25,
  'Kyrgyzstan': 28,
  'Tajikistan': 20,
  'Azerbaijan': 28,
  'Armenia': 35,

  // Small nations
  'Andorra': 45,
  'Liechtenstein': 65,
  'Monaco': 58,
  'San Marino': 40,
  'Vatican City': 45,
  'Maldives': 45,
  'Brunei': 40,
  'Bahrain': 65,
  'Comoros': 25,
  'Djibouti': 30,
  'Eritrea': 25,
  'Guinea-Bissau': 20,
  'Sao Tome and Principe': 25,
  'Timor-Leste': 25
};

// Special adjustments for tourist/expat heavy towns
const TOWN_ADJUSTMENTS = {
  // Mexico - expat areas have much higher English
  'Playa del Carmen': 65,
  'Puerto Vallarta': 60,
  'Lake Chapala (Ajijic)': 70, // Major expat community
  'San Miguel de Allende': 65,
  'Cancún': 60,
  'Tulum': 55,
  'Mazatlán': 50,
  'Cabo San Lucas': 60,

  // Spain - tourist areas
  'Barcelona': 50,
  'Madrid': 45,
  'Valencia': 40,
  'Málaga': 45,
  'Palma de Mallorca': 55,
  'Ibiza': 50,
  'Marbella': 55,
  'Alicante': 45,

  // Portugal - expat friendly
  'Lisbon': 70,
  'Porto': 65,
  'Cascais': 75,
  'Albufeira': 70,
  'Lagos': 65,
  'Tavira': 60,
  'Funchal': 65,

  // Thailand - tourist areas
  'Bangkok': 40,
  'Phuket': 45,
  'Chiang Mai': 40,
  'Koh Samui': 45,
  'Pattaya': 40,
  'Hua Hin': 35,

  // France - tourist areas
  'Paris': 45,
  'Nice': 50,
  'Cannes': 48,
  'Saint-Tropez': 45,
  'Bordeaux': 40,

  // Italy - tourist areas
  'Rome': 45,
  'Florence': 45,
  'Venice': 40,
  'Milan': 42,
  'Naples': 35,
  'Amalfi': 40,

  // Greece - tourist islands
  'Athens': 60,
  'Crete': 65,
  'Santorini': 70,
  'Mykonos': 65,
  'Rhodes': 60,
  'Corfu': 60,

  // Dubai and UAE
  'Dubai': 85,
  'Abu Dhabi': 80,

  // Asian financial centers
  'Hong Kong': 55,
  'Tokyo': 35,
  'Seoul': 50,
  'Taipei': 50,
  'Bangkok': 40
};

async function populateEnglishProficiency() {
  console.log('🌍 Populating English proficiency data for all towns...\n');

  try {
    // Get all towns
    const { data: towns, error } = await supabase
      .from('towns')
      .select('id, town_name, country');

    if (error) {
      console.error('Error fetching towns:', error);
      return;
    }

    console.log(`Processing ${towns.length} towns...\n`);

    let updatedCount = 0;
    const updates = [];

    for (const town of towns) {
      let proficiency = 0;

      // Check for town-specific override first
      if (TOWN_ADJUSTMENTS[town.town_name]) {
        proficiency = TOWN_ADJUSTMENTS[town.town_name];
      } else {
        // Use country default
        proficiency = ENGLISH_PROFICIENCY_DATA[town.country] || 30;
      }

      updates.push({
        id: town.id,
        name: town.town_name,
        country: town.country,
        proficiency: proficiency
      });
    }

    // Sort by proficiency for display
    updates.sort((a, b) => b.proficiency - a.proficiency);

    // Show sample
    console.log('📊 Sample English proficiency values:');
    console.log('\nHighest proficiency:');
    updates.slice(0, 5).forEach(t => {
      console.log(`  ${t.town_name}, ${t.country}: ${t.proficiency}%`);
    });

    console.log('\nLowest proficiency:');
    updates.slice(-5).forEach(t => {
      console.log(`  ${t.town_name}, ${t.country}: ${t.proficiency}%`);
    });

    // Apply updates in batches
    console.log('\n🔄 Applying updates...');

    for (let i = 0; i < updates.length; i += 50) {
      const batch = updates.slice(i, i + 50);

      for (const update of batch) {
        const { error: updateError } = await supabase
          .from('towns')
          .update({ english_proficiency: update.proficiency })
          .eq('id', update.id);

        if (updateError) {
          console.error(`Error updating ${update.name}:`, updateError);
        } else {
          updatedCount++;
        }
      }

      console.log(`  Processed ${Math.min(i + 50, updates.length)} / ${updates.length}`);
    }

    console.log(`\n✅ Successfully updated ${updatedCount} towns with English proficiency!`);

    // Show distribution
    const ranges = {
      'Native (90-100%)': updates.filter(t => t.proficiency >= 90).length,
      'Very High (70-89%)': updates.filter(t => t.proficiency >= 70 && t.proficiency < 90).length,
      'High (50-69%)': updates.filter(t => t.proficiency >= 50 && t.proficiency < 70).length,
      'Moderate (35-49%)': updates.filter(t => t.proficiency >= 35 && t.proficiency < 50).length,
      'Low (20-34%)': updates.filter(t => t.proficiency >= 20 && t.proficiency < 35).length,
      'Very Low (<20%)': updates.filter(t => t.proficiency < 20).length
    };

    console.log('\n📊 Distribution:');
    Object.entries(ranges).forEach(([range, count]) => {
      console.log(`  ${range}: ${count} towns`);
    });

    console.log('\n💡 This data is CRITICAL for retirees!');
    console.log('They can now filter by English proficiency and make informed decisions.');

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

populateEnglishProficiency();