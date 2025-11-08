const fs = require('fs');

// Read the missing towns
const missingTowns = JSON.parse(fs.readFileSync('missing_towns.json', 'utf8'));

// Clean country names
function normalizeCountryName(country) {
  if (!country) return '';
  
  // Remove parentheses and their contents
  let normalized = country.replace(/\s*\([^)]*\)\s*/g, '').trim();
  
  // Replace common variations
  const replacements = {
    'USA': 'United States',
    'UK': 'United Kingdom',
    '&': 'and',
    'Fed.States': 'Federal States',
    'St.': 'Saint'
  };
  
  Object.entries(replacements).forEach(([from, to]) => {
    normalized = normalized.replace(new RegExp(from, 'g'), to);
  });
  
  return normalized;
}

// Escape single quotes for SQL
function escapeSql(str) {
  return str ? str.replace(/'/g, "''") : '';
}

// Generate SQL
let sql = `-- Complete Town Import for Scout2Retire
-- This script safely imports all missing towns using WHERE NOT EXISTS
-- Run this in Supabase SQL Editor

-- Check current count
SELECT COUNT(*) as current_count, 'BEFORE IMPORT' as status FROM towns;

-- Import all missing towns
`;

missingTowns.forEach(town => {
  const normalizedCountry = normalizeCountryName(town.country);
  const regions = [town.continent, town.category].filter(Boolean);
  const climateDesc = town.category?.includes('Mediterranean') ? 'Mediterranean climate' :
                     town.category?.includes('Caribbean') ? 'Tropical Caribbean climate' :
                     town.category?.includes('Asia') ? 'Varied Asian climate' :
                     null;
  
  sql += `
INSERT INTO towns (town_name, country, region, regions, climate_description)
SELECT '${escapeSql(town.town_name)}', '${escapeSql(normalizedCountry)}', ${town.region ? `'${escapeSql(town.region)}'` : 'NULL'}, ARRAY[${regions.map(r => `'${escapeSql(r)}'`).join(', ')}], ${climateDesc ? `'${climateDesc}'` : 'NULL'}
WHERE NOT EXISTS (SELECT 1 FROM towns WHERE town_name = '${escapeSql(town.town_name)}' AND country = '${escapeSql(normalizedCountry)}');`;
});

sql += `

-- Show results
SELECT COUNT(*) as final_count, 'AFTER IMPORT' as status FROM towns;

-- Show count by country
SELECT country, COUNT(*) as count 
FROM towns 
GROUP BY country 
ORDER BY country;

-- Show any specific countries of interest
SELECT * FROM towns WHERE country IN ('Australia', 'Mexico', 'Portugal', 'Spain', 'Italy') ORDER BY country, town_name LIMIT 20;
`;

// Write to file
fs.writeFileSync('complete_town_import_safe.sql', sql);
console.log('SQL script generated: complete_town_import_safe.sql');
console.log(`Total towns to import: ${missingTowns.length}`);