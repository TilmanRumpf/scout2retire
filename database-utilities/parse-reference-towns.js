import fs from 'fs';

// Parse PostgreSQL array format to JSON
function parsePostgresArray(str) {
  if (!str || str === 'NULL' || str === '{}') return [];
  // Remove outer braces
  str = str.replace(/^{|}$/g, '');
  // Split by comma, respecting quoted strings
  const items = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      items.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  if (current) items.push(current.trim().replace(/^"|"$/g, ''));

  return items.filter(x => x);
}

function extractTownData(filePath, townName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`PARSING: ${townName}`);
  console.log('='.repeat(80));

  const content = fs.readFileSync(filePath, 'utf8');

  // Split by tabs (PostgreSQL dump format)
  const parts = content.split('\t');

  console.log(`\nTotal fields: ${parts.length}`);

  // Key array fields we need
  const arrayFields = {
    regions: parts[59],
    water_bodies: parts[60],
    activities_available: parts[67],
    interests_supported: parts[68],
    geographic_features_actual: parts[100],
    vegetation_type_actual: parts[101],
    languages_spoken: parts[79]
  };

  console.log('\n📋 ARRAY FIELDS:\n');
  Object.keys(arrayFields).forEach(field => {
    const parsed = parsePostgresArray(arrayFields[field]);
    console.log(`${field}:`);
    console.log(`  Raw: ${arrayFields[field]?.substring(0, 100)}...`);
    console.log(`  Parsed (${parsed.length} items): [${parsed.slice(0, 5).join(', ')}...]`);
    console.log('');
  });

  // Key scalar fields
  const scalars = {
    pace_of_life_actual: parts[80],
    social_atmosphere: parts[82],
    summer_climate_actual: parts[61],
    winter_climate_actual: parts[62],
    humidity_level_actual: parts[63],
    sunshine_level_actual: parts[64],
    precipitation_level_actual: parts[65],
    seasonal_variation_actual: parts[66],
    typical_monthly_living_cost: parts[92],
    healthcare_score: parts[5],
    safety_score: parts[6],
    primary_language: parts[108],
    expat_community_size: parts[76],
    english_proficiency_level: parts[77]
  };

  console.log('\n📊 KEY SCALARS:\n');
  Object.keys(scalars).forEach(field => {
    console.log(`  ${field}: ${scalars[field]}`);
  });

  return { arrayFields, scalars, parts };
}

console.log('\n🔬 EXTRACTING 3 REFERENCE TOWN PATTERNS\n');

const halifax = extractTownData('/tmp/halifax-complete.txt', 'HALIFAX (NS Template)');
const porto = extractTownData('/tmp/porto-complete.txt', 'PORTO (European Heritage)');
const cascais = extractTownData('/tmp/cascais-complete.txt', 'CASCAIS (Coastal)');

// Create template
const template = `
# EXACT DATA PATTERNS FROM 3 REFERENCE TOWNS

## HALIFAX (Our NS Template)

### regions array (12 items):
${JSON.stringify(parsePostgresArray(halifax.arrayFields.regions), null, 2)}

### activities_available (${parsePostgresArray(halifax.arrayFields.activities_available).length} items):
${JSON.stringify(parsePostgresArray(halifax.arrayFields.activities_available), null, 2)}

### interests_supported (${parsePostgresArray(halifax.arrayFields.interests_supported).length} items):
${JSON.stringify(parsePostgresArray(halifax.arrayFields.interests_supported), null, 2)}

### Key Scalars:
- pace_of_life_actual: ${halifax.scalars.pace_of_life_actual}
- summer_climate_actual: ${halifax.scalars.summer_climate_actual}
- winter_climate_actual: ${halifax.scalars.winter_climate_actual}
- typical_monthly_living_cost: ${halifax.scalars.typical_monthly_living_cost}

---

## PATTERN TO USE FOR ALL NS TOWNS:

\`\`\`sql
regions = '${halifax.arrayFields.regions}'
languages_spoken = '${halifax.arrayFields.languages_spoken}'
geographic_features_actual = '{coastal,harbor}' -- or '{coastal}' for non-harbor towns
vegetation_type_actual = '{forest}'
summer_climate_actual = 'mild'
winter_climate_actual = 'cold'
humidity_level_actual = 'balanced'
sunshine_level_actual = 'balanced'
precipitation_level_actual = 'often_rainy'
seasonal_variation_actual = 'extreme'
pace_of_life_actual = 'moderate' -- or 'relaxed' for smaller towns
\`\`\`
`;

fs.writeFileSync('/Users/tilmanrumpf/Desktop/scout2retire/database-utilities/EXACT-REFERENCE-PATTERNS.md', template);

console.log('\n\n✅ Complete patterns written to: EXACT-REFERENCE-PATTERNS.md\n');
console.log('='.repeat(80));
