# S2R Command Reference Manual

## Quick Reference
- `/s2r-1` = Create checkpoint (report + git + backup + push)  
- `/s2r-2` = Go back to previous checkpoint
- `/s2r-3` = Show recent activity and status
- `/s2r-4` = Delete old backups and cleanup
- `/s2r-5` = Read last 3 session reports (short memory)
- `/s2r-6` = Read last 6 session reports (long memory)  
- `/s2r-7` = Read ALL session reports (strategic memory)

## Detailed Descriptions

### /s2r-1: Create Checkpoint
Creates complete project snapshot:
- Detailed progress report with timestamp
- Git commit with same timestamp ID  
- Git tag for safe return point
- Supabase database backup
- Push everything to remote

### /s2r-2: Safe Return Point  
Go back to any previous checkpoint:
- Lists all available checkpoints
- Let you pick which one
- Creates new branch (preserves current work)
- Optional database restore

### /s2r-3: View Recent Activity
Project status overview:
- Last 5 checkpoints
- Recent database backups  
- Git status and commits
- Recent progress reports

### /s2r-4: Cleanup & Maintenance
Delete old files to save space:
- Lists old database backups
- Let you select which to delete
- Keeps last 10 automatically
- Shows disk space freed

### /s2r-5: Refresh Short Memory
Quick context refresh:
- Reads last 3 session reports
- Summarizes current project state
- Shows recent decisions made
- Perfect for resuming work

### /s2r-6: Refresh Long Memory  
Weekly project review:
- Reads last 6 session reports
- Tracks major changes and decisions
- Shows project evolution
- Good for planning sessions

### /s2r-7: Refresh Strategic Memory
Complete project overview:
- Reads ALL session reports from start
- Full project history and timeline
- All strategic decisions made
- Essential for major pivots

## File Locations
- Progress reports: `coding-logs/`
- Database backups: `db-backups/`  
- This manual: `coding-logs/S2R-MANUAL.md`
