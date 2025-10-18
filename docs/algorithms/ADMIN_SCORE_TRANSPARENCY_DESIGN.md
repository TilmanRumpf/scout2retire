# Admin Score Transparency & Adjustment System

**Created**: 2025-10-17
**Priority**: CRITICAL
**Problem**: Exec admins have NO VISIBILITY into how admin scores are calculated

---

## 🚨 THE PROBLEM

Looking at the Admin tab in TownsManager (your screenshot):

**What we see:**
- Healthcare: `healthcare_score: 3` (raw field)
- Safety: `safety_score: 7` (raw field)
- Infrastructure: `walkability: 6`, etc.
- Legal & Admin: visa requirements, etc.

**What we DON'T see:**
- How does `healthcare_score: 3` become the final healthcare match score?
- What components make up the safety score?
- How do these 4 subcategories combine into the admin match score?
- What bonuses/penalties are being applied?
- Which fields are being used that aren't displayed?

**This is SCARY AS SHIT because:**
- Exec admins are blind to the calculations
- Can't verify if scores make sense
- Can't understand why Latvia scores same as Germany despite different healthcare quality
- Can't add manual adjustments for edge cases (island penalty, Europe bonus, etc.)

---

## 🎯 THE SOLUTION

### Part 1: **Score Breakdown Visualization**

Show the complete calculation flow from raw data → components → subcategory → final score.

#### Healthcare Breakdown (Example for Bubaque)
```
┌─ HEALTHCARE SCORE ─────────────────────────────────────────┐
│                                                              │
│  COMPONENT-BASED CALCULATION:                                │
│  ════════════════════════════════════════════════════════   │
│                                                              │
│  📊 Quality (0-4.0): 0.9                                     │
│    ├─ Admin Baseline: 0.6                                   │
│    │  └─ healthcare_score: 2.0 → normalized to 0-3 scale    │
│    └─ Hospital Count: +0.3                                  │
│       └─ hospital_count: 1 → single hospital bonus          │
│                                                              │
│  🚑 Accessibility (0-3.0): 0.0                               │
│    ├─ Distance: 0.0                                         │
│    │  └─ nearest_major_hospital_km: 60 → >50km = no bonus   │
│    ├─ Emergency Services: 0.4                                │
│    │  └─ emergency_services_quality: 4 → basic care          │
│    └─ English Doctors: 0.0                                  │
│       └─ english_speaking_doctors: false                     │
│                                                              │
│  💰 Cost (0-3.0): 0.3                                        │
│    ├─ Insurance: 0.0                                        │
│    │  └─ insurance_availability_rating: null → no data      │
│    └─ Affordability: 0.3                                     │
│       └─ healthcare_cost: $200 → affordable                  │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  CALCULATED SCORE: 1.2 / 10.0                                │
│                                                              │
│  ⚙️ MANUAL ADJUSTMENTS (Exec Admin):                         │
│  └─ Island Accessibility Penalty: -0.5                       │
│     Reason: "Remote island, boat-only emergency access"      │
│     Added by: admin@scout2retire.com                         │
│     Date: 2025-10-17                                         │
│                                                              │
│  🎯 FINAL ADJUSTED SCORE: 0.7 / 10.0                         │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  PREFERENCE MATCHING:                                        │
│  User wants: "functional" healthcare                         │
│  Match score: 18 / 30 points (60% match)                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Safety Breakdown (Example for Bubaque)
```
┌─ SAFETY SCORE ─────────────────────────────────────────────┐
│                                                              │
│  COMPONENT-BASED CALCULATION:                                │
│  ════════════════════════════════════════════════════════   │
│                                                              │
│  🛡️ Base Safety (0-7.0): 7.0                                 │
│    └─ Admin Baseline: 7.0                                   │
│       └─ safety_score: 7 (capped at 7.0 for bonus room)     │
│                                                              │
│  🚨 Crime Impact (-1.0 to +2.0): 0.0                         │
│    └─ Crime Rate: 0.0 (neutral)                             │
│       └─ crime_rate: null → no data = neutral               │
│                                                              │
│  🌍 Environmental (0-1.0): 0.5                               │
│    ├─ Health Rating: 0.3                                    │
│    │  └─ environmental_health_rating: null → assumed neutral│
│    └─ Disaster Risk: 0.2                                    │
│       └─ natural_disaster_risk: null → assumed moderate     │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  CALCULATED SCORE: 7.5 / 10.0                                │
│                                                              │
│  ⚙️ MANUAL ADJUSTMENTS: None                                 │
│                                                              │
│  🎯 FINAL ADJUSTED SCORE: 7.5 / 10.0                         │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  PREFERENCE MATCHING:                                        │
│  User wants: "functional" safety                             │
│  Match score: 25 / 25 points (100% match)                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### Part 2: **Admin Score Summary**

Show how the 4 subcategories combine into final admin score:

