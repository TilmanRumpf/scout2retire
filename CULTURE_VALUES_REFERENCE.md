# CULTURE VALUES - DETAILED REFERENCE
## Complete Line-by-Line Comparison

---

## pace_of_life_actual

### Database Truth (categoricalValues.js:56-61)
```javascript
pace_of_life_actual: [
  'slow',          // Very laid-back, minimal hustle
  'relaxed',       // ⭐ Comfortable pace, not rushed but not sluggish
  'moderate',      // Balanced pace
  'fast'           // Bustling, energetic, fast-paced
],
```
**Valid Values**: slow, relaxed, moderate, fast (4 total)

### Admin Panel (CulturePanel.jsx:110-116)
```javascript
<EditableField
  field="pace_of_life_actual"
  value={town.pace_of_life_actual}
  label="Pace of Life"
  type="select"
  range={['relaxed', 'moderate', 'fast']}  // ❌ MISSING 'slow'
  description="General pace of daily life"
/>
```
**Shown in UI**: relaxed, moderate, fast (3 total)  
**Missing**: slow

### User Onboarding (OnboardingCulture.jsx:440-444)
```javascript
const paceOptions = [
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'fast', label: 'Fast' }
];
```
**Shown in UI**: relaxed, moderate, fast (3 total)  
**Missing**: slow

---

## social_atmosphere

### Database Truth (categoricalValues.js:91-98)
```javascript
social_atmosphere: [
  'reserved',      // Formal, less outgoing
  'quiet',         // Peaceful, low-key social scene
  'moderate',      // Balanced social energy
  'friendly',      // Welcoming, approachable
  'vibrant',       // Lively, energetic social scene
  'very friendly'  // Exceptionally warm and welcoming
],
```
**Valid Values**: reserved, quiet, moderate, friendly, vibrant, very friendly (6 total)

### Admin Panel (CulturePanel.jsx:118-124)
```javascript
<EditableField
  field="social_atmosphere"
  value={town.social_atmosphere}
  label="Social Atmosphere"
  type="select"
  range={['quiet', 'moderate', 'friendly', 'vibrant']}  
  // ❌ MISSING 'reserved' and 'very friendly'
  description="How social and welcoming the community is"
/>
```
**Shown in UI**: quiet, moderate, friendly, vibrant (4 total)  
**Missing**: reserved, very friendly

### User Onboarding (OnboardingCulture.jsx)
**Not used** - users don't directly input social_atmosphere

---

## traditional_progressive_lean

### Database Truth (categoricalValues.js:103-108)
```javascript
traditional_progressive_lean: [
  'traditional',   // Conservative, traditional values
  'moderate',      // Leans slightly traditional
  'balanced',      // Equal mix of traditional and progressive
  'progressive'    // Forward-thinking, liberal values
],
```
**Valid Values**: traditional, moderate, balanced, progressive (4 total)

### Admin Panel (CulturePanel.jsx:126-132)
```javascript
<EditableField
  field="traditional_progressive_lean"
  value={town.traditional_progressive_lean}
  label="Traditional vs Progressive"
  type="select"
  range={['traditional', 'moderate', 'balanced', 'progressive']}  // ✅ PERFECT
  description="Cultural attitude towards tradition vs progress"
/>
```
**Shown in UI**: traditional, moderate, balanced, progressive (4 total)  
**Missing**: None ✅

### User Onboarding (OnboardingCulture.jsx)
**Not used** - users don't directly input traditional_progressive_lean

---

## expat_community_size

### Database Truth (categoricalValues.js:111-115)
```javascript
expat_community_size: [
  'small',
  'moderate',
  'large'
],
```
**Valid Values**: small, moderate, large (3 total)

### Admin Panel (CulturePanel.jsx:152-158)
```javascript
<EditableField
  field="expat_community_size"
  value={town.expat_community_size}
  label="Expat Community Size"
  type="select"
  range={['small', 'moderate', 'large']}  // ✅ PERFECT
  description="Size of the expatriate community"
/>
```
**Shown in UI**: small, moderate, large (3 total)  
**Missing**: None ✅

### User Onboarding (OnboardingCulture.jsx:433-437)
```javascript
const expatOptions = [
  { value: 'small', label: 'Small' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'large', label: 'Large' }
];
```
**Shown in UI**: small, moderate, large (3 total)  
**Missing**: None ✅

---

## retirement_community_presence

### Database Truth (categoricalValues.js:20-28)
```javascript
retirement_community_presence: [
  'none',           // No retirement communities
  'minimal',        // Very few options
  'limited',        // Some options but not prominent
  'moderate',       // Decent selection
  'strong',         // Good retirement community presence
  'extensive',      // Many retirement communities
  'very_strong'     // Exceptional retirement community presence
],
```
**Valid Values**: none, minimal, limited, moderate, strong, extensive, very_strong (7 total)

