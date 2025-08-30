Execute S2R Safe Return Point workflow:

**1. List Available Checkpoints:**
- Run: `git tag -l "s2r-checkpoint-*" --sort=-creatordate`
- Display each checkpoint tag with its commit message and date
- Show in format: "s2r-checkpoint-2025-08-29-1534 - feat: implement user auth (Aug 29, 3:34 PM)"

**2. Present User Choice:**
- Display numbered list of all available S2R checkpoints
- Include most recent 10 checkpoints for easy selection
- Show format: "1. s2r-checkpoint-2025-08-29-1534 - user authentication work"

**3. Handle User Selection:**
- Wait for user to choose checkpoint number
- Validate selection exists
- Show what will happen before proceeding

**4. Execute Return:**
- Create new branch: `git checkout -b return-to-[CHECKPOINT-ID] [SELECTED-TAG]`
- This preserves your current work while switching to the checkpoint
- Display current branch and status

**5. Optional Database Restore:**
- Ask if user wants to restore database backup: `db-backups/s2r-backup-[CHECKPOINT-ID].sql`
- If yes, provide instructions or execute restore command
- Warn about data loss if restoring database

**6. Confirmation Summary:**
- Show current branch, commit hash, and checkpoint ID
- Provide commands to return to main branch if needed
