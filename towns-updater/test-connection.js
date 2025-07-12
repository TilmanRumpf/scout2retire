import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('Testing Supabase connection...')

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

// Try to count towns in your database
const { count, error } = await supabase
  .from('towns')
  .select('*', { count: 'exact', head: true })

if (error) {
  console.log('Error:', error.message)
} else {
  console.log('Success! Found', count, 'towns in your database')
}