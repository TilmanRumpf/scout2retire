#!/usr/bin/env node

// Check enriched data for specific towns

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkEnrichedData() {
  console.log('🔍 Checking enriched data for specific towns...\n');

  try {
    const { data, error } = await supabase
      .from('towns')
      .select(`
        name, 
        country, 
        description, 
        crime_rate, 
        meal_cost, 
        geographic_features, 
        healthcare_specialties_available
      `)
      .in('name', ['Sarandë', 'Pago Pago', "Saint John's"])
      .in('country', ['Albania', 'American Samoa', 'Antigua and Barbuda']);

    if (error) {
      console.error('❌ Error querying database:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ No towns found matching the criteria');
      return;
    }

    console.log(`✅ Found ${data.length} towns with enriched data:\n`);

    data.forEach((town, index) => {
      console.log(`${index + 1}. ${town.name}, ${town.country}`);
      console.log(`   Description: ${town.description || 'Not available'}`);
      console.log(`   Crime Rate: ${town.crime_rate || 'Not available'}`);
      console.log(`   Meal Cost: ${town.meal_cost || 'Not available'}`);
      console.log(`   Geographic Features: ${town.geographic_features || 'Not available'}`);
      console.log(`   Healthcare Specialties: ${town.healthcare_specialties_available || 'Not available'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkEnrichedData().catch(console.error);