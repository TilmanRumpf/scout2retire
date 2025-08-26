import { createClient } from '@supabase/supabase-js';
import { importTowns } from './src/utils/townImporter.js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Read the missing towns data
const missingTowns = JSON.parse(fs.readFileSync('missing_towns.json', 'utf8'));

console.log(`\n=== Town Import Script ===`);
console.log(`Found ${missingTowns.length} missing towns to import\n`);

// Import the towns
async function runImport() {
  const results = await importTowns(missingTowns, {
    batchSize: 20,
    skipExisting: true,
    onProgress: (progress, stats) => {
      process.stdout.write(`\rProgress: ${progress}% | Imported: ${stats.imported} | Skipped: ${stats.skipped} | Errors: ${stats.errors}`);
    }
  });

  console.log('\n\n=== Import Complete ===');
  console.log(`Total processed: ${results.total}`);
  console.log(`Successfully imported: ${results.imported}`);
  console.log(`Skipped (already exist): ${results.skipped}`);
  console.log(`Errors: ${results.errors}`);
  console.log(`Duration: ${results.duration?.toFixed(2)} seconds`);

  if (results.errors > 0) {
    console.log('\n=== Errors ===');
    results.details
      .filter(d => d.status === 'error')
      .forEach(d => console.log(`- ${d.town}: ${d.error}`));
  }

  // Show final count
  const { count } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true });
    
  console.log(`\n✅ Final town count in database: ${count}`);
}

// Create supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Run the import
runImport().catch(console.error);