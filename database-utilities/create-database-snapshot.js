#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSnapshot() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const snapshotDir = path.join(process.cwd(), 'database-snapshots');
  
  // Create snapshots directory if it doesn't exist
  await fs.mkdir(snapshotDir, { recursive: true });
  
  console.log(`📸 Creating database snapshot at ${timestamp}...`);
  
  const snapshot = {
    timestamp,
    tables: {}
  };
  
  // List of tables to backup
  const tables = [
    'towns',
    'users',
    'user_preferences',
    'favorites',
    'hobbies',
    'towns_hobbies'
  ];
  
  for (const table of tables) {
    console.log(`  Backing up ${table}...`);
    const { data, error } = await supabase
      .from(table)
      .select('*');
      
    if (error) {
      console.error(`  ❌ Error backing up ${table}:`, error.message);
      continue;
    }
    
    snapshot.tables[table] = {
      count: data?.length || 0,
      data: data || []
    };
    console.log(`  ✅ ${table}: ${data?.length || 0} records`);
  }
  
  // Save snapshot to file
  const filename = path.join(snapshotDir, `snapshot-${timestamp}.json`);
  await fs.writeFile(filename, JSON.stringify(snapshot, null, 2));
  
  console.log(`\n✅ Database snapshot saved to: ${filename}`);
  console.log(`📊 Total records backed up:`);
  Object.entries(snapshot.tables).forEach(([table, info]) => {
    console.log(`   ${table}: ${info.count} records`);
  });
  
  return filename;
}

createSnapshot().catch(console.error);