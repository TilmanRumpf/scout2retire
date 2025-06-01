import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL from env:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

// Validate that environment variables are properly set
if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
  console.error('Invalid or missing Supabase URL. Check your .env file.');
  // Provide a fallback for development
  const fallbackUrl = 'https://axlruvxsjepsulcbqlho.supabase.co';
  console.log('Using fallback URL:', fallbackUrl);
  supabaseUrl = fallbackUrl;
}

if (!supabaseKey) {
  console.error('Missing Supabase anon key. Check your .env file.');
}

// Create and export the Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;