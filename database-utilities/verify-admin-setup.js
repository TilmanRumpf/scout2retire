import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function verifyAdminSetup() {
  try {
    console.log('🔍 Verifying admin setup...\n');
    
    // Check if is_admin column exists and get all admin users
    const { data: adminUsers, error } = await supabase
      .from('users')
      .select('id, email, full_name, is_admin, created_at')
      .eq('is_admin', true)
      .order('email');
    
    if (error) {
      console.error('❌ Error verifying admin users:', error);
      
      if (error.message.includes("column users.is_admin does not exist")) {
        console.log('\n💡 The is_admin column has not been added yet.');
        console.log('📋 Please run the SQL commands in: database-utilities/admin-setup-commands.sql');
        console.log('🔗 Go to: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new');
        return;
      }
    } else {
      console.log('✅ Admin setup verification successful!\n');
      
      if (adminUsers && adminUsers.length > 0) {
        console.log('👑 Current admin users:');
        console.log('═'.repeat(80));
        adminUsers.forEach((user, index) => {
          console.log(`${index + 1}. ${user.email}`);
          console.log(`   Name: ${user.full_name}`);
          console.log(`   ID: ${user.id}`);
          console.log(`   Admin: ${user.is_admin ? '✅ YES' : '❌ NO'}`);
          console.log(`   Member since: ${new Date(user.created_at).toLocaleDateString()}`);
          console.log('─'.repeat(60));
        });
        
        console.log(`\n📊 Total admin users: ${adminUsers.length}`);
      } else {
        console.log('⚠️  No admin users found.');
        console.log('📋 Make sure to run the UPDATE commands in admin-setup-commands.sql');
      }
    }
    
    // Also check the expected admin emails exist in the database
    console.log('\n🔍 Checking if all expected admin emails exist...');
    const expectedAdmins = [
      'tobiasrumpf@gmx.de',
      'tilman.rumpf@gmail.com', 
      'tobias.rumpf1@gmail.com', 
      'madara.grisule@gmail.com'
    ];
    
    for (const email of expectedAdmins) {
      const { data: user, error: searchError } = await supabase
        .from('users')
        .select('email, full_name, is_admin')
        .eq('email', email)
        .single();
      
      if (searchError) {
        console.log(`❌ ${email}: Not found in database`);
      } else {
        const adminStatus = user.is_admin ? '👑 ADMIN' : '👤 USER';
        console.log(`✅ ${email}: ${adminStatus} (${user.full_name})`);
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

verifyAdminSetup();