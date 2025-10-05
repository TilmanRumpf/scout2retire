import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkUserStructure() {
  // Check user table structure
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (users.length > 0) {
    console.log('User table columns:');
    const columns = Object.keys(users[0]).sort();
    columns.forEach(col => {
      const value = users[0][col];
      const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
      console.log(`  - ${col} (${type})`);
    });
    
    // Check for onboarding data
    console.log('\nOnboarding-related fields:');
    const onboardingFields = columns.filter(col => col.includes('onboarding'));
    if (onboardingFields.length > 0) {
      onboardingFields.forEach(field => {
        console.log(`  - ${field}`);
      });
    } else {
      console.log('  No onboarding fields found in users table');
    }
    
    // Check for preference fields
    console.log('\nPreference-related fields:');
    const prefFields = columns.filter(col => 
      col.includes('preference') || 
      col.includes('region') || 
      col.includes('climate') ||
      col.includes('culture') ||
      col.includes('hobbies') ||
      col.includes('admin') ||
      col.includes('budget')
    );
    if (prefFields.length > 0) {
      prefFields.forEach(field => {
        console.log(`  - ${field}`);
      });
    }
  }
  
  // Check onboarding_responses table
  console.log('\nChecking onboarding_responses table...');
  const { data: responses, error: respError } = await supabase
    .from('onboarding_responses')
    .select('*')
    .limit(1);
    
  if (respError) {
    console.log('onboarding_responses table error:', respError.message);
  } else if (responses && responses.length > 0) {
    console.log('onboarding_responses columns:');
    Object.keys(responses[0]).forEach(col => {
      console.log(`  - ${col}`);
    });
  }
}

checkUserStructure();