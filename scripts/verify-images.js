import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5fZV2SPe4';

const supabase = createClient(supabaseUrl, supabaseKey);

// Country code mapping
const countryToCodes = {
  'Portugal': 'pt',
  'Spain': 'es',
  'France': 'fr',
  'Italy': 'it',
  'Greece': 'gr',
  'Croatia': 'hr',
  'Slovenia': 'si',
  'Netherlands': 'nl',
  'Latvia': 'lv',
  'Malta': 'mt',
  'Mexico': 'mx',
  'Panama': 'pa',
  'Colombia': 'co',
  'Ecuador': 'ec',
  'United States': 'us',
  'Thailand': 'th',
  'Vietnam': 'vn',
  'Malaysia': 'my'
};

function generateImageFilename(country, townName) {
  const countryCode = countryToCodes[country] || 'xx';
  const cleanName = townName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${countryCode}-${cleanName}.jpg`;
}

async function verifyImages() {
  console.log('Verifying town images...\n');
  
  try {
    // Get all towns from database
    const { data: towns, error } = await supabase
      .from('towns')
      .select('id, town_name, country')
      .order('country, name');
    
    if (error) {
      console.error('Error fetching towns:', error);
      return;
    }
    
    console.log(`Total towns in database: ${towns.length}\n`);
    
    // Generate expected filenames
    const expectedFiles = new Map();
    const report = {
      byCountry: {},
      duplicates: [],
      special: []
    };
    
    for (const town of towns) {
      const filename = generateImageFilename(town.country, town.town_name);
      
      // Track by country
      if (!report.byCountry[town.country]) {
        report.byCountry[town.country] = [];
      }
      report.byCountry[town.country].push({
        name: town.town_name,
        filename: filename
      });
      
      // Check for duplicates
      if (expectedFiles.has(filename)) {
        report.duplicates.push({
          filename,
          towns: [expectedFiles.get(filename), `${town.country} - ${town.town_name}`]
        });
      } else {
        expectedFiles.set(filename, `${town.country} - ${town.town_name}`);
      }
      
      // Flag special cases
      if (filename.includes('---') || filename.endsWith('-.jpg') || filename.length > 50) {
        report.special.push({
          town: `${town.country} - ${town.town_name}`,
          filename,
          issue: 'Unusual filename pattern'
        });
      }
    }
    
    // Print report
    console.log('EXPECTED IMAGE FILES BY COUNTRY');
    console.log('================================\n');
    
    for (const [country, townList] of Object.entries(report.byCountry)) {
      console.log(`${country} (${townList.length} towns):`);
      townList.forEach(t => {
        console.log(`  ${t.town_name.padEnd(25)} → ${t.filename}`);
      });
      console.log('');
    }
    
    if (report.duplicates.length > 0) {
      console.log('\n⚠️  DUPLICATE FILENAMES DETECTED:');
      console.log('=================================');
      report.duplicates.forEach(dup => {
        console.log(`\nFilename: ${dup.filename}`);
        console.log('Used by:');
        dup.towns.forEach(t => console.log(`  - ${t}`));
      });
    }
    
    if (report.special.length > 0) {
      console.log('\n⚠️  SPECIAL CASES TO REVIEW:');
      console.log('============================');
      report.special.forEach(s => {
        console.log(`${s.town}: ${s.filename}`);
        console.log(`  Issue: ${s.issue}\n`);
      });
    }
    
    // Generate checklist
    console.log('\n\n📋 IMAGE UPLOAD CHECKLIST');
    console.log('=========================');
    console.log('Copy this list to verify all images are uploaded:\n');
    
    const sortedFiles = Array.from(expectedFiles.keys()).sort();
    sortedFiles.forEach(filename => {
      console.log(`[ ] ${filename}`);
    });
    
    console.log(`\nTotal unique images needed: ${expectedFiles.size}`);
    
    // Generate SQL for any special cases
    if (report.special.length > 0) {
      console.log('\n\n-- SQL TO FIX SPECIAL CASES:');
      console.log('-- Add these to your UPDATE script if needed\n');
      
      report.special.forEach(s => {
        const parts = s.town.split(' - ');
        console.log(`-- ${s.town}`);
        console.log(`-- Issue: ${s.issue}`);
        console.log(`-- UPDATE towns SET image_url_1 = 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/YOUR-CORRECT-FILENAME.jpg' WHERE country = '${parts[0]}' AND name = '${parts[1]}';`);
        console.log('');
      });
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

// Test the URL formation
async function testUrls() {
  console.log('\n\n🧪 TESTING URL FORMATION');
  console.log('========================\n');
  
  const testCases = [
    { country: 'Portugal', name: 'Porto' },
    { country: 'United States', name: 'Gainesville, FL' },
    { country: 'Mexico', name: 'San Miguel de Allende' },
    { country: 'Thailand', name: 'Chiang Mai' }
  ];
  
  testCases.forEach(test => {
    const filename = generateImageFilename(test.country, test.name);
    const url = `https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/${filename}`;
    console.log(`${test.country} - ${test.name}:`);
    console.log(`  Filename: ${filename}`);
    console.log(`  Full URL: ${url}\n`);
  });
}

// Run verification
console.log('🔍 Scout2Retire Image Verification Tool\n');
verifyImages().then(() => {
  testUrls();
  process.exit(0);
}).catch(console.error);