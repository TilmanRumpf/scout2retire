# Administration & Visa Matching Algorithm (20% of total score)
**Date: August 25, 2025**

## Overview
The administration matching algorithm evaluates healthcare, safety, visa requirements, and governmental factors using a sophisticated graduated scoring system that adapts based on user preference intensity levels.

## Database Fields Referenced

### User Preferences Table
- `healthcare_quality` (Array): Required healthcare quality levels ["excellent", "good", "adequate", "basic"]
- `safety_importance` (Array): Safety priority levels ["very_important", "important", "somewhat_important"]
- `monthly_healthcare_budget` (Number): Healthcare budget in USD
- `insurance_importance` (Array): Insurance priority ["critical", "important", "nice_to_have"]
- `health_considerations` (Object): Contains:
  - `healthcare_access`: String - Access requirements
  - `ongoing_treatment`: String - Treatment needs
  - `environmental_health`: String - Environmental sensitivities
- `visa_concerns` (Boolean): Whether visa is a concern
- `residency_path` (Array): Desired paths ["residence", "citizenship", "temporary"]
- `visa_preference` (Array): Visa type preferences
- `stay_duration` (Array): Intended duration ["short_term", "long_term", "permanent"]
- `tax_preference` (Array): Tax optimization preferences
- `political_stability` (Array): Stability requirements
- `government_efficiency` (Array): Efficiency preferences
- `primary_citizenship` (String): User's primary citizenship
- `secondary_citizenship` (String): User's secondary citizenship

### Towns Table
- `healthcare_score` (Number): Overall healthcare score (2-10)
- `healthcare_cost` (Number): Basic healthcare cost ($10-$400)
- `healthcare_cost_monthly` (Number): Monthly healthcare expenses ($20-$500)
- `private_healthcare_cost_index` (Number): Private healthcare index (20-90)
- `hospital_count` (Number): Number of hospitals (0-500)
- `nearest_major_hospital_km` (Number): Distance to major hospital (0-200km)
- `english_speaking_doctors` (Boolean): English medical services
- `medical_specialties_available` (Array): Available specialties
- `medical_specialties_rating` (Number): Specialty care rating (1-10)
- `healthcare_specialties_available` (Array): Healthcare specialties list
- `health_insurance_required` (Boolean): Insurance requirement
- `insurance_availability_rating` (Number): Insurance availability (1-10)
- `emergency_services_quality` (Number): Emergency services (1-10)
- `air_quality_index` (Number): Air quality (10-300, lower better)
- `environmental_health_rating` (Number): Environmental health (1-10)
- `safety_score` (Number): Overall safety score (2-10)
- `crime_rate` (String): Crime level description
- `crime_index` (Number): Crime index (10-80, lower better)
- `political_stability_rating` (Number): Political stability (1-10)
- `government_efficiency_rating` (Number): Government efficiency (1-10)
- `natural_disaster_risk` (Number): Disaster risk level (1-10)
- `natural_disaster_risk_score` (Number): Disaster risk score (1-10)
- `retirement_visa_available` (Boolean): Retirement visa exists
- `digital_nomad_visa` (Boolean): Digital nomad visa exists
- `visa_requirements` (Object): Detailed visa requirements
- `visa_on_arrival_countries` (Array): VOA eligible countries
- `easy_residency_countries` (Array): Easy residency countries
- `residency_path_info` (Object): Residency path details
- `min_income_requirement_usd` (Number): Visa income requirement ($0-$5,000/month)
- `tax_haven_status` (Boolean): Tax haven status
- `tax_treaty_us` (Boolean): US tax treaty exists
- `foreign_income_taxed` (Boolean): Foreign income taxation

## Scoring Breakdown (100 points total)

### 1. Healthcare Quality Match (35 points)
```javascript
// Field references: user_preferences.healthcare_quality vs towns.healthcare_score
```

**Graduated Scoring Based on User Preference Level:**

#### User wants "Excellent" healthcare:
- **Healthcare score 9-10**: 35 points (perfect)
- **Healthcare score 8**: 30 points
- **Healthcare score 7**: 25 points
- **Healthcare score 6**: 15 points
- **Healthcare score 5**: 10 points
- **Healthcare score <5**: 5 points

#### User wants "Good" healthcare:
- **Healthcare score 7-10**: 35 points (meets/exceeds)
- **Healthcare score 6**: 30 points
- **Healthcare score 5**: 20 points
- **Healthcare score 4**: 10 points
- **Healthcare score <4**: 5 points

#### User wants "Adequate" healthcare:
- **Healthcare score 5-10**: 35 points (meets/exceeds)
- **Healthcare score 4**: 25 points
- **Healthcare score 3**: 15 points
- **Healthcare score <3**: 5 points

#### User wants "Basic" healthcare or no preference:
- **Any healthcare score**: 35 points (always satisfied)

