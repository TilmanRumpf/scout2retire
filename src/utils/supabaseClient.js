import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase connection
const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL from env:', envSupabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

// Determine the final URL to use (either from env or fallback)
let supabaseUrl = envSupabaseUrl;
if (!envSupabaseUrl || envSupabaseUrl === 'https://placeholder.supabase.co') {
  console.error('Invalid or missing Supabase URL. Check your .env file.');
  // Provide a fallback for development
  supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
  console.log('Using fallback URL:', supabaseUrl);
}

if (!supabaseKey) {
  console.error('Missing Supabase anon key. Check your .env file.');
}

// Create and export the Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;