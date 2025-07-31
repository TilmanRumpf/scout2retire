import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function restoreSnapshot(timestamp) {
  if (!timestamp) {
    console.error('❌ Usage: node restore-database-snapshot.js <timestamp>');
    console.log('Available snapshots:');
    const snapshots = fs.readdirSync('database-snapshots')
      .filter(f => f !== 'latest')
      .sort()
      .reverse();
    snapshots.forEach(s => console.log(`  - ${s}`));
    process.exit(1);
  }
  
  const snapshotDir = `database-snapshots/${timestamp}`;
  
  if (!fs.existsSync(snapshotDir)) {
    console.error(`❌ Snapshot not found: ${snapshotDir}`);
    process.exit(1);
  }
  
  console.log(`🔴 WARNING: This will REPLACE all data with snapshot from ${timestamp}`);
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('\n🔵 Starting restore...');
  
  // Read metadata
  const metadata = JSON.parse(
    fs.readFileSync(path.join(snapshotDir, 'metadata.json'), 'utf8')
  );
  
  // Restore tables in reverse order (to handle foreign keys)
  const tables = metadata.tables.reverse();
  
  for (const table of tables) {
    const filePath = path.join(snapshotDir, `${table}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${table} - no backup file`);
      continue;
    }
    
    console.log(`📥 Restoring ${table}...`);
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Delete existing data
    console.log(`  🗑️  Clearing current data...`);
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
    if (deleteError) {
      console.error(`❌ Error clearing ${table}:`, deleteError);
      continue;
    }
    
    // Insert backup data in batches
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from(table)
        .insert(batch);
        
      if (insertError) {
        console.error(`❌ Error inserting ${table} batch ${i/batchSize}:`, insertError);
      } else {
        process.stdout.write(`  📊 Progress: ${Math.min(i + batchSize, data.length)}/${data.length}\r`);
      }
    }
    
    console.log(`\n  ✅ ${table}: ${data.length} records restored`);
  }
  
  console.log('\n✅ Restore complete!');
  console.log('📝 Remember to:');
  console.log('  1. Test the application thoroughly');
  console.log('  2. Check data integrity');
  console.log('  3. Update any cached data');
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const timestamp = process.argv[2];
  restoreSnapshot(timestamp).catch(console.error);
}

export { restoreSnapshot };