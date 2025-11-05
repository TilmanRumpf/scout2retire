import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugGetUserLimits() {
  console.log('Debugging get_user_limits function...\n')

  // First check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log('No user logged in. Testing with anonymous call...')
  } else {
    console.log('User logged in:', user.email)
  }

  // Try calling the function
  console.log('\nCalling get_user_limits()...')
  const { data, error } = await supabase.rpc('get_user_limits')

  if (error) {
    console.log('Error details:')
    console.log('- Code:', error.code)
    console.log('- Message:', error.message)
    console.log('- Details:', error.details)
    console.log('- Hint:', error.hint)

    if (error.message.includes('structure of query does not match')) {
      console.log('\n⚠️  The function return structure doesn\'t match what Supabase expects.')
      console.log('This might be because the function is returning NULL values')
      console.log('or the user doesn\'t have a category assigned.')
    }
  } else {
    console.log('Success! Data returned:')
    console.log(data)
  }

  // Check if user has a category
  if (user) {
    console.log('\nChecking user category...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, category_id')
      .eq('id', user.id)
      .single()

    if (userData) {
      console.log('User category_id:', userData.category_id || 'NULL (no category assigned)')

      if (!userData.category_id) {
        console.log('\n⚠️  User has no category assigned!')
        console.log('This would cause get_user_limits to return no rows.')
      }
    }
  }

  process.exit()
}

debugGetUserLimits()