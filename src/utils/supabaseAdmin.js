import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const url = process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('❌ Missing environment variables:')
  console.error('   VITE_SUPABASE_URL:', url ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', key ? '✅' : '❌')
  process.exit(1)
}

// Create admin client with service role (bypasses RLS)
export const supabaseAdmin = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

// Chunking utility for batch operations
export function chunkArray(array, size = 500) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
