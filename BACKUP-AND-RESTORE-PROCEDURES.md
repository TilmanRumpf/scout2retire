# 🚨 CRITICAL: BACKUP AND RESTORE PROCEDURES

**LAST UPDATED:** July 31, 2025
**STATUS:** IMPLEMENTING NOW

## 🔴 CURRENT RISK LEVEL: EXTREME
- **Last database migration:** July 14 (17 days ago!)
- **Database changes since then:** UNTRACKED
- **Backup system:** NONE
- **Rollback capability:** LIMITED

## 🛡️ IMMEDIATE ACTIONS REQUIRED

### 1. Enable Supabase Point-in-Time Recovery (PITR)
```
1. Go to: https://app.supabase.com/project/axlruvvsjepsulcbqlho
2. Settings → Database → Backups
3. Enable "Point-in-time Recovery"
4. This gives us 7-day rollback capability
```

### 2. Create Database Snapshot NOW
```bash
# Run this immediately
node create-database-snapshot.js
```

### 3. Git Checkpoint
```bash
# Create a safe return point
git add -A
git commit -m "🔒 SAFE CHECKPOINT: Before aggressive database/code changes"
git tag -a "safe-checkpoint-$(date +%Y%m%d)" -m "Safe return point"
git push origin main --tags
```

## 📋 BACKUP CHECKLIST (Run Before EVERY Session)

### Code Backup
```bash
# 1. Commit all changes
git add -A && git commit -m "Checkpoint: $(date)"

# 2. Create backup branch
git checkout -b "backup-$(date +%Y%m%d-%H%M%S)"
git checkout main

# 3. Push to remote
git push origin main
```

### Database Backup
```bash
# 1. Export current schema
node export-database-schema.js

# 2. Export data for critical tables
node export-critical-data.js

# 3. Create Supabase dashboard backup
echo "📸 Go create manual backup in Supabase Dashboard NOW!"
```

## 🔄 RESTORE PROCEDURES

### Code Restore
```bash
# Option 1: Restore to tag
git checkout safe-checkpoint-20250731

# Option 2: Restore specific files
git checkout <commit-hash> -- path/to/file

# Option 3: Full reset
git reset --hard <commit-hash>
```

### Database Restore

#### Option 1: Point-in-Time Recovery (if enabled)
```
1. Supabase Dashboard → Database → Backups
2. Select restore point
3. Click "Restore"
```

#### Option 2: From Migration Files
```bash
# Apply migrations in reverse order
npx supabase db reset
npx supabase migration up
```

#### Option 3: From Export
```javascript
// restore-from-export.js
import { restoreData } from './restore-utilities.js';
await restoreData('exports/backup-20250731.json');
```

## 🚨 EMERGENCY CONTACTS

- **Supabase Support:** support@supabase.io
- **Project URL:** https://app.supabase.com/project/axlruvvsjepsulcbqlho
- **Database Connection String:** (stored in .env)

## 📊 TRACKING CHANGES

### Every Database Change MUST:
1. Be captured in a migration file
2. Have a rollback script
3. Be tested locally first
4. Have data preserved

### Migration Template
```sql
-- Migration: YYYYMMDD_description.sql
-- Rollback: YYYYMMDD_description_rollback.sql

BEGIN;

-- Your changes here

COMMIT;
```

## ⚡ QUICK SCRIPTS

### check-backup-status.js
```javascript
// Shows: last backup, changes since backup, risk level
```

### create-checkpoint.sh
```bash
#!/bin/bash
# Creates both git and database checkpoint
```

### restore-to-checkpoint.sh
```bash
#!/bin/bash
# Restores both code and database to checkpoint
```

## 🔴 NEVER FORGET
1. **BACKUP BEFORE VIOLENT CHANGES**
2. **TEST RESTORE PROCEDURE WEEKLY**
3. **KEEP 7 DAYS OF BACKUPS MINIMUM**
4. **DOCUMENT EVERY MAJOR CHANGE**

---
**THIS IS YOUR SAFETY NET. USE IT OR LOSE YOUR DATA!**