#!/usr/bin/env node

// CLAUDE CODE DATABASE HELPER
// This is the CORRECT way to execute SQL against the ONLINE Supabase instance

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

// Example queries that replace the non-existent "npx supabase db execute"

async function runQueries() {
  console.log('🔍 Running database queries against ONLINE Supabase...\n');

  // 1. Count towns without images
  const { count: townsWithoutImages } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .or('image_url_1.is.null,image_url_1.eq.,image_url_1.ilike.NULL');
  
  console.log(`Towns without valid images: ${townsWithoutImages}`);

  // 2. Count towns WITH images
  const { count: townsWithImages } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true })
    .not('image_url_1', 'is', null)
    .not('image_url_1', 'eq', '')
    .not('image_url_1', 'ilike', 'NULL');
  
  console.log(`Towns with valid images: ${townsWithImages}`);

  // 3. Get sample of towns
  const { data: sampleTowns } = await supabase
    .from('towns')
    .select('id, name, country, image_url_1')
    .limit(5);
  
  console.log('\nSample towns:');
  sampleTowns?.forEach(town => {
    console.log(`- ${town.name}, ${town.country}: ${town.image_url_1 || 'NO IMAGE'}`);
  });

  // 4. Check users table
  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\nTotal users: ${userCount}`);

  console.log('\n✅ Queries completed successfully!');
  console.log('Remember: This queried the ONLINE database, not local.');
}

// Run the queries
runQueries().catch(console.error);