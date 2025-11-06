import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAuthStatus() {
  console.log('Checking authentication status...\n')

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.log('Auth error:', authError.message)
  } else if (user) {
    console.log('✅ Authenticated as:', user.email)
    console.log('User ID:', user.id)
  } else {
    console.log('❌ Not authenticated')
    console.log('This might explain why towns query returns empty array')
  }

  // Try to query towns anyway
  console.log('\nQuerying towns table...')
  const { data: towns, error: townsError } = await supabase
    .from('towns')
    .select('id, town_name, town_name')
    .limit(3)

  if (townsError) {
    console.log('Towns error:', townsError.message)
    console.log('Code:', townsError.code)
  } else if (towns && towns.length > 0) {
    console.log('✅ Got', towns.length, 'towns:')
    towns.forEach(t => console.log(`  - ${t.town_name || t.town_name}`))
  } else {
    console.log('❌ Empty result (RLS might be blocking access)')
    console.log('This happens when:')
    console.log('1. User is not authenticated')
    console.log('2. RLS policies require authentication')
    console.log('3. Towns table has no public access')
  }

  process.exit()
}

checkAuthStatus()