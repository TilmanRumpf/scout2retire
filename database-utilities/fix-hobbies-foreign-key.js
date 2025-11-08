#!/usr/bin/env node

/**
 * FIX TOWNS_HOBBIES FOREIGN KEY CONSTRAINT
 *
 * Problem: The foreign key constraint points to hobbies_old_backup instead of hobbies
 * Solution: Drop the bad constraint and create a correct one
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Client } = pg;

// Construct PostgreSQL connection string from Supabase URL
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  throw new Error('Could not extract project reference from SUPABASE_URL');
}

const connectionString = `postgresql://postgres:[YOUR-PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`;

// Use direct PostgreSQL connection
const client = new Client({
  connectionString: process.env.DATABASE_URL || connectionString,
});

console.log('🔧 FIXING TOWNS_HOBBIES FOREIGN KEY CONSTRAINT\n');

try {
  await client.connect();
  console.log('✅ Connected to database\n');

  // Step 1: Check current constraint
  console.log('1️⃣  Checking current foreign key constraints...');
  const checkConstraints = await client.query(`
    SELECT
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'towns_hobbies'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'hobby_id';
  `);

  if (checkConstraints.rows.length > 0) {
    console.log('   Current constraint:', checkConstraints.rows[0]);
    console.log(`   References: ${checkConstraints.rows[0].foreign_table_name}\n`);
  }

  // Step 2: Drop the bad constraint
  console.log('2️⃣  Dropping incorrect foreign key constraint...');
  await client.query(`
    ALTER TABLE towns_hobbies
    DROP CONSTRAINT IF EXISTS town_hobbies_hobby_id_fkey;
  `);
  console.log('   ✅ Old constraint dropped\n');

  // Step 3: Create correct constraint
  console.log('3️⃣  Creating correct foreign key constraint...');
  await client.query(`
    ALTER TABLE towns_hobbies
    ADD CONSTRAINT town_hobbies_hobby_id_fkey
    FOREIGN KEY (hobby_id)
    REFERENCES hobbies(id)
    ON DELETE CASCADE;
  `);
  console.log('   ✅ New constraint created (references hobbies table)\n');

  // Step 4: Verify
  console.log('4️⃣  Verifying new constraint...');
  const verifyConstraints = await client.query(`
    SELECT
      tc.constraint_name,
      ccu.table_name AS foreign_table_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'towns_hobbies'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name = 'town_hobbies_hobby_id_fkey';
  `);

  if (verifyConstraints.rows.length > 0) {
    console.log('   ✅ Constraint verified:', verifyConstraints.rows[0]);
  }

  console.log('\n✅ FOREIGN KEY CONSTRAINT FIXED!');
  console.log('   towns_hobbies.hobby_id now correctly references hobbies.id\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\n⚠️  Could not fix via script. Please run this SQL manually in Supabase SQL Editor:\n');
  console.log(`
-- Drop bad constraint
ALTER TABLE towns_hobbies
DROP CONSTRAINT IF EXISTS town_hobbies_hobby_id_fkey;

-- Create correct constraint
ALTER TABLE towns_hobbies
ADD CONSTRAINT town_hobbies_hobby_id_fkey
FOREIGN KEY (hobby_id)
REFERENCES hobbies(id)
ON DELETE CASCADE;
  `.trim());
} finally {
  await client.end();
}
