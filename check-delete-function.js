import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkFunction() {
  console.log('🔍 Checking if delete_user_account function exists...\n');
  
  // Check if function exists
  const { data, error } = await supabase.rpc('get_function_info', {
    function_name: 'delete_user_account'
  }).single();
  
  if (error) {
    // Try calling the function with a fake ID to see if it exists
    const { error: rpcError } = await supabase.rpc('delete_user_account', {
      user_id_param: '00000000-0000-0000-0000-000000000000'
    });
    
    if (rpcError?.message?.includes('function') && rpcError?.message?.includes('does not exist')) {
      console.log('❌ Function delete_user_account does NOT exist in database');
      console.log('\n📝 Need to create it. Here\'s the SQL:\n');
      
      const sql = `-- Create delete_user_account RPC function
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete from user_preferences table
  DELETE FROM public.user_preferences WHERE user_id = user_id_param;
  
  -- Delete from favorites table
  DELETE FROM public.favorites WHERE user_id = user_id_param;
  
  -- Delete from notifications table (if exists)
  DELETE FROM public.notifications WHERE user_id = user_id_param;
  
  -- Delete from users table (profile data)
  DELETE FROM public.users WHERE id = user_id_param;
  
  RETURN json_build_object(
    'success', true,
    'message', 'User data deleted successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO authenticated;`;
      
      console.log(sql);
    } else {
      console.log('✅ Function exists (got different error):', rpcError?.message);
    }
  } else {
    console.log('✅ Function information:', data);
  }
}

checkFunction().catch(console.error);