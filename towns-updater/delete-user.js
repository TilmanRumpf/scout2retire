import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '../.env') });

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function deleteUser() {
  const userId = '2441b980-2f30-4986-a86d-c32c18c781ea';
  
  console.log(`Deleting user: ${userId}`);
  
  try {
    // Delete from users table
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('Error deleting user:', error);
      return;
    }
    
    console.log('✅ User deleted successfully from users table');
    
    // Also check and delete related data
    // Delete from onboarding_responses if exists
    const { error: onboardingError } = await supabase
      .from('onboarding_responses')
      .delete()
      .eq('user_id', userId);
      
    if (!onboardingError) {
      console.log('✅ Deleted related onboarding responses');
    }
    
    // Delete from favorites if exists
    const { error: favoritesError } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId);
      
    if (!favoritesError) {
      console.log('✅ Deleted related favorites');
    }
    
    // Delete from user_preferences if exists
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId);
      
    if (!prefsError) {
      console.log('✅ Deleted related user preferences');
    }
    
    console.log('\n🗑️  User and all related data deleted successfully');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

deleteUser();