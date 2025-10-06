import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function analyzeTownStructure() {
  console.log('🔬 ANALYZING TOWN DATA STRUCTURE\n');
  console.log('='.repeat(80) + '\n');

  // Get 3 complete, well-populated towns
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .not('image_url_1', 'is', null)
    .not('description', 'is', null)
    .in('name', ['Halifax', 'Nice', 'Valencia'])
    .limit(3);

  if (error || !towns) {
    console.error('Error:', error);
    return;
  }

  console.log(`📊 Analyzing ${towns.length} reference towns:\n`);

  const analysis = {};

  towns.forEach((town, i) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${i + 1}. ${town.name}, ${town.country}`);
    console.log('='.repeat(80) + '\n');

    Object.keys(town).forEach(field => {
      const value = town[field];
      const type = Array.isArray(value) ? 'array' : typeof value;

      if (!analysis[field]) {
        analysis[field] = {
          type,
          examples: [],
          nullCount: 0,
          populatedCount: 0
        };
      }

      if (value === null || value === undefined || value === '') {
        analysis[field].nullCount++;
      } else {
        analysis[field].populatedCount++;
        if (analysis[field].examples.length < 3) {
          analysis[field].examples.push({
            town: town.name,
            value: Array.isArray(value) ? value : String(value).substring(0, 100)
          });
        }
      }
    });
  });

  // Write detailed analysis
  let output = '# TOWN DATA STRUCTURE ANALYSIS\n\n';

  Object.keys(analysis).sort().forEach(field => {
    const info = analysis[field];
    output += `## ${field}\n`;
    output += `- Type: ${info.type}\n`;
    output += `- Populated: ${info.populatedCount}/${towns.length}\n`;

    if (info.examples.length > 0) {
      output += `- Examples:\n`;
      info.examples.forEach(ex => {
        output += `  - ${ex.town}: ${JSON.stringify(ex.value)}\n`;
      });
    }
    output += '\n';
  });

  fs.writeFileSync('TOWN-STRUCTURE-ANALYSIS.md', output);
  console.log('\n✅ Analysis written to TOWN-STRUCTURE-ANALYSIS.md');

  // Focus on key array fields
  console.log('\n📋 KEY ARRAY FIELDS:\n');

  const arrayFields = [
    'regions', 'water_bodies', 'activities_available', 'interests_supported',
    'geographic_features_actual', 'vegetation_type_actual', 'languages_spoken',
    'local_mobility_options', 'regional_connectivity', 'international_access'
  ];

  arrayFields.forEach(field => {
    console.log(`\n${field}:`);
    towns.forEach(town => {
      if (town[field] && Array.isArray(town[field])) {
        console.log(`  ${town.name}: [${town[field].slice(0, 5).join(', ')}${town[field].length > 5 ? '...' : ''}] (${town[field].length} items)`);
      }
    });
  });

  console.log('\n' + '='.repeat(80));
}

analyzeTownStructure();
