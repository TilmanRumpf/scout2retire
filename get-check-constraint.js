import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getConstraint() {
  console.log('📋 Getting check constraint definition for cultural_events_frequency...\n');

  // Try to insert an invalid value to see the error message
  const { error } = await supabase
    .from('towns')
    .insert({
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Test Town',
      country: 'Test',
      cultural_events_frequency: 'INVALID_VALUE_TEST'
    });

  if (error) {
    console.log('Error message:', error.message);
    console.log('\nThis should show the valid values in the constraint.');
  }
}

getConstraint().catch(console.error);