**Additional Healthcare Factors:**
```javascript
// English-speaking doctors bonus
if (preferences.language_comfort?.preferences?.includes('english_only') && 
    town.english_speaking_doctors) {
  healthcareScore += 5; // Bonus points
}

// Specialty care consideration
if (preferences.health_considerations?.ongoing_treatment && 
    town.medical_specialties_rating >= 7) {
  healthcareScore += 3; // Bonus for specialty availability
}

// Hospital proximity
if (town.nearest_major_hospital_km <= 30) {
  healthcareScore += 2; // Proximity bonus
}
```

### 2. Safety Score Match (25 points)
```javascript
// Field references: user_preferences.safety_importance vs towns.safety_score, crime_index
```

**Graduated Scoring Based on User Preference Level:**

#### User says "Very Important":
- **Safety score 9-10**: 25 points
- **Safety score 8**: 22 points
- **Safety score 7**: 18 points
- **Safety score 6**: 12 points
- **Safety score 5**: 8 points
- **Safety score <5**: 3 points

#### User says "Important":
- **Safety score 7-10**: 25 points
- **Safety score 6**: 20 points
- **Safety score 5**: 15 points
- **Safety score 4**: 8 points
- **Safety score <4**: 3 points

#### User says "Somewhat Important":
- **Safety score 5-10**: 25 points
- **Safety score 4**: 18 points
- **Safety score 3**: 12 points
- **Safety score <3**: 5 points

#### No safety preference:
- **Any safety score**: 25 points

**Crime Index Integration:**
```javascript
// Alternative scoring using crime_index
if (!town.safety_score && town.crime_index) {
  if (crime_index <= 20) safety_score_derived = 9;
  else if (crime_index <= 30) safety_score_derived = 8;
  else if (crime_index <= 40) safety_score_derived = 7;
  else if (crime_index <= 50) safety_score_derived = 6;
  else if (crime_index <= 60) safety_score_derived = 5;
  else safety_score_derived = 4;
}
```

### 3. Visa & Residency Match (15 points)
```javascript
// Field references: user_preferences.visa_concerns, residency_path vs towns visa fields
```

**Visa Requirement Scoring:**

