# Administration & Visa Algorithm (20% weight)
**Updated: August 27, 2025**

## Quick Reference
- **Healthcare Quality**: 35 points
- **Safety**: 25 points  
- **Visa/Residency**: 15 points
- **Healthcare Cost**: 10 points
- **Government**: 10 points (efficiency + stability)
- **Environment**: 5 points

## 1. Healthcare Quality (35 points)

| User Wants | Town Score 9-10 | 8 | 7 | 6 | 5 | <5 |
|------------|-----------------|---|---|---|---|----|
| Excellent | 35 | 30 | 25 | 15 | 10 | 5 |
| Good | 35 | 35 | 35 | 30 | 20 | 5 |
| Adequate | 35 | 35 | 35 | 35 | 35 | 5 |
| Basic/None | 35 | 35 | 35 | 35 | 35 | 35 |

**Bonuses:**
- English-speaking doctors + user needs English: +5
- Specialty care rating ≥7 + ongoing treatment: +3
- Major hospital <30km: +2

## 2. Safety Score (25 points)

| User Priority | Safety 9-10 | 8 | 7 | 6 | 5 | <5 |
|---------------|-------------|---|---|---|---|----|
| Very Important | 25 | 22 | 18 | 12 | 8 | 3 |
| Important | 25 | 25 | 25 | 20 | 15 | 3 |
| Somewhat | 25 | 25 | 25 | 25 | 25 | 5 |
| No Preference | 25 | 25 | 25 | 25 | 25 | 25 |

**Crime Index Fallback:**
- ≤20: Score 9
- ≤30: Score 8
- ≤40: Score 7
- ≤50: Score 6
- ≤60: Score 5
- >60: Score 4

## 3. Visa & Residency (15 points)

```javascript
if (!visa_concerns) return 15; // User doesn't care

// Check citizenship compatibility
if (visa_on_arrival_countries.includes(userCitizenship)) return 15;
if (retirement_visa && age >= 55) return 12;
if (digital_nomad_visa && remote_work) return 12;
return 5; // Visa required
```

## 4. Healthcare Cost (10 points)

| Cost vs Budget | Points |
|----------------|--------|
| ≤100% | 10 |
| ≤120% | 7 |
| ≤150% | 4 |
| >150% | 1 |

Insurance penalty: -3 if required but poor availability

## 5. Government (10 points)

**Efficiency (5 pts):**
- Rating 8-10: 5 points
- Rating 6-7: 4 points
- Rating 4-5: 3 points
- Rating <4: 1 point

**Stability (5 pts):**
- Rating 8-10: 5 points
- Rating 6-7: 4 points
- Rating 4-5: 2 points
- Rating <4: 0 points

## 6. Environmental Health (5 points)

For sensitive users:
- Air Quality ≤50: 5 points
- Air Quality ≤100: 3 points
- Air Quality >100: 0 points

Natural disaster risk ≥7: -2 penalty

## Data Coverage
- Healthcare scores: 88% complete
- Safety scores: 91% complete
- Visa information: 82% complete
- Government ratings: 85% complete

## Key Implementation Notes
1. **Always use `.toLowerCase()` for string comparisons**
2. No preferences = perfect score (100%)
3. Check for null/missing data before calculations
4. Healthcare and safety are highest priorities (60% combined)

---
*Version 2.2 - Simplified*