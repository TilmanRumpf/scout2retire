import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

console.log('Starting towns update...')

// First, find Porto to confirm it exists
const { data: findData, error: findError } = await supabase
  .from('towns')
  .select('*')
  .eq('name', 'Porto')
  .eq('country', 'Portugal')

if (findError) {
  console.log('Find Error:', findError.message)
} else if (findData.length === 0) {
  console.log('Porto not found in Portugal')
} else {
  console.log('Found Porto:', findData[0].name, 'Current cost_index:', findData[0].cost_index)
  
  // Now update it
  const { data: updateData, error: updateError } = await supabase
    .from('towns')
    .update({ cost_index: 1300 })
    .eq('id', findData[0].id)
    .select()

  if (updateError) {
    console.log('Update Error:', updateError.message)
  } else {
    console.log('Updated successfully:', updateData)
  }
}

console.log('Update complete!')