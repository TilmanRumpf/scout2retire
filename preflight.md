# 🚀 PREFLIGHT CHECKLIST - RUN BEFORE CLAUDE TOUCHES ANYTHING

## Quick Copy/Paste Command Block:
```bash
# Run this entire block before letting Claude work
node create-database-snapshot.js
git add -A && git commit -m "🔒 PRE-CLAUDE: $(date '+%Y-%m-%d %H:%M')"
echo "Current dev server PID: $(lsof -ti:5173)"
echo "Git status clean: $(git status --porcelain | wc -l) files modified"
echo "Database snapshot created ✅"
echo "Git checkpoint created ✅"
echo "Claude can now work safely"
```

## Individual Commands:
1. **Create Database Snapshot:**
   ```bash
   node create-database-snapshot.js
   ```

2. **Create Git Checkpoint:**
   ```bash
   git add -A && git commit -m "🔒 PRE-CLAUDE: $(date '+%Y-%m-%d %H:%M')"
   ```

3. **Check Dev Server Status:**
   ```bash
   lsof -ti:5173  # Shows actual PID if running
   ```

4. **Verify Clean State:**
   ```bash
   git status --porcelain  # Should show nothing if clean
   ```

## Emergency Rollback Commands:
```bash
# If Claude fucked everything up:
git reset --hard HEAD~1  # Undo last commit
git checkout main  # Return to main branch
pkill -f "npm run dev"  # Kill any hanging processes
```

## Why This Matters:
- Database snapshots saved Tilman after 40-hour disasters
- Git checkpoints let you rollback Claude's fuck-ups instantly
- Knowing actual dev server PID prevents "multiple server" confusion
- Clean state verification ensures Claude starts from known good state

**NEVER SKIP THIS. Tilman's sanity depends on it.**