### Admin Panel (CulturePanel.jsx:160-166)
```javascript
<EditableField
  field="retirement_community_presence"
  value={town.retirement_community_presence}
  label="Retirement Community Presence"
  type="select"
  range={['none', 'minimal', 'limited', 'moderate', 'strong', 'very_strong']}
  // ❌ MISSING 'extensive'
  description="Presence of retirement-focused communities"
/>
```
**Shown in UI**: none, minimal, limited, moderate, strong, very_strong (6 total)  
**Missing**: extensive

### User Onboarding (OnboardingCulture.jsx)
**Not used** - users don't directly input retirement_community_presence

---

## cultural_events_frequency

### Database Truth (categoricalValues.js:78-86)
```javascript
cultural_events_frequency: [
  'rare',        // Few events per year
  'occasional',  // A few times per month
  'monthly',     // Events every month
  'frequent',    // Multiple events per month
  'weekly',      // Events every week
  'constant',    // Events very frequently
  'daily'        // Daily cultural activities
],
```
**Valid Values**: rare, occasional, monthly, frequent, weekly, constant, daily (7 total)

### Admin Panel (CulturePanel.jsx:168-174)
```javascript
<EditableField
  field="cultural_events_frequency"
  value={town.cultural_events_frequency}
  label="Cultural Events Frequency"
  type="select"
  range={['monthly', 'weekly', 'daily']}
  // ❌ SEVERELY INCOMPLETE - Only 3 of 7 values
  // MISSING: 'rare', 'occasional', 'frequent', 'constant'
  description="How often cultural events and festivals occur"
/>
```
**Shown in UI**: monthly, weekly, daily (3 total)  
**Missing**: rare, occasional, frequent, constant  
**Coverage**: 43%

### User Onboarding (OnboardingCulture.jsx)
**Not directly used** - user selects importance level (1/3/5) not frequency:
```javascript
const culturalCategories = [
  { id: 'dining_nightlife', label: 'Dining & Nightlife', icon: Utensils },
  { id: 'cultural_events', label: 'Events & Concerts', icon: Calendar },
  { id: 'museums', label: 'Museums & Arts', icon: Building }
];
```

---

## english_proficiency_level

### Database Truth (categoricalValues.js:118-125)
```javascript
english_proficiency_level: [
  'low',
  'moderate',
  'high',
  'very high',
  'widespread',
  'native'
],
```
**Valid Values**: low, moderate, high, very high, widespread, native (6 total)

### Admin Panel (CulturePanel.jsx:84-90)
```javascript
<EditableField
  field="english_proficiency_level"
  value={town.english_proficiency_level}
  label="English Proficiency Level"
  type="select"
  range={['low', 'high']}  
  // ❌ SEVERELY INCOMPLETE - Only 2 of 6 values
  // MISSING: 'moderate', 'very high', 'widespread', 'native'
  description="How widely English is spoken"
/>
```
**Shown in UI**: low, high (2 total)  
**Missing**: moderate, very high, widespread, native  
**Coverage**: 33%

### User Onboarding (OnboardingCulture.jsx)
**Not directly used** - user selects language preference categories:
```javascript
const languageOptions = [
  { value: 'languages_i_speak', label: 'Languages I Speak' },
  { value: 'basic_english', label: 'Basic English' },
  { value: 'will_learn', label: 'Will Learn' }
];
```

---

## townDataOptions.js References (src/utils/townDataOptions.js)

### Line 108: pace_of_life
```javascript
pace_of_life: ['relaxed', 'moderate', 'fast'],  // ❌ MISSING 'slow'
```
**Expected**: `['slow', 'relaxed', 'moderate', 'fast']`

### Lines 176-177: cultural_events
```javascript
cultural_events: ['None', 'Rare', 'Occasional', 'Regular', 'Frequent', 'Very Frequent'],
```
**Note**: Uses different capitalization and different values than categoricalValues.js

---

## KEY FINDINGS

### Perfectly Correct (No Issues)
1. **traditional_progressive_lean** - All 4 values present
2. **expat_community_size** - All 3 values present in all three sources

### Missing 1-2 Values
1. **pace_of_life_actual** - Missing 'slow' (75% coverage)
2. **social_atmosphere** - Missing 'reserved', 'very friendly' (67% coverage)
3. **retirement_community_presence** - Missing 'extensive' (86% coverage)

### Severely Incomplete (Under 50% coverage)
1. **cultural_events_frequency** - Only 3 of 7 values (43% coverage) ⚠️
2. **english_proficiency_level** - Only 2 of 6 values (33% coverage) ⚠️

---

## THE HARDCODING PROBLEM

Every culture field in CulturePanel.jsx hardcodes its dropdown values:

**Current (Wrong):**
```javascript
range={['quiet', 'moderate', 'friendly', 'vibrant']}
```

**Should Be:**
```javascript
import { getValidValues } from '../../utils/validation/categoricalValues';

range={getValidValues('social_atmosphere')}
```

This ensures:
- ✅ Always matches database
- ✅ Automatic when database updates
- ✅ Single source of truth
- ✅ No manual sync needed

