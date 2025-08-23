// Import the real function
import { calculateRegionScore } from './src/utils/enhancedMatchingAlgorithm.js';

// Test Spanish town with actual geographic data
const granadaTown = {
  id: 1,
  name: 'Granada',
  country: 'Spain',
  region: 'Andalusia',
  regions: ['Andalusia', 'Southern Spain'],
  geo_region: 'Southern Europe, Mediterranean',
  geographic_features_actual: ['mountain', 'historic'],
  vegetation_type_actual: ['mediterranean']
};

// Test user who loves Spain and selects matching preferences
const userLovesSpain = {
  countries: ['Spain'],
  regions: ['Southern Europe', 'Mediterranean'],
  geographic_features: ['coastal', 'mountain'],  // Granada has mountain
  vegetation_types: ['mediterranean']  // Granada has mediterranean
};

// Test user who loves Spain but selects non-matching features
const userLovesSpainWrongFeatures = {
  countries: ['Spain'],
  regions: ['Southern Europe', 'Mediterranean'],
  geographic_features: ['coastal', 'island'],  // Granada has neither
  vegetation_types: ['tropical']  // Granada is not tropical
};

console.log('=== Testing Region Scoring with Features ===');
console.log('Town:', granadaTown.name, granadaTown.country);
console.log('Town features:', granadaTown.geographic_features_actual);
console.log('Town vegetation:', granadaTown.vegetation_type_actual);

console.log('\n1. User loves Spain WITH matching features:');
const result1 = calculateRegionScore(userLovesSpain, granadaTown);
console.log('Score:', result1.score + '%');
console.log('Raw score:', result1.rawScore + '/' + result1.maxScore);
console.log('Factors:', result1.factors.map(f => f.factor + ' (' + f.score + ' pts)'));

console.log('\n2. User loves Spain WITH non-matching features:');
const result2 = calculateRegionScore(userLovesSpainWrongFeatures, granadaTown);
console.log('Score:', result2.score + '%');
console.log('Raw score:', result2.rawScore + '/' + result2.maxScore);
console.log('Factors:', result2.factors.map(f => f.factor + ' (' + f.score + ' pts)'));

console.log('\n3. User selects Spain + ALL features (test recent fix):');
const ALL_GEO_FEATURES = ['coastal', 'mountain', 'island', 'lake', 'river', 'valley', 'desert', 'forest', 'plains'];
const ALL_VEG_TYPES = ['tropical', 'subtropical', 'mediterranean', 'forest', 'grassland', 'desert'];
const userSelectsAll = {
  countries: ['Spain'],
  regions: ['Southern Europe', 'Mediterranean'],
  geographic_features: ALL_GEO_FEATURES,
  vegetation_types: ALL_VEG_TYPES
};
const result3 = calculateRegionScore(userSelectsAll, granadaTown);
console.log('Score:', result3.score + '%');
console.log('Raw score:', result3.rawScore + '/' + result3.maxScore);
console.log('Factors:', result3.factors.map(f => f.factor + ' (' + f.score + ' pts)'));
