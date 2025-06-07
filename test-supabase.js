// test-supabase.js
import { createClient } from '@supabase/supabase-js'

// Replace with your actual Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url-here'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...\n')
  
  // Test 1: Check environment variables
  console.log('📋 Step 1: Checking environment variables...')
  if (!supabaseUrl || supabaseUrl === 'your-supabase-url-here') {
    console.log('❌ SUPABASE_URL not found')
    return
  }
  if (!supabaseKey || supabaseKey === 'your-anon-key-here') {
    console.log('❌ SUPABASE_ANON_KEY not found')
    return
  }
  console.log('✅ Environment variables found')
  
  // Test 2: Basic connection
  console.log('\n🔌 Step 2: Testing basic connection...')
  try {
    const { data, error } = await supabase
      .from('_pg_version')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Connection failed:', error.message)
      return
    }
    console.log('✅ Successfully connected to Supabase!')
  } catch (error) {
    console.log('❌ Connection error:', error.message)
    return
  }
  
  // Test 3: Check if you can access your tables
  console.log('\n📊 Step 3: Testing table access...')
  try {
    // Replace 'your_table_name' with an actual table name from your database
    const { data, error } = await supabase
      .from('your_table_name')  // ⚠️ CHANGE THIS LINE
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('⚠️  Table access issue:', error.message)
      console.log('   (This might be normal if the table doesn\'t exist or has RLS enabled)')
    } else {
      console.log('✅ Can access your tables!')
    }
  } catch (error) {
    console.log('⚠️  Table test error:', error.message)
  }
  
  // Test 4: Auth service
  console.log('\n🔐 Step 4: Testing auth service...')
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.log('❌ Auth service error:', error.message)
    } else {
      console.log('✅ Auth service is accessible!')
      console.log('   Current session:', session ? 'Logged in' : 'Not logged in')
    }
  } catch (error) {
    console.log('❌ Auth test failed:', error.message)
  }
  
  console.log('\n🎉 Supabase connection test completed!')
}

// Run the test
testSupabaseConnection()