```
┌─ ADMIN MATCH SCORE ────────────────────────────────────────┐
│                                                              │
│  Total: 65 / 100 points                                      │
│                                                              │
│  BREAKDOWN BY SUBCATEGORY:                                   │
│  ════════════════════════════════════════════════════════   │
│                                                              │
│  🏥 Healthcare Match: 18 / 30 points (60%)                   │
│     Dynamic Score: 0.7/10.0 (with adjustments)               │
│     User Preference: "functional"                            │
│     ├─ Quality: 0.9                                         │
│     ├─ Accessibility: 0.0                                    │
│     ├─ Cost: 0.3                                            │
│     └─ Manual Adj: -0.5 (Island penalty)                     │
│                                                              │
│  🛡️ Safety Match: 25 / 25 points (100%)                      │
│     Dynamic Score: 7.5/10.0                                  │
│     User Preference: "functional"                            │
│     ├─ Base: 7.0                                            │
│     ├─ Crime: 0.0                                           │
│     └─ Environmental: 0.5                                    │
│                                                              │
│  🏛️ Government: 8 / 15 points (53%)                          │
│     government_efficiency_rating: null → minimal credit      │
│     User Preference: "functional"                            │
│                                                              │
│  📋 Visa/Residency: 7 / 10 points (70%)                      │
│     User Citizenship: USA                                    │
│     Retirement visa available: true                          │
│                                                              │
│  🌿 Environmental Health: 7 / 10 points (70%)                │
│     environmental_health_rating: null → neutral              │
│     User Sensitivity: "moderate"                             │
│                                                              │
│  🏛️ Political Stability: 5 / 10 points (50%)                 │
│     political_stability_rating: null → neutral               │
│     User Preference: "functional"                            │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  FINAL ADMIN SCORE: 65%                                      │
│  Weight in Overall Match: 20%                                │
│  Contribution to Total: 13 points                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### Part 3: **Manual Adjustment Interface**

Allow exec admins to add basis point adjustments with full transparency:

```
┌─ MANUAL ADJUSTMENTS ───────────────────────────────────────┐
│                                                              │
│  [+ Add Adjustment]                                          │
│                                                              │
│  ACTIVE ADJUSTMENTS:                                         │
│                                                              │
│  1. Healthcare: Island Accessibility Penalty                 │
│     └─ Value: -0.5 points                                   │
│     └─ Reason: "Remote island, boat-only emergency access"   │
│     └─ Added by: admin@scout2retire.com                      │
│     └─ Date: 2025-10-17 14:23 UTC                            │
│     └─ [Edit] [Remove]                                       │
│                                                              │
│  2. Safety: Tourist Area Bonus                               │
│     └─ Value: +0.3 points                                   │
│     └─ Reason: "Popular tourist destination, extra police"   │
│     └─ Added by: admin@scout2retire.com                      │
│     └─ Date: 2025-10-17 14:25 UTC                            │
│     └─ [Edit] [Remove]                                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Add Adjustment Modal:**
```
┌─ Add Manual Adjustment ────────────────────────────────────┐
│                                                              │
│  Town: Bubaque, Guinea-Bissau                                │
│                                                              │
│  Category: [Healthcare ▼]                                    │
│            Healthcare, Safety, Government, Visa, etc.        │
│                                                              │
│  Adjustment Type: [Penalty ▼]                                │
│                   Bonus, Penalty, Override                   │
│                                                              │
│  Value: [-0.5    ] points                                    │
│         (Range: -3.0 to +3.0)                                │
│                                                              │
│  Reason (required):                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Remote island location with boat-only emergency     │    │
│  │ access. Nearest major hospital is 60km away in      │    │
│  │ Bissau. This significantly impacts healthcare       │    │
│  │ accessibility despite reasonable admin baseline.    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Tags (optional): [island] [remote] [emergency_access]       │
│                                                              │
│  Apply to similar towns? [✓]                                 │
│  (Will suggest this adjustment for other remote islands)     │
│                                                              │
│  [Cancel]  [Save Adjustment]                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### Part 4: **Missing Data Visibility**

Show ALL fields being used in calculations, even if empty:

**Current problem**: Some fields like `crime_rate`, `environmental_health_rating`, `natural_disaster_risk` are used in calculations but NOT displayed in the UI.

**Solution**: Show all fields with data status:

```
SAFETY CALCULATION FIELDS:
├─ safety_score: 7 ✓ (has data)
├─ crime_rate: (empty) ⚠️ USED IN CALCULATION (assumes neutral)
├─ environmental_health_rating: (empty) ⚠️ USED IN CALCULATION (assumes neutral)
└─ natural_disaster_risk: (empty) ⚠️ USED IN CALCULATION (assumes moderate)

