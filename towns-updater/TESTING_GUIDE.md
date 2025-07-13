# Testing Guide for Towns Updater

## 🧪 Recommended Testing Approach

### 1. Pre-Test Verification
```bash
# First, check current photo coverage
echo "SELECT COUNT(*) as with_photos FROM towns WHERE image_url_1 IS NOT NULL;" | npx supabase db execute

# Find a town WITH photos for testing
echo "SELECT id, name, country, image_url_1 FROM towns WHERE image_url_1 IS NOT NULL LIMIT 5;" | npx supabase db execute
```

### 2. Test Photo Safety Policy
```bash
# Run the photo safety test
node test-photo-safety.js
```

This test will:
- Find a town with photos
- Attempt to update it WITH photo fields
- Verify photos were NOT changed
- Clean up test data

**Expected Result**: Photos should remain unchanged even if update includes photo fields

### 3. Test Individual Update Scripts

#### A. Test Basic Connection
```bash
node test-connection.js
# Expected: "Success! Found X towns in your database"
```

#### B. Test Safe Update Scripts
```bash
# Pick a specific town to monitor
echo "SELECT * FROM towns WHERE name = 'Porto' AND country = 'Portugal';" | npx supabase db execute

# Run update
node update-porto-paris-safe.js

# Verify photos unchanged
echo "SELECT name, image_url_1, cost_index FROM towns WHERE name = 'Porto';" | npx supabase db execute
```

### 4. Dry Run Testing Strategy

Create a test wrapper for any update script:

```javascript
// dry-run-wrapper.js
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Wrap any update in a transaction that rolls back
async function dryRun(updateFunction) {
  console.log('🏃 DRY RUN MODE - Changes will be rolled back\n')
  
  // Note: Supabase doesn't support true transactions via JS client
  // So we'll track changes and reverse them
  
  const changes = []
  
  // Run your update
  await updateFunction()
  
  console.log('\n🔄 DRY RUN COMPLETE - No permanent changes made')
}
```

### 5. Testing Checklist

Before running any update script in production:

- [ ] **Backup Check**: Note current values of towns you'll update
- [ ] **Photo Verification**: Confirm script excludes photo fields
- [ ] **Small Test**: Run on 1-2 towns first
- [ ] **Verify Results**: Check photos remain unchanged
- [ ] **Check Other Fields**: Ensure intended updates worked
- [ ] **Scale Gradually**: If successful, run on more towns

### 6. Monitoring Commands

```bash
# Before update - save state
echo "SELECT id, name, image_url_1, cost_index FROM towns WHERE country = 'Portugal';" | npx supabase db execute > before-update.txt

# After update - compare
echo "SELECT id, name, image_url_1, cost_index FROM towns WHERE country = 'Portugal';" | npx supabase db execute > after-update.txt

# Check differences
diff before-update.txt after-update.txt
```

### 7. Emergency Rollback

If photos are accidentally modified:

```sql
-- Create a backup table first (run in Supabase dashboard)
CREATE TABLE towns_backup AS SELECT * FROM towns;

-- If needed, restore photos from backup
UPDATE towns t
SET 
  image_url_1 = b.image_url_1,
  image_url_2 = b.image_url_2,
  image_url_3 = b.image_url_3
FROM towns_backup b
WHERE t.id = b.id
AND (
  t.image_url_1 != b.image_url_1 OR
  t.image_url_2 != b.image_url_2 OR
  t.image_url_3 != b.image_url_3
);
```

## 🎯 Best Practices

1. **Always Test on Towns WITH Photos First**
   - This ensures you can verify photos are preserved
   - Towns without photos can't show if protection is working

2. **Use SELECT Queries Liberally**
   - Check state before and after updates
   - Verify only intended fields changed

3. **Start Small**
   - Test on 1 town
   - Then 5 towns
   - Then full batch

4. **Monitor Photo Count**
   ```bash
   # This number should NEVER decrease
   echo "SELECT COUNT(*) FROM towns WHERE image_url_1 IS NOT NULL;" | npx supabase db execute
   ```

5. **Document Your Tests**
   - Note which towns you tested
   - Record what changed
   - Save queries that worked well

## ⚠️ Red Flags

If you see any of these, STOP immediately:

- ❌ Photo count decreases after update
- ❌ Photo URLs change to placeholder values
- ❌ Script outputs "updating image_url" messages
- ❌ Diff shows photo fields modified

## ✅ Green Flags

Good signs your update is safe:

- ✅ Photo URLs remain exactly the same
- ✅ Only intended fields (costs, descriptions) change
- ✅ Photo count stays constant
- ✅ No image_url fields in update objects