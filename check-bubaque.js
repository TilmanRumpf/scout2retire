import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEwNzk1MywiZXhwIjoyMDcyNjgzOTUzfQ.Oy-MblIo6xNvNI6KJwsjrU9uO17rWko_p08fZHY1uyE'
)

async function checkBubaque() {
  console.log('Checking Bubaque town data...\n')

  const { data, error } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Bubaque')
    .single()

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Bubaque Data:')
  console.log(JSON.stringify(data, null, 2))

  // Calculate data completeness
  const fields = Object.keys(data)
  const filledFields = fields.filter(key => data[key] !== null && data[key] !== '')
  const completeness = ((filledFields.length / fields.length) * 100).toFixed(1)

  console.log(`\nTotal Fields: ${fields.length}`)
  console.log(`Filled Fields: ${filledFields.length}`)
  console.log(`Data Completeness: ${completeness}%`)
}

checkBubaque()