[Show all fields] button → expands to show EVERY field used in any component
```

---

## 🎨 UI/UX DESIGN

### Location in TownsManager.jsx

**Current tabs:**
- Region
- Climate
- Culture
- Hobbies
- **Admin** ← ADD TRANSPARENCY HERE
- Costs

**Proposed Admin Tab Structure:**

```
┌─ Admin Tab ────────────────────────────────────────────────┐
│                                                              │
│  [📊 Score Breakdown] [⚙️ Manual Adjustments] [📋 Raw Data]  │
│  └─ Active tab                                               │
│                                                              │
│  ┌─ SCORE BREAKDOWN TAB ────────────────────────────────┐   │
│  │                                                        │   │
│  │  🏥 Healthcare                        [▼ Expand]      │   │
│  │  Calculated: 0.7 / 10.0 | Match: 18/30 pts           │   │
│  │                                                        │   │
│  │  ┌─ EXPANDED BREAKDOWN ─────────────────────────┐    │   │
│  │  │                                                │    │   │
│  │  │  Quality: 0.9 / 4.0                            │    │   │
│  │  │    Admin Base: 0.6 (healthcare_score: 2.0)    │    │   │
│  │  │    Hospital: +0.3 (hospital_count: 1)         │    │   │
│  │  │                                                │    │   │
│  │  │  Accessibility: 0.0 / 3.0                      │    │   │
│  │  │    Distance: 0.0 (60km > 50km limit)          │    │   │
│  │  │    Emergency: 0.4 (quality: 4/10)             │    │   │
│  │  │    English: 0.0 (false)                       │    │   │
│  │  │                                                │    │   │
│  │  │  Cost: 0.3 / 3.0                               │    │   │
│  │  │    Insurance: 0.0 (no data)                   │    │   │
│  │  │    Afford: 0.3 ($200/mo)                      │    │   │
│  │  │                                                │    │   │
│  │  │  Manual Adjustments:                           │    │   │
│  │  │    Island Penalty: -0.5                       │    │   │
│  │  │    [View Details] [Edit] [Remove]             │    │   │
│  │  │                                                │    │   │
│  │  │  Final: 0.7 / 10.0                             │    │   │
│  │  │                                                │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │                                                        │   │
│  │  🛡️ Safety                            [▼ Expand]      │   │
│  │  Calculated: 7.5 / 10.0 | Match: 25/25 pts           │   │
│  │                                                        │   │
│  │  🏛️ Government                        [▶ Collapsed]   │   │
│  │  Match: 8/15 pts                                     │   │
│  │                                                        │   │
│  │  ─────────────────────────────────────────────────    │   │
│  │  TOTAL ADMIN SCORE: 65 / 100                          │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE SCHEMA

Need to store manual adjustments:

```sql
CREATE TABLE admin_score_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  town_id UUID REFERENCES towns(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'healthcare', 'safety', 'government', etc.
  adjustment_type TEXT NOT NULL, -- 'bonus', 'penalty', 'override'
  value NUMERIC NOT NULL, -- -3.0 to +3.0
  reason TEXT NOT NULL,
  tags TEXT[], -- ['island', 'remote', 'emergency_access']
  added_by TEXT NOT NULL, -- admin email
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_adjustments_town ON admin_score_adjustments(town_id);
CREATE INDEX idx_adjustments_category ON admin_score_adjustments(category);
CREATE INDEX idx_adjustments_tags ON admin_score_adjustments USING GIN(tags);
```

---

## 📊 IMPLEMENTATION PLAN

### Phase 1: Score Breakdown Components
1. Create `ScoreBreakdownPanel.jsx` component
2. Import `getHealthcareBonusBreakdown()` and `getSafetyScoreBreakdown()`
3. Create expandable/collapsible UI for each subcategory
4. Show component tree with actual values

### Phase 2: Missing Field Display
1. Audit which fields are used but not displayed
2. Add "Show All Calculation Fields" toggle
3. Mark empty fields that affect calculations with ⚠️ warning

### Phase 3: Manual Adjustments Database
1. Create `admin_score_adjustments` table
2. Create API endpoints for CRUD operations
3. Modify scoring functions to include adjustments

### Phase 4: Manual Adjustments UI
1. Create "Manual Adjustments" tab in Admin panel
2. Create "Add Adjustment" modal
3. Show adjustment history with audit trail
4. Allow edit/remove with confirmation

### Phase 5: Admin Score Summary
1. Create consolidated view showing all 4+ subcategories
2. Show how they combine into final score
3. Show contribution to overall match percentage

### Phase 6: Testing & Documentation
1. Test with Bubaque, Latvia, Istanbul edge cases
2. Document adjustment best practices
3. Create exec admin training guide

---

## 🎯 SUCCESS METRICS

- **Transparency**: Exec admin can explain any town's admin score in <2 minutes
- **Trust**: No "black box" calculations - everything visible
- **Adjustability**: Can add manual corrections for edge cases (islands, specific regions)
- **Audit Trail**: Every adjustment tracked with reason and who made it
- **Data Completeness**: Know which fields are missing and how it affects scores

---

## 🔥 PRIORITY IMPLEMENTATION

**Start with Bubaque example:**
1. Show healthcare breakdown (Quality 0.9 + Access 0.0 + Cost 0.3 = 1.2)
2. Add manual adjustment UI
3. Add island penalty (-0.5)
4. Show final adjusted score (0.7)
5. Verify this makes sense to exec admin

**Then expand to:**
- Safety breakdown
- Government/Visa/Environmental
- Full admin score summary

---

**Next Step**: Implement Phase 1 - Score Breakdown Panel in TownsManager.jsx
