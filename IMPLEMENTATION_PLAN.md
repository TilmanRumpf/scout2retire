# 🎯 FIELD TEMPLATE SYSTEM - IMPLEMENTATION PLAN
**Status:** READY TO EXECUTE
**Owner:** Development Team
**Timeline:** 3-5 days
**Priority:** HIGH (Blocking multi-admin collaboration)

---

## EXECUTIVE DECISION REQUIRED

**Question:** Proceed with migration from legacy system to `field_search_templates` table?

**Current Risk:** Data loss from concurrent admin edits (no conflict resolution)

**Recommended:** ✅ YES - Infrastructure is production-ready, migration is low-risk

---

## PHASE 1: EMERGENCY MIGRATION (Days 1-2) 🔴 CRITICAL

### Day 1 Morning: Update aiResearch.js

**File:** `src/utils/aiResearch.js`

**Replace lines 88-118:**
```javascript
// OLD: Fetch from legacy template row
async function getFieldDefinition(fieldName) {
  const { data } = await supabase
    .from('towns')
    .select('audit_data')
    .eq('id', 'ffffffff-ffff-ffff-ffff-ffffffffffff')
    .maybeSingle();

  return data?.audit_data?.field_definitions?.[fieldName];
}

// NEW: Fetch from proper table
async function getFieldDefinition(fieldName) {
  const { data, error } = await supabase
    .from('field_search_templates')
    .select('*')
    .eq('field_name', fieldName)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) {
    console.warn(`No template found for "${fieldName}"`);
    return null;
  }

  // Map to expected structure for backward compatibility
  return {
    search_template: data.search_template,
    expected_format: data.expected_format,
    audit_question: data.human_description, // Use description as audit question
    search_terms: fieldName, // Fallback
    search_query: data.search_template
  };
}
```

**Testing:**
1. Navigate to Towns Manager
2. Click "Smart Update" on Bodrum
3. Check console - should see templates loading from database
4. Verify no errors

---

### Day 1 Afternoon: Bulk Template Migration

**Run migration script:**
```bash
cd /Users/tilmanrumpf/Desktop/scout2retire/database-utilities
node create-18-templates.js
```

**This populates templates for:**
- description (town overview)
- image_url_1 (primary photo)
- climate, climate_description
- cost_of_living_usd
- population, healthcare_score, safety_score
- geographic_features
- avg_temp_summer, avg_temp_winter, annual_rainfall
- Plus 6 more critical fields

**Verify:**
```sql
SELECT field_name, status, version
FROM field_search_templates
ORDER BY field_name;
```
Expected: 18-20 active templates

---

### Day 2: Remove Legacy System

**Files to update:**

**1. FieldDefinitionEditor.jsx** (lines 39, 74, 101)
```javascript
// Replace all references to:
.eq('id', 'ffffffff-ffff-ffff-ffff-ffffffffffff')

// With:
.from('field_search_templates')
.eq('field_name', currentField)
```

**2. useFieldDefinitions.js** (lines 14-22)
```javascript
// Remove DISABLED comment block
// Enable the hook to fetch from field_search_templates
const fetchFieldDefinitions = async () => {
  const { data } = await supabase
    .from('field_search_templates')
    .select('*')
    .eq('status', 'active');

  const definitions = {};
  data?.forEach(t => {
    definitions[t.field_name] = t;
  });

  setFieldDefinitions(definitions);
  setLoading(false);
};
```

**Testing:**
1. Open Towns Manager
2. Click wrench icon next to any field
3. FieldDefinitionEditor should load existing template
4. Edit and save - verify saves to field_search_templates table
5. Check field_search_templates_history table for audit entry

---

## PHASE 2: ADMIN UI (Days 3-4) 🟡 HIGH PRIORITY

### Day 3: Template Manager Page

**New file:** `src/pages/admin/TemplateManager.jsx`

**Features:**
- List all templates in table view
- Sortable by field name, status, last updated
- Quick edit inline
- Bulk actions (activate/archive multiple)
- Search/filter by field name or category

**URL:** `/admin/templates`

**Add to admin menu in QuickNav.jsx**

**Mockup:**
```
╔══════════════════════════════════════════════════════════╗
║ Template Manager                          [+ New Template]║
╠══════════════════════════════════════════════════════════╣
║ Search: [___________]  Status: [All ▾]  Category: [All ▾] ║
╠═══════════╦═══════════════╦══════════╦═════════╦═════════╣
║ Field Name│ Template      │ Status   │ Updated │ Actions ║
╠═══════════╬═══════════════╬══════════╬═════════╬═════════╣
║ climate   │ Describe the..│ Active   │ 2h ago  │ [✏️][📋]║
║ population│ What is the...│ Active   │ 1d ago  │ [✏️][📋]║
║ elevation │ Meters above..│ Archived │ 5d ago  │ [✏️][📋]║
╚═══════════╩═══════════════╩══════════╩═════════╩═════════╝
```

---

### Day 4: Inline Quick Edit

**Update:** `src/components/EditableDataField.jsx`

**Add "Edit Template" button next to field labels:**
```jsx
<div className="flex items-center gap-2">
  <label>{fieldLabel}</label>
  {isAdmin && (
    <button
      onClick={() => setShowTemplateEditor(true)}
      title="Edit field template"
    >
      🔧
    </button>
  )}
</div>
```

**Mini modal for quick edits:**
- Field name (read-only)
- Search template (textarea)
- Expected format (input)
- Human description (textarea)
- [Save] [Cancel]

**Auto-saves to field_search_templates with user tracking**

---

## PHASE 3: MULTI-ADMIN SAFETY (Day 5) 🟡 MEDIUM PRIORITY

