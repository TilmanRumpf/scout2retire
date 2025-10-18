# Admin Scoring Field Diagram

**Visual representation of how admin fields contribute to scoring**
**Created:** 2025-10-17

---

## Admin Score Structure (100 points total)

```
ADMIN SCORE (0-100 points)
│
├── HEALTHCARE (30 points max)
│   │
│   ├── Base Score: healthcare_score (0.0-10.0)
│   │   └── Formula: min((healthcare_score / 10) * 3.0, 3.0)
│   │   └── Max: 3.0 points
│   │
│   ├── AUTO-BONUS: hospital_count
│   │   ├── 10+ hospitals → +1.0 pts
│   │   ├── 5-9 hospitals → +0.7 pts
│   │   ├── 2-4 hospitals → +0.5 pts
│   │   ├── 1 hospital    → +0.3 pts
│   │   └── 0 hospitals   → 0 pts
│   │
│   ├── AUTO-BONUS: nearest_major_hospital_km
│   │   ├── <5 km   → +1.0 pts
│   │   ├── 5-10 km → +0.7 pts
│   │   ├── 10-30 km → +0.5 pts
│   │   ├── 30-60 km → +0.3 pts
│   │   └── >60 km   → 0 pts
│   │
│   ├── DISPLAY ONLY (no scoring impact):
│   │   ├── emergency_services_quality
│   │   ├── english_speaking_doctors
│   │   ├── insurance_availability_rating
│   │   └── healthcare_cost
│   │
│   └── CALCULATED SCORE: ~0-5.3 points
│       └── Scales to 0-30 admin points based on user preference level:
│           ├── good (7.0+) → full points
│           ├── functional → LINEAR (score/10 * 30)
│           └── basic (4.0+) → full points
│
├── SAFETY (25 points max)
│   │
│   ├── Base Score: safety_score (0.0-10.0, capped at 7.0)
│   │   └── Max: 7.0 points
│   │
│   ├── AUTO-ADJUST: crime_rate
│   │   ├── very_low  → +0.5 pts
│   │   ├── low       → +0.2 pts
│   │   ├── moderate  → 0 pts
│   │   ├── high      → -0.3 pts
│   │   └── very_high → -0.5 pts
│   │
│   ├── DISPLAY ONLY (no scoring impact):
│   │   └── natural_disaster_risk
│   │
│   └── CALCULATED SCORE: ~0-7.5 points
│       └── Scales to 0-25 admin points based on user preference level
│
├── INFRASTRUCTURE (15 points max)
│   │
│   ├── Base Score: government_efficiency_rating (0-100)
│   │   └── Formula: government_efficiency_rating / 10
│   │   └── Max: 10.0 points
│   │
│   ├── DISPLAY ONLY (no scoring impact):
│   │   ├── walkability
│   │   ├── air_quality_index
│   │   └── airport_distance
│   │
│   └── CALCULATED SCORE: 0-10.0 points
│       └── Scales to 0-15 admin points based on user preference level
│
├── VISA/RESIDENCY (10 points max)
│   │
│   ├── MATCH BONUS: visa_on_arrival_countries
│   │   └── If user citizenship in array → +10 pts
│   │
│   ├── MATCH BONUS: easy_residency_countries
│   │   └── If user citizenship in array → +10 pts
│   │
│   ├── CONDITIONAL: retirement_visa_available
│   │   └── If true AND user wants easy access → +8 pts
│   │
│   ├── DISPLAY ONLY:
│   │   └── visa_requirements
│   │
│   └── CALCULATED SCORE: 0-10 points (match-based, not gradual)
│
├── ENVIRONMENTAL (15 points max) - CONDITIONAL
│   │
│   ├── CONDITION: User marked environmental_health as 'sensitive'
│   │
│   ├── Base Score: environmental_health_rating (0-10)
│   │   └── Must be ≥ 4 to award points
│   │
│   ├── DISPLAY ONLY:
│   │   └── air_quality_index (shown in Infrastructure section)
│   │
│   └── CALCULATED SCORE: 0 or 15 points
│       └── Either full 15 points or nothing (threshold-based)
│
└── POLITICAL STABILITY (10 points max)
    │
    ├── Base Score: political_stability_rating (0-100)
    │   └── Formula: political_stability_rating / 10
    │   └── Max: 10.0 points
    │
    └── CALCULATED SCORE: 0-10.0 points
        └── Scales to 0-10 admin points based on user preference level
```

---

## Field Type Legend

```
┌─────────────────────────────────────────┐
│ Field Type Categories                   │
├─────────────────────────────────────────┤
│ 📊 SCORED     → Directly impacts points │
│ 🤖 AUTO       → System calculates bonus │
│ 👁️  DISPLAY   → Shows data, no scoring  │
│ 🔒 CALCULATED → READ ONLY computed value│
│ ⚖️  CONDITIONAL → Only scores if X true │
└─────────────────────────────────────────┘
```

