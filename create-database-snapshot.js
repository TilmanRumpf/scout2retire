import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://axlruvvsjepsulcbqlho.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env file');
  process.exit(1);
}

async function createSnapshot() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const snapshotDir = `database-snapshots/${timestamp}`;
  
  // Create snapshot directory
  fs.mkdirSync(snapshotDir, { recursive: true });
  
  console.log(`🔵 Creating database snapshot: ${timestamp}`);
  
  // Tables to snapshot
  const tables = [
    'users',
    'towns', 
    'user_preferences',
    'favorites',
    'shared_towns',
    'notifications',
    'invitations',
    'reviews'
  ];
  
  for (const table of tables) {
    console.log(`📸 Snapshotting ${table}...`);
    
    // Get all data
    let allData = [];
    let rangeStart = 0;
    const rangeSize = 1000;
    
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .range(rangeStart, rangeStart + rangeSize - 1);
        
      if (error) {
        console.error(`❌ Error fetching ${table}:`, error);
        break;
      }
      
      if (!data || data.length === 0) break;
      
      allData = allData.concat(data);
      rangeStart += rangeSize;
      
      if (data.length < rangeSize) break;
    }
    
    // Save to file
    const filePath = path.join(snapshotDir, `${table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));
    console.log(`✅ ${table}: ${allData.length} records saved`);
  }
  
  // Save metadata
  const metadata = {
    timestamp: new Date().toISOString(),
    tables: tables,
    project_id: 'axlruvvsjepsulcbqlho',
    purpose: 'Pre-aggressive-changes backup',
    restore_instructions: 'Use restore-database-snapshot.js with this timestamp'
  };
  
  fs.writeFileSync(
    path.join(snapshotDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log(`\n✅ Snapshot complete: ${snapshotDir}`);
  console.log('📝 To restore, run: node restore-database-snapshot.js ' + timestamp);
  
  // Also create a latest symlink
  const latestLink = 'database-snapshots/latest';
  if (fs.existsSync(latestLink)) {
    fs.unlinkSync(latestLink);
  }
  fs.symlinkSync(timestamp, latestLink, 'dir');
  
  return timestamp;
}

createSnapshot().catch(console.error);