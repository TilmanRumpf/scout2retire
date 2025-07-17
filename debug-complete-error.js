import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔍 DEBUGGING ONBOARDING COMPLETE ERROR');
console.log('=====================================\n');

async function debugCompleteError() {
  // Get the specific user mentioned in the error
  const userId = '02600f37-06ab-4fa7-88e6-46caa3e1bf05';
  
  console.log('📋 Checking user:', userId);
  
  try {
    // Get the user's onboarding data
    const { data, error } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.log('❌ Error fetching data:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('❌ No onboarding data found for user');
      return;
    }
    
    const userData = data[0];
    console.log('📊 Found onboarding data\n');
    
    // Check each section for objects that might be rendered
    const sections = [
      'current_status',
      'region_preferences', 
      'climate_preferences',
      'culture_preferences',
      'hobbies',
      'administration',
      'costs'
    ];
    
    sections.forEach(section => {
      if (userData[section]) {
        console.log(`🔍 Checking ${section}:`);
        checkForRenderableObjects(userData[section], section);
        console.log('');
      }
    });
    
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
}

function checkForRenderableObjects(obj, path = '') {
  if (obj === null || obj === undefined) {
    return;
  }
  
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    // Check if this object has properties that might be rendered
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        console.log(`  🚨 POTENTIAL ISSUE: ${currentPath} is an object:`, value);
        
        // Check if this might be used in a render with fallback
        if (key === 'status' || key === 'family_situation' || key === 'retirement_timeline') {
          console.log(`    ⚠️  HIGH RISK: ${key} objects are often rendered with fallbacks`);
        }
      } else if (value === '' && key === 'status') {
        console.log(`  ⚠️  EMPTY STATUS: ${currentPath} is empty string (could cause fallback to object)`);
      } else {
        console.log(`  ✅ ${currentPath}: ${typeof value} = ${JSON.stringify(value)}`);
      }
    });
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) {
        checkForRenderableObjects(item, `${path}[${index}]`);
      }
    });
  }
}

debugCompleteError();