# 🎯 COMPLETE HOBBY VERIFICATION AUDIT - ALL 173 HOBBIES

## THE MISSION
Verify EVERY field for ALL 173 hobbies in batches of 10
Ensure each hobby has correct:
- category (activity vs interest)
- is_universal (true/false)
- verification_method (universal/ai_community/ai_facilities/database_geographic/database_infrastructure)
- verification_query (NULL for universal, specific query for others)
- verification_notes (clear explanation)
- required_conditions (NULL or valid needs array)

## BATCH PROCESSING PROTOCOL

### For Each Batch of 10:
1. **GET** the next 10 hobbies with ALL fields
2. **SHOW** current values and proposed fixes
3. **WAIT** for user approval/modifications
4. **UPDATE** the batch
5. **CONFIRM** success
6. **MOVE** to next batch

### SQL TO GET EACH BATCH
```sql
SELECT 
  id,
  name,
  category,
  group_name,
  is_universal,
  verification_method,
  verification_query,
  verification_notes,
  required_conditions
FROM hobbies
ORDER BY name
LIMIT 10 OFFSET {batch_number * 10};
```

## PROGRESS TRACKER (18 BATCHES TOTAL)
- [ ] Batch 1: Hobbies 1-10 (A's)
- [ ] Batch 2: Hobbies 11-20 (B's)
- [ ] Batch 3: Hobbies 21-30 (B-C's)
- [ ] Batch 4: Hobbies 31-40 (C's)
- [ ] Batch 5: Hobbies 41-50 (C-D's)
- [ ] Batch 6: Hobbies 51-60 (D-F's)
- [ ] Batch 7: Hobbies 61-70 (F-G's)
- [ ] Batch 8: Hobbies 71-80 (G-H's)
- [ ] Batch 9: Hobbies 81-90 (H-J's)
- [ ] Batch 10: Hobbies 91-100 (K-M's)
- [ ] Batch 11: Hobbies 101-110 (M-P's)
- [ ] Batch 12: Hobbies 111-120 (P-R's)
- [ ] Batch 13: Hobbies 121-130 (R-S's)
- [ ] Batch 14: Hobbies 131-140 (S's)
- [ ] Batch 15: Hobbies 141-150 (S-T's)
- [ ] Batch 16: Hobbies 151-160 (T-W's)
- [ ] Batch 17: Hobbies 161-170 (W-Y's)
- [ ] Batch 18: Hobbies 171-173 (Y-Z's)

## VERIFICATION RULES

### Category Assignment:
- **activity** = Physical doing (sports, dancing, cooking)
- **interest** = Mental/passive (reading, collecting, watching)

### Universal vs Location-Dependent:
- **Universal** = Can be done anywhere with basic equipment/internet
- **Not Universal** = Needs specific geography/facilities/community

### Verification Methods:
- **universal** → query = NULL, notes explain why universal
- **ai_community** → query = "Are there {hobby} groups in {town}?"
- **ai_facilities** → query = "Find {facility} in {town}"
- **database_geographic** → query = SQL conditions
- **database_infrastructure** → query = SQL column checks

## RECOVERY INSTRUCTIONS
If Claude crashes:
1. Check this file for last completed batch
2. Run: `SELECT COUNT(*) FROM hobbies WHERE verification_query IS NOT NULL;`
3. Continue from next uncompleted batch
4. Each batch is independent - can restart anytime

## START COMMAND
"Let's audit Batch 1 - show me hobbies 1-10 with all fields"