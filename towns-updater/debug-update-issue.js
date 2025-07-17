import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('🔍 Debugging update issue...\n')

async function debugUpdate() {
  // 1. Check what columns exist in the towns table
  console.log('1️⃣ Checking towns table schema...')
  const { data: columns, error: schemaError } = await supabase
    .rpc('sql', { 
      query: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'towns' ORDER BY column_name;`
    })
  
  if (schemaError) {
    console.log('Schema check failed, trying direct query...')
    
    // Alternative: Check a single town to see its structure
    const { data: sampleTown, error: sampleError } = await supabase
      .from('towns')
      .select('*')
      .eq('name', 'Zutphen')
      .single()
    
    if (sampleError) {
      console.error('Sample query failed:', sampleError)
    } else {
      console.log('Sample town columns:', Object.keys(sampleTown))
      console.log('Sample town data for Zutphen:')
      Object.entries(sampleTown).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          console.log(`  ${key}: ${value}`)
        }
      })
    }
  }
  
  // 2. Try a simple update with one field to test
  console.log('\n2️⃣ Testing simple update...')
  
  const { data: testTown } = await supabase
    .from('towns')
    .select('id, name, country')
    .eq('name', 'Zutphen')
    .single()
  
  if (testTown) {
    console.log(`Found test town: ${testTown.name}, ${testTown.country} (ID: ${testTown.id})`)
    
    // Try updating just one field
    const { data: updateResult, error: updateError } = await supabase
      .from('towns')
      .update({ 
        description: 'TEST UPDATE - Debug check',
        last_ai_update: new Date().toISOString()
      })
      .eq('id', testTown.id)
      .select('id, name, description, last_ai_update')
    
    if (updateError) {
      console.error('❌ Update failed:', updateError)
    } else {
      console.log('✅ Update successful!')
      console.log('Updated data:', updateResult)
    }
    
    // Verify the update stuck
    const { data: verifyData } = await supabase
      .from('towns')
      .select('description, last_ai_update')
      .eq('id', testTown.id)
      .single()
    
    console.log('Verification query result:', verifyData)
  }
  
  // 3. Check if there are any triggers or RLS policies
  console.log('\n3️⃣ Checking for RLS policies...')
  const { data: user } = await supabase.auth.getUser()
  console.log('Current user:', user?.user?.id || 'Anonymous')
  
  // 4. Try with a different approach - UPSERT
  console.log('\n4️⃣ Testing UPSERT approach...')
  const { data: upsertResult, error: upsertError } = await supabase
    .from('towns')
    .upsert({ 
      id: testTown.id,
      description: 'TEST UPSERT - Debug check',
      cost_index: 1999
    }, { 
      onConflict: 'id' 
    })
    .select()
  
  if (upsertError) {
    console.error('❌ Upsert failed:', upsertError)
  } else {
    console.log('✅ Upsert result:', upsertResult)
  }
}

debugUpdate()