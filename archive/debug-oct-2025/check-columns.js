import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Get one town to see all columns
const { data, error } = await supabase
  .from('towns')
  .select('*')
  .limit(1)
  .single()

if (data) {
  console.log('Towns table columns:\n')
  Object.keys(data).forEach(column => {
    const value = data[column]
    const type = typeof value
    console.log(`- ${column}: ${type} (example: ${value})`)
  })
}