### Optimistic Locking Implementation

**Add to saveTemplate() function:**
```javascript
async function saveTemplate(fieldName, updates, expectedVersion) {
  const { data, error } = await supabase
    .from('field_search_templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: currentUser.id
    })
    .eq('field_name', fieldName)
    .eq('version', expectedVersion)  // 🔒 Optimistic lock
    .select()
    .single();

  if (!data) {
    // Conflict detected - another admin saved first
    throw new Error('Template was modified by another admin. Please refresh and try again.');
  }

  return data; // Success - version auto-incremented by trigger
}
```

**UI Handling:**
```javascript
try {
  await saveTemplate(field, changes, currentVersion);
  toast.success('Template saved');
} catch (error) {
  if (error.message.includes('modified by another admin')) {
    toast.error('Conflict detected! Another admin just saved this template.');
    // Show diff viewer
    setShowConflictResolver(true);
  }
}
```

---

## PHASE 4: POPULATE REMAINING TEMPLATES (Ongoing)

### Bulk Migration Script

**File:** `database-utilities/migrate-all-templates.js`

**Source:** `field-template-analysis.json` (195+ fields analyzed)

**Strategy:**
1. Start with high-priority fields (climate, costs, population)
2. Batch create 20 templates per day
3. Review and approve in small batches
4. Full coverage in 2 weeks

**Priority Order:**
1. **Tier 1** (Critical for search): description, climate, costs, safety, healthcare (18 fields)
2. **Tier 2** (Important for UX): photos, demographics, infrastructure (45 fields)
3. **Tier 3** (Nice to have): detailed features, hobbies, legacy fields (132 fields)

---

## SUCCESS METRICS

**Phase 1 Complete:**
- ✅ Zero references to legacy template row in codebase
- ✅ 18+ templates active in field_search_templates table
- ✅ AI research working with new template system
- ✅ No errors in production logs

**Phase 2 Complete:**
- ✅ Template Manager page live at /admin/templates
- ✅ Admins can edit templates without touching database
- ✅ All edits logged to history table
- ✅ Timezone displayed in admin's local time

**Phase 3 Complete:**
- ✅ Optimistic locking prevents data loss
- ✅ Conflict detection shows helpful error messages
- ✅ No silent overwrites from concurrent edits

**Full Migration Complete:**
- ✅ 195+ templates populated
- ✅ 100% field coverage
- ✅ Zero hardcoded templates in codebase
- ✅ European admins collaborating successfully

---

## RISK ASSESSMENT

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Templates break AI research | LOW | HIGH | Test thoroughly in phase 1, rollback plan ready |
| Data loss from bad migration | LOW | HIGH | Database backup before migration |
| Admin can't find template editor | MEDIUM | LOW | Clear documentation, training session |
| Concurrent edit conflicts | HIGH | MEDIUM | Phase 3 optimistic locking |
| Template quality varies by admin | MEDIUM | MEDIUM | Approval workflow (future enhancement) |

---

## ROLLBACK PLAN

**If migration fails in Phase 1:**

1. **Immediate rollback:**
```bash
git checkout HEAD -- src/utils/aiResearch.js
git checkout HEAD -- src/hooks/useFieldDefinitions.js
```

2. **Restore legacy template row (if needed):**
```sql
INSERT INTO towns (id, audit_data) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', '{
  "field_definitions": {
    "description": {
      "search_query": "Describe {town_name}, {country}",
      "audit_question": "Is this description accurate and appealing?",
      "verification_level": 5
    }
  }
}');
```

3. **Communicate:**
   - Notify team via Slack
   - Document failure reason
   - Schedule post-mortem

---

## TIMEZONE SUPPORT (Future Enhancement)

**Add to users table:**
```sql
ALTER TABLE users ADD COLUMN timezone text DEFAULT 'UTC';
```

**Frontend:**
```javascript
import { formatInTimeZone } from 'date-fns-tz';

// Display timestamps in admin's timezone
const localTime = formatInTimeZone(
  template.updated_at,
  user.timezone || 'UTC',
  'PPpp' // e.g., "Apr 29, 2023, 5:45 PM"
);
```

**User can set preference in profile settings**

---

## ESTIMATED EFFORT

| Phase | Developer Hours | Calendar Days |
|-------|----------------|---------------|
| Phase 1: Migration | 8h | 1-2 days |
| Phase 2: Admin UI | 12h | 2-3 days |
| Phase 3: Multi-admin | 4h | 1 day |
| Phase 4: Bulk populate | 4h | 2 weeks (ongoing) |
| **TOTAL** | **28h** | **5 days** |

---

## OPEN QUESTIONS FOR TEAM

1. **Approval workflow:** Require executive_admin approval for template changes?
2. **Notification system:** Email/Slack when templates change?
3. **Template testing:** Automated validation before activation?
4. **Versioning UI:** Show diff viewer for template history?
5. **Bulk edit:** Allow editing multiple templates at once?

---

## NEXT STEPS

**Immediate (Today):**
1. ✅ Review this implementation plan
2. ✅ Get stakeholder approval
3. ✅ Schedule Phase 1 kickoff

**Week 1:**
1. Execute Phase 1 (emergency migration)
2. Verify AI research working with new templates
3. Remove all legacy system references

**Week 2:**
1. Build Template Manager UI (Phase 2)
2. Enable inline template editing
3. Train admins on new system

**Week 3+:**
1. Implement optimistic locking (Phase 3)
2. Begin bulk template population (Phase 4)
3. Monitor for issues, iterate based on feedback

---

**Report End**
**Generated:** 2025-11-08
**Author:** Claude (AI Development Assistant)
**Approved By:** [PENDING]
