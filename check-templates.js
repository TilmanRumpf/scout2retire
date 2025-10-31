import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkTemplates() {
  console.log('Checking research_templates table...\n');
  
  // Get all templates
  const { data: templates, error } = await supabase
    .from('research_templates')
    .select('*')
    .order('field_name');
  
  if (error) {
    console.error('Error fetching templates:', error);
    return;
  }
  
  console.log(`Found ${templates.length} templates\n`);
  
  // Find farmers_markets template specifically
  const farmersMarket = templates.find(t => t.field_name === 'farmers_markets');
  
  if (farmersMarket) {
    console.log('✓ farmers_markets template found!');
    console.log('\nTemplate details:');
    console.log('Field name:', farmersMarket.field_name);
    console.log('Panel:', farmersMarket.panel);
    console.log('Search query:', farmersMarket.search_query);
    console.log('Expected format:', farmersMarket.expected_format);
    console.log('Verification prompt:', farmersMarket.verification_prompt?.substring(0, 100) + '...');
    
    // Check for placeholders
    const hasPlaceholders = 
      farmersMarket.search_query?.includes('{town_name}') &&
      farmersMarket.search_query?.includes('{subdivision}') &&
      farmersMarket.search_query?.includes('{country}');
    
    console.log('\n✓ Has required placeholders:', hasPlaceholders);
    
    if (hasPlaceholders) {
      console.log('  - {town_name}: ✓');
      console.log('  - {subdivision}: ✓');
      console.log('  - {country}: ✓');
    }
  } else {
    console.log('✗ farmers_markets template NOT found');
  }
  
  // Show all template field names
  console.log('\n\nAll templates in database:');
  templates.forEach(t => {
    console.log(`  - ${t.field_name} (${t.panel})`);
  });
}

checkTemplates();