---

## Field Relationships Matrix

| Field | Category | Type | Impacts Scoring | Auto-Bonus | Editable |
|-------|----------|------|----------------|------------|----------|
| `healthcare_score` | Healthcare | 📊 SCORED | ✅ Yes (base) | ❌ No | ✅ Yes |
| `hospital_count` | Healthcare | 🤖 AUTO | ✅ Yes (bonus) | ✅ Yes | ✅ Yes |
| `nearest_major_hospital_km` | Healthcare | 🤖 AUTO | ✅ Yes (bonus) | ✅ Yes | ✅ Yes |
| `emergency_services_quality` | Healthcare | 👁️ DISPLAY | ❌ No | ❌ No | ✅ Yes |
| `english_speaking_doctors` | Healthcare | 👁️ DISPLAY | ❌ No | ❌ No | ✅ Yes |
| `insurance_availability_rating` | Healthcare | 👁️ DISPLAY | ❌ No | ❌ No | ✅ Yes |
| `healthcare_cost` | Healthcare | 👁️ DISPLAY | ❌ No | ❌ No | ✅ Yes |
| `safety_score` | Safety | 📊 SCORED | ✅ Yes (base) | ❌ No | ✅ Yes |
| `crime_rate` | Safety | 🤖 AUTO | ✅ Yes (adjust) | ✅ Yes | ✅ Yes |
| `environmental_health_rating` | Safety | ⚖️ CONDITIONAL | ⚠️ Conditional | ❌ No | ✅ Yes |
| `natural_disaster_risk` | Safety | 👁️ DISPLAY | ❌ No | ❌ No | ✅ Yes |
| `political_stability_rating` | Safety | 📊 SCORED | ✅ Yes | ❌ No | ✅ Yes |
| `walkability` | Infrastructure | 👁️ DISPLAY | ❌ No | ❌ No | ✅ Yes |
| `air_quality_index` | Infrastructure | 👁️ DISPLAY | ❌ No | ❌ No | ✅ Yes |
| `airport_distance` | Infrastructure | 👁️ DISPLAY | ❌ No | ❌ No | ✅ Yes |
| `government_efficiency_rating` | Infrastructure | 📊 SCORED | ✅ Yes (base) | ❌ No | ✅ Yes |
| `visa_requirements` | Legal | 👁️ DISPLAY | ❌ No | ❌ No | ✅ Yes |
| `visa_on_arrival_countries` | Legal | 📊 SCORED | ✅ Yes (match) | ❌ No | ✅ Yes |
| `retirement_visa_available` | Legal | ⚖️ CONDITIONAL | ⚠️ Conditional | ❌ No | ✅ Yes |
| `tax_treaty_us` | Legal | 🤖 AUTO | ✅ Yes (bonus) | ✅ Yes | ✅ Yes |
| `tax_haven_status` | Legal | 🤖 AUTO | ✅ Yes (bonus) | ✅ Yes | ✅ Yes |
| `income_tax_rate_pct` | Legal | 📊 SCORED | ⚠️ If user sensitive | ❌ No | ✅ Yes |
| `property_tax_rate_pct` | Legal | 📊 SCORED | ⚠️ If user sensitive | ❌ No | ✅ Yes |
| `sales_tax_rate_pct` | Legal | 📊 SCORED | ⚠️ If user sensitive | ❌ No | ✅ Yes |
| `foreign_income_taxed` | Legal | 🤖 AUTO | ✅ Yes (bonus) | ✅ Yes | ✅ Yes |
| `easy_residency_countries` | Legal | 📊 SCORED | ✅ Yes (match) | ❌ No | ✅ Yes |
| `overall_score` | Calculated | 🔒 CALCULATED | N/A | N/A | ❌ No |
| `admin_score` | Calculated | 🔒 CALCULATED | N/A | N/A | ❌ No |

---

## Scoring Flow Diagram

```
USER EDITS FIELD
      ↓
┌─────────────────────────────────────┐
│ Is field editable?                  │
├─────────────────────────────────────┤
│ ✅ Yes → Continue                   │
│ ❌ No  → Show error (calculated)    │
└─────────────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│ Validate new value                  │
├─────────────────────────────────────┤
│ • Check type (number/boolean/etc)   │
│ • Check range (0-10, etc)           │
│ • Run custom validator              │
└─────────────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│ Update database                     │
├─────────────────────────────────────┤
│ UPDATE towns SET field = value      │
│ WHERE id = townId                   │
└─────────────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│ Does field have auto-bonus?         │
├─────────────────────────────────────┤
│ ✅ Yes → Recalculate score          │
│    • hospital_count                 │
│    • nearest_major_hospital_km      │
│    • crime_rate                     │
│    • tax fields                     │
│                                     │
│ ❌ No  → Update display only        │
│    • emergency_services_quality     │
│    • visa_requirements              │
│    • etc                            │
└─────────────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│ Refresh UI                          │
├─────────────────────────────────────┤
│ • Show new formatted value          │
│ • Update calculated scores          │
│ • Show success toast                │
└─────────────────────────────────────┘
```

