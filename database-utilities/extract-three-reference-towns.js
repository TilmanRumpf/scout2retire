import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function extractReferenceTowns() {
  console.log('🔬 EXTRACTING 3 REFERENCE TOWNS FOR PATTERN ANALYSIS\n');
  console.log('='.repeat(80) + '\n');

  // Get 3 different types of well-structured towns
  const references = [
    { name: 'Halifax', reason: 'Canadian coastal, similar to NS towns' },
    { name: 'Porto', reason: 'European coastal heritage town, UNESCO' },
    { name: 'Valencia', reason: 'Mediterranean coastal, complete data' }
  ];

  let analysis = '# THREE REFERENCE TOWNS - COMPLETE DATA STRUCTURE\n\n';
  analysis += '**Purpose:** Copy these exact patterns for Nova Scotia towns\n\n';

  for (const ref of references) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📍 ${ref.name.toUpperCase()} - ${ref.reason}`);
    console.log('='.repeat(80) + '\n');

    const { data: towns, error } = await supabase
      .from('towns')
      .select('*')
      .ilike('town_name', ref.name)
      .limit(1);

    if (error || !towns || towns.length === 0) {
      console.log(`❌ Could not find ${ref.name}`);
      continue;
    }

    const town = towns[0];

    analysis += `\n## ${town.town_name}, ${town.country}\n\n`;
    analysis += `**Why this reference:** ${ref.reason}\n\n`;

    // Critical array fields
    const arrayFields = {
      'regions': town.regions,
      'water_bodies': town.water_bodies,
      'activities_available': town.activities_available,
      'interests_supported': town.interests_supported,
      'geographic_features_actual': town.geographic_features_actual,
      'vegetation_type_actual': town.vegetation_type_actual,
      'languages_spoken': town.languages_spoken,
      'local_mobility_options': town.local_mobility_options,
      'regional_connectivity': town.regional_connectivity,
      'international_access': town.international_access
    };

    analysis += '### ARRAY FIELDS:\n\n';
    Object.keys(arrayFields).forEach(field => {
      const arr = arrayFields[field];
      if (arr && Array.isArray(arr) && arr.length > 0) {
        analysis += `**${field}** (${arr.length} items):\n`;
        analysis += '```json\n' + JSON.stringify(arr, null, 2) + '\n```\n\n';
      } else {
        analysis += `**${field}**: ${arr ? JSON.stringify(arr) : 'NULL'}\n\n`;
      }
    });

    // Critical scalar fields
    analysis += '### KEY SCALAR FIELDS:\n\n';
    const scalars = {
      'pace_of_life_actual': town.pace_of_life_actual,
      'social_atmosphere': town.social_atmosphere,
      'expat_community_size': town.expat_community_size,
      'summer_climate_actual': town.summer_climate_actual,
      'winter_climate_actual': town.winter_climate_actual,
      'humidity_level_actual': town.humidity_level_actual,
      'sunshine_level_actual': town.sunshine_level_actual,
      'precipitation_level_actual': town.precipitation_level_actual,
      'seasonal_variation_actual': town.seasonal_variation_actual,
      'typical_monthly_living_cost': town.typical_monthly_living_cost,
      'healthcare_score': town.healthcare_score,
      'safety_score': town.safety_score,
      'primary_language': town.primary_language
    };

    Object.keys(scalars).forEach(field => {
      analysis += `- **${field}**: ${scalars[field] !== null ? scalars[field] : 'NULL'}\n`;
    });

    analysis += '\n---\n';

    // Console output
    console.log('ARRAY FIELDS:');
    Object.keys(arrayFields).forEach(field => {
      const arr = arrayFields[field];
      if (arr && Array.isArray(arr)) {
        console.log(`  ${field}: [${arr.slice(0, 3).join(', ')}${arr.length > 3 ? '...' : ''}] (${arr.length} items)`);
      }
    });

    console.log('\nKEY SCALARS:');
    Object.keys(scalars).forEach(field => {
      console.log(`  ${field}: ${scalars[field]}`);
    });
  }

  fs.writeFileSync('/Users/tilmanrumpf/Desktop/scout2retire/database-utilities/REFERENCE-TOWNS-ANALYSIS.md', analysis);
  console.log('\n\n✅ Complete analysis written to: REFERENCE-TOWNS-ANALYSIS.md\n');
  console.log('='.repeat(80));
}

extractReferenceTowns();