#### No visa concerns (visa_concerns === false):
- **Automatic**: 15 points (user doesn't care)

#### Has visa concerns (visa_concerns === true):
```javascript
// Check citizenship compatibility
const userCitizenship = preferences.primary_citizenship;
const easyEntry = town.visa_on_arrival_countries?.includes(userCitizenship) ||
                  town.easy_residency_countries?.includes(userCitizenship);

if (easyEntry) {
  visaScore = 15; // Full points for easy entry
} else if (town.retirement_visa_available && age >= 55) {
  visaScore = 12; // Good option for retirees
} else if (town.digital_nomad_visa && remote_work) {
  visaScore = 12; // Good for remote workers
} else {
  visaScore = 5; // Visa required but possible
}
```

**Residency Path Scoring:**
```javascript
// User wants path to citizenship
if (preferences.residency_path?.includes('citizenship')) {
  if (town.residency_path_info?.citizenship_possible) {
    residencyScore = 10;
  } else {
    residencyScore = 3;
  }
}

// User wants permanent residence
if (preferences.residency_path?.includes('residence')) {
  if (town.residency_path_info?.permanent_residence_available) {
    residencyScore = 10;
  } else {
    residencyScore = 5;
  }
}
```

### 4. Healthcare Cost Match (10 points)
```javascript
// Field references: user_preferences.monthly_healthcare_budget vs towns.healthcare_cost_monthly
```

**Budget-Based Scoring:**
```javascript
const userBudget = preferences.monthly_healthcare_budget || 500;
const townCost = town.healthcare_cost_monthly || 100;

if (townCost <= userBudget) {
  costScore = 10; // Within budget
} else if (townCost <= userBudget * 1.2) {
  costScore = 7; // Slightly over (20%)
} else if (townCost <= userBudget * 1.5) {
  costScore = 4; // Moderately over (50%)
} else {
  costScore = 1; // Significantly over budget
}
```

**Insurance Considerations:**
```javascript
if (town.health_insurance_required && 
    preferences.insurance_importance?.includes('critical')) {
  if (town.insurance_availability_rating >= 7) {
    costScore += 2; // Bonus for good insurance
  } else {
    costScore -= 3; // Penalty for poor insurance
  }
}
```

### 5. Government Efficiency (5 points)
```javascript
// Field references: user_preferences.government_efficiency vs towns.government_efficiency_rating
```

**Efficiency Scoring:**
- **Rating 8-10**: 5 points (excellent)
- **Rating 6-7**: 4 points (good)
- **Rating 4-5**: 3 points (adequate)
- **Rating 2-3**: 1 point (poor)
- **No preference**: 5 points

### 6. Political Stability (5 points)
```javascript
// Field references: user_preferences.political_stability vs towns.political_stability_rating
```

**Stability Scoring:**
- **Rating 8-10**: 5 points (very stable)
- **Rating 6-7**: 4 points (stable)
- **Rating 4-5**: 2 points (moderate)
- **Rating <4**: 0 points (unstable)
- **No preference**: 5 points

### 7. Environmental Health (5 points)
```javascript
// Field references: user_preferences.health_considerations.environmental_health vs towns.air_quality_index, environmental_health_rating
```

**Air Quality Scoring:**
```javascript
if (preferences.health_considerations?.environmental_health === 'sensitive') {
  if (town.air_quality_index <= 50) {
    envScore = 5; // Excellent air
  } else if (town.air_quality_index <= 100) {
    envScore = 3; // Moderate air
  } else {
    envScore = 0; // Poor air
  }
} else {
  envScore = 5; // Not sensitive
}
```

**Natural Disaster Risk:**
```javascript
if (town.natural_disaster_risk_score >= 7) {
  envScore -= 2; // High risk penalty
}
```

## Special Cases and Fallbacks

### No Preferences = Perfect Score
- Users without admin preferences receive 100% score
- Supports flexible retirees

### Tax Optimization Integration
```javascript
// For tax-sensitive users
if (preferences.tax_preference?.includes('minimize')) {
  if (town.tax_haven_status) {
    bonusPoints += 10;
  }
  if (town.foreign_income_taxed === false) {
    bonusPoints += 5;
  }
  if (town.tax_treaty_us && userCitizenship === 'USA') {
    bonusPoints += 5;
  }
}
```

### Healthcare Specialty Requirements
```javascript
// Specific medical needs
const requiredSpecialties = [
  'cardiology', 'oncology', 'orthopedics', 
  'neurology', 'endocrinology'
];

const availableSpecialties = town.medical_specialties_available || [];
const specialtyMatch = requiredSpecialties.filter(s => 
  availableSpecialties.includes(s)
).length;

specialtyScore = (specialtyMatch / requiredSpecialties.length) * 10;
```

## Algorithm Priority Order

1. **Healthcare quality** (35% - highest priority)
   - Critical for retiree population
   
2. **Safety** (25%)
   - Personal security paramount
   
3. **Visa/Residency** (15%)
   - Legal ability to stay
   
4. **Healthcare costs** (10%)
   - Budget considerations
   
5. **Government/Political** (10% combined)
   - Stability and efficiency
   
6. **Environmental health** (5%)
   - Quality of life factor

## Integration with Other Systems

### Budget Correlation
- Healthcare costs feed into overall budget scoring
- Insurance costs included in total expenses

### Language Integration
- English-speaking doctors enhance healthcare score
- Government efficiency affects document processing

### Emergency Preparedness
- Natural disaster risk affects insurance needs
- Emergency services quality critical for seniors

## Recent Improvements (August 2025)

1. **Graduated Scoring System**
   - Preference intensity affects scoring curves
   - More nuanced than binary matching

2. **Multi-Source Healthcare Data**
   - Combines scores, costs, and availability
   - Specialty care recognition

3. **Visa Complexity Handling**
   - Country-specific visa checking
   - Multiple visa type support

## Performance Considerations

- Healthcare and safety scores indexed
- Visa arrays use GIN indexes for contains queries
- Citizenship checking optimized with hash lookups

## Validation Rules

1. Healthcare scores must be 1-10
2. Safety scores must be 1-10
3. Crime index must be 0-100
4. Air quality index must be 0-500
5. All costs must be non-negative
6. Boolean fields must be true/false/null

## Data Coverage Statistics

- Towns with healthcare scores: ~300/341 (88%)
- Towns with safety scores: ~310/341 (91%)
- Towns with visa information: ~280/341 (82%)
- Towns with government ratings: ~290/341 (85%)
- Complete admin data: ~260/341 (76%)

## Future Enhancement Opportunities

1. **Insurance Market Analysis**
   - Private vs public options
   - International coverage portability
   - Pre-existing condition handling

2. **Visa Pathway Simulation**
   - Years to citizenship calculator
   - Tax residency implications
   - Dual citizenship compatibility

3. **Healthcare Network Mapping**
   - Specialist referral networks
   - Medical tourism considerations
   - Prescription availability

4. **Emergency Response Times**
   - Ambulance response data
   - Helicopter evacuation options
   - Coast guard coverage

5. **Legal System Assessment**
   - Property rights protection
   - Contract enforcement
   - Estate planning compatibility

6. **Disaster Preparedness Scoring**
   - Evacuation infrastructure
   - Building codes and standards
   - Community resilience measures

---

*Algorithm Version: 2.1*  
*Last Major Update: August 24, 2025 (Graduated scoring implementation)*  
*Database Fields Verified: August 25, 2025*  
*Admin Data Coverage: 76% complete*