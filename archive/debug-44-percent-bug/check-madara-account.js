import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkUser() {
  console.log('🔍 Checking account for madara.grisule@gmail.com\n');
  
  // Find user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'madara.grisule@gmail.com')
    .single();
    
  if (error) {
    console.error('❌ Error finding user:', error);
    return;
  }
  
  if (!user) {
    console.log('❌ User not found with email madara.grisule@gmail.com');
    return;
  }
  
  console.log('✅ Found user:');
  console.log('- ID:', user.id);
  console.log('- Email:', user.email);
  console.log('- Created:', new Date(user.created_at).toLocaleString());
  console.log('- Full name:', user.full_name || 'Not set');
  console.log('- Username:', user.username || 'Not set');
  
  // Check for related data
  const { data: favorites } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id);
    
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('id')
    .eq('user_id', user.id);
    
  console.log('\n📊 Related data:');
  console.log('- Favorites:', favorites?.length || 0);
  console.log('- Preferences:', preferences?.length || 0);
  
  console.log('\n💡 This is an old account that the user wants to delete herself.');
  console.log('⚠️  Issue: Cannot delete account on mobile device');
}

checkUser().catch(console.error);