import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔍 SEARCHING FOR STATUS OBJECT RENDER BUG');
console.log('==========================================\n');

async function findStatusObjectRenderBug() {
  // Get the specific user's data
  const userId = '02600f37-06ab-4fa7-88e6-46caa3e1bf05';
  
  try {
    const { data, error } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', userId);
    
    if (error || !data || data.length === 0) {
      console.log('❌ No data found');
      return;
    }
    
    const userData = data[0];
    
    // Test patterns that might be problematic in React render
    console.log('🧪 TESTING POTENTIAL RENDER PATTERNS:\n');
    
    // Pattern 1: family_situation fallback (we already fixed this)
    console.log('1. Family situation fallback:');
    const familySituation = userData.current_status?.family_situation;
    const familyResult1 = familySituation?.status || familySituation || 'Not specified';
    const familyResult2 = familySituation?.status || (typeof familySituation === 'string' ? familySituation : 'Not specified');
    
    console.log('   Old pattern result:', familyResult1, typeof familyResult1);
    console.log('   New pattern result:', familyResult2, typeof familyResult2);
    console.log('   Would old pattern break React?', typeof familyResult1 === 'object');
    console.log('');
    
    // Pattern 2: Direct status access in empty objects
    console.log('2. Direct status property access:');
    
    // Check all objects that have empty status properties
    const objectsWithStatus = [];
    
    function findObjectsWithStatus(obj, path = '') {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        if ('status' in obj) {
          objectsWithStatus.push({ path, obj, status: obj.status });
        }
        
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'object' && value !== null) {
            findObjectsWithStatus(value, path ? `${path}.${key}` : key);
          }
        }
      }
    }
    
    findObjectsWithStatus(userData);
    
    objectsWithStatus.forEach(item => {
      console.log(`   Found status at ${item.path}:`, item.status, typeof item.status);
      
      // Test if accessing just the object (not .status) would be problematic  
      if (item.status === '') {
        console.log(`   ⚠️  POTENTIAL BUG: ${item.path} has empty status string`);
        console.log(`   If rendered as: {data.${item.path}} it would show:`, item.obj);
        console.log(`   Type:`, typeof item.obj);
        
        if (typeof item.obj === 'object') {
          console.log(`   🚨 FOUND BUG CANDIDATE: Would render object in React!`);
        }
      }
    });
    
    console.log('\n3. Checking getPreferenceSummary pattern:');
    // Test the pattern from OnboardingComplete.jsx that builds preference summary
    const costs = userData.costs;
    console.log('   costs object:', costs);
    
    if (costs?.total_monthly_budget) {
      console.log('   ✅ total_monthly_budget renders as:', costs.total_monthly_budget);
    }
    
    // Check climate preferences
    const climate = userData.climate_preferences;
    console.log('   climate_preferences:', climate);
    
    if (climate?.seasonal_preference) {
      console.log('   seasonal_preference:', climate.seasonal_preference, typeof climate.seasonal_preference);
      if (climate.seasonal_preference === '') {
        console.log('   🚨 Empty seasonal_preference could cause issues if used in || fallback');
      }
    }
    
    console.log('\n🎯 ANALYSIS:');
    console.log('Looking for places where empty status objects might be rendered...');
    
    // Check specific problematic patterns
    const problematicObjects = objectsWithStatus.filter(item => {
      return item.status === '' || (typeof item.status === 'object' && item.status !== null);
    });
    
    if (problematicObjects.length > 0) {
      console.log('\n🚨 FOUND PROBLEMATIC STATUS OBJECTS:');
      problematicObjects.forEach(item => {
        console.log(`   ${item.path}: status = "${item.status}" (${typeof item.status})`);
        console.log(`   Full object:`, JSON.stringify(item.obj, null, 2));
      });
    }
    
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
}

findStatusObjectRenderBug();