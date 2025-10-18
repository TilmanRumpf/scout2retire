# Component-Based Scoring System

**Created**: 2025-10-17
**Status**: Production Ready
**Scope**: Healthcare & Safety Scores

---

## Overview

Scout2Retire uses **two distinct scoring approaches**:

1. **Component-Based Quality Scores** (0-10 scale) - Healthcare & Safety
2. **Preference Matching Scores** (0-100% compatibility) - Climate, Cost, Culture, etc.

This document covers the **Component-Based Quality Scores**.

---

## Architecture Philosophy

### Why Component-Based?

**Problem**: Static admin-set scores (e.g., `healthcare_score: 7.5`) cannot capture nuance:
- A town with great hospitals but poor insurance acceptance
- A safe town with low crime but high natural disaster risk
- Admin baseline + dynamic bonuses needed

**Solution**: Break quality into measurable components:
- Admin sets **baseline** (their expert judgment)
- System adds **bonuses/penalties** from objective data
- Result is **transparent**, **auditable**, and **dynamic**

---

## 1. Healthcare Scoring (0-10.0)

### Formula
```
Final Score = Quality + Accessibility + Cost (capped at 10.0)
```

### Components

#### Quality (0-4.0)
- **Admin Baseline** (0-3.0): Normalized from `healthcare_score` field
  - `healthcare_score` of 10.0 → 3.0 admin base
  - `healthcare_score` of 5.0 → 1.5 admin base
  - `healthcare_score` of 0.0 → 0.0 admin base
- **Hospital Count Bonus** (0-1.0):
  - 10+ hospitals: +1.0 (major medical hub)
  - 5-9 hospitals: +0.7 (large city)
  - 2-4 hospitals: +0.5 (multiple facilities)
  - 1 hospital: +0.3 (basic coverage)
  - 0 hospitals: 0.0

**Max**: 4.0 points

#### Accessibility (0-3.0)
- **Distance to Hospital** (0-1.5):
  - ≤5km: 1.5 (very close)
  - 6-15km: 1.0 (reasonable)
  - 16-30km: 0.7 (acceptable)
  - 31-50km: 0.4 (remote)
  - >50km: 0.0 (very remote)

- **Emergency Services Quality** (0-1.0):
  - Rating 8-10: 1.0 (excellent)
  - Rating 6-7: 0.7 (good)
  - Rating 4-5: 0.4 (basic)
  - Rating 2-3: 0.2 (minimal)
  - Rating 0-1: 0.0 (poor)

- **English-Speaking Doctors** (0-0.5):
  - Available: 0.5
  - Not available: 0.0

**Max**: 3.0 points

#### Cost (0-3.0)
- **International Insurance Acceptance** (0-1.5):
  - Widely accepted: 1.5
  - Commonly accepted: 1.0
  - Limited: 0.5
  - None/rare: 0.0

- **Healthcare Cost Level** (0-1.5):
  - Very low: 1.5
  - Low: 1.2
  - Moderate: 0.8
  - High: 0.4
  - Very high: 0.0

**Max**: 3.0 points

### Real-World Examples

**Bubaque, Guinea-Bissau** (Remote Island):
- Quality: 0.9 (admin 0.6 + hospital 0.3)
- Accessibility: 0.4 (emergency 0.4 only)
- Cost: 1.7 (insurance 0.5 + low cost 1.2)
- **Total: 3.0/10.0**

**Porto, Portugal** (EU City):
- Quality: 3.0 (admin 2.25 + hospital 0.7, capped)
- Accessibility: 3.0 (distance 1.5 + emergency 1.0 + english 0.5)
- Cost: 2.3 (insurance 1.5 + moderate cost 0.8)
- **Total: 8.3/10.0**

**Chiang Mai, Thailand** (Expat Hub):
- Quality: 2.5 (admin 1.8 + hospital 0.7)
- Accessibility: 2.2 (distance 1.0 + emergency 0.7 + english 0.5)
- Cost: 2.5 (insurance 1.0 + very low cost 1.5)
- **Total: 7.2/10.0**

---

## 2. Safety Scoring (0-10.0)

### Formula
```
Final Score = Base Safety + Crime Impact + Environmental (range 0-10.0)
```

### Components

#### Base Safety (0-7.0)
- **Admin Baseline**: From `safety_score` field
- Capped at 7.0 to leave room for bonuses/penalties
- Default: 5.0 for new towns (neutral)

**Max**: 7.0 points

#### Crime Impact (-1.0 to +2.0)
Based on `crime_rate` (0-100 scale, lower is better):
- 0-20: +2.0 (extremely safe - bonus)
- 21-40: +1.0 (very safe - small bonus)
- 41-60: 0.0 (moderate - neutral)
- 61-80: -0.5 (some concerns - small penalty)
- 81-100: -1.0 (significant concerns - penalty)

**Range**: -1.0 to +2.0

#### Environmental Safety (0-1.0)
- **Environmental Health Rating** (0-0.6):
  - Converts 0-10 rating to 0-0.6 contribution
  - No data = 0.3 (neutral)

- **Natural Disaster Risk** (0-0.4):
  - Low/minimal: +0.4
  - Moderate/medium: +0.2
  - High/severe: 0.0
  - No data = 0.2 (assume moderate)

**Max**: 1.0 points

### Real-World Examples

