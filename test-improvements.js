// Test the improvements to region scoring
import { calculateRegionScore } from './src/utils/enhancedMatchingAlgorithm.js';

// Spanish town data (real from DB)
const granada = {
  name: 'Granada',
  country: 'Spain',
  geo_region: 'Southern Europe,Western Europe,Mediterranean',
  geographic_features_actual: ['continental', 'mountain'],
  vegetation_type_actual: ['mediterranean']
}

const alicante = {
  name: 'Alicante',
  country: 'Spain',
  geo_region: 'Southern Europe,Western Europe,Mediterranean',
  geographic_features_actual: ['coastal'],
  vegetation_type_actual: ['mediterranean']
}

console.log('=== TESTING REGION SCORING IMPROVEMENTS ===\n')

// TEST 1: User wants coastal Spain but gets mountain town (should get partial credit now)
console.log('TEST 1: User wants coastal Spain, testing Granada (mountain town)')
console.log('BEFORE: Would get 44% (40 country + 0 geo + 0 veg)')
console.log('NOW WITH IMPROVEMENTS: Should get better score with partial credit')
const test1 = calculateRegionScore({
  countries: ['Spain'],
  regions: ['Mediterranean'],
  geographic_features: ['coastal'],  // Granada is mountain, not coastal
  vegetation_types: ['subtropical']  // Granada is mediterranean, not subtropical
}, granada)
console.log(`RESULT: ${test1.score}%`)
console.log('Breakdown:', test1.factors.map(f => `${f.factor}: ${f.score}pts`))
console.log('')

// TEST 2: User wants island but gets coastal (related water features)
console.log('TEST 2: User wants island, testing Alicante (coastal town)')
console.log('Related water features should get partial credit')
const test2 = calculateRegionScore({
  countries: ['Spain'],
  regions: [],
  geographic_features: ['island'],  // Alicante is coastal, not island
  vegetation_types: []  // No vegetation preference
}, alicante)
console.log(`RESULT: ${test2.score}%`)
console.log('Breakdown:', test2.factors.map(f => `${f.factor}: ${f.score}pts`))
console.log('')

// TEST 3: Mediterranean region should imply vegetation compatibility
console.log('TEST 3: User selects Mediterranean region (no vegetation specified)')
console.log('Should recognize Mediterranean region implies vegetation compatibility')
const test3 = calculateRegionScore({
  countries: ['Spain'],
  regions: ['Mediterranean'],
  // NO geographic_features
  // NO vegetation_types - but Mediterranean region should imply OK with mediterranean vegetation
}, granada)
console.log(`RESULT: ${test3.score}%`)
console.log('Breakdown:', test3.factors.map(f => `${f.factor}: ${f.score}pts`))
console.log('')

// TEST 4: Subtropical vs Mediterranean (related vegetation)
console.log('TEST 4: User wants subtropical vegetation, town has mediterranean')
console.log('These are related (warm climates) so should get partial credit')
const test4 = calculateRegionScore({
  countries: ['Spain'],
  regions: [],
  geographic_features: [],  
  vegetation_types: ['subtropical']  // Granada has mediterranean (related)
}, granada)
console.log(`RESULT: ${test4.score}%`)
console.log('Breakdown:', test4.factors.map(f => `${f.factor}: ${f.score}pts`))
console.log('')

// TEST 5: Mountain vs Valley (related terrain)
console.log('TEST 5: User wants valley, Granada has mountain')
console.log('These are related terrain features, should get partial credit')
const test5 = calculateRegionScore({
  countries: ['Spain'],
  regions: [],
  geographic_features: ['valley'],  // Granada has mountain (related)
  vegetation_types: []
}, granada)
console.log(`RESULT: ${test5.score}%`)
console.log('Breakdown:', test5.factors.map(f => `${f.factor}: ${f.score}pts`))
console.log('')

console.log('=== IMPROVEMENTS SUMMARY ===')
console.log('1. Related features now get 50% credit instead of 0%')
console.log('2. Mediterranean region selection implies vegetation compatibility')
console.log('3. Water features (coastal/island/lake/river) are considered related')
console.log('4. Mountain/valley/forest are considered related terrain')
console.log('5. Mediterranean/subtropical vegetation are considered related climates')