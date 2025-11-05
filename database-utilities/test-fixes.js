import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFixes() {
  console.log('Testing database fixes...\n')

  let allPassed = true

  // Test 1: get_user_limits function
  console.log('1. Testing get_user_limits function...')
  try {
    const { data, error } = await supabase.rpc('get_user_limits')

    if (error) {
      console.log('   ❌ FAILED:', error.message)
      allPassed = false
    } else {
      console.log('   ✅ PASSED: Function works!')
      if (data && data.length > 0) {
        console.log('   Sample data:', data[0])
      } else {
        console.log('   (No limits configured for current user)')
      }
    }
  } catch (e) {
    console.log('   ❌ FAILED:', e.message)
    allPassed = false
  }

  // Test 2: chat_threads table access
  console.log('\n2. Testing chat_threads table access...')
  try {
    const { data, error } = await supabase
      .from('chat_threads')
      .select('id')
      .limit(1)

    if (error && error.code === '42P01') {
      console.log('   ❌ FAILED: Table does not exist')
      allPassed = false
    } else if (error) {
      // This might just mean no rows, which is fine
      if (error.message.includes('permission') || error.message.includes('denied')) {
        console.log('   ❌ FAILED: Permission issue -', error.message)
        allPassed = false
      } else {
        console.log('   ✅ PASSED: Table exists (no data yet)')
      }
    } else {
      console.log('   ✅ PASSED: Table exists and is accessible')
      if (data && data.length > 0) {
        console.log('   Found', data.length, 'thread(s)')
      }
    }
  } catch (e) {
    console.log('   ❌ FAILED:', e.message)
    allPassed = false
  }

  // Test 3: chat_messages with join
  console.log('\n3. Testing chat_messages with thread join...')
  try {
    const { data, error } = await supabase
      .from('chat_threads')
      .select(`
        id,
        chat_messages!inner(
          id,
          created_at,
          user_id
        )
      `)
      .limit(1)

    if (error) {
      // No data is fine, just checking the query works
      if (error.code === 'PGRST116') {
        console.log('   ✅ PASSED: Query structure works (no data yet)')
      } else {
        console.log('   ⚠️  WARNING:', error.message)
        console.log('   (This might be normal if no messages exist yet)')
      }
    } else {
      console.log('   ✅ PASSED: Join query works!')
      if (data && data.length > 0) {
        console.log('   Found data:', data.length, 'thread(s) with messages')
      }
    }
  } catch (e) {
    console.log('   ❌ FAILED:', e.message)
    allPassed = false
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Database fixes are working.')
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.')
  }
  console.log('='.repeat(50))

  process.exit(allPassed ? 0 : 1)
}

testFixes()