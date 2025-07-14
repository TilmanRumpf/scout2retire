# CLAUDE CODE DATABASE WORKFLOW

## 🚨 CRITICAL: DATABASE HIERARCHY

1. **ONLINE SUPABASE = PRIMARY SOURCE OF TRUTH**
   - URL: https://axlruvvsjepsulcbqlho.supabase.co
   - This is where ALL real data lives
   - ALL updates happen here first

2. **LOCAL SUPABASE = READ-ONLY MIRROR**
   - Only for development/testing
   - NEVER the source of truth
   - Must be synced FROM online regularly

## 📝 HOW TO EXECUTE SQL QUERIES

### ❌ WRONG (This doesn't exist!):
```bash
npx supabase db execute <<SQL  # THIS COMMAND DOESN'T EXIST!
SELECT * FROM towns;
SQL
```

### ✅ CORRECT - Use JavaScript:
```javascript
// 1. Create a file (e.g., check-towns.js)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

// 2. Run your queries
const { data, error } = await supabase
  .from('towns')
  .select('*')
  .eq('country', 'Portugal');

console.log('Portuguese towns:', data);

// 3. Run the file
// node check-towns.js
```

## 🔄 SYNCING WORKFLOW

### After ANY changes to online database:
```bash
# Pull latest schema and data from online to local
npx supabase db pull

# This ensures local matches online
```

### For migrations:
```bash
# 1. Create migration locally
npx supabase migration new your_migration_name

# 2. Edit the migration file in supabase/migrations/

# 3. Push to online (this applies to ONLINE database)
npx supabase db push

# 4. Local will auto-update on next pull
```

## 🎯 QUICK REFERENCE

**Need to check data?**
→ Create JS file, use Supabase client, run with node

**Need to update data?**
→ Create JS file, update ONLINE instance, then pull to local

**Need to run complex SQL?**
→ Use Supabase Dashboard SQL Editor: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql

**Need to create tables/migrations?**
→ Use migration files, push to online, pull to local

## ⚠️ REMEMBER

- Local database is just a mirror
- NEVER rely on local data as truth
- ALWAYS work with online instance first
- Sync local after online changes
- The `npx supabase db execute` command DOES NOT EXIST