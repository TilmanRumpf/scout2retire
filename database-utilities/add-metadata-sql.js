/**
 * ADD METADATA TO EXISTING TOWN IMAGES (SQL Approach)
 *
 * Updates storage.objects metadata column directly via SQL
 * Much more efficient than downloading/re-uploading files
 *
 * Safe to run multiple times - uses COALESCE to preserve existing metadata
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMetadataViaSQL() {
  console.log('🔧 ADDING METADATA TO EXISTING TOWN IMAGES (SQL)\n');
  console.log('='.repeat(80));

  const sql = `
-- Add town_id metadata to existing town images
-- Parses filename format: {countryCode}-{townSlug}-{slot}.jpg
-- Matches to towns table and updates metadata

UPDATE storage.objects
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
  'town_id', (
    SELECT t.id::text
    FROM towns t
    WHERE (
      -- Match by normalized town name from filename
      LOWER(REPLACE(REPLACE(COALESCE(t.town_name, t.town_name), ' ', '-'), '_', '-'))
      =
      -- Extract town slug from filename (between first '-' and last '-')
      SUBSTRING(
        storage.objects.name
        FROM '^[a-z]{2}-(.+)-\\d+\\.(jpg|jpeg|png|webp)$'
      )
    )
    LIMIT 1
  ),
  'updated_at', NOW()::text
)
WHERE bucket_id = 'town-images'
  AND name ~ '^[a-z]{2}-.+-\\d+\\.(jpg|jpeg|png|webp)$'
  AND (metadata IS NULL OR metadata->>'town_id' IS NULL);
`;

  console.log('\n📝 SQL to execute:\n');
  console.log(sql);
  console.log('\n' + '='.repeat(80));

  console.log('\n⚠️  MANUAL EXECUTION REQUIRED\n');
  console.log('This SQL needs to be run in Supabase Dashboard:');
  console.log('1. Go to: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new');
  console.log('2. Paste the SQL above');
  console.log('3. Click "Run"');
  console.log('4. Check the output - should show how many rows updated\n');

  console.log('OR save to file and review:');
  console.log('   cat > /tmp/add-town-metadata.sql << \'EOF\'');
  console.log(sql);
  console.log('   EOF\n');

  console.log('='.repeat(80));
}

addMetadataViaSQL().catch(console.error);
