# 🗄️ DATABASE RUNNER GUIDE

## Overview

Simple, hands-off database operations via JSON task files. One runner script handles all updates - dry-run by default, `--apply` to execute.

## Quick Start

```bash
# Dry run (preview only)
npm run db:run db-tasks/mobility-backfill.json

# Execute changes
npm run db:run db-tasks/mobility-backfill.json -- --apply
```

## Setup

### 1. Verify Environment Variables

Ensure `.env` contains:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

**Get Service Role Key:**
1. Go to https://supabase.com/dashboard/project/[your-project]/settings/api
2. Copy "service_role" key (NOT anon key)
3. Add to `.env` as `SUPABASE_SERVICE_ROLE_KEY`

### 2. File Structure

```
scout2retire/
├── db-runner.js              # Main runner script
├── db-tasks/                 # JSON task files
│   ├── mobility-backfill.json
│   └── [your-task].json
├── src/utils/
│   └── supabaseAdmin.js      # Admin client
└── database-utilities/
    └── operation-log.jsonl   # Auto-generated logs
```

## Creating Tasks

### Update Operation

```json
{
  "description": "Brief description of what this does",
  "table": "towns",
  "operation": "update",
  "filters": {
    "column_name": null
  },
  "updates": {
    "column_name": ["new", "values"]
  }
}
```

### Upsert Operation

```json
{
  "description": "Bulk upsert records",
  "table": "towns",
  "operation": "upsert",
  "onConflict": "id",
  "chunkSize": 500,
  "records": [
    { "id": 1, "name": "Town A", "data": "value" },
    { "id": 2, "name": "Town B", "data": "value" }
  ]
}
```

### Insert Operation

```json
{
  "description": "Insert new records",
  "table": "towns",
  "operation": "insert",
  "chunkSize": 500,
  "records": [
    { "name": "New Town", "country": "USA" }
  ]
}
```

## Filter Options

### Null Values
```json
"filters": {
  "column_name": null  // Matches NULL values
}
```

### Exact Match
```json
"filters": {
  "country": "Canada"  // Matches exactly
}
```

### Array Match (IN clause)
```json
"filters": {
  "id": [1, 2, 3]  // Matches any of these IDs
}
```

## Runner Features

### 1. Dry Run (Default)
- Queries and shows affected rows
- Displays sample data
- No changes made
- Safe to run anytime

### 2. Apply Mode
- Executes actual changes
- Updates in batches (chunking)
- Logs all operations
- Verifies results

### 3. Auto-Logging
Every executed operation is logged to `database-utilities/operation-log.jsonl`:
```jsonl
{"task":"mobility-backfill.json","operation":"update","table":"towns","affected":308,"timestamp":"2025-10-06T19:30:00.000Z"}
```

### 4. Null-Safe Filters
Automatically handles:
- `null` values → `.is(column, null)`
- Arrays → `.in(column, values)`
- Strings → `.eq(column, value)`

## Examples

### Example 1: Backfill Null Fields

**Task:** `db-tasks/mobility-backfill.json`
```json
{
  "description": "Backfill mobility fields",
  "table": "towns",
  "operation": "update",
  "filters": {
    "local_mobility_options": null
  },
  "updates": {
    "local_mobility_options": ["walking", "cycling", "public_transit"],
    "regional_connectivity": ["highways", "regional_bus"]
  }
}
```

**Run:**
```bash
# Preview
npm run db:run db-tasks/mobility-backfill.json

# Execute
npm run db:run db-tasks/mobility-backfill.json -- --apply
```

### Example 2: Update Specific Towns

**Task:** `db-tasks/update-canadian-towns.json`
```json
{
  "description": "Update Canadian town attributes",
  "table": "towns",
  "operation": "update",
  "filters": {
    "country": "Canada"
  },
  "updates": {
    "retirement_visa_available": false,
    "visa_requirements_summary": "Canadian citizenship or PR required"
  }
}
```

### Example 3: Bulk Upsert

**Task:** `db-tasks/upsert-new-data.json`
```json
{
  "description": "Upsert 100 town records",
  "table": "towns",
  "operation": "upsert",
  "onConflict": "id",
  "chunkSize": 500,
  "records": [
    { "id": 1, "name": "Updated Town 1", "population": 50000 },
    { "id": 2, "name": "Updated Town 2", "population": 75000 }
  ]
}
```

## Troubleshooting

### "Invalid API key"
1. Check `.env` has correct `SUPABASE_SERVICE_ROLE_KEY`
2. Get fresh key from Supabase dashboard → Settings → API
3. Ensure you copied "service_role" key, not "anon" key

### "No records found"
- Filters might be too restrictive
- Check filter values match actual data
- Use dry run to preview query results

### "Table not found"
- Verify table name is correct (case-sensitive)
- Ensure you're connected to correct Supabase project

### "Operation failed"
- Check operation-log.jsonl for details
- Verify data types match schema
- Ensure service role has necessary permissions

## Best Practices

### 1. Always Dry Run First
```bash
# Step 1: Preview
npm run db:run db-tasks/my-task.json

# Step 2: Review output

# Step 3: Execute if correct
npm run db:run db-tasks/my-task.json -- --apply
```

### 2. Backup Before Large Updates
```bash
node create-database-snapshot.js
npm run db:run db-tasks/large-update.json -- --apply
```

### 3. Small Batches for Testing
For new tasks, test with small subset first:
```json
"filters": {
  "id": [1, 2, 3]  // Test with just 3 records
}
```

### 4. Version Control Tasks
Commit JSON task files to git:
```bash
git add db-tasks/my-task.json
git commit -m "Add task: brief description"
```

### 5. Monitor Logs
```bash
# View recent operations
tail -n 20 database-utilities/operation-log.jsonl

# Search for specific task
grep "mobility-backfill" database-utilities/operation-log.jsonl
```

## Advanced Usage

### Custom Chunking
```json
{
  "operation": "upsert",
  "chunkSize": 100,  // Smaller chunks for slower connections
  "records": [...]
}
```

### Multiple Filters
```json
"filters": {
  "country": "Canada",
  "population": null  // Both conditions must match
}
```

### Verify Results
Runner automatically verifies after updates:
```
Step 3: Verification...
   Remaining nulls: 0
```

## Migration from Old Scripts

### Old Way (Manual)
```sql
UPDATE towns
SET local_mobility_options = ARRAY[...]
WHERE local_mobility_options IS NULL;
```

### New Way (Automated)
```bash
npm run db:run db-tasks/mobility-backfill.json -- --apply
```

**Benefits:**
- ✅ Dry run preview
- ✅ Auto-logging
- ✅ Error handling
- ✅ Verification
- ✅ Repeatable
- ✅ Version controlled

## Support

**Issues?**
1. Check this guide
2. Review operation-log.jsonl
3. Verify .env configuration
4. Check Supabase dashboard for errors

**Need help creating tasks?**
- Use examples in `db-tasks/` as templates
- Copy and modify existing tasks
- Follow JSON structure exactly
