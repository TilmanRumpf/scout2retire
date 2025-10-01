#!/usr/bin/env node

// Test the reconstruction logic

const compoundMappings = {
  // Activities
  'golf_tennis': ['golf', 'tennis'],
  'walking_cycling': ['walking', 'cycling'],
  'water_sports': ['swimming'],
  'water_crafts': ['boating'],
  'winter_sports': ['skiing'],
  // Interests
  'gardening': ['gardening'],
  'arts': ['arts', 'crafts'],
  'music_theater': ['music', 'theater'],
  'cooking_wine': ['cooking', 'wine'],
  'history': ['museums', 'history']
};

// Create reverse mapping
const reverseMapping = {};
Object.entries(compoundMappings).forEach(([compound, items]) => {
  items.forEach(item => {
    if (!reverseMapping[item]) reverseMapping[item] = [];
    reverseMapping[item].push(compound);
  });
});

console.log('Reverse mapping:', reverseMapping);

// Test cases
const testCases = [
  {
    name: 'Old compound IDs',
    input: ['water_sports', 'golf_tennis'],
    expected: ['water_sports', 'golf_tennis']
  },
  {
    name: 'New individual items',
    input: ['swimming', 'golf', 'tennis'],
    expected: ['water_sports', 'golf_tennis']
  },
  {
    name: 'Mixed old and new',
    input: ['water_sports', 'golf', 'tennis'],
    expected: ['water_sports', 'golf_tennis']
  },
  {
    name: 'Standalone items',
    input: ['fishing', 'hiking'],
    expected: ['fishing', 'hiking']
  }
];

testCases.forEach(test => {
  console.log(`\nTest: ${test.name}`);
  console.log(`Input: ${test.input}`);
  
  const reconstructedActivities = [];
  
  test.input.forEach(activity => {
    if (compoundMappings[activity]) {
      // It's a compound ID - keep it
      if (!reconstructedActivities.includes(activity)) {
        reconstructedActivities.push(activity);
      }
    } else if (reverseMapping[activity]) {
      // It's an individual item that maps to compound
      reverseMapping[activity].forEach(compoundId => {
        if (!reconstructedActivities.includes(compoundId)) {
          reconstructedActivities.push(compoundId);
        }
      });
    } else {
      // It's standalone - keep as is
      if (!reconstructedActivities.includes(activity)) {
        reconstructedActivities.push(activity);
      }
    }
  });
  
  console.log(`Output: ${reconstructedActivities}`);
  console.log(`Expected: ${test.expected}`);
  console.log(`✅ Pass: ${JSON.stringify(reconstructedActivities) === JSON.stringify(test.expected)}`);
});