**Tokyo, Japan** (Very Safe, Earthquake Risk):
- Base: 7.0 (admin 8.5, capped)
- Crime: +2.0 (rate 15 - extremely safe)
- Environmental: 0.6 (health 7.0 → 0.4, disaster moderate → 0.2)
- **Total: 9.6/10.0**

**Mexico City, Mexico** (Moderate Safety):
- Base: 5.0 (admin baseline)
- Crime: -0.5 (rate 65 - some concerns)
- Environmental: 0.2 (health 4.0 → 0.2, disaster high → 0.0)
- **Total: 4.7/10.0**

**Reykjavik, Iceland** (Extremely Safe):
- Base: 7.0 (admin 9.0, capped)
- Crime: +2.0 (rate 10 - extremely safe)
- Environmental: 1.0 (health 9.5 → 0.6, disaster low → 0.4)
- **Total: 10.0/10.0** ⭐

**High Crime City**:
- Base: 4.0 (admin baseline)
- Crime: -1.0 (rate 85 - significant concerns - PENALTY)
- Environmental: 0.5 (health 5.0 → 0.3, disaster moderate → 0.2)
- **Total: 3.5/10.0**

---

## Implementation Files

### Healthcare
- **Calculator**: `src/utils/scoring/helpers/calculateHealthcareScore.js`
- **Integration**: `src/utils/scoring/categories/adminScoring.js` (line 262)
- **Functions**:
  - `calculateHealthcareScore(town)` → Returns 0-10.0 score
  - `getHealthcareBonusBreakdown(town)` → Returns component details

### Safety
- **Calculator**: `src/utils/scoring/helpers/calculateSafetyScore.js`
- **Integration**: `src/utils/scoring/categories/adminScoring.js` (line 291)
- **Functions**:
  - `calculateSafetyScore(town)` → Returns 0-10.0 score
  - `getSafetyScoreBreakdown(town)` → Returns component details

---

## Database Fields Used

### Healthcare
- `healthcare_score` (0-10): Admin baseline
- `hospital_count` (integer): Number of hospitals
- `nearest_major_hospital_km` (float): Distance in km
- `english_speaking_doctors_available` (boolean)
- `emergency_services_quality` (0-10): Emergency response rating
- `international_insurance_acceptance` (text): widely_accepted/commonly_accepted/limited/none
- `healthcare_cost_level` (text): very_low/low/moderate/high/very_high

### Safety
- `safety_score` (0-10): Admin baseline
- `crime_rate` (0-100): Lower is better
- `environmental_health_rating` (0-10): Air/water quality
- `natural_disaster_risk` (text): low/moderate/high

---

## Benefits

### For Admins
✅ **Maintain control**: Set baseline with expert judgment
✅ **Transparency**: See exactly how bonuses are calculated
✅ **Flexibility**: Update components independently

### For Users
✅ **Nuanced scores**: 3.0 vs 7.2 is meaningful, not arbitrary
✅ **Explainable**: "7.2 = Good hospitals + moderate cost + English docs"
✅ **Fair**: Chiang Mai's low cost balances moderate quality

### For System
✅ **Dynamic**: Scores update when data changes
✅ **Auditable**: Every point has a source
✅ **Scalable**: Easy to add new components

---

## Future Enhancements

### Potential New Components

**Healthcare**:
- Specialist availability (+0.5)
- Medical tourism reputation (+0.5)
- Pharmacy availability (+0.3)
- Mental health services (+0.3)

**Safety**:
- Traffic safety rating (0-0.5)
- Political stability impact (0-0.5)
- Natural disaster preparedness (0-0.5)
- Tourist safety rating (0-0.3)

### Potential New Scores

**Infrastructure Quality** (0-10.0):
- Internet speed
- Public transport
- Road quality
- Utilities reliability

**Community Integration** (0-10.0):
- Expat community size
- Language barrier
- Cultural openness
- Integration programs

---

## Lessons Learned

### September 2025: 40-Hour Healthcare Debug
**Problem**: Healthcare scores seemed arbitrary
**Root Cause**: Static `healthcare_score` field couldn't explain differences
**Solution**: Component-based system with transparent breakdown

### October 2025: Safety Scoring Added
**Why**: Safety was just as important as healthcare, deserved same treatment
**Innovation**: Crime rate can add bonuses (+2.0) or penalties (-1.0)
**Result**: More accurate differentiation between safe/unsafe locations

---

## Testing

Test files archived in `archive/debug-2025-10/`:
- `test-healthcare-scoring-phase2.js`
- `test-safety-scoring.js`

Run tests:
```bash
node archive/debug-2025-10/test-healthcare-scoring-phase2.js
node archive/debug-2025-10/test-safety-scoring.js
```

---

## Maintenance

**When adding new towns**:
- Set `healthcare_score` and `safety_score` baselines
- System will calculate final scores automatically
- Add detailed data (hospital_count, crime_rate, etc.) for bonuses

**When updating algorithm**:
- Modify component functions in calculator files
- Scores regenerate on next calculation
- No database migration needed (scores calculated on-the-fly)

**Monitoring**:
- Check `getHealthcareBonusBreakdown()` for component distribution
- Check `getSafetyScoreBreakdown()` for transparency
- Watch for scores capped at 10.0 (may need rebalancing)

---

**Last Updated**: 2025-10-17
**Version**: 1.0
**Status**: ✅ Production Ready
