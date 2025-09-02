import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkUsersSchema() {
  try {
    console.log('📋 Checking current users table...');
    
    // Get all users to see current schema
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      console.log('✅ Sample user record:');
      console.log(JSON.stringify(users[0], null, 2));
      
      if (users[0]) {
        console.log('📊 Current columns:');
        Object.keys(users[0]).forEach(column => {
          console.log(`   ${column}: ${typeof users[0][column]}`);
        });
      }
    }
    
    // Check if any users have email addresses we want to make admin
    const adminEmails = [
      'tobiasrumpf@gmx.de',
      'tilman.rumpf@gmail.com', 
      'tobias.rumpf1@gmail.com', 
      'madara.grisule@gmail.com'
    ];
    
    console.log('\n🔍 Checking for admin email addresses...');
    
    for (const email of adminEmails) {
      const { data: foundUsers, error: searchError } = await supabase
        .from('users')
        .select('id, email, created_at')
        .eq('email', email);
      
      if (searchError) {
        console.error(`Error searching for ${email}:`, searchError);
      } else if (foundUsers && foundUsers.length > 0) {
        console.log(`✅ Found: ${email} (ID: ${foundUsers[0].id})`);
      } else {
        console.log(`❌ Not found: ${email}`);
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkUsersSchema();