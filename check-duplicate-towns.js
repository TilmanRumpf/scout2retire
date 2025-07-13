import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

async function checkDuplicates() {
  console.log('🔍 Checking for duplicate towns...\n');
  
  // Get all Medellin entries
  const { data: medellins, error } = await supabase
    .from('towns')
    .select('*')
    .ilike('name', '%medellin%');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Found ${medellins.length} Medellin entries:\n`);
  
  medellins.forEach((m, i) => {
    console.log(`${i + 1}. ${m.name}, ${m.country}`);
    console.log(`   ID: ${m.id}`);
    console.log(`   Visible: ${m.visible}`);
    console.log(`   Image: ${m.image_url_1 || 'NO IMAGE'}`);
    console.log(`   Description: ${m.description?.substring(0, 50)}...`);
    console.log('');
  });
  
  // Check for other duplicates
  const { data: allTowns } = await supabase
    .from('towns')
    .select('name, country')
    .order('name');
    
  const duplicates = {};
  allTowns?.forEach(town => {
    const key = `${town.name}, ${town.country}`;
    duplicates[key] = (duplicates[key] || 0) + 1;
  });
  
  console.log('Other duplicate towns:');
  Object.entries(duplicates)
    .filter(([_, count]) => count > 1)
    .forEach(([name, count]) => {
      console.log(`  - ${name} (${count} times)`);
    });
}

checkDuplicates();