---

## User Preference Impact

```
PREFERENCE LEVEL → SCORING BEHAVIOR

┌──────────────────────────────────────────────────────────┐
│ USER SELECTS: "basic"                                    │
├──────────────────────────────────────────────────────────┤
│ Town Score ≥ 4.0 → Full points                           │
│ Town Score 3.0-4.0 → 70% of points                       │
│ Town Score 2.0-3.0 → 40% of points                       │
│ Town Score < 2.0 → 15% of points                         │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ USER SELECTS: "functional" ⭐ LINEAR SCORING             │
├──────────────────────────────────────────────────────────┤
│ Points = (Town Score / 10.0) × Max Points                │
│ Example: 7.5 score, 30 max → 7.5/10 × 30 = 22.5 points  │
│ Creates REAL differentiation between towns               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ USER SELECTS: "good"                                     │
├──────────────────────────────────────────────────────────┤
│ Town Score ≥ 7.0 → Full points                           │
│ Town Score 6.0-7.0 → 85% of points                       │
│ Town Score 5.0-6.0 → 65% of points                       │
│ Town Score 4.0-5.0 → 40% of points                       │
│ Town Score < 4.0 → 15% of points                         │
└──────────────────────────────────────────────────────────┘
```

---

## Example Calculation Walkthrough

### Town: "Valencia, Spain"

**Raw Data:**
- `healthcare_score`: 7.5
- `hospital_count`: 9
- `nearest_major_hospital_km`: 3
- `safety_score`: 8.5
- `crime_rate`: 'low'
- `government_efficiency_rating`: 70
- `political_stability_rating`: 82

**Step 1: Calculate Healthcare**
```
Base: (7.5 / 10) * 3.0 = 2.25 pts
Hospital bonus: 5-9 hospitals = +0.7 pts
Distance bonus: <5 km = +1.0 pts
────────────────────────────────────
Total calculated: 3.95 pts
```

**Step 2: Apply User Preference (functional)**
```
Healthcare calculated: 3.95 pts
User preference: functional
Formula: (3.95 / 5.3) * 30 = 22.4 admin points
```

**Step 3: Calculate Safety**
```
Base: 8.5 pts (capped at 7.0 for safety)
Crime adjustment: low = +0.2 pts
────────────────────────────────────
Total calculated: 7.2 pts
```

**Step 4: Apply User Preference (functional)**
```
Safety calculated: 7.2 pts
User preference: functional
Formula: (7.2 / 10.0) * 25 = 18.0 admin points
```

**Step 5: Calculate Infrastructure**
```
Government rating: 70 / 10 = 7.0 pts
User preference: functional
Formula: (7.0 / 10.0) * 15 = 10.5 admin points
```

**Step 6: Calculate Political Stability**
```
Stability rating: 82 / 10 = 8.2 pts
User preference: functional
Formula: (8.2 / 10.0) * 10 = 8.2 admin points
```

**Step 7: Add Visa (if applicable)**
```
Assume user is USA citizen:
visa_on_arrival_countries: ['USA', ...] → +10 pts
```

**TOTAL ADMIN SCORE:**
```
Healthcare:    22.4 pts
Safety:        18.0 pts
Infrastructure: 10.5 pts
Stability:      8.2 pts
Visa:          10.0 pts
───────────────────────
TOTAL:         69.1 / 100 admin points
```

---

## Key Insights

1. **Auto-bonuses are powerful** - Changing `hospital_count` from 4 to 10 adds +0.5 pts to calculated healthcare score

2. **Functional preference creates differentiation** - Linear scoring means every 0.1 point difference matters

3. **Some fields are display-only** - They inform users but don't affect matching score

4. **Calculated fields are protected** - Can't edit `overall_score` or `admin_score` directly

5. **Conditional scoring requires user flag** - Environmental health only scores if user marked as sensitive

---

**See Also:**
- Metadata system: `src/utils/admin/adminFieldMetadata.js`
- Scoring logic: `src/utils/scoring/categories/adminScoring.js`
- Healthcare calc: `src/utils/scoring/helpers/calculateHealthcareScore.js`
- Safety calc: `src/utils/scoring/helpers/calculateSafetyScore.js`

**Last Updated:** 2025-10-17
