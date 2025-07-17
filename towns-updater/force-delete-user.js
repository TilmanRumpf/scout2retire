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

async function forceDeleteUser() {
  const userId = '2441b980-2f30-4986-a86d-c32c18c781ea';
  
  console.log(`Force deleting user: ${userId}`);
  
  try {
    // First check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();
    
    if (checkError) {
      console.log('User not found or already deleted:', checkError.message);
      return;
    }
    
    console.log('Found user:', existingUser.email);
    
    // Force delete from users table
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('Error deleting user:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return;
    }
    
    console.log('✅ User deleted successfully from users table');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
  
  // Exit process
  process.exit(0);
}

forceDeleteUser();