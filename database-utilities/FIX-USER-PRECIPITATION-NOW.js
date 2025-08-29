import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔥 FIXING USER PRECIPITATION - FOR REAL THIS TIME');
console.log('=' .repeat(50));

async function fixUsers() {
  // Get ALL users - no fancy filtering that might fail
  const { data: allUsers } = await supabase
    .from('user_preferences')
    .select('*');
  
  console.log(`Total users: ${allUsers?.length}`);
  
  let fixedCount = 0;
  
  for (const user of allUsers || []) {
    if (user.precipitation && Array.isArray(user.precipitation)) {
      let needsUpdate = false;
      const newPrecipitation = user.precipitation.map(p => {
        if (p === 'often_rainy') {
          needsUpdate = true;
          return 'less_dry';
        }
        return p;
      });
      
      if (needsUpdate) {
        console.log(`Fixing user: ${user.email || user.user_id}`);
        console.log(`  Old: ${JSON.stringify(user.precipitation)}`);
        console.log(`  New: ${JSON.stringify(newPrecipitation)}`);
        
        const { error } = await supabase
          .from('user_preferences')
          .update({ precipitation: newPrecipitation })
          .eq('user_id', user.user_id);
        
        if (error) {
          console.error(`  ❌ Failed:`, error);
        } else {
          console.log(`  ✅ Fixed!`);
          fixedCount++;
        }
      }
    }
  }
  
  // Verify
  console.log('\n' + '=' .repeat(50));
  const { data: checkUsers } = await supabase
    .from('user_preferences')
    .select('user_id, precipitation');
  
  const stillBad = [];
  checkUsers?.forEach(u => {
    if (u.precipitation?.includes('often_rainy')) {
      stillBad.push(u.user_id);
    }
  });
  
  if (stillBad.length > 0) {
    console.log(`❌ STILL BROKEN: ${stillBad.length} users`);
  } else {
    console.log(`✅ ALL USERS FIXED! (${fixedCount} updated)`);
  }
}

fixUsers();